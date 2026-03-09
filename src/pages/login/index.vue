<template>
  <div class="bg"></div>
  <div class="loginPage">
    <div class="formBox">
      <div class="logoBox">
        <img :src="logo" alt="logo" class="logo-img" />
        <span class="logo-text">AI漫剧智能体</span>
      </div>
      <a-form :model="state.user" :rules="formRules" ref="ruleFormRef" @finish="handleFinish" class="login-form">
        <a-form-item name="apiKey">
          <a-input-password
            v-model:value="state.user.apiKey"
            placeholder="请输入APIKey（以 sk- 开头）"
            autocomplete="off"
            size="large"
          />
        </a-form-item>
        <a-form-item>
          <a-button class="loginBtn" type="primary" size="large" :loading="state.loginLoading" html-type="submit" block>
            APIKey登录
          </a-button>
        </a-form-item>
      </a-form>
      <a-alert class="default-hint" type="info">
        <template #message>
          <div class="hint-content">
            <p>请输入 APIKey</p>
            <p>
              格式示例：
              <code>sk-xxxxxxxxxxxxxxxx</code>
            </p>
            <!-- 微信二维码已隐藏，后续如需显示可取消注释
            <div class="qr-wrap">
              <img :src="qrImg" alt="客服微信" class="qr-img" />
              <p class="qr-label">若有任何问题，请联系客服微信：ricoxueai</p>
            </div>
            -->
          </div>
        </template>
      </a-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Router from "@/router/index";
import { message } from "ant-design-vue";
import logo from "@/assets/logo.png";
import axios from "@/utils/axios";

const state = ref({
  show: true,
  loginLoading: false,
  user: { apiKey: "" },
});

const formRules = {
  apiKey: [
    { required: true, message: "请输入APIKey" },
    {
      validator: (_rule: any, value: string) =>
        value?.startsWith("sk-") ? Promise.resolve() : Promise.reject("APIKey格式错误，必须以'sk-'开头"),
    },
  ],
};

const handleFinish = (values: { apiKey: string }) => {
  state.value.loginLoading = true;
  axios
    .post("/other/apiKeyLogin", { apiKey: values.apiKey })
    .then(({ data }) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
      Router.push("/project");
      message.success("APIKey登录成功");
      state.value.loginLoading = false;
    })
    .catch((e) => {
      state.value.loginLoading = false;
      message.error(e.message);
    });
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
