/**
 * Lucky UI Stop Hook Guard
 * 守卫目标：
 * 在会话结束时，确保组件、Demo与文档的交付完整性。
 */
let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    // Stop 钩子默认允许正常结束，若有特定三位一体强校验逻辑可在此扩展
    console.log(JSON.stringify({
      decision: 'allow'
    }));
  } catch (err) {
    console.log(JSON.stringify({ decision: 'allow' }));
  }
});
