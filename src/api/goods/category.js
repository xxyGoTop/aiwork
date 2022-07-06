import { OM as Fetch } from "@/api"

// 类目列表
export const GetCateList = (data) => Fetch({
  url: "/product/category/list",
  method: "post",
  data
})

// 类目更新
export const CateUpdate = (data) => Fetch({
  url: "/product/category/update",
  data,
  method: "post",
})