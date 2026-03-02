<template>
  <el-dialog v-model="showConfigModal" :title="configModalTitle" :footer="null" width="520px">
    <a-form :model="modelForm">
      <a-form-item label="模型名称">
        <a-input v-model:value="modelForm.model" placeholder="请输入模型标识" :disabled="isFieldDisabled" />
      </a-form-item>
      <a-form-item label="Base URL" v-if="modelForm.manufacturer !== 'runninghub'">
        <a-input v-model:value="modelForm.baseUrl" :placeholder="props.defaultPlaceHolder" :disabled="isFieldDisabled" />
      </a-form-item>
      <a-form-item label="API Key">
        <a-input-password v-model:value="modelForm.apiKey" placeholder="请输入 API Key" />
      </a-form-item>
      <a-form-item v-if="currentWebsite">
        <a :href="currentWebsite" target="_blank" rel="noopener noreferrer" style="font-size: 14px">
          点击获取 {{ modelForm.manufacturer === 'ricoxueai' ? '超级斜杠' : (manufacturerNames[modelForm.manufacturer] ?? modelForm.manufacturer) }} API Key
        </a>
      </a-form-item>
      <a-form-item style="text-align: right; margin-bottom: 0">
        <a-button style="margin-right: 8px" @click="showConfigModal = false">取消</a-button>
        <a-button type="primary" @click="keep">保存</a-button>
      </a-form-item>
    </a-form>
  </el-dialog>
</template>

<script setup lang="ts">
import axios from "@/utils/axios";
import { ElMessage } from "element-plus";
import { ref, computed, watch } from "vue";
import modelConfig from "@/config/modelMapping.json";
interface RowData {
  id: number;
  name: string;
  type: string;
  modelType: string;
  model: string;
  baseUrl: string;
  manufacturer: string;
  createTime: number;
  apiKey: string;
}
const props = defineProps({
  currentWebsite: {
    type: String,
    default: "",
  },
  isCustomModel: {
    type: Boolean,
    default: false,
  },
  defaultPlaceHolder: {
    type: String,
    default: "",
  },
  manufacturerNames: {
    type: Object,
    default: {},
  },
  agentKey: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["fetchModelList"]);
const showConfigModal = defineModel<boolean>({
  default: false,
});
const modelForm = defineModel<RowData>("modelForm", {
  default: () => ({
    manufacturer: "",
    model: "",
    baseUrl: "",
    apiKey: "",
    id: 0,
    type: "",
    modelType: "",
  }),
});

// 模块与模型的映射关系
const AGENT_MODEL_MAP = modelConfig.agentModelMap;

// 是否禁用特定的模型名称和 Base URL 字段
const isFieldDisabled = computed(() => {
  // 如果是指定的 Agent 或者是视频类型，则禁用
  const mapping = AGENT_MODEL_MAP as Record<string, string>;
  return !!(props.agentKey && mapping[props.agentKey]) || modelForm.value.type === "video";
});

watch(
  [() => props.agentKey, () => modelForm.value.type],
  ([newAgentKey, newType]) => {
    if (newAgentKey && (AGENT_MODEL_MAP as any)[newAgentKey as string]) {
      modelForm.value.model = (AGENT_MODEL_MAP as any)[newAgentKey as string];
      modelForm.value.baseUrl = modelConfig.baseUrl;
    } else if (newType === "video") {
      modelForm.value.model = modelConfig.globalMAPPING.video;
      modelForm.value.baseUrl = modelConfig.baseUrl;
    }
  },
  { immediate: true },
);

const configModalTitle = computed(() => {
  if (props.isCustomModel) {
    return "配置自定义模型";
  }
  if (modelForm.value.manufacturer === "ricoxueai") {
    return "配置超级斜杠模型";
  }
  return `配置 ${modelForm.value.model}`;
});
async function keep() {
  const { type, modelType, model, baseUrl, manufacturer, apiKey, id } = modelForm.value;

  // 验证必填项
  if (!model) {
    ElMessage.error("请输入模型标识");
    return;
  }
  if (!apiKey) {
    ElMessage.error("请输入 API Key");
    return;
  }
  if (manufacturer == "other" && baseUrl.trim() == "") {
    ElMessage.error("请输入 Base URL");
    return;
  }
  if (id == 0) {
    try {
      await axios.post("/setting/addModel", {
        modelType: modelType || "",
        type,
        model,
        baseUrl,
        manufacturer,
        apiKey,
      });
      ElMessage.success("新增成功");
      emit("fetchModelList");
    } catch (e) {
      ElMessage.error("新增失败");
    }
  } else {
    try {
      await axios.post("/setting/updateModel", {
        id,
        type,
        modelType: modelType || "",
        model,
        baseUrl,
        manufacturer,
        apiKey,
      });
      ElMessage.success("编辑成功");
      emit("fetchModelList");
    } catch (e) {
      ElMessage.error("编辑失败");
    }
  }

  showConfigModal.value = false; //关闭弹窗
}
</script>

<style lang="scss" scoped></style>
