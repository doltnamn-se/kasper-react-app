
export interface DeviceToken {
  id?: string;
  user_id: string;
  token: string;
  device_type: 'ios' | 'android' | 'web';
  created_at?: string;
  last_updated?: string;
}
