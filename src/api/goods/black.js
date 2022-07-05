import { OM as Fetch } from '@/api';
import qs from 'qs'
// 任务查询
export const GetBlackTaskList = params => Fetch({
  url: '/task/queryTaskList',
  method: 'get',
  params
});

// 任务结果
export const BlackTaskInfo = params => Fetch({
  url: `/task/taskInfo/${params.taskId}`,
});

// 任务结果列表
export const BlackTaskDetail = params => Fetch({
  url: '/task/taskDetail',
  method: 'get',
  params,
  paramsSerializer: function (params) {
    return qs.stringify(params, { indices: false })
  },
});

// 任务导出
export const TaskResultDownload = params => Fetch({
  url: '/task/taskResult',
  method: 'get',
  params
});

// 取消任务
export const TaskCancel = params => Fetch({
  url: '/task/cancel',
  method: 'get',
  params,
});

// 任务全部移除
export const TaskDetach = params => Fetch({
  url: '/task/detach',
  method: 'get',
  params,
});

// 黑名单商品列表查询
export const QueryProductList = params => Fetch({
  url: '/black/blackProductList',
  method: 'get',
  params,
})

// 商品移除
export const DeleteProduct = params => Fetch({
  url: '/black/delete',
  method: 'get',
  params,
})

// 黑名单新增
export const BlackTaskCreate = data => Fetch({
  url: '/task/create',
  method: 'post',
  data,
})

// 商品编辑
export const EditBlackProduct = params => Fetch({
  url: '/black/edit',
  params,
})