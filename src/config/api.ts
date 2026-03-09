/**
 * API 端点配置，可通过环境变量 VITE_AI_API_BASE_URL 切换
 * 默认: https://api.yiwuxueshe.cn（原 ricoxueai 为 https://api.ricoxueai.cn）
 */
export const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "https://api.yiwuxueshe.cn";
export const AI_API_BASE_URL_V1 = `${AI_API_BASE_URL}/v1`;
