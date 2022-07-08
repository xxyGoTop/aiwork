import Vue from "vue"
import ElementUI from "element-ui"
import router from "@/router"
import store from "@/store"
import App from "./App.vue"

import "@/assets/js/iconfont.js"
import "@/components/global.js"
import "@/api/preset"
import "./permission"

import "normalize.css"
import "element-ui/lib/theme-chalk/index.css"
import "@/styles/index.scss"

Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app")
