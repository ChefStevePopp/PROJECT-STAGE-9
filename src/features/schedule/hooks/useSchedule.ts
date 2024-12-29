import { useEffect } from 'react';
import { useScheduleStore } from '@/stores/scheduleStore';

export const useSchedule = () => {
  const { 
    shifts, 
    error, 
    isLoading, 
    syncSchedule,
    accessToken,
    testConnection 
  } = useScheduleStore();

  // Auto-sync on mount if we have an access token
  useEffect(() => {
    if (accessToken) {
      syncSchedule();
    }
  }, [accessToken, syncSchedule]);

  return {
    shifts,
    error,
    isLoading,
    syncSchedule,
    testConnection,
    isConfigured: !!accessToken
  };
};