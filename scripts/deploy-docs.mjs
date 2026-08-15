import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { purgeEdgeOneCache, verifyEdgeOneAccess } from './purge-edgeone-cache.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const distDirectory = join(projectRoot, 'docs', '.vitepress', 'dist');
const sshHost = process.env.DOCS_DEPLOY_SSH_HOST?.trim() || 'tx';
const remoteBase = process.env.DOCS_DEPLOY_REMOTE_BASE?.trim() || '/www/wwwroot/lucky-ui-docs';
const hostname = process.env.EDGEONE_HOSTNAME?.trim() || 'lucky-ui.cn';
const skipPurge = process.argv.includes('--skip-purge');
const dryRun = process.argv.includes('--dry-run');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: options.input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    input: options.input,
    shell: false,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function createTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function getFileSha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function assertSafeConfig() {
  if (!/^[\w.-]+$/.test(sshHost)) throw new Error(`Unsafe SSH host: ${sshHost}`);
  if (!/^\/[\w./-]+$/.test(remoteBase)) throw new Error(`Unsafe remote base: ${remoteBase}`);
  if (!/^[a-z0-9.-]+$/i.test(hostname)) throw new Error(`Unsafe hostname: ${hostname}`);
}

function deployRemote({ archive, archiveHash, stamp }) {
  const remoteArchive = `/tmp/lucky-ui-docs-${stamp}.tar.gz`;
  run('scp', ['-q', '-o', 'BatchMode=yes', archive, `${sshHost}:${remoteArchive}`]);

  const script = `set -euo pipefail
stamp="$1"
expected_hash="$2"
base="$3"
hostname="$4"
current="$base/dist"
releases="$base/.releases"
stage="$base/.deploy-stage-$stamp"
backup="$releases/dist-$stamp"
failed="$releases/failed-$stamp"
archive="/tmp/lucky-ui-docs-$stamp.tar.gz"
health="/tmp/lucky-ui-docs-health-$stamp.html"

cleanup() {
  sudo rm -f "$archive" "$health"
}
trap cleanup EXIT

actual_hash="$(sha256sum "$archive" | awk '{print $1}')"
test "$actual_hash" = "$expected_hash"
sudo nginx -t
sudo mkdir -p "$releases"
sudo rm -rf "$stage"
sudo mkdir "$stage"
sudo tar -xzf "$archive" -C "$stage"

sudo test -s "$stage/index.html"
sudo test -s "$stage/robots.txt"
sudo test -s "$stage/sitemap.xml"
sudo test -s "$stage/components/button.html"
sudo test ! -e "$stage/ANIMATION_FIX.html"
sudo grep -Fq "https://$hostname/" "$stage/index.html"
sudo grep -Fq 'SoftwareSourceCode' "$stage/index.html"
sudo grep -Fq "Sitemap: https://$hostname/sitemap.xml" "$stage/robots.txt"
sudo grep -Fq "https://$hostname/components/button.html" "$stage/sitemap.xml"
sudo chown -R www:www "$stage"
sudo chmod 705 "$stage"

sudo mv "$current" "$backup"
if ! sudo mv "$stage" "$current"; then
  sudo mv "$backup" "$current"
  echo 'Activation failed; previous dist restored.' >&2
  exit 1
fi

rollback() {
  sudo mv "$current" "$failed" || true
  sudo mv "$backup" "$current" || true
}

if ! curl -kfsS --resolve "$hostname:443:127.0.0.1" "https://$hostname/" -o "$health"; then
  rollback
  echo 'Origin health check failed; previous dist restored.' >&2
  exit 1
fi
if ! grep -Fq 'Lucky UI' "$health"; then
  rollback
  echo 'Origin content check failed; previous dist restored.' >&2
  exit 1
fi

echo "DEPLOY_OK active=$current backup=$backup sha256=$actual_hash"
`;

  run('ssh', [sshHost, 'bash', '-s', '--', stamp, archiveHash, remoteBase, hostname], {
    input: script,
  });
}

function rollbackRemote(stamp) {
  const command = [
    'set -eu',
    `base='${remoteBase}'`,
    `stamp='${stamp}'`,
    'current="$base/dist"',
    'backup="$base/.releases/dist-$stamp"',
    'failed="$base/.releases/failed-$stamp"',
    'sudo test -d "$backup"',
    'sudo mv "$current" "$failed"',
    'sudo mv "$backup" "$current"',
    'echo ROLLBACK_OK',
  ].join('; ');
  run('ssh', [sshHost, command]);
}

async function verifyPublicSite() {
  for (const path of ['/', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(`https://${hostname}${path}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Public health check failed: ${path} -> ${response.status}`);
  }
}

async function main() {
  assertSafeConfig();

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          distDirectory,
          hostname,
          remoteBase,
          skipPurge,
          sshHost,
        },
        null,
        2
      )
    );
    return;
  }

  if (!skipPurge) {
    await verifyEdgeOneAccess();
    console.log('EdgeOne API preflight passed.');
  }

  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  run(pnpm, ['run', 'docs:build']);
  run(pnpm, ['run', 'docs:seo-check']);
  if (!existsSync(distDirectory)) throw new Error(`Docs dist not found: ${distDirectory}`);

  const stamp = createTimestamp();
  const archive = join(tmpdir(), `lucky-ui-docs-${stamp}.tar.gz`);

  try {
    run('tar', ['-C', distDirectory, '-czf', archive, '.']);
    const archiveHash = getFileSha256(archive);
    deployRemote({ archive, archiveHash, stamp });

    try {
      if (!skipPurge) {
        const purge = await purgeEdgeOneCache({ hostname });
        console.log(`EdgeOne cache purge accepted: job=${purge.jobId}`);
      }
      await verifyPublicSite();
    } catch (error) {
      console.error(`Post-deploy verification failed: ${error.message}`);
      rollbackRemote(stamp);
      if (!skipPurge) {
        try {
          await purgeEdgeOneCache({ hostname });
        } catch (purgeError) {
          console.error(`Rollback cache purge also failed: ${purgeError.message}`);
        }
      }
      throw error;
    }

    console.log(`Docs deployment completed: https://${hostname}/`);
  } finally {
    rmSync(archive, { force: true });
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
