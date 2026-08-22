<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { z } from 'zod';
import LkForm from '@/uni_modules/lucky-ui/components/lk-form/lk-form.vue';
import LkFormItem from '@/uni_modules/lucky-ui/components/lk-form/lk-form-item.vue';
import LkFormGroup from '@/uni_modules/lucky-ui/components/lk-form-group/lk-form-group.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkTextarea from '@/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import LkCheckbox from '@/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox.vue';
import LkCheckboxGroup from '@/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox-group.vue';
import LkRadio from '@/uni_modules/lucky-ui/components/lk-radio/lk-radio.vue';
import LkRadioGroup from '@/uni_modules/lucky-ui/components/lk-radio/lk-radio-group.vue';
import LkRate from '@/uni_modules/lucky-ui/components/lk-rate/lk-rate.vue';
import LkSelectList from '@/uni_modules/lucky-ui/components/lk-select-list/lk-select-list.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkUpload from '@/uni_modules/lucky-ui/components/lk-upload/lk-upload.vue';
import LkCalendar from '@/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue';
import LkCalendarPicker from '@/uni_modules/lucky-ui/components/lk-calendar-picker/lk-calendar-picker.vue';
import LkKeyboard from '@/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.vue';
import LkVerifyCode from '@/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.vue';
import LkPicker from '@/uni_modules/lucky-ui/components/lk-picker/lk-picker.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import type { FormRules } from '@/uni_modules/lucky-ui/components/lk-form/context';
import type {
  CustomRequestFn,
  UploadFile,
} from '@/uni_modules/lucky-ui/components/lk-upload/upload.props';

// 表单引用
const formRef = ref();

// Deterministic Form contract probe for H5 and WeChat runtime evidence.
const contractFormRef = ref();
const contractModel = reactive({
  title: 'Initial title',
  notes: 'Initial notes',
  checkbox: [] as string[],
  radio: 'a',
  switch: false,
  stepper: 1,
  slider: 20,
  rate: 1,
  select: 'a',
});
const contractDisabled = ref(false);
const contractUploadRef = ref();
const contractUploadFiles = ref<UploadFile[]>([createContractUploadFile()]);
let contractUploadRequest: Parameters<CustomRequestFn>[0] | null = null;
const contractPickerValue = ref('a');
const contractPickerVisible = ref(false);
const contractCalendarValue = ref('2026-08-13');
const contractCalendarViewDate = ref('2026-08-01');
const contractCalendarPickerValue = ref('2026-08-13');
const contractCalendarPickerShow = ref(false);
const contractKeyboardValue = ref('');
const contractKeyboardVisible = ref(false);
const contractVerifyValue = ref('');
const contractAdvancedCounts = reactive({
  uploadUpdate: 0,
  uploadChange: 0,
  uploadSuccess: 0,
  pickerPick: 0,
  pickerConfirm: 0,
  pickerCancel: 0,
  calendarChange: 0,
  calendarPickerChange: 0,
  calendarPickerConfirm: 0,
  calendarPickerClose: 0,
  keyboardInput: 0,
  keyboardConfirm: 0,
  keyboardClose: 0,
  verifySend: 0,
  verifyCountdownEnd: 0,
});
const contractSilentResult = ref<'idle' | 'resolved' | 'rejected'>('idle');
const contractSilentEventDelta = ref(0);
const contractAsyncCounts = reactive({ started: 0, settled: 0 });
const contractEventCounts = reactive({
  fieldChange: 0,
  fieldBlur: 0,
  validateField: 0,
  validate: 0,
  reset: 0,
});
const contractRules: FormRules = {
  title: [
    { min: 4, message: 'Title needs at least 4 characters', trigger: 'change' },
    {
      message: 'Superseded async title error',
      trigger: 'change',
      validator: validateContractAsyncTitle,
    },
  ],
  notes: [{ required: true, message: 'Notes are required', trigger: 'blur' }],
};
const contractEventTotal = computed(() =>
  Object.values(contractEventCounts).reduce((total, count) => total + count, 0)
);
const contractCheckboxState = computed(() => JSON.stringify(contractModel.checkbox));
const contractOverlayOpen = computed(
  () =>
    contractPickerVisible.value || contractCalendarPickerShow.value || contractKeyboardVisible.value
);
const contractState = computed(() =>
  JSON.stringify({
    title: contractModel.title,
    notes: contractModel.notes,
    controls: {
      checkbox: contractModel.checkbox,
      radio: contractModel.radio,
      switch: contractModel.switch,
      stepper: contractModel.stepper,
      slider: contractModel.slider,
      rate: contractModel.rate,
      select: contractModel.select,
    },
    disabled: contractDisabled.value,
    eventCounts: contractEventCounts,
    silentResult: contractSilentResult.value,
    silentEventDelta: contractSilentEventDelta.value,
    asyncCounts: contractAsyncCounts,
    advanced: {
      upload: {
        status: contractUploadFiles.value[0]?.status || 'missing',
        progress: contractUploadFiles.value[0]?.progress ?? -1,
        updateCount: contractAdvancedCounts.uploadUpdate,
        changeCount: contractAdvancedCounts.uploadChange,
        successCount: contractAdvancedCounts.uploadSuccess,
      },
      picker: {
        value: contractPickerValue.value,
        visible: contractPickerVisible.value,
        pickCount: contractAdvancedCounts.pickerPick,
        confirmCount: contractAdvancedCounts.pickerConfirm,
        cancelCount: contractAdvancedCounts.pickerCancel,
      },
      calendar: {
        value: contractCalendarValue.value,
        changeCount: contractAdvancedCounts.calendarChange,
      },
      calendarPicker: {
        value: contractCalendarPickerValue.value,
        show: contractCalendarPickerShow.value,
        changeCount: contractAdvancedCounts.calendarPickerChange,
        confirmCount: contractAdvancedCounts.calendarPickerConfirm,
        closeCount: contractAdvancedCounts.calendarPickerClose,
      },
      keyboard: {
        value: contractKeyboardValue.value,
        visible: contractKeyboardVisible.value,
        inputCount: contractAdvancedCounts.keyboardInput,
        confirmCount: contractAdvancedCounts.keyboardConfirm,
        closeCount: contractAdvancedCounts.keyboardClose,
      },
      verify: {
        value: contractVerifyValue.value,
        sendCount: contractAdvancedCounts.verifySend,
        countdownEndCount: contractAdvancedCounts.verifyCountdownEnd,
      },
    },
  })
);

