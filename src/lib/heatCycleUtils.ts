import { CYCLE_LENGTH, FERTILE_WINDOW_START, FERTILE_WINDOW_END, GESTATION_DAYS } from './constants';

export interface HeatCycleData {
  currentDay: number;
  isFertile: boolean;
  cycleStatus: 'pre-fertile' | 'fertile' | 'post-fertile' | 'not-in-cycle';
  daysUntilFertile: number | null;
  daysLeftInFertile: number | null;
  lastBleedDate: Date | null;
}

export function calculateCycleDay(lastBleedDate: Date | null): number {
  if (!lastBleedDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bleedDate = new Date(lastBleedDate);
  bleedDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - bleedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const cycleDay = diffDays + 1;

  return cycleDay > CYCLE_LENGTH ? 0 : cycleDay;
}

export function isInFertileWindow(cycleDay: number): boolean {
  return cycleDay >= FERTILE_WINDOW_START && cycleDay <= FERTILE_WINDOW_END;
}

export function getCycleStatus(cycleDay: number): 'pre-fertile' | 'fertile' | 'post-fertile' | 'not-in-cycle' {
  if (cycleDay === 0) return 'not-in-cycle';
  if (cycleDay < FERTILE_WINDOW_START) return 'pre-fertile';
  if (cycleDay <= FERTILE_WINDOW_END) return 'fertile';
  return 'post-fertile';
}

export function calculateHeatCycleData(lastBleedDate: Date | null): HeatCycleData {
  const currentDay = calculateCycleDay(lastBleedDate);
  const isFertile = isInFertileWindow(currentDay);
  const cycleStatus = getCycleStatus(currentDay);

  let daysUntilFertile: number | null = null;
  let daysLeftInFertile: number | null = null;

  if (currentDay > 0 && currentDay < FERTILE_WINDOW_START) {
    daysUntilFertile = FERTILE_WINDOW_START - currentDay;
  }

  if (isFertile) {
    daysLeftInFertile = FERTILE_WINDOW_END - currentDay + 1;
  }

  return {
    currentDay,
    isFertile,
    cycleStatus,
    daysUntilFertile,
    daysLeftInFertile,
    lastBleedDate,
  };
}

export function calculateWhelpingDate(matingDate: Date): Date {
  const whelping = new Date(matingDate);
  whelping.setDate(whelping.getDate() + GESTATION_DAYS);
  return whelping;
}

export function formatCycleDay(day: number): string {
  if (day === 0) return 'N/A';
  return `D-${day}`;
}

export function getCycleColor(cycleStatus: string): string {
  switch (cycleStatus) {
    case 'fertile':
      return 'text-green-600 bg-green-100';
    case 'pre-fertile':
      return 'text-amber-600 bg-amber-100';
    case 'post-fertile':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getCycleRingColor(cycleStatus: string): string {
  switch (cycleStatus) {
    case 'fertile':
      return '#10b981';
    case 'pre-fertile':
      return '#f59e0b';
    case 'post-fertile':
      return '#3b82f6';
    default:
      return '#9ca3af';
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-MT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-MT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(targetDate: Date | string): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
