import { OM } from "./index"

// 获取菜单
export const AuthMenu = () => OM({
  url: "/menu/info"
})

// 退出登录
export const Logout = () => OM({
  url: "/logout",
})