function createContractUploadFile(): UploadFile {
  return {
    uid: 'form-contract-upload',
    name: 'contract.png',
    url: '/static/logo.png',
    status: 'fail',
    progress: 20,
    message: 'fixed initial failure',
  };
}

function onContractUploadUpdate(files: UploadFile[]) {
  contractUploadFiles.value = files.map(file => ({ ...file }));
  contractAdvancedCounts.uploadUpdate += 1;
}

function runContractUploadRequest(options: Parameters<CustomRequestFn>[0]) {
  contractUploadRequest = options;
}

function startContractUpload() {
  contractUploadRef.value?.retryUpload(0);
}

function settleStaleContractUpload() {
  contractUploadRequest?.onSuccess({ probe: 'stale-success' });
}

async function resetContractAdvancedProbe() {
  contractDisabled.value = true;
  await nextTick();
  contractModel.checkbox = [];
  contractModel.radio = 'a';
  contractModel.switch = false;
  contractModel.stepper = 1;
  contractModel.slider = 20;
  contractModel.rate = 1;
  contractModel.select = 'a';
  contractUploadRequest = null;
  contractUploadFiles.value = [createContractUploadFile()];
  contractPickerValue.value = 'a';
  contractPickerVisible.value = false;
  contractCalendarValue.value = '2026-08-13';
  contractCalendarViewDate.value = '2026-08-01';
  contractCalendarPickerValue.value = '2026-08-13';
  contractCalendarPickerShow.value = false;
  contractKeyboardValue.value = '';
  contractKeyboardVisible.value = false;
  contractVerifyValue.value = '';
  Object.keys(contractAdvancedCounts).forEach(key => {
    contractAdvancedCounts[key as keyof typeof contractAdvancedCounts] = 0;
  });
  contractDisabled.value = false;
}

function validateContractAsyncTitle(value: unknown) {
  if (value !== 'pending-invalid') return true;
  contractAsyncCounts.started += 1;
  return new Promise<boolean>(resolve => {
    setTimeout(() => {
      contractAsyncCounts.settled += 1;
      resolve(false);
    }, 750);
  });
}

