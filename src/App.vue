<template>
  <layout />
</template>

<script>
import Layout from "@/layout/Layout";
export default {
  components: { Layout },
  mounted() {
    const clientWidth = document.body.clientWidth;
    if (800 < clientWidth && clientWidth < 1700) {
      document.body.style.zoom = 0.56;
    } else {
      document.body.style.zoom = 1;
    }
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

<style>
@font-face {
  font-family: HYGangYiTi;
  src: url("./assets/css/HYGangYiTi-85W.ttf");
}
</style>
