import { OM as Fetch } from "@/api"

// 任务列表
export const GetTaskList = (data) => Fetch({
  url: "/priceMonitor/task/list",
  method: "post",
  data,
})

// 任务列表详情
export const GetTaskDetailList = (data) => Fetch({
  url: "/priceMonitor/task/detail/list",
  method: "post",
  data,
})

// 停止
export const StopTask = (data) => Fetch({
  url: "/priceMonitor/task/stop",
  method: "post",
  data,
})

// 新增任务
export const TaskCreate = data => Fetch({
  url: "/task/create",
  method: "post",
  data,
})

// 修改
export const TaskEdit = data => Fetch({
  url: "/priceMonitor/task/update",
  method: "post",
  data,
})

// 任务模板
export const DownloadTaskTemplate = params => Fetch({
  url: "/task/template",
  params,
  responseType: "blob",
})

// 上传
export const UploadFile = data => Fetch({
  url: "/task/file/upload",
  method: "post",
  data
})

// 导出
export const TaskResult = data => Fetch({
  url: "/priceMonitor/export/task",
  method: "post",
  data
})