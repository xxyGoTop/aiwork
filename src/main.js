import Vue from "vue";
import BaiduMap from "vue-baidu-map";
import ElementUI from "element-ui";
import router from "@/router";
import store from "@/store";
import App from "./App.vue";

import "@/api/preset";

import "normalize.css";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/css/common.scss";
import "@/assets/css/cover.scss";

Vue.use(ElementUI);
Vue.use(BaiduMap, { ak: "E4805d16520de693a3fe707cdc962045" });

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
