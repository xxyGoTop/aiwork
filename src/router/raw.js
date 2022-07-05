// 路由配置文件

export default [
  {
    path: '/',
    name: 'Home',
    redirect: '/goods',
  },
  // 商品管理
  {
    path: '/goods',
    name: 'goods',
    meta: {
      title: '商品管理',
      menu: true
    },
    redirect: '/goods/list',
    children: [
      {
        path: '/goods/list',
        name: 'goods-list',
        meta: {
          title: '商品列表',
          menu: true
        },
        component: () => import('@/views/goods/list/index.vue'),
      },
      {
        path: '/goods/publish',
        name: 'goods-publish',
        meta: {
          title: '商品发布',
          menu: true
        },
        component: () => import('@/views/goods/publish/index.vue'),
      },
      {
        path: '/goods/updateprice',
        name: 'goods-updateprice',
        meta: {
          title: '商品改价任务',
          menu: true
        },
        component: () => import('@/views/goods/price/task.vue'),
      },
      {
        path: '/goods/updateprice/list',
        name: 'goods-updateprice-list',
        meta: {
          title: '商品改价列表',
          menu: true
        },
        component: () => import('@/views/goods/price/list.vue'),
      },
      {
        path: '/goods/updateinfo',
        name: 'goods-updateinfo',
        meta: {
          title: '商品信息修改',
          menu: true
        },
        component: () => import('@/views/goods/info/index.vue'),
      },
      {
        path: '/goods/batchshelf',
        name: 'goods-batchshelf',
        meta: {
          title: '商品上下架',
          menu: true
        },
        component: () => import('@/views/goods/shelf/index.vue'),
      },
      {
        path: '/goods/map',
        name: 'goods-map',
        meta: {
          title: '商品映射',
          menu: true
        },
        component: () => import('@/views/goods/mapping/index.vue'),
      },
      {
        path: '/goods/alter',
        name: 'goods-alter',
        meta: {
          title: '商品变更查询',
          menu: true
        },
        component: () => import('@/views/goods/alter/index.vue'),
      },
      {
        path: '/goods/black/task',
        name: 'goods-black-task',
        meta: {
          title: '黑名单任务',
          menu: true
        },
        component: () => import('@/views/goods/black/task.vue'),
      },
      {
        path: '/goods/black/list',
        name: 'goods-black-list',
        meta: {
          title: '黑名单商品',
          menu: true
        },
        component: () => import('@/views/goods/black/list.vue'),
      },
      {
        path: '/goods/warn/list',
        name: 'goods-warn-list',
        meta: {
          title: '价格预警管理',
          menu: true
        },
        component: () => import('@/views/goods/warning/list.vue'),
      },
      {
        path: '/goods/graft',
        name: 'goods-graft',
        meta: {
          title: '商品嫁接列表',
          menu: true
        },
        component: () => import('@/views/goods/graft/index.vue'),
      },
      {
        path: '/goods/category',
        name: 'goods-category',
        meta: {
          title: '商品类目修改',
          menu: true
        },
        component: () => import('@/views/goods/category/index.vue'),
      },
    ]
  },
  // 直播管理
  {
    path: '/living',
    name: 'Living',
    meta: {
      title: '直播管理',
      menu: true
    },
    redirect: '/living/list',
    children: [
      {
        path: '/living/list',
        name: 'LiveList',
        component: () => import('@/views/live/LiveList.vue'),
        meta: {
          title: '直播列表',
          menu: true,
        },
      },
      {
        path: '/living/product/single/:action/:liveId',
        name: 'ProductSingle',
        component: () => import('@/views/live/ProductSingle.vue'),
        meta: {
          title: '单品买赠',
          menu: false,
        },
      },
      {
        path: '/living/product/stage/:action/:liveId',
        name: 'ProductStage',
        component: () => import('@/views/live/ProductStage.vue'),
        meta: {
          title: '单品阶梯赠',
          menu: false,
        },
      },
      {
        path: '/living/product/stage/set/:action/:liveId/:mainProductId',
        name: 'ProductStageSet',
        component: () => import('@/views/live/ProductStageSet.vue'),
        meta: {
          title: '单品阶梯赠设置',
          menu: false,
        },
      },
      {
        path: '/living/activity/stage/:action/:liveId',
        name: 'ActivityStage',
        component: () => import('@/views/live/ActivityStage.vue'),
        meta: {
          title: '活动阶梯赠',
          menu: false,
        },
      },
      {
        path: '/living/submit/:liveId/:action',
        name: 'LiveSubmit',
        component: () => import('@/views/live/LiveSubmit.vue'),
        meta: {
          title: '直播提交',
          menu: false,
        },
      },
      {
        path: '/living/promo/list/:liveId/:action',
        name: 'LivePromoList',
        component: () => import('@/views/live/LivePromoList.vue'),
        meta: {
          title: '直播促销列表',
          menu: false,
        },
      },
      {
        path: '/living/createLive',
        name: 'createLive',
        component: () => import('@/views/live/CreateLive.vue'),
        meta: {
          title: '新建直播',
          menu: true,
        },
      },
      {
        path: '/living/product/productAndStock/:liveId/:platformId',
        name: 'productAndStock',
        component: () => import('@/views/live/ProductAndStock.vue'),
        meta: {
          title: '商品及锁库存页面',
          menu: false,
        },
      },
      {
        name: 'updateLive',
        path: '/living/updateLive/:liveId',
        component: () => import('@/views/live/UpdateLive.vue'),
        meta: {
          title: '编辑直播',
          menu: false,
        },
      },
    ]
  },
  // 库存管理
  {
    name: 'stock',
    path: '/stock',
    meta: {
      title: '库存管理',
      menu: true
    },
    redirect: '/stock/task',
    children: [
      {
        name: 'stockTask',
        path: '/stock/task',
        component: () => import('@/views/stock/task.vue'),
        meta: {
          title: '锁库存任务',
          menu: true
        },
      },
      {
        name: 'stockList',
        path: '/stock/list',
        component: () => import('@/views/stock/list.vue'),
        meta: {
          title: '锁库存列表',
          menu: true
        },
      },
      {
        name: 'stockSearch',
        path: '/stock/search',
        component: () => import('@/views/stock/search.vue'),
        meta: {
          title: '库存查询',
          menu: true
        },
      },
      {
        name: 'stockSyncRate',
        path: '/stock/sync_rate',
        component: () => import('@/views/stock/syncRate.vue'),
        meta: {
          title: '库存同步比例',
          menu: true,
        },
      },
    ]
  },
  // 地址管理
  {
    name: 'address',
    path: '/address',
    component: () => import('@/views/address/List.vue'),
    meta: {
      title: '地址管理',
      menu: true
    },
  },
  // 促销管理
  {
    name: 'promote',
    path: '/promote',
    redirect: '/promote/gift',
    meta: {
      title: '促销管理',
      menu: true
    },
    children: [
      {
        name: 'gift',
        path: '/promote/gift',
        component: () => import('@/views/promote/gift/index.vue'),
        meta: {
          title: '赠品促销',
          menu: true
        }
      },
      {
        name: 'giftEdit',
        path: '/promote/gift/:type',
        component: () => import('@/views/promote/gift/components/PromoteEdit.vue'),
        meta: {
          title: '赠品促销编辑',
          menu: false
        }
      },
    ]
  },
  // 敏感词管理
  {
    name: 'words',
    path: '/words',
    redirect: '/words/list',
    meta: {
      title: '敏感词管理',
      menu: true
    },
    children: [
      {
        name: 'wordsList',
        path: '/words/list',
        component: () => import('@/views/words/index.vue'),
        meta: {
          title: '敏感词列表',
          menu: true
        },
      },
      {
        name: 'wordsTask',
        path: '/words/task',
        component: () => import('@/views/words/task.vue'),
        meta: {
          title: '敏感词任务',
          menu: true
        },
      },
    ]
  },
  // 结算管理
  {
    path: '/bill',
    name: 'bill',
    meta: {
      title: '结算管理',
      menu: true,
    },
    redirect: '/bill/list',
    children: [
      {
        path: '/bill/list',
        name: 'billList',
        meta: {
          title: '快手结算单',
          menu: true,
        },
        component: () => import('@/views/bill/list.vue'),
      },
    ]
  },
  // 订单管理
  {
    path: '/orders',
    name: 'orders',
    meta: {
      title: '订单管理',
      menu: true
    },
    redirect: '/orders/list',
    children: [
      {
        path: '/orders/list',
        name: 'orders-list',
        meta: {
          title: '订单列表',
          menu: true
        },
        component: () => import('@/views/orders/list.vue'),
      },
      {
        path: '/orders/convert',
        name: 'orderConvert',
        meta: {
          title: '订单重新转单',
          menu: true
        },
        component: () => import('@/views/orders/convert.vue'),
      },
    ]
  },
];
