import { Role } from '../../user/entity/base-user';
import { StateResponseDto } from '../dto/state-response';
import {
  CSVStateProps,
  NotificationStateProps,
  StateProps,
  StatusType,
  WorkType,
} from '../entity/state';
import { IStateCommandRepo } from '../interface/i-state-command-repo';

export const createStateCommandService = (stateCommandRepo: IStateCommandRepo) => {
  const findPendingCsv = async (): Promise<CSVStateProps[]> => {
    const states = await stateCommandRepo.findAllByStatus(StatusType.PENDING);

    states.map((state) => {
      if (state.status === StatusType.PENDING && state.workType === WorkType.CSV) {
        return states;
      }
    });

    return states as CSVStateProps[];
  };

  const findPendingNotification = async (): Promise<StateResponseDto[]> => {
    const states = (await stateCommandRepo.findAllByStatus(
      StatusType.PENDING,
    )) as NotificationStateProps[];

    const filteredStates = states.filter((state) => {
      return state.status === StatusType.PENDING && state.workType === WorkType.ALARM;
    });

    if (!filteredStates || filteredStates.length === 0) {
      return [];
    }

    return filteredStates.map((state) => ({
      // @ fiter는 배열을 걸러내는거고 map은 배열을 변환함
      id: state.payload.id,
      userId: state.payload.userId,
      content: state.payload.message,
      apartmentId: state.payload.apartmentId,
      receiverType: state.payload.receiverType as Role,
    }));
  };

  const markAsProcessed = async (): Promise<void> => {
    await stateCommandRepo.bulkUpdate();
    return;
  };

  return {
    markAsProcessed,
    findPendingCsv,
    findPendingNotification,
  };
};
export type StateCommandService = ReturnType<typeof createStateCommandService>;
