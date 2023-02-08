import { boot } from 'quasar/wrappers';
import axios from 'axios';

//const baseURL = 'http://localhost:3000/api/';
const baseURL = 'https://stockdiv.com:8447/api';

const api = axios.create({ baseURL: baseURL });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
