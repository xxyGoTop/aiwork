import { OM as Fetch } from "@/api"

// 查询赠品
export const GiftQuery = (data) => Fetch({
  url: "/gift/list",
  method: "post",
  data
})

// 创建赠品
export const GiftCreate = (data) => Fetch({
  url: "/gift/create",
  method: "post",
  data
})

// 获取赠品信息
export const GiftInfoGet = (partnerId, productId) => Fetch({
  url: `/product/detail/${partnerId}/${productId}`,
})

// 赠品活动详情
export const GiftActDetail = (taskId) => Fetch({
  url: `/gift/detail/${taskId}`,
})

// 赠品活动删除
export const GiftActDel = (taskId) => Fetch({
  url: `/gift/delete/${taskId}`,
})

// 赠品活动更新
export const GiftActUpdate = data => Fetch({
  url: "/gift/update",
  method: "post",
  data
})

// 终止
export const GiftActStop = taskId => Fetch({
  url: `/gift/suspend/${taskId}`,
})