<template>
  <div class="login-wrapper">
    <div class="login-left">
      <div class="login-left-logo"></div>
      <div class="login-left-form">
        <div class="login-left-form-title">
          <span>乌鲁木齐ai</span>
          <span>智能管理平台</span>
        </div>
        <div class="login-left-form-sub">
          Intelligent ai conservancy management of Lasa River
        </div>
        <el-form
          :model="formData"
          status-icon
          ref="formData"
          label-width="0px"
          class="login-ruleForm"
        >
          <el-form-item prop="account">
            <el-input
              placeholder="输入手机号或账号"
              v-model="formData.account"
              autocomplete="off"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              placeholder="请输入密码"
              :type="showpass ? 'text' : 'password'"
              v-model="formData.password"
              autocomplete="off"
            >
              <i
                class="form-eye-icon"
                :class="{ close: !showpass }"
                slot="suffix"
                @click="handleIconClick"
              >
              </i>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('formData')">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- © 2021 西藏智启权所有 -->
      <div class="login-left-copyright">乌ICP备2021000258号</div>
    </div>
    <div class="login-right"></div>
  </div>
</template>

<script>
import * as Tone from "tone"
import { cMd5 } from "@/util"
import { mapState, mapMutations } from "vuex"
import { postAuthLogin, getUserPage, getUserRole } from "@/api/user"
export default {
  data() {
    return {
      formData: {
        account: "",
        password: "",
        platformTypeEnum: "PC",
      },
      showpass: false,
    }
  },
  computed: {
    ...mapState(["authToken"]),
  },
  methods: {
    ...mapMutations([
      "updateAccessToken",
      "updateUserInfo",
      "updateRoles",
      "updateUser",
    ]),
    async getUser() {
      if (!this.authToken) return
      const role = await getUserRole()
      const user = await getUserPage({ pageSize: 3000 })
      this.updateRoles(role.data.records)
      this.updateUser(user.data.records)
    },
    async submitForm() {
      const { password } = this.formData
      postAuthLogin({
        ...this.formData,
        password: cMd5(password),
      }).then((data) => {
        this.updateAccessToken(data.data.token)
        this.updateUserInfo({ ...data.data })
        this.getUser()
        this.$router.replace(this.$route.query.redirect || "/")
      })
      await Tone.start()
    },
    handleIconClick() {
      this.showpass = !this.showpass
    },
  },
}
</script>

<style lang="scss">
.login-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  .login-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 598px;
    height: 100%;
    padding-left: 32px;
    padding-top: 37px;
    box-sizing: border-box;
    .el-input {
      width: 373px;
    }
    .el-input__inner {
      width: 373px;
      height: 53px;
      background: #fafbfd;
      border-radius: 3px;
      border: 1px solid #e5e5e5;
      color: #333;
    }
    .el-input__suffix {
      top: 16px;
    }
    .el-button {
      width: 373px;
      height: 53px;
      background: #1a77ff;
      border-radius: 5px;
    }
    &-form {
      padding-left: 149px;
    }
    &-logo {
      width: 193px;
      height: 64px;
      // background: url(~@/assets/imgs/login_img_logo.png) center no-repeat;
      background-size: 100%;
    }
    &-copyright {
      width: 373px;
      padding-bottom: 153px;
      text-align: center;
      margin-left: 149px;
      font-size: 16px;
      font-family: "PingFangSC-Regular, PingFang SC";
      font-weight: 400;
      color: #9c9c9c;
    }
    &-form-title {
      span {
        display: block;
      }
      font-size: 37px;
      font-family: "OPPOSans-B, OPPOSans";
      font-weight: normal;
      color: #333333;
      line-height: 48px;
    }
    &-form-sub {
      font-size: 11px;
      margin: 8px 0px 43px;
    }
  }
}
</style>
