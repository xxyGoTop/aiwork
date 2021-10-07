<template>
  <div class="app-wrapper" :style="pageStyle">
    <page-header v-if="isShowHeader" :title="pageTitle"></page-header>
    <router-view></router-view>
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
    pageStyle() {
      const clientWidth = document.body.clientWidth;
      if (this.$route.name === "Login") {
        return {
          width: "100%",
          height: "100%",
        };
      }
      return {
        width: "100%",
        minWidth: clientWidth < 700 ? "1920px" : '100%',
        height: "100%",
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.app-wrapper {
  background-color: #061369;
  margin: 0 auto;
}
</style>
