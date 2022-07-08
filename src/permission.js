import { Message } from "element-ui"

import router from "./router"
import store from "./store"
import getPageTitle from "@/utils/get-page-title"
import { getToken } from "@/utils/auth"
import { IS_DEV } from "@/utils"

import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })

const whiteList = ["/login"]

const lanuch = async () => {
  // 开发环境不用登陆
  if (IS_DEV) {
    const accessRoutes = await store.dispatch("permission/generateRoutes", ["admin"])
    router.addRoutes(accessRoutes)
  }

  router.beforeEach(async(to, _, next) => {
    NProgress.start()
  
    document.title = getPageTitle(to.meta.title)
  
    const hasToken = getToken() || IS_DEV
  
    if (hasToken) {
      if (to.path === "/login") {
        next({ path: "/" })
        NProgress.done()
      } else {
        const hasRoles = store.getters.roles && store.getters.roles.length > 0 || IS_DEV
        if (hasRoles) {
          next()
        } else {
          try {
            // get user info
            // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
            const { roles } = await store.dispatch("user/getInfo")
  
            // generate accessible routes map based on roles
            const accessRoutes = await store.dispatch("permission/generateRoutes", roles)
  
            // dynamically add accessible routes
            router.addRoutes(accessRoutes)
  
            // hack method to ensure that addRoutes is complete
            // set the replace: true, so the navigation will not leave a history record
            next({ ...to, replace: true })
          } catch (error) {
            // remove token and go to login page to re-login
            await store.dispatch("user/resetToken")
            Message.error(error || "Has Error")
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        }
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

lanuch().catch(console.log)
