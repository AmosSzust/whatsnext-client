import { defineStore } from 'pinia';

export const whatsnextStore = defineStore('whatsnext', {
  state: () => ({
    token: '',
  }),

  getters: {
    getToken(state) {
      return state.token;
    },
  },

  actions: {},
});
