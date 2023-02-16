<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>WhatsNext for {{ fullName }}</q-toolbar-title>

        <div>v0.1.0</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {api} from 'boot/axios';
import {bus, showAPIError, showNotification } from 'src/utils/utils';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    return {
      fullName: ref<string>(''),
    };
  },
  methods: {
    getFullName() {
      api
        .get('/user/name')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.fullName = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    }
  },
  mounted() {
    bus.on('updateFullName', this.getFullName);
    this.getFullName();
  },
});
</script>
