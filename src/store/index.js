import Vue from "vue"
import Vuex from "vuex"
import getters from "./getters"

Vue.use(Vuex)

const modulesFiles = require.context("./modules", true, /\.js$/)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1")
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

export default new Vuex.Store({
  modules,
  getters,
  state: {
    username: "",
    // 侧边栏菜单
    asideMenu: [],
    partnerId: "",
  },
  mutations: {
    // 菜单
    setAsideMenu(state, menu) {
      state.asideMenu = menu
    },
    setUserName(state, name) {
      state.username = name
    },
    setPartnerId(state, v) {
      state.partnerId = v
    },
  },
})
