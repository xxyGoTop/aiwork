import axios from "axios"

// 本地mock服务使用
export const Mock = axios.create({
  baseURL: "/api-mock"
})

// 外卖场
export const OM = axios.create({
  baseURL: process.env.VUE_APP_OM_API,
})

// 文件服务
export const File = axios.create({
  baseURL: process.env.VUE_APP_FILE_API,
})

// 直播
export const Live = axios.create({
  baseURL: process.env.VUE_APP_LIVE_API,
})

// 地址管理
export const Addr = axios.create({
  baseURL: process.env.VUE_APP_ADDR_API,
})

// 快手结算单
export const Bill = axios.create({
  baseURL: process.env.VUE_APP_BILL_API
})

// 商品变更查询
export const Alter = axios.create({
  baseURL: process.env.VUE_APP_ALTER_API
})

Addr.extra = {
  native: true,
}
