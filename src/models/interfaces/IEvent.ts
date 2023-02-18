import { ILifeEvent } from './ILifeEvent';

export interface IEvent extends ILifeEvent {
  event_when: Date;
  private: boolean;
}
