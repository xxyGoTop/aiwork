import { Bill } from './index'

// 查询结算单
export const QueryBillList = data => Bill({
  url: '/settle/kuaishou/info/list',
  method: 'post',
  data,
})

// 获取任务列表
export const QueryTaskList = data => Bill({
  url: '/settle/kuaishou/task/list',
  method: 'post',
  data
})

// 任务文件下载
export const DownloadTaskResult = params => Bill({
  url: '/settle/kuaishou/download',
  params,
  method: 'get',
  responseType: 'blob'
})

// 下载模板
export const DownloadBillTemp = (params) => Bill({
  url: '/task/template',
  params,
  responseType: 'blob'
})

// 上传结算单(废弃)
// export const UploadBill = data => Bill({
//   url: '/settle/kuaishou/upload',
//   method: 'post',
//   data
// })

// 导入结算单
export const ImportBill = data => Bill({
  url: '/settle/kuaishou/import',
  method: 'post',
  data
})
