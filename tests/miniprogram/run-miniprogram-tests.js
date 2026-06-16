const { runButtonSnapshotTest, runButtonTapBindingTest } = require('./button.spec');
const { runTimelineBasicTest, runTimelineStatusTest } = require('./timeline.spec');

function run() {
  try {
    runButtonSnapshotTest();
    runButtonTapBindingTest();
    console.log('[test:mp] lk-button 小程序渲染测试通过。');

    runTimelineBasicTest();
    runTimelineStatusTest();
    console.log('[test:mp] lk-timeline 小程序渲染测试通过。');
  } catch (error) {
    console.error('[test:mp] 小程序渲染测试失败。');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

run();
