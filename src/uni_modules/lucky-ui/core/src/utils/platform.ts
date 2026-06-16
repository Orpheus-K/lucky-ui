/* eslint-disable no-unreachable */
// UniApp 环境下的平台检测 - 基于官方条件编译变量
let systemInfo: UniApp.GetSystemInfoResult | null = null;

/**
 * 获取系统信息（缓存版本）
 * @returns 系统信息
 */
export function getSystemInfo(): UniApp.GetSystemInfoResult {
  if (!systemInfo) {
    systemInfo = uni.getSystemInfoSync();
  }
  return systemInfo;
}

/**
 * 清除系统信息缓存
 */
export function clearSystemInfoCache(): void {
  systemInfo = null;
}

/**
 * 检查是否为 Vue3 版本
 * @returns 是否为 Vue3
 */
export function isVue3(): boolean {
  // #ifdef VUE3
  return true;
  // #endif
  // #ifndef VUE3
  return false;
  // #endif
}

/**
 * 检查是否为 Vue2 版本
 * @returns 是否为 Vue2
 */
export function isVue2(): boolean {
  // #ifdef VUE2
  return true;
  // #endif
  // #ifndef VUE2
  return false;
  // #endif
}

/**
 * 检查是否为 uni-app x 项目
 * @returns 是否为 uni-app x
 */
export function isUniAppX(): boolean {
  // #ifdef UNI-APP-X
  return true;
  // #endif
  // #ifndef UNI-APP-X
  return false;
  // #endif
}

/**
 * 检查是否为 App 环境
 * @returns 是否为 App
 */
export function isApp(): boolean {
  // #ifdef APP
  return true;
  // #endif
  // #ifndef APP
  return false;
  // #endif
}

/**
 * 检查是否为 App Plus 环境（uni-app js引擎版编译为App时）
 * @returns 是否为 App Plus
 */
export function isAppPlus(): boolean {
  // #ifdef APP-PLUS
  return true;
  // #endif
  // #ifndef APP-PLUS
  return false;
  // #endif
}

/**
 * 检查是否为 App Nvue 页面
 * @returns 是否为 App Nvue
 */
export function isAppNvue(): boolean {
  // #ifdef APP-PLUS-NVUE
  return true;
  // #endif
  // #ifndef APP-PLUS-NVUE
  return false;
  // #endif
}

/**
 * 检查是否为 App Android 平台
 * @returns 是否为 App Android
 */
export function isAppAndroid(): boolean {
  // #ifdef APP-ANDROID
  return true;
  // #endif
  // #ifndef APP-ANDROID
  return false;
  // #endif
}

/**
 * 检查是否为 App iOS 平台
 * @returns 是否为 App iOS
 */
export function isAppIOS(): boolean {
  // #ifdef APP-IOS
  return true;
  // #endif
  // #ifndef APP-IOS
  return false;
  // #endif
}

/**
 * 检查是否为 App HarmonyOS Next 平台
 * @returns 是否为 App HarmonyOS
 */
export function isAppHarmony(): boolean {
  // #ifdef APP-HARMONY
  return true;
  // #endif
  // #ifndef APP-HARMONY
  return false;
  // #endif
}

/**
 * 检查是否为 H5 环境
 * @returns 是否为 H5
 */
export function isH5(): boolean {
  // #ifdef H5
  return true;
  // #endif
  // #ifndef H5
  return false;
  // #endif
}

/**
 * 检查是否为 Web 环境（同 H5，推荐使用）
 * @returns 是否为 Web
 */
export function isWeb(): boolean {
  // #ifdef WEB
  return true;
  // #endif
  // #ifndef WEB
  return false;
  // #endif
}

/**
 * 检查是否为微信小程序
 * @returns 是否为微信小程序
 */
export function isMpWeixin(): boolean {
  // #ifdef MP-WEIXIN
  return true;
  // #endif
  // #ifndef MP-WEIXIN
  return false;
  // #endif
}

/**
 * 检查是否为支付宝小程序
 * @returns 是否为支付宝小程序
 */
export function isMpAlipay(): boolean {
  // #ifdef MP-ALIPAY
  return true;
  // #endif
  // #ifndef MP-ALIPAY
  return false;
  // #endif
}

/**
 * 检查is否为百度小程序
 * @returns 是否为百度小程序
 */
export function isMpBaidu(): boolean {
  // #ifdef MP-BAIDU
  return true;
  // #endif
  // #ifndef MP-BAIDU
  return false;
  // #endif
}

