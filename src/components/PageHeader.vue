<template>
  <div class="page-header-wrap" :class="{ fixed: isFixed }">
    <div class="page-header-back" @click="handleToBack">
      <span class="page-header-back-icon"></span>
      <span>返回</span>
    </div>
    <div class="page-header-title">
      <span class="page-span-title">{{ title }}</span>
      <span class="page-span-date">{{ time }} 星期{{ wwkMap[week] }}</span>
    </div>
    <div class="page-header-user">
      <span class="page-user-icon"></span>
      <span class="page-user-name" :title="userInfo.name">
        {{ userInfo.name }}
      </span>
      <span class="page-user-arrow"></span>
      <div class="page-user-logout" @click="handleOut">退出登录</div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { mapState, mapMutations } from "vuex";
import { postAuthLogout } from "@/api/user";
export default {
  props: {
    title: {
      type: String,
      default: "标题",
    },
  },
  data() {
    return {
      week: null,
      wwkMap: {
        0: "日",
        1: "一",
        2: "二",
        3: "三",
        4: "四",
        5: "五",
        6: "六",
      },
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      timer: null,
    };
  },
  computed: {
    ...mapState(["userInfo"]),
    isFixed() {
      return this.$route.name === "Way";
    },
  },
  methods: {
    ...mapMutations(["updateAccessToken"]),
    handleToBack() {
      this.$router.go(-1);
    },
    handleOut() {
      postAuthLogout({
        memo: "退出登录",
        platformTypeEnum: "PC",
      }).then(() => {
        this.updateAccessToken("");
        location.href = "/login";
      });
    },
  },
  mounted() {
    this.week = dayjs().day();
    this.timer = setInterval(() => {
      this.time = dayjs().format("YYYY-MM-DD HH:mm:ss");
    }, 1000);
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
};
</script>

<style lang="scss" scoped>
.page-header-wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 91px;
  margin-bottom: 26px;
  background: url(~@/assets/imgs/nav_page_header_bg.png) center 0 no-repeat;
  background-size: 100%;
  padding: 0px 20px;
  box-sizing: border-box;
  .page-header-title {
    font-family: "Microsoft Yahei";
    span {
      display: block;
      color: #ffffff;
      text-align: center;
    }
    .page-span-title {
      height: 58px;
      font-size: 33px;
      font-family: "Microsoft Yahei";
    }
  }
  .page-header-back {
    width: 132px;
    height: 39px;
    line-height: 39px;
    background: url(~@/assets/imgs/nav_left.png) center no-repeat;
    background-size: 100%;
    color: #fff;
    font-size: 16px;
    text-align: center;
    margin-top: 21px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    &-icon {
      width: 18px;
      height: 18px;
      margin-right: 7px;
      background: url(~@/assets/imgs/nav_ico_back.png) center no-repeat;
      background-size: 100%;
    }
  }
  .page-header-back:hover {
    background: url(~@/assets/imgs/nav_left_hov.png) center no-repeat;
  }
  .page-header-user {
    width: 132px;
    height: 39px;
    line-height: 39px;
    background: url(~@/assets/imgs/nav_right.png) center no-repeat;
    background-size: 100%;
    color: #fff;
    font-size: 15px;
    text-align: center;
    margin-top: 21px;
    cursor: pointer;
  }
  .page-header-user:hover {
    background: url(~@/assets/imgs/nav_right_hov.png) center no-repeat;
  }
  .page-header-user {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px 18px;
    box-sizing: border-box;
    .page-user-logout {
      position: absolute;
      left: 0px;
      bottom: -33px;
      width: 112px;
      height: 0px;
      line-height: 33px;
      text-align: center;
      font-size: 15px;
      font-weight: bold;
      background-color: #000fab;
      opacity: 0;
    }
    &:hover .page-user-logout {
      opacity: 1;
      height: 33px;
    }
    span {
      display: block;
    }
    .page-user-icon {
      width: 18px;
      height: 18px;
      background: url(~@/assets/imgs/nav_user.png) center no-repeat;
      background-size: 100%;
    }
    .page-user-name {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
    }
    .page-user-arrow {
      width: 8px;
      height: 8px;
      background: url(~@/assets/imgs/nav_user_arrow.png) center no-repeat;
      background-size: 100%;
    }
  }
}
.page-header-wrap.fixed {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 1920px;
}
</style>
