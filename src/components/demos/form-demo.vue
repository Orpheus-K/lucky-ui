<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { z } from 'zod';
import LkForm from '@/uni_modules/lucky-ui/components/lk-form/lk-form.vue';
import LkFormItem from '@/uni_modules/lucky-ui/components/lk-form/lk-form-item.vue';
import LkFormGroup from '@/uni_modules/lucky-ui/components/lk-form-group/lk-form-group.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkTextarea from '@/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkPicker from '@/uni_modules/lucky-ui/components/lk-picker/lk-picker.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import type { FormRules } from '@/uni_modules/lucky-ui/components/lk-form/context';

// 表单引用
const formRef = ref();

// 交互状态控制
const isVerticalLayout = ref(false); // 是否开启上下布局
const isZodEngine = ref(true); // 是否开启 Zod 校验引擎

// 表单数据
const formData = reactive({
  title: '', // 创意名称
  category: '', // 申报领域
  fundingPeriod: '', // 众筹周期
  minFunding: '', // 起筹金额
  targetFunding: '', // 目标金额
  launchTime: '', // 启动时间
  deliveryDate: '', // 交付日期
  region: '', // 展示区域
  pitch: '', // 创意陈述
  rewardsCount: 50, // 初期回馈份数
  earlyBird: false, // 开启首批折扣
  discountRate: '', // 折扣比例
});
type DemoFormData = typeof formData;

function asDemoFormData(model: Record<string, unknown>): DemoFormData {
  return model as DemoFormData;
}

// 计算属性：动态布局对齐方式
const labelAlign = computed(() => (isVerticalLayout.value ? 'top' : 'left'));

// ==========================================
// Zod 校验规则与引擎 (简约高级版)
// ==========================================
const zodSchema = z
  .object({
    title: z.string().min(1, '请填写项目名称').max(30, '名称最多限制为30个字符'),
    category: z.string().min(1, '请选择申报领域'),
    fundingPeriod: z.string().min(1, '请选择众筹周期'),
    minFunding: z
      .string()
      .min(1, '请输入起筹限额')
      .regex(/^\d+(\.\d+)?$/, '金额必须是数字格式')
      .refine(val => Number(val) > 0, '金额需大于0'),
    targetFunding: z
      .string()
      .min(1, '请输入目标额度')
      .regex(/^\d+(\.\d+)?$/, '金额必须是数字格式')
      .refine(val => Number(val) > 0, '金额需大于0'),
    launchTime: z.string().min(1, '请指定启动时间'),
    deliveryDate: z.string().min(1, '请指定首款交付周期'),
    region: z.string().min(1, '请选择展示区'),
    pitch: z.string().min(10, '创意陈述不可少于10个字符').max(200, '创意陈述不可超过200个字符'),
    rewardsCount: z.number().min(10, '回馈数量不可低于10份').max(1000, '最多限定1000份'),
    earlyBird: z.boolean(),
    discountRate: z.string().optional(),
  })
  .refine(
    data => {
      // 联合校验：目标金额必须大于起筹金额
      const min = Number(data.minFunding);
      const target = Number(data.targetFunding);
      if (!isNaN(min) && !isNaN(target) && target < min) {
        return false;
      }
      return true;
    },
    {
      message: '目标金额需大于或等于起筹金额',
      path: ['targetFunding'],
    }
  )
  .refine(
    data => {
      // 条件校验：若开启首批折扣，折扣率必填且在0-1之间
      if (data.earlyBird) {
        if (!data.discountRate) return false;
        const rate = Number(data.discountRate);
        return !isNaN(rate) && rate > 0 && rate < 1;
      }
      return true;
    },
    {
      message: '请填写 0 到 1 之间的合理折率 (如 0.85)',
      path: ['discountRate'],
    }
  );

const isPositiveAmountText = (value: string) => /^\d+(\.\d+)?$/.test(value) && Number(value) > 0;

const setFirstError = (errors: Record<string, string>, field: string, message: string) => {
  if (!errors[field]) errors[field] = message;
};