/**
 * 检查是否为抖音小程序
 * @returns 是否为抖音小程序
 */
export function isMpToutiao(): boolean {
  // #ifdef MP-TOUTIAO
  return true;
  // #endif
  // #ifndef MP-TOUTIAO
  return false;
  // #endif
}

/**
 * 检查是否为飞书小程序
 * @returns 是否为飞书小程序
 */
export function isMpLark(): boolean {
  // #ifdef MP-LARK
  return true;
  // #endif
  // #ifndef MP-LARK
  return false;
  // #endif
}

/**
 * 检查是否为QQ小程序
 * @returns 是否为QQ小程序
 */
export function isMpQQ(): boolean {
  // #ifdef MP-QQ
  return true;
  // #endif
  // #ifndef MP-QQ
  return false;
  // #endif
}

/**
 * 检查是否为快手小程序
 * @returns 是否为快手小程序
 */
export function isMpKuaishou(): boolean {
  // #ifdef MP-KUAISHOU
  return true;
  // #endif
  // #ifndef MP-KUAISHOU
  return false;
  // #endif
}

/**
 * 检查是否为京东小程序
 * @returns 是否为京东小程序
 */
export function isMpJd(): boolean {
  // #ifdef MP-JD
  return true;
  // #endif
  // #ifndef MP-JD
  return false;
  // #endif
}

/**
 * 检查是否为360小程序
 * @returns 是否为360小程序
 */
export function isMp360(): boolean {
  // #ifdef MP-360
  return true;
  // #endif
  // #ifndef MP-360
  return false;
  // #endif
}

/**
 * 检查是否为鸿蒙元服务
 * @returns 是否为鸿蒙元服务
 */
export function isMpHarmony(): boolean {
  // #ifdef MP-HARMONY
  return true;
  // #endif
  // #ifndef MP-HARMONY
  return false;
  // #endif
}

/**
 * 检查是否为小红书小程序
 * @returns 是否为小红书小程序
 */
export function isMpXhs(): boolean {
  // #ifdef MP-XHS
  return true;
  // #endif
  // #ifndef MP-XHS
  return false;
  // #endif
}

/**
 * 检查是否为小程序环境（通用）
 * @returns 是否为小程序
 */
export function isMp(): boolean {
  // #ifdef MP
  return true;
  // #endif
  // #ifndef MP
  return false;
  // #endif
}

/**
 * 检查是否为快应用通用(包含联盟、华为)
 * @returns 是否为快应用通用
 */
export function isQuickappWebview(): boolean {
  // #ifdef QUICKAPP-WEBVIEW
  return true;
  // #endif
  // #ifndef QUICKAPP-WEBVIEW
  return false;
  // #endif
}

/**
 * 检查是否为快应用联盟
 * @returns 是否为快应用联盟
 */
export function isQuickappWebviewUnion(): boolean {
  // #ifdef QUICKAPP-WEBVIEW-UNION
  return true;
  // #endif
  // #ifndef QUICKAPP-WEBVIEW-UNION
  return false;
  // #endif
}

/**
 * 检查是否为快应用华为
 * @returns 是否为快应用华为
 */
export function isQuickappWebviewHuawei(): boolean {
  // #ifdef QUICKAPP-WEBVIEW-HUAWEI
  return true;
  // #endif
  // #ifndef QUICKAPP-WEBVIEW-HUAWEI
  return false;
  // #endif
}

/**
 * 获取当前平台类型
 * @returns 平台类型字符串
 */
export function getPlatform(): string {
  if (isMpWeixin()) return 'mp-weixin';
  if (isMpAlipay()) return 'mp-alipay';
  if (isMpBaidu()) return 'mp-baidu';
  if (isMpToutiao()) return 'mp-toutiao';
  if (isMpLark()) return 'mp-lark';
  if (isMpQQ()) return 'mp-qq';
  if (isMpKuaishou()) return 'mp-kuaishou';
  if (isMpJd()) return 'mp-jd';
  if (isMp360()) return 'mp-360';
  if (isMpHarmony()) return 'mp-harmony';
  if (isMpXhs()) return 'mp-xhs';
  if (isAppAndroid()) return 'app-android';
  if (isAppIOS()) return 'app-ios';
  if (isAppHarmony()) return 'app-harmony';
  if (isAppPlus()) return 'app-plus';
  if (isApp()) return 'app';
  if (isWeb()) return 'web';
  if (isH5()) return 'h5';
  if (isQuickappWebviewUnion()) return 'quickapp-webview-union';
  if (isQuickappWebviewHuawei()) return 'quickapp-webview-huawei';
  if (isQuickappWebview()) return 'quickapp-webview';
  return 'unknown';
}

