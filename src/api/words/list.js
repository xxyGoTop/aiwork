import { OM as Fetch } from "@/api"

// 列表查询
export const QueryWordsList = params => Fetch({
  url: "/sensitive/word/list",
  params
})

// 词查询
export const QueryWords = data => Fetch({
  url: "/sensitive/word/search",
  method: "post",
  data
})

// 批量新增
export const BatchAddWords = data => Fetch({
  url: "/sensitive/wordCreate",
  method: "post",
  data
})

// 删除
export const BatchDelWords = data => Fetch({
  url: "/sensitive/word/delete",
  method: "post",
  data
})

// 批量模板
export const BatchTemplate = data => Fetch({
  url: "/sensitive/task/template/download",
  method: "post",
  data,
  responseType: "blob",
})

// 添加特例品
export const BatchAddProduct = data => Fetch({
  url: "/sensitive/wordCreate",
  method: "post",
  data
})

// 删除特例品
export const BatchDelProduct = data => Fetch({
  url: "/sensitive/specialProductDelete",
  method: "post",
  data
})
