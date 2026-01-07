import { randomUUID } from 'crypto';

export type OptionModel = {
  id: string;
  title: string;
  count: number;
};
export const OptionEntity = {
  create: (props: { title: string }): OptionModel => {
    return {
      id: randomUUID(),
      title: props.title,
      count: 0,
    } as OptionModel;
  },
  restore: (props: { id: string; title: string; count: number }): OptionModel => {
    return { ...props } as OptionModel;
  },
  updateTitle: (option: OptionModel, title: string) => {
    option.title = title;
  },
  vote: (option: OptionModel) => {
    option.count++;
  },
  cancle: (option: OptionModel) => {
    option.count--;
  },
};
