<template>
  <div class="modelData">
    <el-dialog
      v-model="modelDataShow"
      title="模型数据管理"
      top="1vh"
      :footer="null"
      width="90%"
      :bodyStyle="{ padding: '24px' }"
      class="model-data-modal">
      <div class="data-container">
        <div class="toolbar">
          <div class="toolbar-left">
            <!-- 这里原来为新增模型字样 -->
            <a-button type="primary" size="large" @click="addModelBtn" class="add-btn">
              <template #icon>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </template>
              配置模型
            </a-button>
          </div>
          <div class="toolbar-center">
            <a-input v-model:value="searchKeyword" placeholder="搜索模型名称..." size="large" allow-clear class="search-input">
              <template #prefix>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#8c8c8c">
                  <path
                    d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </template>
            </a-input>
          </div>
          <div class="toolbar-right">
            <a-badge :count="filteredTableData.length" :number-style="{ backgroundColor: '#52c41a' }">
              <div class="model-count">共 {{ filteredTableData.length }} 个模型</div>
            </a-badge>
          </div>
        </div>

        <!-- 原有列表展示逻辑已隐藏 -->
        <!-- <div class="table-wrapper">
          <vxe-table
            ref="tableRef"
            :data="filteredTableData"
            :radio-config="{ highlight: true, checkMethod: checkRadioMethod, trigger: 'row' }"
            :row-config="{ isHover: true }"
            stripe
            border="inner"
            round
            class="custom-table">
            ... 
          </vxe-table>
        </div> -->

        <!-- 新的卡片展示逻辑 -->
        <div class="card-grid-wrapper">
          <div v-for="row in filteredTableData" :key="row.id" 
               class="model-item-card" 
               :class="{ 'is-selected': selectedCardId === row.id }"
               @click="selectCard(row)">
            <div class="card-selection-indicator" v-if="row.type === props.currentType">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            
            <div class="card-main-info">
              <div class="card-top">
                <a-tag color="blue" class="manufacturer-badge">{{ row.manufacturer }}</a-tag>
                <div class="model-type-icon">
                  <span v-if="row.type == 'text'">📝</span>
                  <span v-if="row.type == 'image'">🖼️</span>
                  <span v-if="row.type == 'video'">🎬</span>
                </div>
              </div>
              
              <h3 class="card-model-name">{{ row.model }}</h3>
              
              <div class="card-detail">
                <div class="detail-row">
                  <span class="detail-label">Base URL:</span>
                  <span class="detail-value text-truncate">{{ row.baseUrl || "默认" }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">API Key:</span>
                  <div class="api-key-container">
                    <span class="detail-value">{{ visibleMap[row.id] ? row.apiKey : "••••••••" }}</span>
                    <a-button type="text" size="small" class="view-btn" @click.stop="setVisible(row.id, !visibleMap[row.id])">
                      <i-preview-open v-if="!visibleMap[row.id]" theme="outline" size="14" fill="#8c8c8c" />
                      <i-preview-close v-else theme="outline" size="14" fill="#1890ff" />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-footer" @click.stop>
              <a-space size="small">
                <a-button type="primary" ghost size="small" :loading="row.load" @click="testAi(row)" class="card-action-btn">测试</a-button>
                <a-button size="small" @click="editModelBtn(row)" class="card-action-btn">编辑</a-button>
                <a-popconfirm title="确定要删除此模型吗？" ok-text="确定" cancel-text="取消" @confirm="delModelBtn(row)">
                  <a-button danger size="small" class="card-action-btn">删除</a-button>
                </a-popconfirm>
              </a-space>
            </div>
          </div>
          
          <div v-if="filteredTableData.length === 0" class="empty-placeholder">
            <a-empty description="暂无符合搜索条件的模型" />
          </div>
        </div>

        <div class="footer-actions">
          <a-space size="middle">
            <a-button size="large" @click="modelDataShow = false">取消</a-button>
            <a-button type="primary" size="large" @click="confirmConfig" class="confirm-btn">
              <template #icon>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </template>
              确认配置
            </a-button>
          </a-space>
        </div>
      </div>
    </el-dialog>

    <modeListDialog
      v-model:modelShow="modelShow"
      :typeList="['text', 'image']"
      v-model:modelForm="modelForm"
      :state="state"
      @fetchModelList="fetchModelList" />

    <addModelDialog
      v-model="editDialogVisible"
      v-model:modelForm="editModelForm"
      :currentWebsite="currentWebsite"
      :isCustomModel="false"
      :defaultPlaceHolder="defaultPlaceHolder"
      :manufacturerNames="manufacturerNames"
      :agentKey="configingModel?.key"
      @fetchModelList="fetchModelList" />

    <!-- 图像测试结果预览弹窗 -->
    <el-dialog v-model="testImageModalVisible" top="1vh" :footer="null" centered width="80%" class="test-result-modal">
      <template #header>
        <div class="result-modal-header">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#52c41a" style="margin-right: 8px">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>图像生成测试成功</span>
        </div>
      </template>
      <div class="test-result-content">
        <p class="test-result-tip">
          <a-tag color="success" style="font-size: 14px">✅ 配置正确</a-tag>
          图像模型配置正确，以下是生成的测试图片：
        </p>
        <div class="test-image-wrapper">
          <a-image :src="testImageResult" :preview="{ src: testImageResult }" class="test-image-preview" />
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="testVideoVisible" top="1vh" :footer="null" centered width="80%" class="test-result-modal">
      <template #header>
        <div class="result-modal-header">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#52c41a" style="margin-right: 8px">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>视频生成测试成功</span>
        </div>
      </template>
      <div class="test-result-content">
        <p class="test-result-tip">
          <a-tag color="success" style="font-size: 14px">✅ 配置正确</a-tag>
          视频模型配置正确，以下是生成的测试视频：
        </p>
        <div class="test-video-wrapper">
          <video :src="testVideoResult" controls class="test-video-preview" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";
import { message, Modal } from "ant-design-vue";
import axios from "@/utils/axios";
import modeListDialog from "./modeListDialog.vue";
import addModelDialog from "./addModelDialog.vue";
import { ElMessage } from "element-plus";
import { AI_API_BASE_URL, AI_API_BASE_URL_V1 } from "@/config/api";
const modelDataShow = defineModel("modelDataShow", {
  type: Boolean,
  required: true,
});
const props = defineProps({
  currentType: {
    type: String,
    default: "text",
  },
});
interface ModelType {
  id: number;
  model: string;
  name: string;
  key: string;
}
const configingModel = defineModel<ModelType>("configingModel");
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
  load?: boolean;
}
const tableRef = ref();
const state = ref("");
const modelShow = ref(false);
const tableData = ref<RowData[]>([]);
const searchKeyword = ref("");
const selectedCardId = ref<number | null>(null);

