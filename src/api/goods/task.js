import { OM as Fetch } from "@/api"
import qs from "qs"

// 创建任务
export const TaskCreate = data => Fetch({
  url: "/task/create",
  method: "post",
  data,
})

// 查询任务列表
export const QueryTaskList = params => Fetch({
  url: "/task/queryTaskList",
  params,
})

// 任务状态集合查询
export const TaskStatusList = params => Fetch({
  url: "/task/status",
  params,
})

// 下载中心任务查询
export const DownloadTaskQuery = params => Fetch({
  url: "/task/fileCenter/query",
  params,
})

// 商品映射明细查询
export const MapDetailQuery = params => Fetch({
  url: "/task/mapping/detail",
  params,
  paramsSerializer: function (params) {
    return qs.stringify(params, { indices: false })
  },
})

// 任务详情查询
export const TaskDetailQuery = params => Fetch({
  url: "/task/taskDetail",
  params,
  paramsSerializer: function (params) {
    return qs.stringify(params, { indices: false })
  },
})

// 任务信息查询
export const TaskInfoQuery = params => Fetch({
  url: `/task/taskInfo/${params.taskId}`,
})

// 上传文件
export const UploadFile = data => Fetch({
  url: "/task/file/upload",
  method: "post",
  data
})

// 上传图片
export const UploadPicture = data => Fetch({
  url: "/task/image/upload",
  method: "post",
  data
})

// 商品信息修改终止
export const InfoAbort = params => Fetch({
  url: "/task/abort",
  params
})

// 任务模板下载
export const DownloadTaskTemplate = params => Fetch({
  url: "/task/template",
  params,
  responseType: "blob",
})
// 获取任务结果
// -1: 任务不存在, -2: 系统异常, 2: 结果文件生成中, 3: 结果文件已经上传
export const TaskResult = (params) => Fetch({
  url: "/task/taskResult",
  params,
})

// 任务详情状态映射
export const TaskStatusMap = (params) => Fetch({
  url: "/task/displayStatus",
  params,
})
