<template>
  <q-page class="row items-center justify-evenly">
    <div class="column items-center">
      <q-img src="logo.png" />
      <br />
      <q-card class="shadow-12">
        <div class="text-weight-bold text-center q-mt-sm">
          Connect through similar life events
        </div>
        <q-form class="q-pa-sm">
          <q-input
            v-model="email"
            ref="emailRef"
            filled
            autofocus
            type="email"
            label="Email"
            class="q-my-sm"
          />

          <q-input
            v-model="password"
            filled
            :type="isPwd ? 'password' : 'text'"
            label="Password"
            class="q-my-sm"
            @keyup.enter="letMeIn()"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-input
            v-model="rePassword"
            v-if="newUser"
            filled
            ref="repass"
            :type="isRePwd ? 'password' : 'text'"
            label="Confirm password"
            class="q-my-sm"
          >
            <template v-slot:append>
              <q-icon
                :name="isRePwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isRePwd = !isRePwd"
              />
            </template>
          </q-input>

          <q-input
            filled
            v-model="birthDate"
            mask="####-##-##"
            v-if="newUser"
            label="Birthday"
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="birthDate"
                    mask="YYYY-MM-DD"
                    :options="birthOptions"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <div class="row justify-center">
            <q-toggle
              v-model="newUser"
              color="primary"
              keep-color
              label="I'm a new user"
              @click="focusRepass()"
            />
          </div>

          <q-input
            v-model="confirmationCode"
            filled
            ref="confirmationCodeRef"
            type="text"
            hint="Email sent. Enter the confirmation code."
            v-if="codeSent"
          />

          <div class="row justify-center">
            <q-btn
              push
              color="primary"
              text-color="white"
              label="Let me in"
              :disable="disableLetMeIn"
              @click="letMeIn()"
            />
          </div>
          <div class="row q-my-sm" style="color: #6161f5">
            <div class="cursor-pointer q-mx-sm">
              <a target="_blank" @click="openPrivacyPolicyDialog"
                >Privacy policy</a
              >
            </div>
            <div class="cursor-pointer q-mx-sm">
              <a target="_blank" @click="openDisclaimerDialog">Disclaimer</a>
            </div>
            <div class="cursor-pointer q-mx-sm">
              <a target="_blank" @click="openWhyEmailDialog"> Why email? </a>
            </div>
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { api } from 'boot/axios';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { QInput } from 'quasar';
import { useRouter } from 'vue-router';
import { whatsnextStore } from 'stores/whatsnextStore';
import {
  bus,
  showAPIError,
  showNotification,
  validateEmail,
} from 'src/utils/utils';

export default defineComponent({
  name: 'loginPage',
  components: {},

  setup() {
    const router = useRouter();
    function birthOptions(date: string) {
      return (
        date <= new Date().toISOString().substring(0, 10).replace(/-/g, '/')
      );
    }

    return {
      password: ref(''),
      rePassword: ref(''),
      isPwd: ref(true),
      isRePwd: ref(true),
      email: ref(''),
      newUser: ref(false),
      confirmationCode: ref(''),
      codeSent: ref(false),
      birthDate: ref('2010-01-01'),
      repass: ref<QInput>(),
      emailRef: ref<QInput>(),
      disableLetMeIn: ref(false),
      confirmationCodeRef: ref<QInput>(),
      router,
      birthOptions,
    };
  },
  methods: {
    openWhyEmailDialog() {
      this.$q.dialog({
        title: '<div><span>WhatsNext</span></div>',
        message:
          "<div>Your email won't be used for anything except when you ask for help, account deletion, password change, etc. Your email won't be sold nor given to any third party whatsoever. A confirmation code will be sent to make sure the email is yours</div>",
        html: true,
      });
    },
    openDisclaimerDialog() {
      this.$q.dialog({
        title: '<div><span>WhatsNext</span></div>',
        message:
          '<div>Disclaimer: We give you the opportunity, what you will do with it, is up to you.</div>',
        html: true,
      });
    },
    openPrivacyPolicyDialog() {
      this.$q.dialog({
        title: '<div><span>WhatsNext</span></div>',
        message:
          "<div>Privacy Policy: The application collects only the following user's data: email, password (encrypted) and life events as entered by the user. This data won't be sold to any 3rd party.</div>",
        html: true,
      });
    },

    focusRepass() {
      setTimeout(() => {
        if (this.repass && this.email !== '') this.repass.focus();
        else this.emailRef?.focus();
      }, 250);
    },
    letMeIn() {
      if (!validateEmail(this.email)) {
        showNotification('Invalid email');
      } else if (this.password.length < 8) {
        showNotification('Password must have at least 8 characters');
      } else if (this.newUser && this.password !== this.rePassword) {
        showNotification('Passwords do not match');
      } else if (this.newUser && this.birthDate.length < 10) {
        showNotification('Invalid birth date');
      } else {
        const command = this.codeSent || !this.newUser ? 'login' : 'register';
        this.disableLetMeIn = true;
        api
          .post(`/user/${command}`, {
            email: this.email,
            password: this.password,
            confirmationCode: this.codeSent
              ? this.confirmationCode.trim()
              : undefined,
            birthDate: this.codeSent ? this.birthDate : undefined,
          })
          .then((response) => {
            this.disableLetMeIn = false;
            if (response.data.result || response.data.token) {
              if (response.data.result) {
                this.codeSent = true;
                setTimeout(() => {
                  this.confirmationCodeRef?.focus();
                }, 500);
              } else {
                const store = whatsnextStore();
                store.token = response.data.token;
                bus.emit('updateFullName');
                this.router.push({ name: 'timeline' });
              }
            } else {
              showNotification(
                response.data.error
                  ? response.data.error
                  : 'Oops, there was a problem'
              );
            }
          })
          .catch((err) => {
            showAPIError(err);
          });
      }
    },
  },
});
</script>
