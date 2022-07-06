import { OM as Fetch } from "@/api"

export const QueryTaskList = (data) => Fetch({
  url: "/price/task/list",
  method: "post",
  data
})

// 停止改价
export const StopPriceTask = data => Fetch({
  url: "/price/task/stop",
  method: "POST",
  data
})

// 删除
export const DelPriceTask = data => Fetch({
  url: "/price/task/delete",
  method: "POST",
  data
})

// 详情
export const TaskDetailQuery = data => Fetch({
  url: "/price/task/detail/list",
  method: "POST",
  data
})

// 导出
export const TaskResult = data => Fetch({
  url: "/price/task/detail/export",
  method: "POST",
  data,
  responseType: "blob"
})

// 商品信息获取
export const GetProductIndoById = data => Fetch({
  url: "/price/productInfo",
  method: "POST",
  data
})

// 商品改价任务批量提交
export const BatchPriceSubmit = data => Fetch({
  url: "/task/create",
  method: "POST",
  data
})

export const DownloadTaskTemplate = params => Fetch({
  url: "/task/template",
  params,
  responseType: "blob",
})

// 商品改价列表
export const UpdatePriceList = data => Fetch({
  url: "/price/product",
  method: "POST",
  data
})