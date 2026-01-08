import { randomUUID } from 'crypto';

export type OptionModel = {
  id: string;
  title: string;
  count: number;
  userIds: string[];
};
export const OptionEntity = {
  create: (props: { title: string }): OptionModel => {
    return {
      id: randomUUID(),
      title: props.title,
      count: 0,
      userIds: [],
    } as OptionModel;
  },
  restore: (props: { id: string; title: string; count: number, userIds: [], }): OptionModel => {
    return { ...props } as OptionModel;
  },
  updateTitle: (option: OptionModel, title: string) => {
    option.title = title;
  },
  countInc: (option: OptionModel) => {
    option.count++;
  },
  countDec: (option: OptionModel) => {
    option.count--;
  },
};
