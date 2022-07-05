<template>
<d-frame id="app" :option="option">
  <router-view/>
</d-frame>
</template>

<script>
import store from '@/store';

export default {
  computed: {
    menu() {
      return store.state.asideMenu;
    },
    option() {
      return {
        title: '当当供应链输出平台',
        menu: this.menu
      }
    },
  },
}
</script>
