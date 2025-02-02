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
  // Map the internal status values to translation keys
  const statusMap: Record<string, string> = {
    'received': 'deindexing.status.received',
    'case_started': 'deindexing.status.case.started',
    'in_progress': 'deindexing.status.case.started',
    'request_submitted': 'deindexing.status.request.submitted',
    'removal_approved': 'deindexing.status.removal.approved',
    'completed': 'deindexing.status.removal.approved'
  };

  const translationKey = statusMap[status] || 'deindexing.status.received';
  return t(translationKey);
};