/**
 * 获取平台详细信息
 * @returns 平台详细信息对象
 */
export function getPlatformInfo() {
  return {
    // Vue 版本
    vue2: isVue2(),
    vue3: isVue3(),
    uniAppX: isUniAppX(),

    // App 平台
    app: isApp(),
    appPlus: isAppPlus(),
    appNvue: isAppNvue(),
    appAndroid: isAppAndroid(),
    appIOS: isAppIOS(),
    appHarmony: isAppHarmony(),

    // Web 平台
    h5: isH5(),
    web: isWeb(),

    // 小程序平台
    mp: isMp(),
    mpWeixin: isMpWeixin(),
    mpAlipay: isMpAlipay(),
    mpBaidu: isMpBaidu(),
    mpToutiao: isMpToutiao(),
    mpLark: isMpLark(),
    mpQQ: isMpQQ(),
    mpKuaishou: isMpKuaishou(),
    mpJd: isMpJd(),
    mp360: isMp360(),
    mpHarmony: isMpHarmony(),
    mpXhs: isMpXhs(),

    // 快应用平台
    quickappWebview: isQuickappWebview(),
    quickappWebviewUnion: isQuickappWebviewUnion(),
    quickappWebviewHuawei: isQuickappWebviewHuawei(),

    // 当前平台
    current: getPlatform(),
  };
}

/**
 * 检查是否为移动端平台
 * @returns 是否为移动端
 */
export function isMobile(): boolean {
  return isApp() || isMp() || isQuickappWebview();
}

/**
 * 检查是否为桌面端平台
 * @returns 是否为桌面端
 */
export function isDesktop(): boolean {
  return isWeb() || isH5();
}

/**
 * 获取设备信息
 * @returns 设备信息
 */
export function getDeviceInfo() {
  const info = getSystemInfo();
  return {
    brand: info.brand, // 设备品牌
    model: info.model, // 设备型号
    system: info.system, // 操作系统及版本
    platform: info.platform, // 客户端平台
    version: info.version, // 微信版本号
    SDKVersion: info.SDKVersion, // 客户端基础库版本
    pixelRatio: info.pixelRatio, // 设备像素比
    screenWidth: info.screenWidth, // 屏幕宽度
    screenHeight: info.screenHeight, // 屏幕高度
    windowWidth: info.windowWidth, // 可使用窗口宽度
    windowHeight: info.windowHeight, // 可使用窗口高度
    statusBarHeight: info.statusBarHeight || 0, // 状态栏高度
    safeArea: info.safeArea || {}, // 安全区域
    safeAreaInsets: info.safeAreaInsets || {}, // 安全区域插入值
  };
}

/**
 * 检查是否支持某个API
 * @param api API名称
 * @returns 是否支持
 */
export function canIUse(api: string): boolean {
  return uni.canIUse(api);
}

/**
 * 获取编译器版本（需要 HBuilderX 3.9.0+）
 * @returns 编译器版本信息
 */
export function getUniVersion(): string {
  // #ifdef uniVersion
  const envGlobal = globalThis as typeof globalThis & {
    process?: { env?: { UNI_COMPILER_VERSION?: string } };
  };
  return envGlobal.process?.env?.UNI_COMPILER_VERSION || 'unknown';
  // #endif
  // #ifndef uniVersion
  return 'not-supported';
  // #endif
}

/**
 * 检查是否为小程序环境（具体的小程序平台）
 * @returns 是否为具体的小程序
 */
export function isSpecificMiniProgram(): boolean {
  return (
    isMpWeixin() ||
    isMpAlipay() ||
    isMpBaidu() ||
    isMpToutiao() ||
    isMpLark() ||
    isMpQQ() ||
    isMpKuaishou() ||
    isMpJd() ||
    isMp360() ||
    isMpHarmony() ||
    isMpXhs()
  );
}

/**
 * 检查是否为原生App环境
 * @returns 是否为原生App
 */
export function isNativeApp(): boolean {
  return isAppAndroid() || isAppIOS() || isAppHarmony();
}

/**
 * 检查是否为Web环境（包括H5和Web）
 * @returns 是否为Web环境
 */
export function isWebEnvironment(): boolean {
  return isH5() || isWeb();
}

/**
 * 检查是否为混合App环境
 * @returns 是否为混合App
 */
export function isHybridApp(): boolean {
  return isAppPlus() && !isAppNvue();
}
