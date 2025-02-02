import { URLStatusStep } from "@/types/url-management";

export const STEPS = ['received', 'in_progress', 'request_submitted', 'completed'] as const;

export const getStepIndex = (status: string): number => {
  let mappedStatus = status;
  switch (status) {
    case 'case_started':
      mappedStatus = 'in_progress';
      break;
    case 'removal_approved':
      mappedStatus = 'completed';
      break;
    default:
      mappedStatus = status;
  }

  console.log('Mapped status:', mappedStatus);
  const index = STEPS.indexOf(mappedStatus as typeof STEPS[number]);
  console.log('Step index:', index);
  
  return index >= 0 ? index : 0; // Default to first step if status is unknown
};

export const getStatusText = (status: string, t: (key: string) => string): string => {
  switch (status) {
    case 'received':
      return t('deindexing.status.received');
    case 'in_progress':
      return t('deindexing.status.case.started');
    case 'request_submitted':
      return t('deindexing.status.request.submitted');
    case 'completed':
      return t('deindexing.status.removal.approved');
    default:
      return t('deindexing.status.received'); // Default to 'received' for unknown statuses
  }
};