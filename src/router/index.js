import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";
import { local } from "@/util.js";

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function (location) {
  return originalPush.call(this, location).catch((err) => err);
};
Vue.use(VueRouter);

// 主站内页面
const FrameRoutes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      auth: true,
    },
  },
  {
    path: "/device/alarm",
    name: "Record",
    component: () => import("@/views/Alarm.vue"),
    meta: {
      auth: true,
      title: "报警记录",
    },
  },
  {
    path: "/device/history",
    name: "Record",
    component: () => import("@/views/History.vue"),
    meta: {
      auth: true,
      title: "历史记录",
    },
  },
  {
    path: "/check/way/:id",
    name: "Way",
    component: () => import("@/views/Way.vue"),
    meta: {
      auth: true,
      title: "人员定位",
    },
  },
  {
    path: "/check/way",
    name: "Way",
    component: () => import("@/views/Way.vue"),
    meta: {
      auth: true,
      title: "人员定位",
    },
  },
  {
    path: "/check/record",
    name: "Record",
    component: () => import("@/views/Record.vue"),
    meta: {
      auth: true,
      title: "打卡记录",
    },
  },
  {
    path: "/device",
    name: "Device",
    component: () => import("@/views/Device.vue"),
    meta: {
      auth: true,
      title: "设备管理",
    },
  },
  {
    path: "/device/sensor/:code",
    name: "Sensor",
    component: () => import("@/views/Sensor.vue"),
    meta: {
      auth: true,
      title: "传感器数据",
    },
  },
  {
    path: "/user",
    name: "User",
    component: () => import("@/views/User.vue"),
    meta: {
      auth: true,
      title: "用户管理",
    },
  },
  {
    path: "/user/log/:userId",
    name: "UserLog",
    component: () => import("@/views/UserLog.vue"),
    meta: {
      auth: true,
      title: "登录记录",
    },
  },
];

// 主站外页面
const FrameOutRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.VUE_APP_BASE_URL,
  routes: [...FrameOutRoutes, ...FrameRoutes],
});

router.beforeEach((to, _, next) => {
  const token = local.get("authToken");
  if (to.matched.some((r) => r.meta.auth)) {
    if (token && token !== "undefined") {
      next();
    } else {
      // 没有登录的时候跳转到登录界面
      // 携带上登陆成功之后需要跳转的页面完整路径
      next({
        name: "Login",
        query: {
          redirect: to.fullPath,
        },
      });
    }
  } else if (to.path === "/login" && token) {
    next("/");
  } else {
    next();
  }
});

export default router;
