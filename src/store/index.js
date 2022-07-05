import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: '',
    // 侧边栏菜单
    asideMenu: [],
    groupMap: {
      0: {
        label: '主站',
        link: 'http://product.dangdang.com/',
        // http://product.dangdang.com/23413230.html(主站商品详情)
      },
      1: {
        label: '天猫',
        link: 'https://detail.tmall.com/item.htm?id=',
      },
      2: {
        label: '拼多多',
        link: 'https://mobile.yangkeduo.com/goods.html?goods_id=',
      },
      3: {
        label: '抖音',
        link: 'https://haohuo.jinritemai.com/views/product/detail?origin_type=604&id=',
      },
      4: {
        label: '快手',
        link: 'https://app.kwaixiaodian.com/merchant/shop/detail?id=',
      },
      5: {
        label: '小红书',
        link: 'https://pages.xiaohongshu.com/goods/',
      },
    },
    partnerId: '',
  },
  mutations: {
    // 菜单
    setAsideMenu(state, menu) {
      state.asideMenu = menu;
    },
    setUserName(state, name) {
      state.username = name;
    },
    setPartnerId(state, v) {
      state.partnerId = v;
    },
  },
  actions: {},
  modules: {},
})
