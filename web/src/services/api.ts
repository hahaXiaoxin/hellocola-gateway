import type { ServiceInfo, ApiResponse } from '../types/index';

const API_BASE = '/api';

/**
 * Fetch all registered services from the gateway API.
 */
export async function fetchServices(): Promise<ServiceInfo[]> {
  const response = await fetch(`${API_BASE}/services`);
  if (!response.ok) {
    console.error(`Failed to fetch services: ${response.status} ${response.statusText}`);
    return [];
  }

  const result: ApiResponse<ServiceInfo[]> = await response.json();
  if (!result.success || !result.data) {
    console.error('API returned unsuccessful response:', result.error);
    return [];
  }

  return result.data;
}

/**
 * Fetch details for a specific service by domain.
 */
export async function fetchServiceByDomain(domain: string): Promise<ServiceInfo | null> {
  const response = await fetch(`${API_BASE}/services/${encodeURIComponent(domain)}`);
  if (!response.ok) {
    console.error(`Failed to fetch service ${domain}: ${response.status}`);
    return null;
  }

  const result: ApiResponse<ServiceInfo> = await response.json();
  if (!result.success || !result.data) {
    console.error('API returned unsuccessful response:', result.error);
    return null;
  }

  return result.data;
}
