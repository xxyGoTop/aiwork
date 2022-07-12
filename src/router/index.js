import Vue from "vue"
import Router from "vue-router"
import Home from "@/views/Home.vue"

const originalPush = Router.prototype.push
Router.prototype.push = function (location) {
  return originalPush.call(this, location).catch((err) => err)
}
Vue.use(Router)

// 主站外页面
export const constantRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
]

// 主站内页面
export const asyncRoutes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "首页",
      icon: "el-icon-s-home"
    },
  },
  {
    path: "/device",
    name: "Device",
    meta: {
      title: "设备管理",
      icon: "el-icon-receiving"
    },
    redirect: "/device/list",
    children: [
      {
        path: "list",
        name: "DeviceList",
        meta: {
          title: "设备列表",
        },
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "setting",
        name: "DeviceSetting",
        meta: {
          title: "设备设置",
        },
        component: () => import("@/views/Home.vue"),
      },
    ]
  },
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  mode: "history",
  base: process.env.VUE_APP_BASE_URL,
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
