import {
  OM as Fetch,
} from "./index"
import qs from "qs"

export const Get = (url, params, options = {}) => Fetch.get(url, { params, ...options })
export const Post = (url, data) => Fetch.post(url, data)

// 查询任务列表
export const QueryTaskList = params => Fetch({
  url: "/task/queryTaskList",
  params,
})

// 任务详情查询
export const TaskDetailQuery = params => Fetch({
  url: "/task/taskDetail",
  params,
  paramsSerializer: function (params) {
    return qs.stringify(params, { indices: false })
  },
})

// 获取任务结果
// -1: 任务不存在, -2: 系统异常, 2: 结果文件生成中, 3: 结果文件已经上传
export const TaskResult = (params) => Fetch({
  url: "/task/taskResult",
  params,
})

// 锁库存店铺
export const StockPartners = (params) => {
  return Get("/stock/lock/partners", params)
}

// 添加锁库存
export const addStockLock = (data) => {
  return Post("/stock/addStockLock", data)
}

// 根据商品ID查看商品库存信息
export const queryStockByProduct = (params) => {
  return Get("/stock/queryStockByProduct", params)
}

// 锁库存任务列表
export const queryStockLockTask = (params) => {
  return Get("/stock/queryStockLockTask", params)
}

// 查看任务信息
export const queryStockLockTaskDetail = (params) => {
  return Get("/stock/queryStockLockTaskDetail", params)
}

// 全部解锁 任务维度
export const releaseStockLockTask = (params) => {
  return Get("/stock/releaseStockLockTask", params)
}

// 锁库列表
export const stockLockList = (data) => {
  return Post("/stock/stockLockList", data)
}

// 释放锁库
export const releaseStockLock = (data) => {
  return Post("/stock/releaseStockLock", data)
}

// 批量查询商品库存信息
export const batchQueryStockByProduct = (params) => {
  return Get("/stock/batchQueryStockByProduct", params)
}

// 品库存查询
export const stockQuery = (params) => {
  return Get("/stock/StockQuery", params)
}

// 品库存同步
export const stockSync = (params) => {
  return Get("/stock/stockSync", params)
}

// 批量库存同步
export const BatchStockSync = data => {
  return Post("/stock/stockBatchSync", data)
}

// 品库存同步
export const exportStockLockData = (data) => Fetch({
  url: "/stock/exportStockLockData",
  data,
  method: "post",
  responseType: "blob",
})

// 任务获取商品库存
export const queryStockByTaskId = (params) => {
  return Get("/stock/queryStockByTaskId", params)
}

export const exportStockQueryData = (data) => Fetch({
  url: "/stock/exportStockQueryData",
  data,
  method: "post",
  responseType: "blob",
})

// 库存同步比例查询
export const queryStockRate = (data) => Fetch({
  url: "/stock/queryStockRate",
  data,
  method: "post",
})

// 修改库存比例
export const updateStockRate = (params) => Fetch({
  url: "/stock/updateStockRate",
  params,
})
