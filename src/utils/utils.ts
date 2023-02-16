import { AxiosError, AxiosResponse } from 'axios';
import { EventBus, Notify } from 'quasar';

export const bus = new EventBus();

export const showNotification = (what: string) => {
  Notify.create({
    message: what,
    color: 'purple',
  });
};

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const showAPIError = (apiError: unknown) => {
  let err = 'Unknown error';
  if (apiError instanceof AxiosError) {
    let helper: AxiosResponse | null = null;
    if (apiError.response) helper = apiError.response;
    if (helper == null) err = apiError.message;
    else err = helper.data.error;
  } else if (apiError instanceof Error) err = apiError.message;
  showNotification(err);
};
