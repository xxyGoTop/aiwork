import { OM } from "./index"

export function login(data) {
  return OM({
    url: "/vue-element-admin/user/login",
    method: "post",
    data
  })
}

export function getInfo(token) {
  return OM({
    url: "/vue-element-admin/user/info",
    method: "get",
    params: { token }
  })
}

export function logout() {
  return OM({
    url: "/vue-element-admin/user/logout",
    method: "post"
  })
}