function selectCard(row: RowData) {
  if (row.type !== props.currentType) {
    message.warning(`此模型类型为 [${row.type}]，无法用于当前 [${props.currentType}] 模块`);
    return;
  }
  selectedCardId.value = row.id;
}

// 根据搜索关键词过滤表格数据
const filteredTableData = computed(() => {
  if (!searchKeyword.value) {
    return tableData.value;
  }
  const keyword = searchKeyword.value.toLowerCase().trim();
  return tableData.value.filter((item) => {
    return item.model.toLowerCase().includes(keyword);
  });
});
//模型表单数据
const modelForm = ref<RowData>({
  id: 0,
  name: "",
  type: "",
  modelType: "",
  model: "",
  apiKey: "",
  baseUrl: "",
  manufacturer: "",
  createTime: 0,
  load: false,
});
// 配置模型 (原来为新增模型，现改为直接跳转到超级斜杠配置)
function addModelBtn() {
  state.value = "配置模型";
  editModelForm.value = {
    id: 0,
    name: "",
    type: props.currentType || "text",
    modelType: "",
    model: "",
    apiKey: "",
    baseUrl: manufacturerDefaultBaseUrls["ricoxueai"]?.[props.currentType] || AI_API_BASE_URL_V1,
    manufacturer: "ricoxueai",
    createTime: 0,
  };
  editDialogVisible.value = true;
}
// 单选框校验方法，只允许选择与 currentType 相同的 type
function checkRadioMethod({ row }: { row: RowData }) {
  return row.type == props.currentType;
}
const visibleMap = reactive<Record<string | number, boolean>>({});
function setVisible(id: string | number, val: boolean) {
  visibleMap[id] = val;
}
const testImageResult = ref<string>("");
const testImageModalVisible = ref(false);

const testVideoVisible = ref(false);
const testVideoResult = ref<string>("");

// 编辑对话框相关
const editDialogVisible = ref(false);
const editModelForm = ref<RowData>({
  id: 0,
  name: "",
  type: "",
  modelType: "",
  model: "",
  apiKey: "",
  baseUrl: "",
  manufacturer: "",
  createTime: 0,
});

// 网站链接配置
const websites = ref<Record<string, string>>({
  deepSeek: "https://platform.deepseek.com",
  volcengine: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
  kling: "https://app.klingai.com/cn/dev/api-key",
  zhipu: "https://bigmodel.cn/usercenter/proj-mgmt/apikeys",
  qwen: "https://bailian.console.aliyun.com/cn-beijing/?tab=model#/api-key",
  wan: "https://bailian.console.aliyun.com/cn-beijing/?tab=model#/api-key",
  openai: "",
  vidu: "https://platform.vidu.cn/api-keys",
  anthropic: "",
  runninghub: "https://www.runninghub.cn/enterprise-api/consumerApi",
  gemini: "https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn",
  ricoxueai: `${AI_API_BASE_URL}/pricing`,
});

