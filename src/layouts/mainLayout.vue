<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="row no-wrap"
          >WhatsNext
          <div v-if="store.token !== ''">
            &nbsp;for {{ fullName }}
            <q-icon
              class="q-mx-sm q-mb-xs cursor-pointer"
              name="home"
              @click="goHome()"
              size="sm"
              ><q-tooltip>Timeline</q-tooltip></q-icon
            >
            <q-icon
              class="q-mx-sm q-mb-xs cursor-pointer"
              name="search"
              @click="goSearch()"
              size="sm"
              ><q-tooltip>Search for similar people</q-tooltip></q-icon
            >
            <q-icon
              class="q-mx-sm q-mb-xs cursor-pointer"
              name="contact_support"
              @click="goContacts()"
              size="sm"
              ><q-tooltip>View connection requests</q-tooltip></q-icon
            >
            <q-icon
              class="q-mx-sm q-mb-xs cursor-pointer"
              name="settings"
              @click="showSettingsPopup = true"
              size="sm"
              ><q-tooltip>Settings</q-tooltip></q-icon
            >
          </div>
        </q-toolbar-title>
        <div>v0.1.0</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <q-dialog
    v-model="showSettingsPopup"
    role="dialog"
    aria-modal="true"
    position="bottom"
    ><q-card class="bg-info">
      <q-card-section>
        Settings<q-separator />
        <q-input dense v-model="fullNameEdit" hint="Your name" autofocus />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Save" @click="saveSettings()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { api } from 'boot/axios';
import { bus, showAPIError, showNotification } from 'src/utils/utils';
import { useRouter } from 'vue-router';
import { whatsnextStore } from 'src/stores/whatsnextStore';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const router = useRouter();
    const store = whatsnextStore();
    return {
      fullName: ref<string>(''),
      fullNameEdit: ref<string>(''),
      showSettingsPopup: ref<boolean>(false),
      router,
      store,
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
            this.fullNameEdit = this.fullName;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    saveSettings() {
      this.fullName = this.fullNameEdit;
      api
        .put('/user/name', { full_name: this.fullName })
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            showNotification('Your name was updated');
            this.getFullName();
            this.showSettingsPopup = false;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    goContacts() {
      this.router.push({ name: 'contacts' });
    },
    goSearch() {
      this.router.push({ name: 'search' });
    },
    goHome() {
      this.router.push({ name: 'timeline' });
    },
  },
  mounted() {
    bus.on('updateFullName', this.getFullName);
  },
});
</script>
