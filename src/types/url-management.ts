export type URLStatusStep = "received" | "case_started" | "request_submitted" | "removal_approved";

export type URLStatus = "received" | "in_progress" | "completed" | "failed";

export interface URLStatusHistory {
  status: string;
  timestamp: string;
}

export interface URL {
  id: string;
  url: string;
  status: string;
  created_at: string;
  customer: {
    id: string;
    profiles: {
      email: string;
    };
  };
  status_history?: URLStatusHistory[];
}