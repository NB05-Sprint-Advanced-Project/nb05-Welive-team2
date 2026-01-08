import { PollModel } from "../../../command/entities/poll/poll-entity";

export interface IPollCommandRepo {
  findById(pollId: string): Promise<PollModel>;
  create(model: PollModel): Promise<PollModel>;
  update(model: PollModel): Promise<void>;
  delete(pollId: string): Promise<void>;
}