function resetContractProbe() {
  contractFormRef.value?.resetFields();
}

function toggleContractDisabled() {
  contractDisabled.value = !contractDisabled.value;
}

async function runContractSilentValidation() {
  const before = contractEventTotal.value;
  try {
    await contractFormRef.value?.validate({ fields: ['title'], silent: true });
    contractSilentResult.value = 'resolved';
  } catch {
    contractSilentResult.value = 'rejected';
  }
  await nextTick();
  contractSilentEventDelta.value = contractEventTotal.value - before;
}

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
  } catch {
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

    <view
      id="form-contract-probe"
      class="form-contract-probe"
      :data-title="contractModel.title"
      :data-notes="contractModel.notes"
      :data-disabled="contractDisabled ? 'true' : 'false'"
      :data-event-total="contractEventTotal"
      :data-change-count="contractEventCounts.fieldChange"
      :data-blur-count="contractEventCounts.fieldBlur"
      :data-validation-count="contractEventCounts.validateField"
      :data-reset-count="contractEventCounts.reset"
      :data-silent-result="contractSilentResult"
      :data-silent-event-delta="contractSilentEventDelta"
      :data-async-started="contractAsyncCounts.started"
      :data-async-settled="contractAsyncCounts.settled"
      :data-checkbox="contractCheckboxState"
      :data-radio="contractModel.radio"
      :data-switch="String(contractModel.switch)"
      :data-stepper="contractModel.stepper"
      :data-slider="contractModel.slider"
      :data-rate="contractModel.rate"
      :data-select="contractModel.select"
    >
      <text class="form-contract-probe__title">FORM CONTRACT PROBE</text>
      <lk-form
        id="form-contract-probe-form"
        ref="contractFormRef"
        :model="contractModel"
        :rules="contractRules"
        :disabled="contractDisabled"
        @field-change="contractEventCounts.fieldChange += 1"
        @field-blur="contractEventCounts.fieldBlur += 1"
        @validate-field="contractEventCounts.validateField += 1"
        @validate="contractEventCounts.validate += 1"
        @reset="contractEventCounts.reset += 1"
      >
        <lk-form-item id="form-contract-probe-title-item" label="Title" prop="title">
          <lk-input
            id="form-contract-probe-input"
            v-model="contractModel.title"
            placeholder="Contract title"
          />
        </lk-form-item>
        <lk-form-item id="form-contract-probe-notes-item" label="Notes" prop="notes" vertical>
          <lk-textarea
            id="form-contract-probe-textarea"
            v-model="contractModel.notes"
            placeholder="Contract notes"
          />
        </lk-form-item>
        <view id="form-contract-probe-controls" class="form-contract-probe__controls">
          <lk-checkbox-group id="form-contract-probe-checkbox" v-model="contractModel.checkbox">
            <lk-checkbox id="form-contract-probe-checkbox-action" name="a">
              Checkbox A
            </lk-checkbox>
          </lk-checkbox-group>
          <lk-radio-group id="form-contract-probe-radio" v-model="contractModel.radio">
            <lk-radio name="a">Radio A</lk-radio>
            <lk-radio id="form-contract-probe-radio-action" name="b">Radio B</lk-radio>
          </lk-radio-group>
          <lk-switch id="form-contract-probe-switch" v-model="contractModel.switch" />
          <lk-stepper id="form-contract-probe-stepper" v-model="contractModel.stepper" />
          <lk-slider id="form-contract-probe-slider" v-model="contractModel.slider" />
          <lk-rate id="form-contract-probe-rate" v-model="contractModel.rate" />
          <lk-select-list
            id="form-contract-probe-select"
            v-model="contractModel.select"
            :options="[
              { label: 'Select A', value: 'a' },
              { label: 'Select B', value: 'b' },
            ]"
          />
        </view>

        <view
          id="form-contract-probe-upload-state"
          class="form-contract-probe__case"
          :data-status="contractUploadFiles[0]?.status || 'missing'"
          :data-progress="contractUploadFiles[0]?.progress ?? -1"
          :data-update-count="contractAdvancedCounts.uploadUpdate"
          :data-change-count="contractAdvancedCounts.uploadChange"
          :data-success-count="contractAdvancedCounts.uploadSuccess"
        >
          <text>UPLOAD ASYNC PROBE</text>
          <lk-upload
            id="form-contract-probe-upload"
            ref="contractUploadRef"
            :model-value="contractUploadFiles"
            action="contract://pending"
            :custom-request="runContractUploadRequest"
            :show-upload="false"
            @update:model-value="onContractUploadUpdate"
            @change="contractAdvancedCounts.uploadChange += 1"
            @success="contractAdvancedCounts.uploadSuccess += 1"
          />
          <lk-button id="form-contract-probe-upload-start" size="sm" @click="startContractUpload">
            Start pending upload
          </lk-button>
          <lk-button
            id="form-contract-probe-upload-stale-success"
            size="sm"
            @click="settleStaleContractUpload"
          >
            Resolve stale upload
          </lk-button>
        </view>

        <view
          id="form-contract-probe-picker-state"
          class="form-contract-probe__case"
          :data-value="contractPickerValue"
          :data-visible="contractPickerVisible ? 'true' : 'false'"
          :data-pick-count="contractAdvancedCounts.pickerPick"
          :data-confirm-count="contractAdvancedCounts.pickerConfirm"
          :data-cancel-count="contractAdvancedCounts.pickerCancel"
        >
          <text>PICKER PROBE</text>
          <lk-button
            id="form-contract-probe-picker-open"
            size="sm"
            @click="contractPickerVisible = true"
          >
            Open picker
          </lk-button>
          <lk-picker
            id="form-contract-probe-picker"
            v-model="contractPickerValue"
            v-model:visible="contractPickerVisible"
            :columns="[
              { label: 'Picker A', value: 'a' },
              { label: 'Picker B', value: 'b' },
            ]"
            @pick="contractAdvancedCounts.pickerPick += 1"
            @confirm="contractAdvancedCounts.pickerConfirm += 1"
            @cancel="contractAdvancedCounts.pickerCancel += 1"
          />
        </view>

        <view
          id="form-contract-probe-calendar-state"
          class="form-contract-probe__case"
          :data-value="contractCalendarValue"
          :data-change-count="contractAdvancedCounts.calendarChange"
        >
          <text>CALENDAR PROBE</text>
          <lk-calendar
            id="form-contract-probe-calendar"
            v-model="contractCalendarValue"
            v-model:view-date="contractCalendarViewDate"
            min-date="2026-08-01"
            max-date="2026-08-31"
            :show-today="false"
            @change="contractAdvancedCounts.calendarChange += 1"
          />
        </view>

        <view
          id="form-contract-probe-calendar-picker-state"
          class="form-contract-probe__case"
          :data-value="contractCalendarPickerValue"
          :data-show="contractCalendarPickerShow ? 'true' : 'false'"
          :data-change-count="contractAdvancedCounts.calendarPickerChange"
          :data-confirm-count="contractAdvancedCounts.calendarPickerConfirm"
          :data-close-count="contractAdvancedCounts.calendarPickerClose"
        >
          <text>CALENDAR PICKER PROBE</text>
          <lk-button
            id="form-contract-probe-calendar-picker-open"
            size="sm"
            @click="contractCalendarPickerShow = true"
          >
            Open calendar picker
          </lk-button>
          <lk-calendar-picker
            id="form-contract-probe-calendar-picker"
            v-model="contractCalendarPickerValue"
            v-model:show="contractCalendarPickerShow"
            view-date="2026-08-01"
            min-date="2026-08-01"
            max-date="2026-08-31"
            :show-today="false"
            @change="contractAdvancedCounts.calendarPickerChange += 1"
            @confirm="contractAdvancedCounts.calendarPickerConfirm += 1"
            @close="contractAdvancedCounts.calendarPickerClose += 1"
          />
        </view>

        <view
          id="form-contract-probe-keyboard-state"
          class="form-contract-probe__case"
          :data-value="contractKeyboardValue"
          :data-visible="contractKeyboardVisible ? 'true' : 'false'"
          :data-input-count="contractAdvancedCounts.keyboardInput"
          :data-confirm-count="contractAdvancedCounts.keyboardConfirm"
          :data-close-count="contractAdvancedCounts.keyboardClose"
        >
          <text>KEYBOARD PROBE</text>
          <lk-button
            id="form-contract-probe-keyboard-open"
            size="sm"
            @click="contractKeyboardVisible = true"
          >
            Open keyboard
          </lk-button>
          <lk-keyboard
            id="form-contract-probe-keyboard"
            v-model="contractKeyboardValue"
            v-model:visible="contractKeyboardVisible"
            :vibrate="false"
            @input="contractAdvancedCounts.keyboardInput += 1"
            @confirm="contractAdvancedCounts.keyboardConfirm += 1"
            @close="contractAdvancedCounts.keyboardClose += 1"
          />
        </view>

        <view
          id="form-contract-probe-verify-state"
          class="form-contract-probe__case"
          :data-value="contractVerifyValue"
          :data-send-count="contractAdvancedCounts.verifySend"
          :data-countdown-end-count="contractAdvancedCounts.verifyCountdownEnd"
        >
          <text>VERIFY CODE PROBE</text>
          <lk-verify-code
            id="form-contract-probe-verify"
            v-model="contractVerifyValue"
            countdown
            :countdown-duration="1"
            @send="contractAdvancedCounts.verifySend += 1"
            @countdown-end="contractAdvancedCounts.verifyCountdownEnd += 1"
          />
        </view>
      </lk-form>
      <view class="form-contract-probe__actions">
        <lk-button id="form-contract-probe-reset" size="sm" @click="resetContractProbe">
          Reset initial values
        </lk-button>
        <lk-button id="form-contract-probe-disable" size="sm" @click="toggleContractDisabled">
          {{ contractDisabled ? 'Enable form' : 'Disable form' }}
        </lk-button>
        <lk-button id="form-contract-probe-silent" size="sm" @click="runContractSilentValidation">
          Silent title validation
        </lk-button>
        <lk-button
          id="form-contract-probe-advanced-reset"
          size="sm"
          @click="resetContractAdvancedProbe"
        >
          Reset advanced probes
        </lk-button>
      </view>
      <text id="form-contract-probe-state" class="form-contract-probe__state">{{
        contractState
      }}</text>
      <view
        v-if="contractOverlayOpen && !contractDisabled"
        id="form-contract-probe-overlay-disable"
        class="form-contract-probe__overlay-disable"
        role="button"
        aria-label="Disable form while overlay is open"
        @tap="toggleContractDisabled"
      >
        Disable open overlay probe
      </view>
    </view>

    <!-- 表单区：全宽占满，带细线分隔，呈现列表化平铺 -->
    <lk-form
      ref="formRef"
      :model="formData"
      :rules="isZodEngine ? undefined : standardRules"
      :custom-validator="isZodEngine ? zodValidator : undefined"
      :label-align="labelAlign"
      label-width="190rpx"
      scroll-to-error
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
            inline-prompt
            active-text="Zod"
            inactive-text="标准"
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
              v-model="formData.pitch"
              class="textarea-field__control"
              prop="pitch"
              placeholder="描述创意设计背景、技术突破及项目解决的现实痛点（10-200字之间）..."
              :maxlength="200"
              show-count
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

  .form-contract-probe {
    margin: 0 var(--lk-spacing-md) var(--lk-spacing-xl);
    padding: var(--lk-spacing-lg);
    border: var(--lk-rpx-2) solid var(--lk-color-border-light);
    border-radius: var(--lk-radius-lg);
    background: var(--lk-bg-container);

    &__title {
      display: block;
      margin-bottom: var(--lk-spacing-md);
      color: var(--lk-text-secondary);
      font-size: var(--lk-font-size-sm);
      letter-spacing: var(--lk-rpx-2);
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--lk-spacing-sm);
      margin-top: var(--lk-spacing-md);
    }

    &__controls,
    &__case {
      display: flex;
      flex-direction: column;
      gap: var(--lk-spacing-sm);
      margin-top: var(--lk-spacing-md);
      padding-top: var(--lk-spacing-md);
      border-top: var(--lk-rpx-2) solid var(--lk-color-border-light);
    }

    &__state {
      display: block;
      margin-top: var(--lk-spacing-md);
      color: var(--lk-text-secondary);
      font-size: var(--lk-font-size-xs);
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    &__overlay-disable {
      position: fixed;
      top: var(--lk-spacing-md);
      right: var(--lk-spacing-md);
      z-index: 20000;
      padding: var(--lk-spacing-sm) var(--lk-spacing-md);
      border-radius: var(--lk-radius-md);
      background: var(--lk-color-danger);
      color: var(--lk-text-inverse);
      font-size: var(--lk-font-size-sm);
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
