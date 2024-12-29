import { format, isToday, isTomorrow, addDays } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};

export const getRelativeDay = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d');
};

export const getNextNDays = (n: number): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < n; i++) {
    dates.push(addDays(new Date(), i));
  }
  return dates;
};