const currentWebsite = computed(() => {
  return websites.value[editModelForm.value.manufacturer] || "";
});

// 厂商名称映射
const manufacturerNames: Record<string, string> = {
  deepSeek: "DeepSeek",
  volcengine: "火山引擎",
  kling: "可灵",
  zhipu: "智谱",
  qwen: "阿里千问",
  wan: "阿里万相",
  openai: "OpenAI",
  vidu: "Vidu",
  anthropic: "Anthropic",
  runninghub: "RunningHUB",
  gemini: "Gemini",
  ricoxueai: "超级斜杠",
  other: "其他",
};

// 厂商默认 BaseURL 配置
const manufacturerDefaultBaseUrls: Record<string, Record<string, string>> = {
  deepSeek: {
    text: "https://api.deepseek.com",
  },
  volcengine: {
    text: "https://ark.cn-beijing.volces.com/api/v3",
  },
  kling: {
    image: "https://api.klingai.com",
    video: "https://api.klingai.com",
  },
  zhipu: {
    text: "https://open.bigmodel.cn/api/paas/v4",
    image: "https://open.bigmodel.cn/api/paas/v4",
    video: "https://open.bigmodel.cn/api/paas/v4",
  },
  qwen: {
    text: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  wan: {
    image: "https://dashscope.aliyuncs.com/api/v1/services/aigc/",
  },
  openai: {
    text: "https://api.openai.com/v1",
    image: "https://api.openai.com/v1",
  },
  vidu: {
    video: "https://api.vidu.studio/v1",
  },
  anthropic: {
    text: "https://api.anthropic.com",
  },
  gemini: {
    text: "https://generativelanguage.googleapis.com",
  },
  ricoxueai: {
    text: AI_API_BASE_URL_V1,
    image: AI_API_BASE_URL_V1,
    video: AI_API_BASE_URL_V1,
  },
};

// 获取默认 BaseURL 的 placeholder
const defaultPlaceHolder = computed((): string => {
  const { manufacturer, type } = editModelForm.value;
  if (!manufacturer || manufacturer === "runninghub") {
    return "请输入 Base URL";
  }

  if (type && manufacturerDefaultBaseUrls[manufacturer]) {
    const defaultUrl = manufacturerDefaultBaseUrls[manufacturer][type];
    return defaultUrl ? `默认: ${defaultUrl}` : "请输入 Base URL";
  }

  return "请输入 Base URL";
});
async function testAi(row: RowData) {
  const { model, apiKey, baseUrl, manufacturer } = row;

  if (!model) {
    message.warning("请先填写模型名称");
    return;
  }
  if (!apiKey) {
    message.warning("请先填写 API Key");
    return;
  }
  if (!manufacturer) {
    message.warning("请先选择厂商");
    return;
  }
  row.load = true;

  try {
    let queryUrl = "";
    if (row.type == "text") {
      queryUrl = "/other/testAI";
    } else if (row.type == "image") {
      queryUrl = "/other/testImage";
    } else if (row.type == "video") {
      queryUrl = "/other/testVideo";
    }
    if (!queryUrl) {
      row.load = false;
      return message.warning("type 错误");
    }
    const res = await axios.post(queryUrl, {
      modelName: model,
      apiKey: apiKey,
      baseURL: baseUrl || undefined,
      manufacturer,
    });

    if (row.type == "text") {
      ElMessage.success("连接成功！模型配置正确");
    }
    if (row.type == "image") {
      ElMessage.success("连接成功！图像模型配置正确");
      // 显示生成的图片
      if (res.data) {
        testImageResult.value = res.data;
        testImageModalVisible.value = true;
      }
    }
    if (row.type == "video") {
      ElMessage.success("连接成功！视频模型配置正确");
      if (res.data) {
        testVideoResult.value = res.data;
        testVideoVisible.value = true;
      }
    }
  } catch (e: any) {
    message.error(`连接失败: ${e.message}`);
  } finally {
    row.load = false;
  }
}
//编辑模型
function editModelBtn(row: RowData) {
  editModelForm.value = { ...row };
  editDialogVisible.value = true;
}
watch(
  () => modelDataShow.value,
  (val) => {
    if (val == true) {
      fetchModelList();
    }
  },
  { deep: true },
);
//查询模型列表
async function fetchModelList() {
  const res = await axios.post("/setting/getSetting");
  tableData.value = res.data;
}

//删除模型
function delModelBtn(row: RowData) {
  axios
    .post("/setting/delModel", { id: row.id })
    .then(() => {
      message.success("模型删除成功");
      fetchModelList();
      emit("modelList");
    })
    .catch(() => {
      message.error("模型删除失败");
    });
}
const emit = defineEmits(["modelList"]);
// 确认配置
async function confirmConfig() {
  const selectedId = selectedCardId.value;
  if (!selectedId) {
    message.warning("请先选择一个模型卡片");
    return;
  }
  try {
    await axios.post("/setting/configurationModel", {
      id: configingModel.value?.id,
      configId: selectedId,
    });

    message.success("配置成功");
    tableRef.value?.clearRadioRow();
    modelDataShow.value = false;
    emit("modelList");
  } catch {
    message.error("配置失败，请重试");
  }
}
</script>

<style lang="scss" scoped>
.modelData {
  :deep(.model-data-modal) {
    .ant-modal-content {
      border-radius: 12px;
      overflow: hidden;
    }

    .ant-modal-header {
      padding: 0;
      border-bottom: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .ant-modal-body {
      padding: 24px;
      background: #f5f7fa;
    }
  }
}

.modal-header {
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);

    svg {
      color: white;
    }
  }

  .header-text {
    flex: 1;
  }

  .header-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: white;
  }

  .header-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.data-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;

  .toolbar-left {
    .add-btn {
      height: 40px;
      padding: 0 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
      }

      svg {
        margin-right: 6px;
      }
    }
  }

  .toolbar-center {
    flex: 1;
    max-width: 400px;
    margin: 0 24px;

    .search-input {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      transition: all 0.3s ease;

      :deep(.ant-input) {
        font-size: 14px;
        border-radius: 8px;
      }

      :deep(.ant-input-affix-wrapper) {
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &:focus,
        &.ant-input-affix-wrapper-focused {
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
          border-color: #40a9ff;
        }
      }
    }
  }

  .toolbar-right {
    .model-count {
      padding: 8px 16px;
      background: #f0f5ff;
      border-radius: 20px;
      font-size: 14px;
      color: #1890ff;
      font-weight: 500;
    }
  }
}

