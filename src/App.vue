<template>
  <layout />
</template>

<script>
import Layout from "@/layout/Layout";
export default {
  components: { Layout },
  mounted() {
    const clientWidth = document.body.clientWidth;
    if (clientWidth < 1300) {
      document.body.style.zoom = 0.67;
    } else if (1300 < clientWidth < 3000) {
      document.body.style.zoom = 1;
    } else {
      document.body.style.zoom = 2;
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
