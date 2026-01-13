import { PollProps } from '../../../application/command/entities/poll/poll-entity';
import { BasePrismaClient } from '../../../application/ports/i-repos';
import { IPollCommandRepo } from '../../../application/ports/repos/command/i-poll-command-repo';

export const createPollCommandRepo = (prismaClient: BasePrismaClient): IPollCommandRepo => {
  const findById = async (pollId: string): Promise<PollProps | null> => {
    const poll = await prismaClient.polls.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    });
    if (!poll) {
      return null;
    }
    return poll;
  };

  const create = async (props: PollProps): Promise<PollProps> => {
    const { options, ...data } = props;
    const poll = await prismaClient.polls.create({
      data: {
        ...data,
        options: {
          create: options.map((opt) => {
            return { id: opt.id, title: opt.title };
          }),
        },
      },
      include: {
        options: true,
      },
    });

    return poll;
  };

  const update = async (props: PollProps): Promise<void> => {
    const { options, ...data } = props;
    await prismaClient.polls.update({
      where: { id: props.id },
      data: {
        ...data,
        options: {
          deleteMany: {},
          create: options.map((opt) => {
            return { id: opt.id, title: opt.title };
          }),
        },
      },
    });
    return;
  };

  const deletePoll = async (pollId: string): Promise<void> => {
    await prismaClient.polls.delete({
      where: { id: pollId },
    });
    return;
  };

  return {
    findById,
    create,
    update,
    deletePoll,
  };
};

export type PollCommandRepo = ReturnType<typeof createPollCommandRepo>;
