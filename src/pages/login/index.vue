<template>
  <div class="bg"></div>
  <div class="loginPage">
    <div class="formBox">
      <div class="logoBox">
        <img :src="logo" alt="logo" class="logo-img" />
        <span class="logo-text">AI漫剧智能体</span>
      </div>
      <div class="login-type-switch">
        <a-radio-group v-model:value="loginType" button-style="solid">
          <a-radio-button value="account">账号登录</a-radio-button>
          <a-radio-button value="apikey">APIKey登录</a-radio-button>
        </a-radio-group>
      </div>
      <a-form :model="state.user" :rules="formRules" ref="ruleFormRef" @finish="handleFinish" class="login-form">
        <template v-if="loginType === 'account'">
          <a-form-item name="username">
            <a-input v-model:value="state.user.username" placeholder="请输入账号" autocomplete="username" size="large">
              <template #prefix>
                <i-people theme="outline" class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <a-input-password v-model:value="state.user.password" placeholder="请输入密码" size="large">
              <template #prefix>
                <i-lock theme="outline" class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item name="apiKey">
            <a-input-password
              v-model:value="state.user.apiKey"
              placeholder="请输入APIKey（以 sk- 开头）"
              autocomplete="off"
              size="large"
            />
          </a-form-item>
        </template>
        <a-form-item>
          <a-button class="loginBtn" type="primary" size="large" :loading="state.loginLoading" html-type="submit" block>
            {{ loginType === "account" ? "登录" : "APIKey登录" }}
          </a-button>
        </a-form-item>
      </a-form>
      <a-alert v-if="showHint && loginType === 'account'" class="default-hint" type="info" closable @close="showHint = false">
        <template #message>
          <div class="hint-content">
            <p>
              默认账号：
              <code>admin</code>
            </p>
            <p>
              默认密码：
              <code>admin123</code>
            </p>
            <p>登录后可在设置中修改</p>
            <div class="qr-wrap">
              <img :src="qrImg" alt="客服微信" class="qr-img" />
              <p class="qr-label">若有任何问题，请联系客服微信：ricoxueai</p>
            </div>
          </div>
        </template>
      </a-alert>
      <a-alert v-if="loginType === 'apikey'" class="default-hint" type="info">
        <template #message>
          <div class="hint-content">
            <p>请输入超级斜杠 APIKey</p>
            <p>
              格式示例：
              <code>sk-xxxxxxxxxxxxxxxx</code>
            </p>
            <div class="qr-wrap">
              <img :src="qrImg" alt="客服微信" class="qr-img" />
              <p class="qr-label">若有任何问题，请联系客服微信：ricoxueai</p>
            </div>
          </div>
        </template>
      </a-alert>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import Router from "@/router/index.ts";
import { message } from "ant-design-vue";
import logo from "@/assets/logo.png";
import qrImg from "@/assets/qr.png";
import axios from "@/utils/axios";

const svgRef = ref(null);
const showHint = ref(true);
const loginType = ref("account");
const state = ref({
  show: true,
  loginLoading: false,
  user: {
    username: "",
    password: "",
    apiKey: "",
  },
});

const formRules = computed(() =>
  loginType.value === "account"
    ? {
        username: [{ required: true, message: "请输入您的账号" }],
        password: [{ required: true, message: "请输入密码" }],
      }
    : {
        apiKey: [
          { required: true, message: "请输入APIKey" },
          {
            validator: (_rule, value) =>
              value?.startsWith("sk-") ? Promise.resolve() : Promise.reject("APIKey格式错误，必须以'sk-'开头"),
          },
        ],
      },
);

const svg = ref();
const captcha = ref();

onMounted(() => {
  resSvg();
});
const handleFinish = (values) => {
  state.value.loginLoading = true;
  const isApiKeyLogin = loginType.value === "apikey";
  const loginPath = isApiKeyLogin ? "/other/apiKeyLogin" : "/other/login";
  const obj = isApiKeyLogin ? { apiKey: values.apiKey } : { username: values.username, password: values.password };
  axios
    .post(loginPath, obj)
    .then(({ data }) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
      Router.push("/project");
      message.success(isApiKeyLogin ? "APIKey登录成功" : "登录成功");
      state.value.loginLoading = false;
    })
    .catch((e) => {
      state.value.loginLoading = false;
      message.error(e.message);
      resSvg();
    });
};

const resSvg = async () => {
  return;
  const { data } = await axios.get("/other/getCaptcha");
  svgRef.value.innerHTML = data.svg;
  captcha.value = data.captcha;
};
</script>

<style lang="scss" scoped>
.bg {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-image: url("@/assets/bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.loginPage {
  z-index: 999;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .formBox {
    width: 380px;
    padding: 40px 40px 30px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);

    .logoBox {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 30px;
      gap: 12px;

      .logo-img {
        width: 48px;
        height: 48px;
      }

      .logo-text {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        letter-spacing: 1px;
      }
    }

    .login-form {
      .input-icon {
        color: #999;
        font-size: 18px;
      }

      :deep(.ant-input-affix-wrapper) {
        padding: 8px 12px;
        border-radius: 8px;

        &:hover,
        &:focus-within {
          border-color: var(--mainColor);
        }
      }

      :deep(.ant-form-item) {
        margin-bottom: 20px;
      }
    }

    .login-type-switch {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .loginBtn {
      height: 44px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 8px;
      background: var(--mainGradient);
      border: none;

      &:hover {
        background: var(--mainGradientHover);
      }
    }
  }
}

.default-hint {
  margin-top: 20px;
  border-radius: 8px;

  :deep(.ant-alert-message) {
    width: 100%;
  }

  .hint-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: #666;

    p {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  code {
    background: #fff;
    padding: 2px 10px;
    border-radius: 4px;
    font-family: "Monaco", "Menlo", monospace;
    color: var(--mainColor);
    font-weight: 500;
    font-size: 13px;
    border: 1px solid #e8d5ff;
  }
}

.qr-wrap {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .qr-label {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: bold;
    color: #6C01CE;
  }
  .qr-img {
    width: 120px;
    height: 120px;
  }
}
</style>
