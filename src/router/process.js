import raw from './raw';

// 平铺路由
const routes = raw.map(route => {
  if (route.children && route.children.length) {
    // 父级路由
    const proute = Object.create(null);
    for (const [key, value] of Object.entries(route)) {
      if (key !== 'children') {
        proute[key] = value;
      }
    }
    return [
      proute,
      ...route.children
    ]
  }
  return route
});

// 生成路由
export default routes.flat();