const validateWithPortableSchema = (model: DemoFormData) => {
  const errors: Record<string, string> = {};

  if (!model.title) setFirstError(errors, 'title', '请填写项目名称');
  else if (model.title.length > 30) setFirstError(errors, 'title', '名称最多限制为30个字符');
  if (!model.category) setFirstError(errors, 'category', '请选择申报领域');
  if (!model.fundingPeriod) setFirstError(errors, 'fundingPeriod', '请选择众筹周期');
  if (!model.minFunding) setFirstError(errors, 'minFunding', '请输入起筹限额');
  else if (!isPositiveAmountText(model.minFunding))
    setFirstError(errors, 'minFunding', '金额必须是数字格式');
  if (!model.targetFunding) setFirstError(errors, 'targetFunding', '请输入目标额度');
  else if (!isPositiveAmountText(model.targetFunding))
    setFirstError(errors, 'targetFunding', '金额必须是数字格式');
  if (!model.launchTime) setFirstError(errors, 'launchTime', '请指定启动时间');
  if (!model.deliveryDate) setFirstError(errors, 'deliveryDate', '请指定首款交付周期');
  if (!model.region) setFirstError(errors, 'region', '请选择展示区');
  if (model.pitch.length < 10) setFirstError(errors, 'pitch', '创意陈述不可少于10个字符');
  else if (model.pitch.length > 200) setFirstError(errors, 'pitch', '创意陈述不可超过200个字符');
  if (model.rewardsCount < 10) setFirstError(errors, 'rewardsCount', '回馈数量不可低于10份');
  else if (model.rewardsCount > 1000) setFirstError(errors, 'rewardsCount', '最多限定1000份');

  const min = Number(model.minFunding);
  const target = Number(model.targetFunding);
  if (
    !errors.minFunding &&
    !errors.targetFunding &&
    !isNaN(min) &&
    !isNaN(target) &&
    target < min
  ) {
    setFirstError(errors, 'targetFunding', '目标金额需大于或等于起筹金额');
  }

  if (model.earlyBird) {
    const rate = Number(model.discountRate);
    if (!model.discountRate || isNaN(rate) || rate <= 0 || rate >= 1) {
      setFirstError(errors, 'discountRate', '请填写 0 到 1 之间的合理折率 (如 0.85)');
    }
  }

  return Object.keys(errors).length ? errors : null;
};

// Zod 报错解析映射；小程序 AppService 下 Zod refine 可能抛错，需兜底为字段级错误。
const zodValidator = (model: Record<string, unknown>) => {
  const demoModel = asDemoFormData(model);
  try {
    const result = zodSchema.safeParse(demoModel);
    if (!result.success) {
      const errorMap: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        if (field && !errorMap[field]) {
          errorMap[field] = issue.message;
        }
      });
      return errorMap;
    }
  } catch {
    return validateWithPortableSchema(demoModel);
  }
  return null;
};

