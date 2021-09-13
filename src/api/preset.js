import { Message } from "element-ui";
import { toLogin } from "@/util.js";
import store from "@/store";
import * as Api from "./index.js";

Object.values(Api).forEach((ins) => {
  ins.defaults.headers.common["Authorization"] = store.state.authToken;
  ins.defaults.timeout = 5000000;
  ins.defaults.validateStatus = (status) =>
    (status >= 200 && status < 300) || status === 304;
  ins.interceptors.request.use(
    (config) => config,
    (error) => {
      Message.error(error.message || "请求：未知错误");
      return Promise.reject(error);
    }
  );
  ins.interceptors.response.use(
    (res) => {
      const vres = res.data;
      vres.config = res.config;
      vres.headers = res.headers;
      if (vres instanceof Blob) return vres;
      if (
        vres.code === undefined ||
        vres.code === 0 ||
        (vres.code >= 200 && vres.code < 300)
      ) {
        return vres;
      } else if (vres.code === 401) {
        Message.error("该用户没有权限");
      } else if (vres.code === 302) {
        toLogin("登录态已过期，请先登录");
      } else {
        Message.error(`${vres.code}: ${vres.message}` || "响应：未知错误");
      }
      return Promise.reject(vres);
    },
    (error) => {
      const { response, message } = error;
      const msg = response
        ? `${response.status}: ${
            +response.status === 401 ? "该用户没有权限" : response.statusText
          }`
        : message || "响应：未知错误";
      Message.error(msg);
      return Promise.reject(error);
    }
  );
});
