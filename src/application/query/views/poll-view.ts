export interface PollView {
  id: string;
  createdAt: Date;
  title: string;
  content: string;
  status: string;
  startDate: Date;
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

  optionIdVotedByMe: string | null;
}

export interface PollsView {
  data: Omit<PollView, 'options' | 'optionIdVotedByMe'>[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