// ==========================================
// 标准 Async-Validator 校验规则
// ==========================================
const standardRules: FormRules = {
  title: [
    { required: true, message: '请填写项目名称' },
    { max: 30, message: '名称最多限制为30个字符' },
  ],
  category: [{ required: true, message: '请选择申报领域' }],
  fundingPeriod: [{ required: true, message: '请选择众筹周期' }],
  minFunding: [
    { required: true, message: '请输入起筹限额' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入合法数字' },
  ],
  targetFunding: [
    { required: true, message: '请输入目标额度' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入合法数字' },
  ],
  launchTime: [{ required: true, message: '请指定启动时间' }],
  deliveryDate: [{ required: true, message: '请指定首款交付周期' }],
  region: [{ required: true, message: '请选择展示区' }],
  pitch: [
    { required: true, message: '请输入创意陈述' },
    { min: 10, message: '描述字数不可少于10个字符' },
  ],
  discountRate: [
    {
      validator: (val: unknown, _rule: unknown, model?: Record<string, unknown>) => {
        if (model?.earlyBird) {
          if (!val) return '折扣率必填';
          const rate = Number(val);
          if (isNaN(rate) || rate <= 0 || rate >= 1) return '折扣率范围需在 0 到 1 之间';
        }
        return true;
      },
    },
  ],
};

// Picker 状态与配置
const showCategoryPicker = ref(false);
const categoryColumns = [
  { label: '智能硬件', value: '智能硬件' },
  { label: '潮流交互', value: '潮流交互' },
  { label: '低碳科技', value: '低碳科技' },
  { label: '数字艺术', value: '数字艺术' },
];

const showPeriodPicker = ref(false);
const periodColumns = [
  { label: '30 天 (快速募集)', value: '30天' },
  { label: '60 天 (常规周期)', value: '60天' },
  { label: '90 天 (长效支持)', value: '90天' },
];

const showTimePicker = ref(false);
const timeColumns = [
  [
    { label: '09:00', value: '09:00' },
    { label: '10:00', value: '10:00' },
    { label: '14:00', value: '14:00' },
    { label: '16:00', value: '16:00' },
  ],
  [
    { label: '上午场', value: '上午场' },
    { label: '下午场', value: '下午场' },
  ],
];

const showDeliveryPicker = ref(false);
const deliveryColumns = [
  { label: '2026 Q3 季度', value: '2026年第三季度' },
  { label: '2026 Q4 季度', value: '2026年第四季度' },
  { label: '2027 Q1 季度', value: '2027年第一季度' },
];

const showRegionPicker = ref(false);
const regionColumns = [
  { label: '华东区 (上海艺术中心)', value: '华东区' },
  { label: '华南区 (深圳未来港湾)', value: '华南区' },
  { label: '华北区 (北京工体一号)', value: '华北区' },
  { label: '西南区 (成都数码绿道)', value: '西南区' },
];

// 辅助点击事件
const showTitleHelp = () => {
  uni.showModal({
    title: '填写指南',
    content: '为展示专业度，建议采用“核心技术 + 应用场景”的结构命名，如：无线静音骨传导耳机。',
    showCancel: false,
  });
};

// 提交与重置
const onSubmit = async () => {
  try {
    await formRef.value?.validate();
    uni.showModal({
      title: '项目申报已接收',
      content: JSON.stringify(formData, null, 2),
      showCancel: false,
    });
  } catch (err) {
    uni.showToast({ title: '请完善标红的错误项', icon: 'none' });
  }
};

const onReset = () => {
  formRef.value?.resetFields();
  uni.showToast({ title: '数据已清空', icon: 'none' });
};

const validateFieldSilently = async (prop: string) => {
  await nextTick();
  formRef.value?.validateField(prop).catch(() => undefined);
};

const onLaunchTimeConfirm = async (value: unknown) => {
  formData.launchTime = Array.isArray(value) ? value.join(' ') : String(value);
  await validateFieldSilently('launchTime');
};
</script>

<template>
  <view class="demo-complex-form">
    <!-- 简约高级感头部，纯白无边框，仅留白与经典文字 -->
    <view class="form-header">
      <text class="form-header__title">创意项目申报</text>
      <text class="form-header__subtitle">PROJECT DECLARATION</text>
      <view class="form-header__line" />
    </view>

    <!-- 表单区：全宽占满，带细线分隔，呈现列表化平铺 -->
    <lk-form
      ref="formRef"
      :model="formData"
      :rules="isZodEngine ? undefined : standardRules"
      :custom-validator="isZodEngine ? zodValidator : undefined"
      :label-align="labelAlign"
      label-width="190rpx"
      scrollToError
      asterisk-position="right"
      border
    >
      <!-- 分组 1: 控制参数 -->
      <lk-form-group title="DEMO ENGINE SETTING">
        <lk-form-item label="上下布局">
          <lk-switch v-model="isVerticalLayout" active-color="#111111" />
          <text class="switch-tip">{{
            isVerticalLayout ? '已切换至垂直上下排列' : '左右对齐模式'
          }}</text>
        </lk-form-item>

        <lk-form-item label="Zod 引擎">
          <lk-switch
            v-model="isZodEngine"
            inlinePrompt
            activeText="Zod"
            inactiveText="标准"
            active-color="#111111"
          />
          <text class="switch-tip">{{
            isZodEngine ? '由 Zod 引擎驱动联合校验规则' : '传统 Rules 校验规则'
          }}</text>
        </lk-form-item>
      </lk-form-group>

      <!-- 分组 2: 基本申报信息 -->
      <lk-form-group title="PART 01. BASIC INFORMATION">
        <lk-form-item label="项目名称" prop="title" required>
          <lk-input
            v-model="formData.title"
            prop="title"
            placeholder="请输入项目名称"
            :maxlength="30"
            show-word-limit
            borderless
          >
            <template #suffix>
              <lk-icon
                name="question-circle"
                color="var(--lk-text-placeholder)"
                size="32"
                custom-style="margin-left: 12rpx;"
                @click="showTitleHelp"
              />
            </template>
          </lk-input>
        </lk-form-item>

        <lk-form-item
          label="申报领域"
          prop="category"
          required
          is-link
          @tap="showCategoryPicker = true"
        >
          <view class="selector-field">
            <lk-input
              :fake="true"
              :fake-text="formData.category"
              placeholder="请选择领域"
              borderless
              custom-style="width: 100%;"
            />
          </view>
        </lk-form-item>

        <lk-form-item
          label="众筹周期"
          prop="fundingPeriod"
          required
          is-link
          @tap="showPeriodPicker = true"
        >
          <view class="selector-field">
            <lk-input
              :fake="true"
              :fake-text="formData.fundingPeriod"
              placeholder="请选择时限"
              borderless
              custom-style="width: 100%;"
            />
          </view>
        </lk-form-item>

        <lk-form-item label="筹集目标" :prop="['minFunding', 'targetFunding']" required>
          <view class="combined-funding">
            <text class="funding-label">起筹</text>
            <lk-input
              v-model="formData.minFunding"
              prop="minFunding"
              type="number"
              placeholder="额度"
              borderless
              input-align="center"
              custom-style="flex: 1; border-bottom: 2rpx solid var(--lk-color-border-light); padding: 4rpx 0;"
            />
            <text class="funding-split">/</text>
            <text class="funding-label">目标</text>
            <lk-input
              v-model="formData.targetFunding"
              prop="targetFunding"
              type="number"
              placeholder="目标"
              borderless
              input-align="center"
              custom-style="flex: 1; border-bottom: 2rpx solid var(--lk-color-border-light); padding: 4rpx 0;"
            />
            <text class="funding-unit">元</text>
          </view>
        </lk-form-item>
      </lk-form-group>

      <!-- 分组 3: 时间与展示 -->
      <lk-form-group title="PART 02. TIMELINE & REGION">
        <lk-form-item
          label="启动时段"
          prop="launchTime"
          required
          is-link
          @tap="showTimePicker = true"
        >
          <view class="selector-field">
            <lk-input
              :fake="true"
              :fake-text="formData.launchTime"
              placeholder="请选择启动时间"
              borderless
              custom-style="width: 100%;"
            />
          </view>
        </lk-form-item>

        <lk-form-item
          label="交付节点"
          prop="deliveryDate"
          required
          is-link
          @tap="showDeliveryPicker = true"
        >
          <view class="selector-field">
            <lk-input
              :fake="true"
              :fake-text="formData.deliveryDate"
              placeholder="请选择交付时间"
              borderless
              custom-style="width: 100%;"
            />
          </view>
        </lk-form-item>

        <lk-form-item
          label="展示展区"
          prop="region"
          required
          is-link
          @tap="showRegionPicker = true"
        >
          <view class="selector-field">
            <lk-input
              :fake="true"
              :fake-text="formData.region"
              placeholder="请选择区域"
              borderless
              custom-style="width: 100%;"
            />
          </view>
        </lk-form-item>
      </lk-form-group>

      <!-- 分组 4: 项目详细设定 -->
      <lk-form-group title="PART 03. DETAIL SETTINGS">
        <lk-form-item label="创意陈述" prop="pitch" required vertical>
          <view class="textarea-field">
            <lk-textarea
              class="textarea-field__control"
              v-model="formData.pitch"
              prop="pitch"
              placeholder="描述创意设计背景、技术突破及项目解决的现实痛点（10-200字之间）..."
              :maxlength="200"
              showCount
              custom-style="width: 100%; border: 2rpx solid var(--lk-color-border-light); padding: var(--lk-spacing-sm); margin-top: var(--lk-spacing-xs); background-color: var(--lk-fill-1);"
            />
          </view>
        </lk-form-item>

        <lk-form-item label="回馈份数" prop="rewardsCount" required>
          <lk-stepper
            v-model="formData.rewardsCount"
            prop="rewardsCount"
            :min="10"
            :max="1000"
            :step="5"
          />
          <text class="step-label">份 (支持设定 10 - 1000 份)</text>
        </lk-form-item>

        <lk-form-item label="首批折率" prop="earlyBird">
          <lk-switch v-model="formData.earlyBird" prop="earlyBird" active-color="#111111" />
          <text class="switch-tip">开启首批支持者专享折扣</text>
        </lk-form-item>

        <lk-form-item v-if="formData.earlyBird" label="折扣比例" prop="discountRate" required>
          <lk-input
            v-model="formData.discountRate"
            prop="discountRate"
            placeholder="例如 0.85 表示 85 折"
            type="digit"
            clearable
            borderless
          />
        </lk-form-item>
      </lk-form-group>
    </lk-form>

    <!-- 简约黑色哑光动作条 -->
    <view class="form-actions">
      <lk-button
        type="primary"
        block
        custom-style="margin-bottom: 24rpx; height: 96rpx; font-weight: 500; font-size: 30rpx; background: #111111; color: #ffffff; border: none; border-radius: 4px;"
        @click="onSubmit"
      >
        SUBMIT APPLICATION / 提交项目申报
      </lk-button>
      <lk-button
        block
        borderless
        custom-style="color: var(--lk-text-secondary); font-size: 26rpx; letter-spacing: 1px;"
        @click="onReset"
      >
        RESET / 重置数据
      </lk-button>
    </view>

    <!-- 选择器弹出层 -->
    <lk-picker
      v-model:visible="showCategoryPicker"
      v-model="formData.category"
      mode="single"
      title="申报领域"
      :columns="categoryColumns"
      @confirm="validateFieldSilently('category')"
    />

    <lk-picker
      v-model:visible="showPeriodPicker"
      v-model="formData.fundingPeriod"
      mode="single"
      title="众筹周期"
      :columns="periodColumns"
      @confirm="validateFieldSilently('fundingPeriod')"
    />

    <lk-picker
      v-model:visible="showTimePicker"
      v-model="formData.launchTime"
      mode="multi"
      title="选择启动时段"
      :columns="timeColumns"
      @confirm="onLaunchTimeConfirm"
    />

    <lk-picker
      v-model:visible="showDeliveryPicker"
      v-model="formData.deliveryDate"
      mode="single"
      title="首款预计交付"
      :columns="deliveryColumns"
      @confirm="validateFieldSilently('deliveryDate')"
    />

    <lk-picker
      v-model:visible="showRegionPicker"
      v-model="formData.region"
      mode="single"
      title="选择展示区域"
      :columns="regionColumns"
      @confirm="validateFieldSilently('region')"
    />
  </view>
</template>

<style scoped lang="scss">
.demo-complex-form {
  padding-bottom: 120rpx;
  background-color: var(--lk-bg-container);
  min-height: 100vh;
  box-sizing: border-box;

  .form-header {
    padding: 60rpx 40rpx 40rpx;
    background-color: var(--lk-bg-container);
    display: flex;
    flex-direction: column;

    &__title {
      font-size: 44rpx;
      font-weight: 700;
      color: #111111;
      letter-spacing: 1px;
    }

    &__subtitle {
      font-size: 20rpx;
      color: #999999;
      margin-top: 8rpx;
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: 2px;
    }

    &__line {
      width: 60rpx;
      height: 4rpx;
      background-color: #111111;
      margin-top: 24rpx;
    }
  }

  .switch-tip {
    font-size: 24rpx;
    color: var(--lk-text-secondary);
    margin-left: 20rpx;
  }

  .step-label {
    font-size: 24rpx;
    color: var(--lk-text-secondary);
    margin-left: 16rpx;
  }

  .selector-field {
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .textarea-field,
  .textarea-field__control {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .combined-funding {
    display: flex;
    align-items: center;
    width: 100%;

    .funding-label {
      font-size: 24rpx;
      color: var(--lk-text-secondary);
      margin-right: 12rpx;
      flex-shrink: 0;
    }

    .funding-split {
      color: var(--lk-color-border-light);
      margin: 0 20rpx;
      flex-shrink: 0;
    }

    .funding-unit {
      font-size: 26rpx;
      color: var(--lk-text-primary);
      margin-left: 12rpx;
      flex-shrink: 0;
    }
  }

  .form-actions {
    padding: 60rpx 40rpx 40rpx;
    background-color: var(--lk-bg-container);
  }
}
</style>
