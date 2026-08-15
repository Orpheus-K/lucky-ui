import { createHash, createHmac } from 'node:crypto';
import { request } from 'node:https';
import { pathToFileURL } from 'node:url';

const API_HOST = 'teo.tencentcloudapi.com';
const API_VERSION = '2022-09-01';
const CONTENT_TYPE = 'application/json; charset=utf-8';
const SERVICE = 'teo';

function getRequiredEnv(name, env = process.env) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key, value) {
  return createHmac('sha256', key).update(value).digest();
}

function getUtcDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

export function buildTencentApiHeaders({
  action,
  payload,
  secretId,
  secretKey,
  sessionToken,
  timestamp = Math.floor(Date.now() / 1000),
}) {
  const date = getUtcDate(timestamp);
  const canonicalHeaders = `content-type:${CONTENT_TYPE}\nhost:${API_HOST}\n`;
  const signedHeaders = 'content-type;host';
  const canonicalRequest = ['POST', '/', '', canonicalHeaders, signedHeaders, sha256(payload)].join(
    '\n'
  );
  const credentialScope = `${date}/${SERVICE}/tc3_request`;
  const stringToSign = [
    'TC3-HMAC-SHA256',
    timestamp,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');
  const secretDate = hmac(`TC3${secretKey}`, date);
  const secretService = hmac(secretDate, SERVICE);
  const secretSigning = hmac(secretService, 'tc3_request');
  const signature = createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  const authorization =
    `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    Authorization: authorization,
    'Content-Type': CONTENT_TYPE,
    Host: API_HOST,
    'X-TC-Action': action,
    'X-TC-Timestamp': String(timestamp),
    'X-TC-Version': API_VERSION,
    ...(sessionToken ? { 'X-TC-Token': sessionToken } : {}),
  };
}

function postTencentApi(headers, payload) {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: API_HOST,
        method: 'POST',
        path: '/',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      response => {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          let data;
          try {
            data = JSON.parse(body);
          } catch {
            reject(
              new Error(`Tencent Cloud API returned invalid JSON (HTTP ${response.statusCode})`)
            );
            return;
          }

          if ((response.statusCode ?? 500) >= 400 || data.Response?.Error) {
            const error = data.Response?.Error;
            reject(
              new Error(
                `Tencent Cloud API ${error?.Code ?? response.statusCode}: ${error?.Message ?? 'request failed'}`
              )
            );
            return;
          }

          resolve(data.Response);
        });
      }
    );

    req.setTimeout(20_000, () => req.destroy(new Error('Tencent Cloud API request timed out')));
    req.on('error', reject);
    req.end(payload);
  });
}

function getCredentials(env = process.env) {
  return {
    secretId: getRequiredEnv('TENCENTCLOUD_SECRET_ID', env),
    secretKey: getRequiredEnv('TENCENTCLOUD_SECRET_KEY', env),
    sessionToken: env.TENCENTCLOUD_SESSION_TOKEN?.trim(),
  };
}

export async function callTencentApi(action, parameters, options = {}) {
  const env = options.env ?? process.env;
  const payload = JSON.stringify(parameters);
  const headers = buildTencentApiHeaders({
    action,
    payload,
    ...getCredentials(env),
    timestamp: options.timestamp,
  });
  return postTencentApi(headers, payload);
}

export async function verifyEdgeOneAccess(options = {}) {
  const env = options.env ?? process.env;
  const zoneId = options.zoneId ?? getRequiredEnv('EDGEONE_ZONE_ID', env);
  const now = Date.now();
  const startTime = new Date(now - 5 * 60_000).toISOString();
  const endTime = new Date(now).toISOString();

  await callTencentApi(
    'DescribePurgeTasks',
    { ZoneId: zoneId, StartTime: startTime, EndTime: endTime, Limit: 1, Offset: 0 },
    { env }
  );

  return { zoneId };
}

export async function purgeEdgeOneCache(options = {}) {
  const env = options.env ?? process.env;
  const zoneId = options.zoneId ?? getRequiredEnv('EDGEONE_ZONE_ID', env);
  const hostname = options.hostname ?? env.EDGEONE_HOSTNAME?.trim() ?? 'lucky-ui.cn';
  const response = await callTencentApi(
    'CreatePurgeTask',
    {
      ZoneId: zoneId,
      Type: 'purge_host',
      Method: 'invalidate',
      Targets: [hostname],
    },
    { env }
  );

  if (response.FailedList?.length) {
    throw new Error(`EdgeOne cache purge rejected: ${JSON.stringify(response.FailedList)}`);
  }

  return {
    hostname,
    jobId: response.JobId,
    requestId: response.RequestId,
    zoneId,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    const payload = JSON.stringify({
      ZoneId: process.env.EDGEONE_ZONE_ID || 'zone-example',
      Type: 'purge_host',
      Method: 'invalidate',
      Targets: [process.env.EDGEONE_HOSTNAME || 'lucky-ui.cn'],
    });
    const headers = buildTencentApiHeaders({
      action: 'CreatePurgeTask',
      payload,
      secretId: 'AKIDEXAMPLE',
      secretKey: 'SECRETEXAMPLE',
      timestamp: 1_700_000_000,
    });
    console.log(
      JSON.stringify(
        {
          action: headers['X-TC-Action'],
          endpoint: `https://${API_HOST}/`,
          payload: JSON.parse(payload),
          signedHeaders: 'content-type;host',
        },
        null,
        2
      )
    );
    return;
  }

  const result = await purgeEdgeOneCache();
  console.log(`EdgeOne cache purge accepted: job=${result.jobId} host=${result.hostname}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
