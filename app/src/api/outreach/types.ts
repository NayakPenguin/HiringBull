export type OutreachRequest = {
  email: string;
  companyName: string;
  reason: string;
  jobId?: string;
  resumeLink?: string;
  message?: string;
};

export type OutreachResponse = {
  success: boolean;
  message: string;
};
