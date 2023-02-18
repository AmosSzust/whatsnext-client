<template>
  <q-page class="column q-pa-md items-center">
    <div class="row no-wrap">
      Your connection requests
      <q-icon
        class="q-mx-md cursor-pointer"
        name="refresh"
        size="sm"
        @click="getContactsList()"
        ><q-tooltip>Refresh</q-tooltip></q-icon
      >
    </div>
    <q-list v-show="doneLoading">
      <q-item v-for="item in contactsList" v-bind:key="item.id">
        <q-item-section>
          <q-item-label> {{ item.full_name }} </q-item-label>
          <q-item-label caption lines="2"
            >Wants to connect. You can contact them via email
            <a :href="`mailto:${item.email}`">{{ item.email }}</a></q-item-label
          >
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption>{{
            showContactTime(item.contact_when)
          }}</q-item-label>
          <q-icon class="cursor-pointer" name="email" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-inner-loading :showing="!doneLoading">
      <q-spinner-hourglass size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { whatsnextStore } from 'src/stores/whatsnextStore';
import { api } from 'src/boot/axios';
import { IContact } from 'src/models/interfaces/IContact';
import { date } from 'quasar';
import { showAPIError, showNotification } from 'src/utils/utils';
export default defineComponent({
  name: 'contacts-connections',
  setup() {
    const router = useRouter();
    const store = whatsnextStore();

    return {
      router,
      store,
      contactsList: ref<IContact[]>([]),
      doneLoading: ref<boolean>(false),
    };
  },
  methods: {
    showContactTime(contactTime: Date) {
      return date.formatDate(contactTime, 'YYYY-MM-DD');
    },
    getContactsList() {
      this.doneLoading = false;
      api
        .get('/contact')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.contactsList = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.doneLoading = true;
        });
    },
  },
  mounted() {
    this.getContactsList();
  },
});
</script>
