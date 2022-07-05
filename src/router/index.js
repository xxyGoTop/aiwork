import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './process';
import NotFound from '@/views/404.vue';


const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function(location) {
  return originalPush.call(this, location).catch(err => err);
};

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    ...routes,
    {
      path: '*',
      name: 'notfound',
      component: NotFound,
      meta: { title: '404' },
    },
  ],
});

export default router;
