import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/login.vue') },
      {
        name: 'timeline',
        path: '/timeline',
        component: () => import('pages/time-line.vue'),
      },
      {
        name: 'search',
        path: '/search',
        component: () => import('pages/search-similar.vue'),
      },
      {
        name: 'contacts',
        path: '/contacts',
        component: () => import('pages/contacts-connections.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
