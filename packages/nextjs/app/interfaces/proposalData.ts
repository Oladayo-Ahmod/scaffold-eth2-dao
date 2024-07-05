interface ProposalData {
  id: number;
  title: string;
  description: string;
  amount: string;
  beneficiary: string;
  upVote: number;
  downVote: number;
  paid: boolean;
}

export default ProposalData;
