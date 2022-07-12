import axios from "axios"

// 服务
export const Face = axios.create({
  baseURL: process.env.VUE_APP_API,
})

// 其他服务
export const Other = axios.create({
  baseURL: process.env.VUE_OTHER_API,
})

export default axios
