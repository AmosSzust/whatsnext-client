import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { whatsnextStore } from 'stores/whatsnextStore';

//const baseURL = 'http://localhost:3000/api/';
const baseURL = 'https://stockdiv.com:8447/api';

const api = axios.create({ baseURL: baseURL });
api.interceptors.request.use(
  (config) => {
    if (config != null && config.headers != null) {
      config.headers['Authorization'] = `Bearer ${whatsnextStore().token}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
