import router from "./index"
import { AuthMenu } from "@/api/auth"
import store from "@/store"
import {
  processMenu,
  processDevMenu,
  IS_DEV,
} from "@/util"
import rawRoutes from "./raw"
import flatRoutes from "./process"
import {
  Message,
} from "element-ui"

// 权限菜单
let autnMenu = []
const lanuch = async () => {
  if (IS_DEV) {
    const dev_menu = processDevMenu(rawRoutes)
    store.commit("setAsideMenu", dev_menu)
  } else {
    const {
      data: {
        name = "",
        menus = [],
      }
    } = await AuthMenu()
    autnMenu = menus
    store.commit("setUserName", name)
    const prod_menu = processMenu(menus, flatRoutes)
    store.commit("setAsideMenu", prod_menu)
  }

  // 导航权限控制
  const navAuthorityCtrl = (to, next) => {
    if (IS_DEV) return next()
    if (autnMenu.length) {
      const flatMenu = autnMenu.map(item => {
        if (item.childNodes && item.childNodes.length) {
          const subPathMap = item.childNodes.map(subItem => subItem.path)
          return [item.path, ...subPathMap]
        }
        return item.path
      }).flat()

      if (to.meta && to.meta.menu) {
        if (!flatMenu.includes(to.path)) {
          Message.warning("抱歉，您暂时无权访问该路径！")
          return next(false)
        }
        return next()
      }
      return next()
    }
    if (to.path === "/" || to.path === "/goods" || to.path === "/goods/list") return next()
    
    Message.warning("抱歉，您暂时无权访问该路径！")
    return next(false)
  }

  router.beforeEach((to, _, next) => {
    if (to.meta.title) {
      document.title = to.meta.title
    }
    navAuthorityCtrl(to, next)
  })

}

lanuch().catch(console.warn)