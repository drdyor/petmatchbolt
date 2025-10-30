import { calculateHeatCycleData, getCycleRingColor, formatCycleDay } from '@/lib/heatCycleUtils';
import { CYCLE_LENGTH } from '@/lib/constants';

interface HeatRingProps {
  lastBleedDate: Date | null;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function HeatRing({ lastBleedDate, size = 'medium', showLabel = true }: HeatRingProps) {
  const cycleData = calculateHeatCycleData(lastBleedDate);
  const color = getCycleRingColor(cycleData.cycleStatus);

  const sizes = {
    small: { ring: 48, stroke: 6, text: 'text-sm' },
    medium: { ring: 80, stroke: 8, text: 'text-base' },
    large: { ring: 120, stroke: 10, text: 'text-2xl' },
  };

  const { ring, stroke } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = cycleData.currentDay > 0 ? (cycleData.currentDay / CYCLE_LENGTH) * circumference : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="transform -rotate-90">
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          {cycleData.currentDay > 0 && (
            <circle
              cx={ring / 2}
              cy={ring / 2}
              r={radius}
              stroke={color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-bold ${sizes[size].text}`}
          style={{ color }}
        >
          {formatCycleDay(cycleData.currentDay)}
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          {cycleData.isFertile && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Fertile Window
            </span>
          )}
          {cycleData.daysUntilFertile && (
            <span className="text-xs font-medium text-amber-600">
              Fertile in {cycleData.daysUntilFertile}d
            </span>
          )}
          {cycleData.cycleStatus === 'post-fertile' && (
            <span className="text-xs font-medium text-blue-600">Post-fertile</span>
          )}
          {cycleData.currentDay === 0 && (
            <span className="text-xs font-medium text-gray-500">No active cycle</span>
          )}
        </div>
      )}
    </div>
  );
}
