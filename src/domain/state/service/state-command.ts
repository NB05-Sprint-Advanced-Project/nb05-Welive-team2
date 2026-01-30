import { Role } from '../../user/entity/base-user';
import { StateResponseDto } from '../dto/state-response';
import { CSVStateProps, NotificationStateProps, StatusType, WorkType } from '../entity/state';
import { IStateCommandRepo } from '../interface/i-state-command-repo';

export const createStateCommandService = (stateCommandRepo: IStateCommandRepo) => {
  const findPendingCsv = async (): Promise<CSVStateProps[]> => {
    const states = await stateCommandRepo.findAllByStatus(StatusType.PENDING);

    const filteredStates = states.filter((state) => {
      if (state.status === StatusType.PENDING && state.workType === WorkType.CSV) {
        return state;
      }
    });

    return filteredStates as CSVStateProps[];
  };

  const findPendingNotification = async (): Promise<StateResponseDto[]> => {
    const states = (await stateCommandRepo.findAllByStatus(
      StatusType.PENDING,
    )) as NotificationStateProps[];

    return states.map((state) => ({
      // @ fiter는 배열을 걸러내는거고 map은 배열을 변환함
      stateId: state.id,
      payloadId: state.payload.id,
      userId: state.payload.userId,
      content: state.payload.message,
      apartmentId: state.payload.apartmentId,
      receiverType: state.payload.receiverType as Role,
    }));
  };

  const markAsProcessed = async (states: StateResponseDto[]): Promise<void> => {
    const stateIds = states.map((state) => {
      return state.stateId;
    });

    await stateCommandRepo.bulkUpdate(stateIds);
    return;
  };

  return {
    markAsProcessed,
    findPendingCsv,
    findPendingNotification,
  };
};
export type StateCommandService = ReturnType<typeof createStateCommandService>;
