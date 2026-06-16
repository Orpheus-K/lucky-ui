/**
 * 验证手机号
 */
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证身份证号（支持18位二代身份证）
 */
export function isIdCard(idCard: string): boolean {
  if (!idCard) return false;

  // 只支持18位二代身份证
  if (idCard.length !== 18) return false;

  // 基本格式验证：前17位数字 + 最后一位数字或X
  const basicReg = /^\d{17}[\dXx]$/;
  if (!basicReg.test(idCard)) return false;

  // 验证省份代码（前两位）
  const provinceCode = idCard.slice(0, 2);
  const validProvinceCodes = [
    '11',
    '12',
    '13',
    '14',
    '15',
    '21',
    '22',
    '23',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '50',
    '51',
    '52',
    '53',
    '54',
    '61',
    '62',
    '63',
    '64',
    '65',
    '71',
    '81',
    '82',
    '91',
  ];
  if (!validProvinceCodes.includes(provinceCode)) return false;

  // 验证市县代码（第3-6位）
  const cityCode = idCard.slice(2, 4);
  const countyCode = idCard.slice(4, 6);

  // 市代码验证：01-20,51-70 为省直辖市；21-50 为地区
  if (cityCode < '01' || cityCode > '99') return false;

  // 县代码验证：01-99
  if (countyCode < '01' || countyCode > '99') return false;

  // 验证出生日期（第7-14位）
  const birthYear = parseInt(idCard.slice(6, 10));
  const birthMonth = parseInt(idCard.slice(10, 12));
  const birthDay = parseInt(idCard.slice(12, 14));

  // 年份验证：1900-当前年份
  const currentYear = new Date().getFullYear();
  if (birthYear < 1900 || birthYear > currentYear) return false;

  // 月份验证：01-12
  if (birthMonth < 1 || birthMonth > 12) return false;

  // 日期验证：01-31（简单验证，不考虑每月具体天数）
  if (birthDay < 1 || birthDay > 31) return false;

  // 更精确的日期验证
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  if (
    birthDate.getFullYear() !== birthYear ||
    birthDate.getMonth() !== birthMonth - 1 ||
    birthDate.getDate() !== birthDay
  ) {
    return false;
  }

  // 验证顺序码（第15-17位）：001-999
  const sequenceCode = idCard.slice(14, 17);
  if (sequenceCode < '001' || sequenceCode > '999') return false;

  // 验证校验码（第18位）
  const checkCode = idCard.charAt(17).toUpperCase();
  const calculatedCheckCode = calculateIdCardCheckCode(idCard.slice(0, 17));

  return checkCode === calculatedCheckCode;
}

/**
 * 计算身份证校验码
 * @param idCard17 身份证前17位
 * @returns 校验码（0-9或X）
 */
function calculateIdCardCheckCode(idCard17: string): string {
  // 加权因子
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  // 校验码对应表
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard17.charAt(i)) * weights[i];
  }

  return checkCodes[sum % 11];
}

/**
 * 验证 URL
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 强度等级 0-4 (0: 无效, 1: 弱, 2: 一般, 3: 强, 4: 很强)
 */
export function getPasswordStrength(password: string): number {
  if (!password || password.length < 6) return 0;

  let strength = 0;

  // 长度
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 包含小写字母
  if (/[a-z]/.test(password)) strength++;

  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++;

  // 包含数字
  if (/\d/.test(password)) strength++;

  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  return Math.min(strength, 4);
}
