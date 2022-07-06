import {
  Live,
} from "./index"

export const Get = (url, params, options = {}) => Live.get(url, { params, ...options })
export const Post = (url, data) => Live.post(url, data)

//文件下载
export const ExportFileRequest = (url, params) => {
  return Live({
    method: "get",
    params: params,
    url: url,
    responseType: "blob",
  })
}

export const DownloadTemplate = () => Live({
  url: "/product/single/template",
  method: "get",
  responseType: "blob",
})

//下载商品上传模板
export const DownLiveProduct = (params) => Live({
  url: "/product/single/downloadError",
  method: "get",
  responseType: "blob",
  params,
})

// 阶梯赠保存
export const SaveProductStage = (data, { liveId = "", promoType = "" }) => Live({
  url: `/stage/activity/saveGiftInfo/${liveId}/${promoType}`,
  method: "post",
  data,
})

// 单品买赠
export const ProductSingleList = (liveId, params) => {
  return Get("/product/single/list/" + liveId, params)
}

export const DownloadError = (params) => {
  return ExportFileRequest("/product/single/downloadError", params)
}

//获取活动信息
export const GetLiveInfo = (params) => {
  return Post("/list", params)
}
//获取商品及锁库存列表
export const GetLiveProductList = (params) => {
  return Post("/liveProduct/findLiveProductsByLiveId", params)
}

//获取阶梯信息
export const GetStageInfo = (params) => {
  return Get("/stage/promo/list", params)
}

//直播提交接口
export const submitLiveInfo = (params) => {
  return Post("/operate/submitLiveInfo", params)
}

// 阶梯赠品信息
export const StageGiftInfoList = (params) => {
  return Post("/stage/activity/stageGiftInfo", params)
}

// 主商品信息
export const MainProductList = (params) => {
  return Get("/stage/product/mainList", params)
}

// 查询主商品信息
export const QueryMainProduct = (params) => {
  return Get("/stage/product/mainProductInfo", params)
}

// 保存主商品信息
export const SaveMainProduct = (params) => {
  return Post("/stage/product/saveMainProduct", params)
}

// 删除主商品信息
export const DeleteMainProduct = (params) => {
  return Post("/stage/product/deleteMainProduct", params)
}

export const UploadProducts = (params) => {
  return Post("/product/single/upload", params)
}

export const SaveProductSingle = (liveId, params) => {
  return Post("/product/single/save/" + liveId, params)
}

//查询直播列表
export const LiveList = (params)=>{
  return Live.post("/list", params)
}

//删除直播
export const DeleteLive = (params)=>{
  return Live.post("/delete", params)
}

export const GiftInfo = (params) => {
  return Get("/stage/product/giftInfo", params)
}
//新建直播页面获取下拉框值
export const CreateLiveBasic = () => {
  return Live.get("/getCreateLiveBasic")
}
//保存直播信息
export const SaveLiveInfo = (params) => {
  return Post("/saveLive", params)
}
//获取直播品信息
export const GetLiveProductsByLiveId = (params) => {
  return Post("/liveProduct/findLiveProductsByLiveId", params)
}
//删除直播品
export const LogicDeleteLiveProuct = (params) => {
  return Post("/liveProduct/logicDeleteLiveProuct", params)
}
//批量上传商品
export const UploadLiveProduct = (params) => {
  return Post("/liveProduct/upload", params)
}
//批量更新预锁库存数量
export const UpdatePrelockNum = (params) => {
  return Post("/liveProduct/updatePrelockNum", params)
}
//商品及锁库存页面-添加商品
export const SaveLiveProduct = (params) => {
  return Post("/liveProduct/saveLiveProduct", params)
}
//根据直播ID查询直播信息
export const GetLiveInfoByLiveId = (params) => {
  return Post("/getLiveInfoByLiveId", params)
}
export const UpdateLiveInfo = (params) => {
  return Post("/updateLiveInfo", params)
}

