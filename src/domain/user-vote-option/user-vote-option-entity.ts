export type UserVoteOptionProps = {
  readonly createdAt: Date;
  readonly userId: string;
  readonly optionId: string;
  readonly pollId: string;
};

export const UserVoteOptionEntity = {
  create: (props: { userId: string; optionId: string; pollId: string }): UserVoteOptionProps => {
    const now = new Date();
    return { createdAt: now, ...props };
  },
  restore: (props: {
    userId: string;
    optionId: string;
    pollId: string;
    createdAt: Date;
  }): UserVoteOptionProps => {
    return { ...props };
  },
};
