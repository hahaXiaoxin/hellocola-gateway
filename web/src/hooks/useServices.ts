import { useState, useEffect, useCallback } from 'react';
import type { ServiceInfo } from '../types/index';
import { fetchServices } from '../services/api';

interface UseServicesResult {
  services: ServiceInfo[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook to fetch and poll registered services.
 * @param pollIntervalMs - Polling interval in milliseconds (default: 15000)
 */
export function useServices(pollIntervalMs = 15000): UseServicesResult {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);

    const data = await fetchServices();
    setServices(data);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadServices(true);

    const interval = setInterval(() => {
      loadServices(false);
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [loadServices, pollIntervalMs]);

  return { services, loading, error, refresh: () => loadServices(true) };
}
