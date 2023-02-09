<template>
  <q-page class="q-pa-md">
    <q-icon
      class="q-my-xs q-mx-xs cursor-pointer"
      name="arrow_back_ios"
      @click="goBack()"
      ><q-tooltip>Back</q-tooltip></q-icon
    >Your connection requests
    <q-icon
      class="cursor-pointer"
      name="refresh"
      size="sm"
      @click="getContactsList()"
      ><q-tooltip>Refresh</q-tooltip></q-icon
    >
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
      <q-spinner-gears size="50px" color="primary" />
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
    goBack() {
      this.router.push({ name: 'timeline' });
    },
    getContactsList() {
      this.doneLoading = false;
      api
        .get('/contact', {
          headers: {
            Authorization: `Bearer ${this.store.token}`,
          },
        })
        .then((response) => {
          if (response.data.error) {
            this.$q.notify({
              message: response.data.error,
            });
          } else {
            this.contactsList = response.data;
            this.doneLoading = true;
          }
        })
        .catch((error) => {
          console.log(error);
          const err = error.response?.data
            ? error.response?.data.error
            : error.message;
          this.$q.notify({
            message: err,
          });
          this.doneLoading = true;
        });
    },
  },
  mounted() {
    this.getContactsList();
  },
});
</script>
