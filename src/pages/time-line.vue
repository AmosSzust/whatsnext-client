<template>
  <q-page class="column q-pa-md items-center">
    <div class="row">
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
    <q-timeline color="secondary" v-if="finishedLoading" layout="loose">
      <q-timeline-entry
        v-for="event in events"
        :key="event.id"
        :subtitle="getEventDate(event.event_when)"
        :icon="event.icon_name"
        :body="event.description"
      >
        <template v-slot:title>
          {{ event.event_name }}
          <q-icon
            class="q-mb-xs q-mx-xs cursor-pointer"
            :name="event.event_name === 'Birth' ? 'edit' : 'delete_forever'"
            @click="handleEvent(event.event_name, event.id)"
          ><q-tooltip>{{
              event.event_name === 'Birth' ? 'Edit' : 'Delete this event'
            }}</q-tooltip></q-icon
          >
        </template>
      </q-timeline-entry>
    </q-timeline>
    <q-inner-loading :showing="!finishedLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="addEventPopupShow = true"
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
          :option-disable="(opt) => opt.id === 1"
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
import {bus, showAPIError, showNotification} from 'src/utils/utils';
export default defineComponent({
  name: 'time-line',

  setup() {
    const router = useRouter();
    const store = whatsnextStore();
    let eventNameOptions: string[] = [];
    let birthDate = ref(new Date());
    function eventOptions(date: string) {
      return (
        date >= birthDate.value.toISOString().substring(0, 10).replace(/-/g, '/') &&
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
      return this.diffYears(new Date(this.eventWhen), this.birthDate);
    },
  },
  methods: {
    diffYears(dt2: Date, dt1: Date) {
      const diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60 / 60 / 24;
      return Math.trunc(diff / 365.25);
    },
    goContacts() {
      this.router.push({ name: 'contacts' });
    },
    goSearch() {
      this.router.push({ name: 'search' });
    },
    handleEvent(eventName: string, eventId: number) {
      if (eventName !== 'Birth') this.deleteEvent(eventId);
      else this.editBirthEvent();
    },
    editBirthEvent() {
      this.$q
        .dialog({
          title: 'Update your birthdate',
          message: 'What is your birthdate (yyyy-mm-dd)?',
          prompt: {
            model: '',
            type: 'text',
          },
          cancel: true,
        })
        .onOk((data) => {
          if (isNaN(Date.parse(data))) {
            showNotification('You entered an invalid date');
          } else {
            api
              .put(
                '/user/birthdate',
                { birthDate: data })
              .then((response) => {
                if (response.data.error) {
                  showNotification(response.data.error);
                } else {
                  showNotification('Your birthdate was updated');
                  this.getLifeEvents();
                }
              })
              .catch((err) => {
                showAPIError(err);
              });
          }
        });
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
            .delete(`/event/${eventId}`)
            .then((response) => {
              if (response.data.error) {
                showNotification(response.data.error);
              } else {
                this.getLifeEvents();
              }
            })
            .catch((err) => {
              showAPIError(err);
            });
        });
    },
    ageFromBirth(eventWhen: Date): number {
      return this.diffYears(new Date(eventWhen), this.birthDate);
    },
    addEventToUser() {
      if (this.eventData == null) {
        showNotification('Please select a life event');
      } else {
        api
          .post(
            '/event',
            {
              id: this.eventData?.id,
              description: this.notes,
              event_when: this.eventWhen,
            })
          .then((response) => {
            if (response.data.error) {
              showNotification(response.data.error);
            } else {
              this.addEventPopupShow = false;
              this.eventData = null;
              this.notes = '';
              this.eventWhen = new Date().toISOString().substring(0, 10);
              this.getLifeEvents();
            }
          })
          .catch((err) => {
            showAPIError(err);
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
    getAllEvents() {
      api
        .get('/event/all')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.eventNameOptions = response.data;
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    getLifeEvents() {
      api
        .get('/event')
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.events = response.data;
            this.birthDate = new Date(
              this.events[this.events.length - 1].event_when
            );
            this.finishedLoading = true;
          }
        })
        .catch((err) => {
          showAPIError(err);
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
          if (data.trim() === '') {
            showNotification('Your name is missing');
          } else {
            api
              .put(
                '/user/name',
                { full_name: data })
              .then((response) => {
                if (response.data.error) {
                  showNotification(response.data.error);
                } else {
                  showNotification('Your name was updated');
                  bus.emit('updateFullName');
                }
              })
              .catch((err) => {
                showAPIError(err);
              });
          }
        });
    },
  },
  mounted() {
    this.getLifeEvents();
    this.getAllEvents();
  },
});
</script>
