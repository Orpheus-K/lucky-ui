<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkForm from '@/uni_modules/lucky-ui/components/lk-form/lk-form.vue';
import LkFormItem from '@/uni_modules/lucky-ui/components/lk-form/lk-form-item.vue';
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
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import type { FormRules } from '@/uni_modules/lucky-ui/components/lk-form/context';
import type {
  CustomRequestFn,
  UploadFile,
} from '@/uni_modules/lucky-ui/components/lk-upload/upload.props';

// 基础表单演示引用
const formRef = ref();
const showContractProbe = ref(false);

// 登录表单演示
const loginFormRef = ref();
const loginForm = reactive({
  account: '',
  password: '',
});
const loginRules: FormRules = {
  account: [{ required: true, message: '请输入账号或手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
};
const handleLogin = async () => {
  try {
    await loginFormRef.value?.validate();
    uni.showToast({ title: '登录成功', icon: 'success' });
  } catch {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
  }
};

// ==========================================
// 契约演练探针 (Contract Probe)
// ==========================================
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

// ==========================================
// 基础演示数据与方法
// ==========================================
const basicForm = reactive({
  username: '',
  phone: '',
  remark: '',
});

const basicRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'change' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'change' },
  ],
};

const handleBasicSubmit = async () => {
  try {
    await formRef.value?.validate();
    uni.showToast({ title: '提交成功', icon: 'success' });
  } catch {
    uni.showToast({ title: '请完善表单内容', icon: 'none' });
  }
};

const handleBasicReset = () => {
  formRef.value?.resetFields();
  uni.showToast({ title: '已重置', icon: 'none' });
};

// 标签布局演示
const layoutForm = reactive({
  name: '',
  intro: '',
});

// 控件组合演示
const controlsForm = reactive({
  switchVal: true,
  stepperVal: 1,
  rateVal: 4,
  radioVal: '1',
  checkboxVal: ['1'],
});
</script>

<template>
  <view class="component-demo form-demo">
    <!-- 1. 基础表单与校验 -->
    <demo-block title="基础表单与校验 (List Form)">
      <lk-form ref="formRef" :model="basicForm" :rules="basicRules" label-width="160rpx" border>
        <lk-form-item label="用户名" prop="username" required>
          <lk-input v-model="basicForm.username" placeholder="请输入用户名" borderless clearable />
        </lk-form-item>
        <lk-form-item label="手机号" prop="phone" required>
          <lk-input
            v-model="basicForm.phone"
            type="tel"
            placeholder="请输入手机号"
            borderless
            clearable
          />
        </lk-form-item>
        <lk-form-item label="备注" prop="remark">
          <lk-input v-model="basicForm.remark" placeholder="选填，请输入备注" borderless clearable />
        </lk-form-item>
        <view class="demo-form-actions">
          <lk-button type="primary" size="sm" @click="handleBasicSubmit">提交</lk-button>
          <lk-button size="sm" @click="handleBasicReset">重置</lk-button>
        </view>
      </lk-form>
    </demo-block>

    <!-- 2. 标签顶部对齐与多行反馈 -->
    <demo-block title="标签顶部对齐与多行反馈">
      <lk-form :model="layoutForm" label-align="top" border>
        <lk-form-item label="姓名" prop="name" required>
          <lk-input v-model="layoutForm.name" placeholder="请输入姓名" borderless clearable />
        </lk-form-item>
        <lk-form-item label="反馈内容" prop="intro" required>
          <lk-textarea
            v-model="layoutForm.intro"
            placeholder="请输入详细反馈建议..."
            :maxlength="100"
            show-count
            variant="flush"
            auto-height
          />
        </lk-form-item>
      </lk-form>
    </demo-block>

    <!-- 3. 常见表单控件组合 -->
    <demo-block title="常见控件组合">
      <lk-form :model="controlsForm" label-width="180rpx" border>
        <lk-form-item label="通知开关" prop="switchVal">
          <lk-switch v-model="controlsForm.switchVal" />
        </lk-form-item>
        <lk-form-item label="数量" prop="stepperVal">
          <lk-stepper v-model="controlsForm.stepperVal" :min="1" :max="10" />
        </lk-form-item>
        <lk-form-item label="评分" prop="rateVal">
          <lk-rate v-model="controlsForm.rateVal" />
        </lk-form-item>
        <lk-form-item label="单选" prop="radioVal">
          <lk-radio-group v-model="controlsForm.radioVal">
            <lk-radio name="1">选项一</lk-radio>
            <lk-radio name="2">选项二</lk-radio>
          </lk-radio-group>
        </lk-form-item>
        <lk-form-item label="多选" prop="checkboxVal">
          <lk-checkbox-group v-model="controlsForm.checkboxVal">
            <lk-checkbox label="1">选项 A</lk-checkbox>
            <lk-checkbox label="2">选项 B</lk-checkbox>
          </lk-checkbox-group>
        </lk-form-item>
      </lk-form>
    </demo-block>

    <!-- 4. 移动端卡片登录表单 -->
    <demo-block title="卡片式登录表单 (Card Login)">
      <view class="demo-card-form-wrapper">
        <lk-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
          <lk-space direction="vertical" :gap="24" fill>
            <lk-form-item prop="account">
              <lk-input
                v-model="loginForm.account"
                prefix-icon="person"
                placeholder="请输入手机号 / 账号"
                clearable
              />
            </lk-form-item>
            <lk-form-item prop="password">
              <lk-input
                v-model="loginForm.password"
                type="password"
                show-password
                prefix-icon="lock"
                placeholder="请输入登录密码"
              />
            </lk-form-item>
            <lk-button type="primary" block @click="handleLogin">立即登录</lk-button>
          </lk-space>
        </lk-form>
      </view>
    </demo-block>

    <!-- 契约演练探针 (保留于页面底部以确保自动化测试合同兼容) -->
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
      <text class="form-contract-probe__title">FORM CONTRACT PROBE (AUTOMATION FIXTURE)</text>
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
            :view-date="contractCalendarViewDate"
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
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  width: 100%;
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.demo-card-form-wrapper {
  padding: var(--lk-spacing-lg) var(--lk-spacing-md);
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-lg);
}

.demo-form-actions {
  display: flex;
  gap: 24rpx;
  padding: var(--lk-spacing-md) var(--lk-spacing-md) var(--lk-spacing-sm);
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
</style>
