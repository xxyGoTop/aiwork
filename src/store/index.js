import Vue from "vue";
import Vuex from "vuex";
import * as APIS from "@/api";
import { local } from "@/util.js";

Vue.use(Vuex);

const apis = Object.values(APIS);

export default new Vuex.Store({
  state: {
    roles: local.get("roles", []),
    users: local.get("users", []),
    userInfo: local.get("userInfo", {}),
    authToken: local.get("authToken", ""),
    sensorColor: {
      0: '#FF4200',
      1: '#FFAE00',
      2: '#12E37E',
      3: '#0036FF',
      4: '#00A8FF',
      5: '#BA00FF',
      6: '#00DEFF',
      7: '#FF004E',
    },
  },
  mutations: {
    updateRoles(state, roles) {
      state.roles = roles;
      local.set("roles", roles);
    },
    updateUser(state, users) {
      state.users = users;
      local.set("users", users);
    },
    updateUserInfo(state, info) {
      state.userInfo = info;
      local.set("userInfo", info);
    },
    updateAccessToken(state, authToken) {
      state.authToken = authToken;
      apis.forEach((ins) => {
        ins.defaults.headers.common.Authorization = authToken;
      });
      local.set("authToken", authToken);
    },
  },
  actions: {},
  modules: {},
});
