import {
  Message,
} from 'element-ui';
import {
  toLogin,
} from '@/util.js';
import * as Api from './index.js';

Object.values(Api).forEach(ins => {
  ins.defaults.timeout = 500000;
  ins.defaults.validateStatus = (status) =>
    (status >= 200 && status < 300) || status === 304;
  ins.interceptors.request.use(
    (config) => {
      return config
    },
    (error) => {
      Message.error(error.message || '请求：未知错误'); 
      return Promise.reject(error);
    }
  );
  const extra = Object.assign({}, ins.extra);
  ins.interceptors.response.use(
    (res) => {
      if (extra.native) return res;
      const vres = res.data;
      if (vres instanceof Blob) return vres;
      vres.config = res.config;
      vres.headers = res.headers;
      vres.code = typeof vres.code === 'number' ? vres.code : +vres.code;
      if (vres.code === undefined || vres.code === 0 || (vres.code >= 200 && vres.code < 300)) {
        return vres;
      } else if (vres.code === 401) {
        Message.error('该用户没有权限');
      } else if (vres.code === 99999) {
        toLogin('登录态已过期，请先登录', vres.message);
      } else {
        Message.error(`${vres.code}: ${vres.message}` || '响应：未知错误');
      }
      return Promise.reject(vres);
    },
    (error) => {
      const {
        response,
        message,
      } = error;
      const msg = response
        ? `${response.status}: ${+response.status === 401 ? '该用户没有权限' : response.statusText}`
        : (message || '响应：未知错误');
      Message.error(msg);
      return Promise.reject(error);
    }
  );
});
