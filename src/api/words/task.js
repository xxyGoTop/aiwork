import { OM as Fetch } from '@/api'

// 查询任务列表
export const QueryTaskList = data => Fetch({
  url: '/sensitive/task/list',
  method: 'post',
  data
})

// 取消任务
export const CancelTask = data => Fetch({
  url: '/sensitive/task/cancel',
  method: 'post',
  data
})

// 查询任务详情
export const TaskDetailQuery = data => Fetch({
  url: '/sensitive/task/detail',
  method: 'post',
  data
})

// 导出
export const TaskResult = (data) => Fetch({
  url: '/sensitive/task/export',
  data,
  method: 'post',
  responseType: 'blob',
});