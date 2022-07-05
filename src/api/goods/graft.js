import { OM as Fetch } from '@/api';

// 嫁接列表
export const GetGraftList = params => Fetch({
  url: '/product/graft/search',
  params,
})

// 新增
export const CreateGraftTask = data => Fetch({
  url: '/product/graft/save',
  method: 'post',
  data,
})

// 编辑
export const EditGraftTask = data => Fetch({
  url: '/product/graft/edit',
  method: 'post',
  data,
})

// 商品详情
export const GetGraftInfo = params => Fetch({
  url: '/product/graft/product-detail',
  params,
})