import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWaitTime(minutes: number, t: (key: any) => string) {
  const minStr = t('minShort' as any) || 'min';
  const hStr = t('hourShort' as any) || 'h';
  const dStr = t('dayShort' as any) || 'j';

  if (minutes < 60) {
    return `${Math.floor(minutes)} ${minStr}`;
  }
  const totalHours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  
  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    
    let result = `${days}${dStr}`;
    if (hours > 0) result += ` ${hours}${hStr}`;
    if (remainingMinutes > 0) result += ` ${remainingMinutes}${minStr}`;
    return result;
  }
  
  if (remainingMinutes === 0) {
    return `${totalHours}${hStr}`;
  }
  
  return `${totalHours}${hStr} ${remainingMinutes}${minStr}`;
}

export function generateTicketId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const pick = (n: number) => Array.from({length: n}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `${pick(2)}-${pick(1)}-${pick(1)}`;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

// Generates the next 60 days starting from tomorrow
export function generateAvailabilityDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 60; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
}

export function getDaysDifference(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(targetDateStr);
  target.setHours(0,0,0,0);
  const diffTime = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// Returns wait time in minutes based on the new logic
export function calculateEstimatedWaitTime(targetDateStr: string, positionInQueue: number): number {
  const today = new Date();
  const targetDate = new Date(targetDateStr);
  // Assume start of day queue is 8:00 AM on the target date
  targetDate.setHours(8, 0, 0, 0);

  const daysDifference = getDaysDifference(targetDateStr); // e.g. 1 for tomorrow, 2 for day after 
  
  if (daysDifference < 1) return 0; // Invalid/today
  
  // Interval per ticket on that day (in seconds):
  // Day +1 -> 20s
  // Day +2 -> 40s
  // Day +3 -> 60s
  const intervalSeconds = daysDifference * 20;
  
  const additionalQueueTimeSeconds = (positionInQueue - 1) * intervalSeconds;
  
  // Diff between NOW and the target 8:00 AM in milliseconds
  let diffMs = targetDate.getTime() - today.getTime();
  
  // Add the queue processing time
  diffMs += (additionalQueueTimeSeconds * 1000);
  
  // If the target time + queue time is less than now (happens if it's past), return 0
  if (diffMs < 0) return 0;

  // Returning minutes
  return Math.floor(diffMs / (1000 * 60));
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

