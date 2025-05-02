
export type MonitoringUrlStatus = 'pending' | 'approved' | 'rejected';

export interface MonitoringUrl {
  id: string;
  url: string;
  customer_id: string;
  admin_user_id: string | null;
  status: MonitoringUrlStatus;
  created_at: string;
  updated_at: string;
  reason: string | null;
  customer?: {
    profiles?: {
      display_name: string | null;
      email: string | null;
    };
  };
}
