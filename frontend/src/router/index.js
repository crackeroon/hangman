import { createRouter, createWebHistory } from 'vue-router';

import { RedirectPathService } from '@/services/redirect-path-service';

const homeUrlRedirect = RedirectPathService.DEFAULT_URL;
const homeUrl = {
  path: '/',
  name: 'home',
  redirect: homeUrlRedirect,
};

const routes = [
  homeUrl,
  {
    name: 'main',
    path: '/hangman',
    component: () => import('@/views/start-page.vue'),
  },
  {
    name: 'select-themes',
    path: '/hangman-themes',
    component: () => import('@/views/theme-hangman-select.vue'),
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});


/*router.beforeEach((to) => {
  if (UserService.instance.isAuth) {
    if (to.name === 'login') return RedirectPathService.DEFAULT_URL;
    else return true;
  } else {
    if (to.name !== 'login') {
      RedirectPathService.savePath(to.fullPath);
      return { name: 'login' };
    } else {
      return true;
    }
  }
});*/


export default router;
