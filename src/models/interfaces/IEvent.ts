import { ILifeEvent } from './ILifeEvent';

export interface IEvent extends ILifeEvent {
  event_when: string;
  private: boolean;
}
