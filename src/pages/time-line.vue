<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="text-weight-bold">Hello {{ full_name }},</div>
      <q-icon
        class="q-mx-xs cursor-pointer"
        name="edit"
        @click="setFullName()"
        size="sm"
        ><q-tooltip>Update your name</q-tooltip></q-icon
      >
      <q-icon
        class="q-mx-xs cursor-pointer"
        name="search"
        @click="goSearch()"
        size="sm"
        ><q-tooltip>Search for similar people</q-tooltip></q-icon
      >
      <q-icon
        class="q-mx-xs cursor-pointer"
        name="contact_support"
        @click="goContacts()"
        size="sm"
        ><q-tooltip>View connection requests</q-tooltip></q-icon
      >
    </div>
    <q-timeline color="secondary" v-if="finishedLoading">
      <q-timeline-entry
        v-for="event in events"
        :key="event.id"
        :title="event.event_name"
        :icon="event.icon_name"
        :body="event.description"
      >
        <template v-slot:subtitle>
          {{ getEventDate(event.event_when) }}
          <q-icon
            size="sm"
            class="q-my-xs q-mx-xs cursor-pointer"
            name="delete_forever"
            @click="deleteEvent(event.id)"
            ><q-tooltip>Delete this event</q-tooltip></q-icon
          >
        </template>
      </q-timeline-entry>
    </q-timeline>
    <q-inner-loading :showing="!finishedLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="addEvent()"
        ><q-tooltip>Add an event</q-tooltip></q-btn
      >
    </q-page-sticky>
  </q-page>

  <q-dialog
    v-model="addEventPopupShow"
    role="dialog"
    aria-modal="true"
    position="bottom"
  >
    <q-card class="bg-info">
      <q-card-section>
        This event happened when you were {{ age }} years old
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-select
          v-model="eventData"
          :options="eventNameOptions"
          hint="Select life event"
          option-value="id"
          option-label="event_name"
          class="q-my-sm"
          autofocus
        >
          <template v-slot:before>
            <q-icon v-if="eventData !== null" :name="eventData.icon_name" />
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon_name" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.event_name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          v-model="eventWhen"
          mask="####-##-##"
          hint="The year is what's important"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="eventWhen"
                  mask="YYYY-MM-DD"
                  today-btn
                  :options="eventOptions"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          v-model="notes"
          type="textarea"
          counter
          maxlength="256"
          autogrow
          hint="Add notes (not mandatory)"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Add event" @click="addEventToUser()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { IEvent } from 'src/models/interfaces/IEvent';
import { whatsnextStore } from 'src/stores/whatsnextStore';
import { defineComponent, ref } from 'vue';
import { date } from 'quasar';
import { ILifeEvent } from 'src/models/interfaces/ILifeEvent';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'time-line',

  setup() {
    const router = useRouter();
    const store = whatsnextStore();
    let eventNameOptions: string[] = [];
    let birthDate: Date = new Date();
    function eventOptions(date: string) {
      return (
        date <= new Date().toISOString().substring(0, 10).replace(/-/g, '/')
      );
    }
    return {
      events: ref<IEvent[]>([]),
      finishedLoading: ref<boolean>(false),
      addEventPopupShow: ref<boolean>(false),
      eventData: ref<ILifeEvent | null>(null),
      eventNameOptions,
      store,
      eventWhen: ref<string>(new Date().toISOString().substring(0, 10)),
      birthDate,
      router,
      notes: ref(''),
      full_name: ref(''),
      eventOptions,
    };
  },
  computed: {
    age(): number {
      //return date.getDateDiff(new Date(this.eventWhen),this.birthDate,'years');
      return this.diffYears(new Date(this.eventWhen), this.birthDate);
    },
  },
  methods: {
    diffYears(dt2: Date, dt1: Date) {
      var diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60 / 60 / 24;
      return Math.trunc(diff / 365.25);
    },
    goContacts() {
      this.router.push({ name: 'contacts' });
    },
    goSearch() {
      this.router.push({ name: 'search' });
    },
    deleteEvent(eventId: number) {
      this.$q
        .dialog({
          title: 'Delete an event',
          message: 'Are you sure?',
          cancel: true,
        })
        .onOk(() => {
          api
            .delete(`/event/${eventId}`, {
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
                this.getLifeEvents();
              }
            })
            .catch((error) => {
              console.log(error);
              const err = error.response.data
                ? error.response.data.error
                : error.message;
              this.$q.notify({
                message: err,
              });
            });
        });
    },
    ageFromBirth(eventWhen: Date): number {
      //return date.getDateDiff(eventWhen, this.birthDate, 'years');
      return this.diffYears(new Date(eventWhen), this.birthDate);
    },
    addEventToUser() {
      if (this.eventData == null) {
        this.$q.notify({
          message: 'Please select a life event',
        });
      } else {
        api
          .post(
            '/event',
            {
              id: this.eventData?.id,
              description: this.notes,
              event_when: this.eventWhen,
            },
            {
              headers: {
                Authorization: `Bearer ${this.store.token}`,
              },
            }
          )
          .then((response) => {
            if (response.data.error) {
              this.$q.notify({
                message: response.data.error,
              });
            } else {
              this.addEventPopupShow = false;
              this.eventData = null;
              this.notes = '';
              this.eventWhen = new Date().toISOString().substring(0, 10);
              this.getLifeEvents();
            }
          })
          .catch((error) => {
            console.log(error);
            const err = error.response.data
              ? error.response.data.error
              : error.message;
            this.$q.notify({
              message: err,
            });
          });
      }
    },
    getEventDate(eventDate: Date) {
      return (
        date.formatDate(eventDate, 'MMMM DD, YYYY') +
        ' (Age ' +
        this.ageFromBirth(eventDate) +
        ')'
      );
    },
    addEvent() {
      api
        .get('/event/all', {
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
            this.eventNameOptions = response.data;
            this.addEventPopupShow = true;
          }
        })
        .catch((error) => {
          console.log(error);
          const err = error.response.data
            ? error.response.data.error
            : error.message;
          this.$q.notify({
            message: err,
          });
        });
    },
    getLifeEvents() {
      api
        .get('/event', {
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
            this.events = response.data;
            this.birthDate = new Date(
              this.events[this.events.length - 1].event_when
            );
            this.finishedLoading = true;
          }
        })
        .catch((error) => {
          console.log(error);
          const err = error.response.data
            ? error.response.data.error
            : error.message;
          this.$q.notify({
            message: err,
          });
        });
    },
    getFullName() {
      api
        .get('/user/name', {
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
            this.full_name = response.data.full_name;
          }
        })
        .catch((error) => {
          console.log(error);
          const err = error.response.data
            ? error.response.data.error
            : error.message;
          this.$q.notify({
            message: err,
          });
        });
    },
    setFullName() {
      this.$q
        .dialog({
          title: 'Update your name',
          message: 'What is your name?',
          prompt: {
            model: '',
            type: 'text',
          },
          cancel: true,
        })
        .onOk((data) => {
          api
            .put(
              '/user/name',
              { full_name: data },
              {
                headers: {
                  Authorization: `Bearer ${this.store.token}`,
                },
              }
            )
            .then((response) => {
              if (response.data.error) {
                this.$q.notify({
                  message: response.data.error,
                });
              } else {
                this.getFullName();
              }
            })
            .catch((error) => {
              console.log(error);
              const err = error.response.data
                ? error.response.data.error
                : error.message;
              this.$q.notify({
                message: err,
              });
            });
        });
    },
  },
  mounted() {
    this.getLifeEvents();
    this.getFullName();
  },
});
</script>
