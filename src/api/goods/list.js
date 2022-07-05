import { OM as Fetch } from '@/api';
import qs from 'qs'

export const DDCate = () => Fetch({
  url: '/product/ddCategory',
});

export const DDCateFuzzySearch = (params) => Fetch({
  url: '/product/ddCategoryByName',
  params,
});

export const GoodsDel = (params) => Fetch({
  url: '/product/delete',
  params,
});

export const GoodsDetail = (partnerId, productId) => Fetch({
  url: `/product/detail/${partnerId}/${productId}`,
});

export const GoodsOffShelf = (params) => Fetch({
  url: '/product/offShelf',
  params,
});

export const GoodsOnShelf = (params) => Fetch({
  url: '/product/onShelf',
  params,
});

export const OuterCate = (params) => Fetch({
  url: '/product/outerCategory',
  params,
});

export const OuterCateFuzzySearch = (params) => Fetch({
  url: '/product/outerCategoryByName',
  params,
});

export const GoodsShops = (params) => Fetch({
  url: '/product/partners',
  params,
});

export const GoodsPrice = (partnerId, productId, outerCode) => Fetch({
  url: `/product/price/${partnerId}/${productId}/${outerCode}`,
});

export const GoodsSale = (params) => Fetch({
  url: '/product/sale',
  params,
});

export const GoodsSearch = (params) => Fetch({
  url: '/product/search',
  params,
});

// 商品库存详细查询
export const GoodsStore = (params) => Fetch({
  url: '/stock/detail',
  params
})

// 黑名单列表查询
export const GoodsBlackList = (partnerId, productId) => Fetch({
  url: `/black/list/${partnerId}/${productId}`,
})

// 操作日志
export const GoodsOperateLog = (data) => Fetch({
  url: '/productOpt/selectProductOptRecord',
  method: 'post',
  data
})

// 商品批量删除
export const BatchDelete = params => Fetch({
  url: '/product/batch/delete',
  params,
  paramsSerializer: function (params) {
    return qs.stringify(params, { indices: false })
  },
})

// 规格查询-天猫
export const SpecificationList = (partnerId, outerCode) => Fetch({
  url: `/product/specification/list/${partnerId}/${outerCode}`,
})

// 规格删除
export const SpecificationDelete = (partnerId, primaryId) => Fetch({
  url: `/product/specification/delete/${partnerId}/${primaryId}`,
})

// 规格恢复
export const SpecificationRecover = (partnerId, primaryId) => Fetch({
  url: `/product/specification/recover/${partnerId}/${primaryId}`,
})

// 价格查询
export const GetPrice = data => Fetch({
  url: '/price/outer/product/list',
  method: 'post',
  data,
})

// 库存查询
export const GetStock = data => Fetch({
  url: '/stock/outer/product/list',
  method: 'post',
  data,
})

// 解绑
export const ProductUnbind = params => Fetch({
  url: '/product/unbound',
  params
})

// 规格查询-拼多多、抖音
export const PDNormsList = (id) => Fetch({
  url: `/product/skuList/${id}`,
})

// 规格删除、恢复-拼多多、抖音
export const PDNormsR = params => Fetch({
  url: '/product/sku/status',
  params,
})