import { OM as Fetch } from '@/api';

// 草稿箱列表
export const GetDraftsList = params => Fetch({
  url: '/product/draft/search',
  params,
})

// 导出草稿箱-异步
export const ExportDraftsList = data => Fetch({
  url: '/task/create',
  method: 'post',
  data,
})

// 删除
export const BatchDraftsDel = data => Fetch({
  url: '/product/draft/batch/delete',
  data,
  method: 'post',
})

// 发布
export const BatchPub = data => Fetch({
  url: '/product/draft/batch/repub',
  data,
  method: 'post',
})