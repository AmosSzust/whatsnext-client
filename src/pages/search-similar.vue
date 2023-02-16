<template>
  <q-page class="q-pa-md">
    <q-icon
      class="q-my-xs q-mx-xs cursor-pointer"
      name="arrow_back_ios"
      @click="goBack()"
      ><q-tooltip>Back</q-tooltip></q-icon
    >
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
      <div class="q-gutter-sm" style="max-width: 300px">
        <q-input
          v-model.number="numberOfEvents"
          type="number"
          label="Number of events"
          autofocus
          prefix="At least: "
          :rules="[
            (val) =>
              parseInt(val) > 0 || 'You must have at least one event in common',
          ]"
        />
        <q-input
          v-model.number="yearsDifference"
          type="number"
          label="Years difference (before/after)"
          :rules="[
            (val) => parseInt(val) > -1 || 'The value should be zero and above',
          ]"
        />
      </div>
      <q-btn
        color="primary"
        label="Search"
        class="q-my-sm"
        type="submit"
      /><br />
      Due to privacy, the other side's information is not disclosed. You can ask
      to connect via email.<br /><b
        >Notice: When asking to connect, your name/email will be visible to the other
        side.</b
      >
    </q-form>

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
      <q-spinner-gears size="50px" color="primary" />
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
        this.$q.notify({
          message: 'Not implemented yet',
        });
        this.searchBasedOn = SearchBasedOnEnum.YEAR;
      }
    },
  },
  methods: {
    sendContact() {
      api
        .post(
          `/contact/${this.events[0].id}/0`)
        .then((response) => {
          if (response.data.error) {
            this.$q.notify({
              message: response.data.error,
            });
          } else {
            this.$q.notify({
              message:
                "Your request was sent, now it's up to the other side to contact you",
            });
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
    getEventDate(eventDate: Date) {
      return (
        date.formatDate(eventDate, 'MMMM DD, YYYY') +
        ' (Age ' +
        this.ageFromBirth(eventDate) +
        ')'
      );
    },
    goBack() {
      this.router.push({ name: 'timeline' });
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
          `/user/similar?yearsDifference=${this.yearsDifference}&numberOfEvents=${this.numberOfEvents}&basedOn=${this.searchBasedOn}&resultId=${page}`)
        .then((response) => {
          if (response.data.error) {
            this.$q.notify({
              message: response.data.error,
            });
          } else {
            this.events = response.data[0];
            try {
              if (this.events.length === 0) return;
              if (this.resultId === 0) this.availableIds = response.data[1];
              this.resultId++;
              this.birthDate = new Date(
                this.events[this.events.length - 1].event_when
              );
            } finally {
              this.finishedLoading = true;
            }
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
          this.finishedLoading = true;
        });
    },
  },
});
</script>