.card-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px;

  .model-item-card {
    background: #fff;
    border-radius: 12px;
    border: 2px solid #f0f0f0;
    padding: 16px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;

    &:hover {
      border-color: #d6e4ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    &.is-selected {
      border-color: #1890ff;
      background: #f0f7ff;
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);

      .card-selection-indicator {
        color: #1890ff;
        opacity: 1;
      }
    }

    .card-selection-indicator {
      position: absolute;
      top: 12px;
      right: 12px;
      color: #bfbfbf;
      opacity: 0.3;
      transition: all 0.3s ease;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .manufacturer-badge {
        margin: 0;
        border-radius: 4px;
        font-weight: 600;
        font-size: 11px;
      }

      .model-type-icon {
        font-size: 18px;
      }
    }

    .card-model-name {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #262626;
      line-height: 1.4;
      font-family: "Consolas", "Monaco", monospace;
      word-break: break-all;
    }

    .card-detail {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .detail-row {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .detail-label {
          font-size: 11px;
          color: #8c8c8c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 13px;
          color: #595959;
          font-family: "Consolas", "Monaco", monospace;

          &.text-truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .api-key-container {
          display: flex;
          align-items: center;
          gap: 6px;

          .view-btn {
            padding: 0;
            height: auto;
            line-height: 1;
          }
        }
      }
    }

    .card-footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 12px;
      display: flex;
      justify-content: center;

      .card-action-btn {
        border-radius: 6px;
        font-size: 12px;
      }
    }
  }

  .empty-placeholder {
    grid-column: 1 / -1;
    padding: 60px 0;
  }
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;

  .confirm-btn {
    height: 40px;
    padding: 0 32px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    }

    svg {
      margin-right: 6px;
    }
  }
}

// 测试结果弹窗样式
:deep(.test-result-modal) {
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-modal-header {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    border-bottom: none;
    padding: 20px 24px;
  }

  .ant-modal-body {
    padding: 24px;
  }
}

.result-modal-header {
  display: flex;
  align-items: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.test-result-content {
  .test-result-tip {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #f6ffed;
    border-left: 4px solid #52c41a;
    border-radius: 4px;
    font-size: 14px;
    color: #262626;
    line-height: 1.6;
  }

  .test-image-wrapper,
  .test-video-wrapper {
    display: flex;
    justify-content: center;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 2px dashed #d9d9d9;
  }

  .test-image-preview {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .test-video-preview {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .toolbar-left,
    .toolbar-right {
      width: 100%;
    }
  }

  .action-buttons {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.data-container {
  animation: fadeIn 0.3s ease;
}
</style>
