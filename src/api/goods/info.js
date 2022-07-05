import { OM as Fetch } from '@/api';

// 定时模板
export const PostTel = (params) => Fetch({
  url: '/product/postageId',
  params
});

// 定时包邮结束时间更新
export const PostTelTimeUpdate = (data) => Fetch({
  url: '/task/postage/update',
  data,
  method: 'post',
});