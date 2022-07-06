import { OM as Fetch } from "@/api"

// 列表查询
export const QueryOrdersList = data => Fetch({
  url: "/order/list",
  method: "post",
  data
})

// 基础数据
export const GetBasicData = params => Fetch({
  url: `/order/getOrderBasicData/${params.partnerId}`,
})

// 导出
export const OrderExport = (params) => Fetch({
  url: "/order/export",
  method: "get",
  params,
  responseType: "blob",
})

// 重置订单状态
export const ResetOrderStatus = data => Fetch({
  url: "/order/resetOrderStatus",
  method: "post",
  data
})

