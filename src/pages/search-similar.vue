<template>
  <q-page class="column q-pa-md items-center text-center">
    <div class="row">
      <div class="q-my-sm">Search for similar people based on</div>
      <q-radio
        v-model="searchBasedOn"
        checked-icon="task_alt"
        unchecked-icon="panorama_fish_eye"
        val="year"
        label="Year"
      />
      <q-radio
        v-model="searchBasedOn"
        checked-icon="task_alt"
        unchecked-icon="panorama_fish_eye"
        val="age"
        label="Age"
      />
    </div>
    <q-form @submit.prevent="initSearchSimilar">
      <div class="q-gutter-sm row no-wrap">
        <q-input
          dense
          v-model.number="numberOfEvents"
          type="number"
          label="Number of events"
          autofocus
          prefix="At least: "
          :rules="[
            (val) =>
              parseInt(val) > 0 || 'You must have at least one event in common',
          ]"
        /><q-separator vertical />
        <q-input
          dense
          v-model.number="yearsDifference"
          type="number"
          label="Years (before/after)"
          :rules="[
            (val) => parseInt(val) > -1 || 'The value should be zero and above',
          ]"
        />
        <q-btn
          dense
          color="primary"
          label="Search"
          class="q-my-sm shadow-8"
          type="submit"
        />
      </div>
    </q-form>
    Due to privacy concerns, the other side's information is not disclosed. You
    can ask to connect via email.<br /><b
      >Notice: When asking to connect, your name/email will be visible to the
      other side.</b
    >

    <div class="row" v-show="events.length > 0">
      <q-btn
        flat
        size="md"
        :disabled="resultId === 1"
        icon="chevron_left"
        @click="previousResult()"
        ><q-tooltip>Previous</q-tooltip></q-btn
      >
      <div class="q-my-md">
        Number of similar people: {{ availableIds.length }}
      </div>
      <q-btn
        flat
        size="md"
        :disabled="resultId === availableIds.length"
        icon="navigate_next"
        @click="nextResult()"
        ><q-tooltip>Next</q-tooltip></q-btn
      >
      <q-btn flat size="md" icon="email" @click="sendContact()"
        ><q-tooltip>Ask this person to contact you via email</q-tooltip></q-btn
      >
    </div>

    <q-timeline color="secondary" v-if="finishedLoading">
      <q-timeline-entry
        v-for="event in events"
        :key="event.id"
        :title="event.event_name"
        :icon="event.icon_name"
        :subtitle="getEventDate(event.event_when)"
      />
    </q-timeline>
    <q-inner-loading :showing="!finishedLoading">
      <q-spinner-hourglass size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts">
import { api } from 'src/boot/axios';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { whatsnextStore } from 'src/stores/whatsnextStore';
import { IEvent } from 'src/models/interfaces/IEvent';
import { SearchBasedOnEnum } from 'src/models/enums/SearchBasedOnEnum';
import { date } from 'quasar';
import { showAPIError, showNotification } from 'src/utils/utils';

export default defineComponent({
  name: 'search-similar',
  setup() {
    const router = useRouter();
    const store = whatsnextStore();
    let birthDate: Date = new Date();
    return {
      birthDate,
      router,
      store,
      events: ref<IEvent[]>([]),
      yearsDifference: ref<number>(0),
      numberOfEvents: ref<number>(1),
      searchBasedOn: ref<SearchBasedOnEnum>(SearchBasedOnEnum.YEAR),
      resultId: ref<number>(0),
      finishedLoading: ref<boolean>(true),
      availableIds: ref<{ user_id: number }[]>([]),
    };
  },
  watch: {
    searchBasedOn() {
      if (this.searchBasedOn === SearchBasedOnEnum.AGE) {
        showNotification('Not implemented yet');
        this.searchBasedOn = SearchBasedOnEnum.YEAR;
      }
    },
  },
  methods: {
    sendContact() {
      api
        .post(`/contact/${this.events[0].id}/0`)
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            showNotification(
              "Your request was sent, now it's up to the other side whether to reply"
            );
          }
        })
        .catch((err) => {
          showAPIError(err);
        });
    },
    previousResult() {
      this.resultId--;
      this.searchSimilar();
    },
    nextResult() {
      this.resultId++;
      this.searchSimilar();
    },
    diffYears(dt2: Date, dt1: Date) {
      const diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60 / 60 / 24;
      return Math.trunc(diff / 365.25);
    },
    ageFromBirth(eventWhen: Date): number {
      //return date.getDateDiff(eventWhen, this.birthDate, 'years');
      return this.diffYears(new Date(eventWhen), this.birthDate);
    },
    getEventDate(eventDate: string) {
      return (
        date.formatDate(new Date(eventDate), 'MMMM DD, YYYY') +
        ' (Age ' +
        this.ageFromBirth(new Date(eventDate)) +
        ')'
      );
    },
    initSearchSimilar() {
      this.resultId = 0;
      this.searchSimilar();
    },
    searchSimilar() {
      this.finishedLoading = false;
      let page = this.resultId === 0 ? 0 : this.availableIds[this.resultId];
      api
        .get(
          `/user/similar?yearsDifference=${this.yearsDifference}&numberOfEvents=${this.numberOfEvents}&basedOn=${this.searchBasedOn}&resultId=${page}`
        )
        .then((response) => {
          if (response.data.error) {
            showNotification(response.data.error);
          } else {
            this.events = response.data[0];
            if (this.events.length === 0) return;
            if (this.resultId === 0) this.availableIds = response.data[1];
            this.resultId++;
            this.birthDate = new Date(
              this.events[this.events.length - 1].event_when
            );
          }
        })
        .catch((err) => {
          showAPIError(err);
        })
        .finally(() => {
          this.finishedLoading = true;
        });
    },
  },
});
</script>
