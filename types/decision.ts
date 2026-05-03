export type DecisionStatus = 'OPEN' | 'CLOSED';

export type OptionView = {
  id: string;
  label: string;
  /** Always set by API (0 when no votes yet). */
  voteCount: number | null;
};

export type VoteActivity = {
  optionLabel: string;
  votedAt: string;
};

export type DecisionResult = {
  winnerOptionId: string | null;
  winnerLabel: string | null;
  explanation: string;
};

export type Decision = {
  id: string;
  title: string;
  options: OptionView[];
  status: DecisionStatus;
  closesAt: string | null;
  createdAt: string;
  result: DecisionResult | null;
  hasVoted: boolean;
  /** Present while OPEN: recent votes, newest first (anonymous). */
  voteActivity?: VoteActivity[] | null;
};

export type CreateDecisionPayload = {
  title: string;
  options: string[];
  closesAt?: string;
};
