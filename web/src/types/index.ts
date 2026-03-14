export interface ServiceInfo {
  domain: string;
  target: string;
  name: string;
  description?: string;
  icon?: string;
  ttl: number;
  lastHeartbeat: number;
  status: 'active' | 'pending';
  registeredAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
