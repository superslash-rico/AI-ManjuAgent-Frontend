<template>
  <div class="settingContainer">
    <span>设置</span>
    <div class="model">
      <div class="jb c" style="margin-top: 10px">
        <h1 style="font-size: 18px; display: block">AI 模型配置</h1>
      </div>

      <!-- 全局配置表单 (精简版) -->
      <div class="global-config-section">
        <div class="compact-config-bar">
          <div class="config-title">配置超级斜杠API</div>
          <div class="config-inputs">
            <div class="input-item">
              <span class="label">API Key</span>
              <a-input-password v-model:value="globalApiKey" placeholder="输入 API Key" size="middle"
                class="compact-input" />
            </div>
            <div class="input-item">
              <span class="label">Base URL</span>
              <a-input v-model:value="globalBaseUrl" disabled size="middle" class="compact-input" />
            </div>
            <a-button type="primary" size="middle" :loading="isBatchConfiguring" @click="autoConfigureAll"
              class="compact-btn">
              一键配置
            </a-button>
            <a-button size="middle" :loading="isSavingApiKey" @click="saveApiKeyOnly" class="compact-btn">
              仅保存
            </a-button>
          </div>
        </div>
      </div>

      <div class="model-grid">
        <div v-for="(item, index) in modelData" :key="index" class="model-card-item">
          <!-- 禁用单独配置点击，只能通过顶部一键配置 -->
          <a-card class="model-config-card disabled-card">
            <template #title>
              <div class="card-title-wrapper">
                <div class="card-icon">
                  <i-brain theme="outline" size="20" fill="currentColor" v-if="item.key.includes('Agent')" />
                  <i-text theme="outline" size="20" fill="currentColor"
                    v-else-if="item.key.includes('Script') || item.key.includes('Prompt')" />
                  <i-picture theme="outline" size="20" fill="currentColor" v-else />
                </div>
                <span class="card-title-text">{{ item.name }}</span>
              </div>
            </template>
            <div class="card-content">
              <div class="model-info">
                <div class="model-label">当前模型:</div>
                <div class="model-value" v-if="item.configModel">
                  <a-tag color="blue">{{ item.configModel }}</a-tag>
                </div>
                <div class="model-value unconfigured" v-else>
                  <i-attention theme="outline" size="14" fill="#faad14" />
                  <span>未配置</span>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </div>

    <div class="video-model-section">
      <div class="section-header">
        <h1 class="section-title">
          <i-video theme="outline" size="20" fill="currentColor" />
          视频模型配置
        </h1>
      </div>

      <!-- 仅支持单个视频模型，通过上方一键配置 -->
      <div class="video-model-card-single" v-if="currentVideoModel">
        <a-card class="fixed-video-card">
          <div class="video-card-body-horizontal">
            <div class="video-icon-large">
              <i-video theme="filled" size="32" fill="#9913FA" />
            </div>
            <div class="video-info-main">
              <div class="video-model-row">
                <span class="video-model-name-large">{{ currentVideoModel.model }}</span>
                <a-tag :color="getManufacturerTagColor(currentVideoModel.manufacturer)" class="manufacturer-tag-large">
                  {{ getManufacturerName(currentVideoModel.manufacturer) }}
                </a-tag>
              </div>
              <div class="video-detail-row">
                <div class="detail-item">
                  <span class="detail-label">Base URL:</span>
                  <span class="detail-value">{{ currentVideoModel.baseUrl || "默认" }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">创建时间:</span>
                  <span class="detail-value">{{ formatTime(currentVideoModel.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </div>
      <a-empty v-else description="暂无视频模型配置，请使用上方“超级斜杠配置”一键设置" class="empty-state">
        <template #image>
          <i-video theme="outline" size="64" fill="#d9d9d9" />
        </template>
      </a-empty>
    </div>
    <div class="other">
      <h1 class="otherConfiguration">其他配置</h1>
      <div class="prompt">
        <a-card title="提示词" style="width: 100%">
          <template #extra>
            <a-button type="primary" class="addBtn" @click="promptEditorShow = true">
              <div class="c">
                <i-edit theme="outline" size="14" fill="currentColor" />
                编辑提示词
              </div>
            </a-button>
          </template>
          <div class="promptData">管理和自定义AIAgent的提示词,可修改主Agent、子Agent和系统提示词</div>
        </a-card>
      </div>
      <div class="sql">
        <a-card title="数据库" style="width: 100%">
          <template #extra>
            <span class="dangerBadge">危险区域</span>
          </template>
          <div class="sqlData">
            <p>以下操作不可逆，请谨慎执行</p>
            <div class="dangerActions" style="display: flex; gap: 12px">
              <a-button danger @click="deleteAllData">
                <i-clear theme="outline" size="14" fill="currentColor" />
                清空数据库
              </a-button>
              <a-button danger type="primary" @click="clearDatabase">
                <i-delete theme="outline" size="14" fill="currentColor" />
                删除数据库
              </a-button>
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <PromptEditor v-model="promptEditorShow" />
    <newModelData v-model:modelDataShow="modelDataShow" :currentType="currentType"
      v-model:configingModel="configingModel" @modelList="modelList" />
    <!-- 多模型选择已注释，仅通过一键配置
    <ModeListDialog :typeList="['video']" v-model:modelShow="videoModelDialogShow" state="选择视频模型"
      @fetchModelList="onVideoModelDialogClose" />
    -->
    <addModelDialog v-model="editDialogVisible" v-if="editDialogVisible" v-model:modelForm="editForm"
      @fetchModelList="loadVideoModels" />
  </div>
</template>

<script setup lang="ts">
import axios from "@/utils/axios";
import { message, Modal } from "ant-design-vue";
import PromptEditor from "./components/promptEditor.vue";
import newModelData from "./components/modelData.vue";
// import ModeListDialog from "./components/modeListDialog.vue"; // 多模型已注释
import addModelDialog from "./components/addModelDialog.vue";
import modelConfig from "@/config/modelMapping.json";
import { AI_API_BASE_URL_V1 } from "@/config/api";

import dayjs from "dayjs";

const promptEditorShow = ref(false);
interface ModelType {
  id: number;
  model: string;
  configModel: string;
  name: string;
  key: string;
}
const editForm = ref();
interface VideoModelType {
  id: number;
  model: string;
  modelType: string;
  manufacturer: string;
  baseUrl: string;
  apiKey: string;
  createTime: number;
  type: string;
}

const modelData = ref<ModelType[]>([]);
const videoModels = ref<VideoModelType[]>([]);
const currentType = ref("");
const videoModelDialogShow = ref(false);

// 仅展示一个视频模型（取列表首项）
const currentVideoModel = computed(() => videoModels.value[0] ?? null);

// 全局配置相关
const globalApiKey = ref("");
const globalBaseUrl = ref(AI_API_BASE_URL_V1);
const isBatchConfiguring = ref(false);
const isSavingApiKey = ref(false);

const GLOBAL_MODEL_MAPPING = modelConfig.globalMAPPING;

async function saveApiKeyOnly() {
  if (!globalApiKey.value) return message.warning("请先输入 API Key");
  isSavingApiKey.value = true;
  try {
    await axios.post("/setting/saveGlobalApiKey", { apiKey: globalApiKey.value });
    message.success("API Key 已保存");
  } catch (e) {
    message.error("保存失败");
  } finally {
    isSavingApiKey.value = false;
  }
}

async function autoConfigureAll() {
  if (!globalApiKey.value) {
    return message.warning("请先输入 API Key");
  }

  isBatchConfiguring.value = true;
  try {
    // 0. 仅允许一个视频模型，先删除已有视频模型
    const videoListRes = await axios.post("/setting/getVideoModelList", { type: "video" });
    const existingVideos = Array.isArray(videoListRes.data) ? videoListRes.data : [];
    for (const v of existingVideos) {
      await axios.post("/setting/delModel", { id: v.id });
    }

    // 1. 创建所需的 4 个模型（text*1, image*2, video*1）
    const modelSpecs = [
      { type: "text", model: GLOBAL_MODEL_MAPPING.text },
      { type: "image", model: GLOBAL_MODEL_MAPPING.image.default },
      { type: "image", model: GLOBAL_MODEL_MAPPING.image.editImage },
      { type: "video", model: GLOBAL_MODEL_MAPPING.video },
    ];

    const modelIdMap: Record<string, number> = {};

    for (const spec of modelSpecs) {
      const res = await axios.post("/setting/addModel", {
        type: spec.type,
        modelType: spec.type === "video" ? "text" : "", // 视频模型在系统中通常需要一个 modelType，这里暂设为 text 或按需调整
        model: spec.model,
        baseUrl: globalBaseUrl.value,
        manufacturer: "ricoxueai",
        apiKey: globalApiKey.value,
      });
      // 假设后端返回的对象中有 id，或者我们需要重新查询列表来获取刚创建的 ID
      // 实际开发中如果 addModel 不返回 ID，可能需要查询
      // 这里根据 addModelDialog.vue 推测 addModel 是成功的，为了保险，我们批量添加后刷新列表
    }

    // 2. 刷新所有模型列表以获取最新的 ID
    const allModelsRes = await axios.post("/setting/getSetting");
    const allModels = allModelsRes.data;

    // 3. 建立 模型名称 -> ID 的映射
    allModels.forEach((m: any) => {
      if (m.manufacturer === "ricoxueai" && m.apiKey === globalApiKey.value) {
        modelIdMap[m.model] = m.id;
      }
    });

    // 4. 为每个 Agent 模块绑定模型
    for (const agent of modelData.value) {
      let targetModelName = "";
      if (agent.key === "editImage") {
        targetModelName = GLOBAL_MODEL_MAPPING.image.editImage;
      } else if (["storyboardImage", "assetsImage"].includes(agent.key)) {
        targetModelName = GLOBAL_MODEL_MAPPING.image.default;
      } else {
        targetModelName = GLOBAL_MODEL_MAPPING.text;
      }

      const configId = modelIdMap[targetModelName];
      if (configId) {
        await axios.post("/setting/configurationModel", {
          id: agent.id,
          configId: configId,
        });
      }
    }

    await axios.post("/setting/saveGlobalApiKey", { apiKey: globalApiKey.value });
    message.success("全局模型配置并激活成功！");
    modelList();
    loadVideoModels();
  } catch (error) {
    console.error(error);
    message.error("配置过程中出现错误，请重试");
  } finally {
    isBatchConfiguring.value = false;
  }
}
const editingVideoModel = ref<VideoModelType | null>({
  id: 0,
  model: "",
  modelType: "",
  manufacturer: "",
  baseUrl: "",
  apiKey: "",
  createTime: 0,
  type: "video",
});
const editDialogVisible = ref(false);
async function loadGlobalApiKey() {
  const res = await axios.post("/setting/getGlobalApiKey");
  const key = res?.data ?? "";
  globalApiKey.value = typeof key === "string" ? key : key?.apiKey ?? "";
}

onMounted(() => {
  modelList();
  loadVideoModels();
  loadGlobalApiKey();
});

async function modelList() {
  const res = await axios.post("/setting/getAiModelMap");
  modelData.value = res.data;
}

// 加载视频模型列表
async function loadVideoModels() {
  try {
    const res = await axios.post("/setting/getVideoModelList", { type: "video" });
    if (res.data) {
      videoModels.value = Array.isArray(res.data) ? res.data : [];
    } else {
      videoModels.value = [];
    }
  } catch (error) {
    console.error("加载视频模型列表失败", error);
    videoModels.value = [];
  }
}

const modelDataShow = ref(false);
const configingModel = ref<ModelType>();

// 开始配置
function startConfig(item: ModelType) {
  configingModel.value = item;
  const imageKey = ["editImage", "storyboardImage", "assetsImage"];
  const textKey = ["storyboardAgent", "outlineScriptAgent", "assetsPrompt", "generateScript", "videoPrompt"];
  if (imageKey.includes(item.key)) {
    currentType.value = "image";
  } else if (textKey.includes(item.key)) {
    currentType.value = "text";
  }
  modelDataShow.value = true;
}

// 添加视频模型（已注释，仅通过一键配置）
// function addVideoModel() {
//   editingVideoModel.value = null;
//   videoModelDialogShow.value = true;
// }

// 编辑视频模型
function editVideoModel(model: VideoModelType) {
  editForm.value = { ...model };
  editDialogVisible.value = true;
}

// 删除视频模型
async function deleteVideoModel(id: number) {
  try {
    await axios.post("/setting/delModel", { id });
    message.success("删除成功");
    loadVideoModels();
  } catch (error) {
    message.error("删除失败");
  }
}

// 获取厂商名称
function getManufacturerName(manufacturer: string): string {
  const names: Record<string, string> = {
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
  return names[manufacturer] || manufacturer;
}

// 获取厂商标签颜色
function getManufacturerTagColor(manufacturer: string): string {
  const colors: Record<string, string> = {
    deepSeek: "blue",
    volcengine: "orange",
    kling: "purple",
    zhipu: "cyan",
    qwen: "green",
    wan: "green",
    openai: "geekblue",
    vidu: "magenta",
    anthropic: "volcano",
    runninghub: "gold",
    gemini: "lime",
    ricoxueai: "red",
  };
  return colors[manufacturer] || "default";
}

// 获取模型类型名称
function getModelTypeName(type: string): string {
  const names: Record<string, string> = {
    singleImage: "单图生视频",
    startEndRequired: "首尾帧（必需）",
    endFrameOptional: "首尾帧（尾帧可选）",
    startFrameOptional: "首尾帧（首帧可选）",
    multiImage: "多图生视频",
    reference: "参考图生视频",
    text: "文本生视频",
  };
  return names[type] || type;
}

// 格式化时间
function formatTime(timestamp: number): string {
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
}

// 视频模型弹窗关闭后刷新列表
function onVideoModelDialogClose() {
  videoModelDialogShow.value = false;
  loadVideoModels();
}

//其他配置
function showDoubleConfirm2(step = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const config =
      step === 1
        ? {
          title: "危险操作！确认要删除所有数据表吗？",
          content: "此操作会删除所有数据表，且不可恢复。请谨慎操作！",
          okText: "继续操作",
        }
        : {
          title: "请再次确认",
          content: "真的要删除所有数据表吗？数据将无法恢复！",
          okText: "确认删除",
        };

    Modal.confirm({
      ...config,
      cancelText: "取消",
      centered: true,
      onOk: async () => {
        if (step === 1) {
          resolve(await showDoubleConfirm2(2));
        } else {
          resolve(true);
        }
      },
      onCancel: () => resolve(false),
    });
  });
}
async function clearDatabase() {
  const confirmed = await showDoubleConfirm2();
  if (!confirmed) {
    message.info("操作已取消");
    return;
  }
  try {
    await axios.post("/other/clearDatabase");
    message.success("所有数据表已删除，请重新打开页面");
  } catch {
    message.error("操作失败，请重试");
  }
}
function showDoubleConfirm(step = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const config =
      step === 1
        ? {
          title: "危险操作！确认要清空所有数据表吗？",
          content: "此操作会删除所有数据表的数据，且不可恢复。请谨慎操作！",
          okText: "继续操作",
        }
        : {
          title: "请再次确认",
          content: "真的要清空所有数据表吗？数据将无法恢复！",
          okText: "确认删除",
        };

    Modal.confirm({
      ...config,
      cancelText: "取消",
      centered: true,
      onOk: async () => {
        if (step === 1) {
          resolve(await showDoubleConfirm(2));
        } else {
          resolve(true);
        }
      },
      onCancel: () => resolve(false),
    });
  });
}

async function deleteAllData() {
  const confirmed = await showDoubleConfirm();
  if (!confirmed) {
    message.info("操作已取消");
    return;
  }
  try {
    await axios.post("/other/deleteAllData");
    message.success("所有数据表已清空");
  } catch {
    message.error("操作失败，请重试");
  }
}
</script>

<style lang="scss" scoped>
.settingContainer {
  padding: 50px;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  >span {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .global-config-section {
    margin: 10px 0 20px;
    padding: 16px 20px;
    background: transparent;
    border: 1px dashed #d9d9d9;
    border-radius: 12px;

    .compact-config-bar {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .config-title {
        font-size: 15px;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 16px;
          background: var(--mainColor);
          border-radius: 2px;
        }
      }

      .config-inputs {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
        width: 100%;
        justify-content: flex-start;

        .input-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .label {
            font-size: 13px;
            color: #6b7280;
            white-space: nowrap;
          }

          .compact-input {
            width: 240px;
            border-radius: 6px;
          }
        }

        .compact-btn {
          min-width: 80px;
          border-radius: 6px;
          font-weight: 600;
        }
      }
    }
  }

  .addModel {
    margin-top: 20px;
    flex: 0 0 auto;
  }

  .model {
    .model-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-top: 20px;

      .model-card-item {
        .model-config-card {
          height: 100%;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;

          &.disabled-card {
            cursor: not-allowed;
            opacity: 0.85;
            filter: grayscale(0.2);

            &:hover {
              border-color: #f0f0f0;
              box-shadow: none;
              transform: none;
            }
          }

          &:hover:not(.disabled-card) {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(153, 19, 250, 0.15);
            border-color: var(--mainColor);
          }

          :deep(.ant-card-head) {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 20px;
          }

          :deep(.ant-card-body) {
            padding: 20px;
          }

          :deep(.ant-card-actions) {
            border-top: 1px solid #f0f0f0;
            background: #fafafa;

            >li {
              margin: 8px 0;
            }
          }

          .card-title-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;

            .card-icon {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, var(--mainColorLight) 0%, #ede9fe 100%);
              border-radius: 8px;
              color: var(--mainColor);
            }

            .card-title-text {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
          }

          .card-content {
            .model-info {
              display: flex;
              gap: 8px;

              .model-label {
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
              }

              .model-value {
                font-size: 14px;
                color: #1f2937;

                &.unconfigured {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  color: #faad14;
                }
              }
            }
          }

          .config-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 6px;
          }
        }
      }
    }
  }

  // 视频模型区域
  .video-model-section {
    margin-top: 40px;
    padding: 24px;
    background: #fafafa;
    border-radius: 12px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;

        i {
          color: var(--mainColor);
        }
      }

      .add-video-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 8px;
        height: 40px;
        padding: 0 20px;
      }
    }

    .video-model-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;

      .video-model-card {

        .clickable-card {
          cursor: pointer;
        }

        :deep(.ant-card) {
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          background: white;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(153, 19, 250, 0.12);
            border-color: var(--mainColor);
          }

          .ant-card-head {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 20px;
          }

          .ant-card-body {
            padding: 20px;
          }
        }

        .video-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;

          .video-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f5f0ff 0%, #ede9fe 100%);
            border-radius: 8px;
          }

          .video-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .video-model-name {
              font-size: 15px;
              font-weight: 600;
              color: #1f2937;
            }

            .manufacturer-tag {
              align-self: flex-start;
              margin: 0;
            }
          }

          .delete-btn-corner {
            margin-left: auto;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 6px;
            flex-shrink: 0;
          }
        }

        .video-card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .video-detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;

            .detail-label {
              color: #6b7280;
              font-weight: 500;
              min-width: 80px;
            }

            .detail-value {
              color: #1f2937;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }

    .video-model-card-single {
      .fixed-video-card {
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        background: white;

        :deep(.ant-card-body) {
          padding: 20px 24px;
        }
      }

      .video-card-body-horizontal {
        display: flex;
        align-items: center;
        gap: 24px;

        .video-icon-large {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f0ff 0%, #ede9fe 100%);
          border-radius: 12px;
        }

        .video-info-main {
          flex: 1;
          min-width: 0;

          .video-model-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            .video-model-name-large {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }

            .manufacturer-tag-large {
              margin: 0;
            }
          }

          .video-detail-row {
            display: flex;
            gap: 24px;
            font-size: 13px;

            .detail-item {
              display: flex;
              align-items: center;
              gap: 8px;

              .detail-label {
                color: #6b7280;
                font-weight: 500;
              }

              .detail-value {
                color: #1f2937;
              }
            }
          }
        }

        .video-card-actions {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }

    .empty-state {
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      border: 2px dashed #e5e7eb;
    }
  }

  .other {
    margin-top: 16px;
    -webkit-overflow-scrolling: touch;

    .otherConfiguration {
      font-size: 18px;
      margin-top: 10px;
      display: block;
    }

    .prompt {
      margin-top: 20px;

      .promptText {
        font-size: 18px;
        margin-top: 10px;
        display: block;
      }
    }

    .sql {
      margin-top: 20px;

      .sqlText {
        font-size: 18px;
        margin-top: 10px;
        display: block;
      }

      .dangerBadge {
        font-size: 12px;
        color: #ef4444;
        background: #fee2e2;
        padding: 4px 10px;
        border-radius: 20px;
        margin-left: auto;
      }
    }
  }
}
</style>
