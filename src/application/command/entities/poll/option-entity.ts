import { randomUUID } from 'crypto';

export type OptionProps = {
  readonly id: string;
  title: string;
  count: number;
  userIds: string[];
};
export const OptionEntity = {
  create: (props: { title: string }): OptionProps => {
    return {
      id: randomUUID(),
      title: props.title,
      count: 0,
      userIds: [],
    } as OptionProps;
  },
  restore: (props: { id: string; title: string; count: number; userIds: [] }): OptionProps => {
    return { ...props } as OptionProps;
  },
  updateTitle: (option: OptionProps, title: string) => {
    option.title = title;
  },
  countInc: (option: OptionProps) => {
    option.count++;
  },
  countDec: (option: OptionProps) => {
    option.count--;
  },
};
