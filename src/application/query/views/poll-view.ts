export interface PollView {
  id: string;
  createdAt: Date;
  title: string;
  content: string;
  status: string;
  starDate: Date;
  endDate: Date;
  apartmentId: string;
  building: number;

  author: {
    id: string;
    name: string;
  };

  options: {
    id: string;
    title: string;
    voteCount: number;
  }[];

  optionIdVotedByMe: string;
}
