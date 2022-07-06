import md5 from "js-md5"
import { MessageBox } from "element-ui"

// 基本类型值
const basicType = (value) =>
  typeof value !== "object" && typeof value !== "function"

// 空字段
export const isEmptyField = (value) =>
  value === "" ||
  value === undefined ||
  value === null ||
  value === "undefined" ||
  value === "null"

export const hasValue = (value) =>
  !(
    value === "" ||
    value === undefined ||
    value === null ||
    value === "undefined" ||
    value === "null"
  )

export const isProtocol = (path) => {
  return /^(?:https?|mailto|tel):/.test(path)
}

/**
 * 下载Bolb文件
 * @param {Bolb} blobData Bolb类型数据
 * @param {String} fileName 文件名
 */
export const downBlobFile = (blobData, fileName) => {
  const url = window.URL.createObjectURL(blobData)
  const a = document.createElement("a")
  a.style.display = "none"
  a.href = url
  a.setAttribute("download", fileName)
  document.body.appendChild(a)
  //点击下载
  a.click()
  // 下载完成移除元素
  document.body.removeChild(a)
  // 释放掉blob对象
  window.URL.revokeObjectURL(url)
}

// 本地存储
export const local = {
  get: (key, defaultValue = "") => {
    let res = localStorage.getItem(key)
    try {
      res = JSON.parse(res)
    } catch (error) {
      console.log(error)
    }
    return isEmptyField(res) ? defaultValue : res
  },
  set: (key, value = "", defaultValue = "") => {
    try {
      value = basicType(value) ? value : JSON.stringify(value)
    } catch (error) {
      value = defaultValue
    }
    localStorage.setItem(key, value)
  },
  remove: (key) => {
    if (key) {
      localStorage.removeItem(key)
    } else {
      localStorage.clear()
    }
  },
}

// 获取登录url
export const getLoginURL = () => {
  const returnurl = `${location.origin}${process.env.VUE_APP_BASE_URL}`
  return `${process.env.VUE_APP_LIGIN_URL}?returnurl=${encodeURIComponent(
    returnurl
  )}`
}

// 登录状态提示
export const toLogin = (title, isClose = false) => {
  return MessageBox.alert(title, "提示", {
    confirmButtonText: "跳转",
    showClose: isClose,
  })
    .then(() => {
      local.remove("authToken")
      window.location.href = "/login"
    })
    .catch((err) => {
      return Promise.reject(err)
    })
}

// 读取存储数据
export const getCookie = (key) => {
  const cKey = key.trim()
  if (typeof cKey !== "string" || !cKey) return ""
  const result = document.cookie.match(
    new RegExp("(^| )" + cKey + "=([^;]*)(;|$)")
  )
  if (!result) return ""
  return decodeURIComponent(result[2])
}

// md5加密
export const cMd5 = (val) => (val ? md5(val) : "")
