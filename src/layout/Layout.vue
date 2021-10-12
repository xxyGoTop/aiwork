<template>
  <div class="app-wrapper" :style="pageStyle">
    <page-header v-if="isShowHeader" :title="pageTitle"></page-header>
    <router-view></router-view>
    <div class="app-bottom-bg" v-if="!isShowBottom">
      <div class="app-bottom-left"></div>
      <div class="app-bottom-mid"></div>
      <div class="app-bottom-right"></div>
    </div>
    <div class="app-bottom-footer" v-if="!isShowBottom"></div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader";
export default {
  name: "Layout",
  components: {
    PageHeader,
  },
  computed: {
    pageTitle() {
      return this.$route.meta.title;
    },
    isShowHeader() {
      return this.$route.name !== "Home" && this.$route.name !== "Login";
    },
    isShowBottom() {
      return (
        this.$route.name === "Login" ||
        this.$route.name === "Home" ||
        this.$route.name === "Way"
      );
    },
    pageStyle() {
      const clientWidth = document.body.clientWidth;
      if (
        this.$route.name === "Login" ||
        this.$route.name === "Home" ||
        this.$route.name === "Way"
      ) {
        return {
          width: clientWidth < 800 ? "1920px" : "100%",
          height: clientWidth < 800 ? "1080px" : "100%",
        };
      }
      return {
        width: "100%",
        minWidth: clientWidth < 800 ? "1920px" : "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        paddingBottom: "90px",
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  background-color: #061369;
  margin: 0 auto;
}
.app-bottom-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 91px;
  background: linear-gradient(
    180deg,
    rgba(21, 23, 209, 0),
    rgba(5, 7, 113, 0.58)
  );

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 41px 19px 10px;
  box-sizing: border-box;
  .app-bottom-left {
    width: 821px;
    height: 18px;
    background: url(~@/assets/imgs/data_img_line_foot_left.png) 0 center
      no-repeat;
  }
  .app-bottom-mid {
    font-size: 16px;
    height: 16px;
    line-height: 16px;
    color: #80b5fc;
  }
  .app-bottom-right {
    width: 821px;
    height: 18px;
    background: url(~@/assets/imgs/data_img_line_foot_right.png) 0 center
      no-repeat;
  }
}
.app-bottom-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 996;
  width: 100%;
  height: 173px;
  background: url(~@/assets/imgs/list_img_bg_foot.png) center
    no-repeat;
  background-size: 125%; 
}
</style>
