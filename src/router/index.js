import Vue from "vue"
import VueRouter from "vue-router"
import Home from "@/views/Home.vue"
import { local } from "@/util.js"

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function (location) {
  return originalPush.call(this, location).catch((err) => err)
}
Vue.use(VueRouter)

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
      auth: true,
    },
  },
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  mode: "history",
  base: process.env.VUE_APP_BASE_URL,
  routes: constantRoutes
})

const router = createRouter()

router.beforeEach((to, _, next) => {
  const token = local.get("authToken")
  if (to.matched.some((r) => r.meta.auth)) {
    if (token && token !== "undefined") {
      next()
    } else {
      // 没有登录的时候跳转到登录界面
      // 携带上登陆成功之后需要跳转的页面完整路径
      next({
        name: "Login",
        query: {
          redirect: to.fullPath,
        },
      })
    }
  } else if (to.path === "/login" && token) {
    next("/")
  } else {
    next()
  }
})

export default router
