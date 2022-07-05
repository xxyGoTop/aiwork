import Vue from 'vue';
import '@/api/preset';
import App from './App.vue';
import router from '@/router';
import store from '@/store';
import '@/components/global.js';
import '@/assets/js/iconfont.js';
import '@/router/preset.js';

import 'normalize.css';
import '@/assets/css/common.css';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import '@/assets/css/cover.scss';

Vue.use(ElementUI, { size: 'small', zIndex: 3000 });

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
