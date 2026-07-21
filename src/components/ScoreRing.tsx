import { cn } from '../utils/cn';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8, className, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'from-emerald-500/20' };
    if (s >= 60) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'from-amber-500/20' };
    if (s >= 40) return { stroke: '#f97316', text: 'text-orange-400', bg: 'from-orange-500/20' };
    return { stroke: '#ef4444', text: 'text-red-400', bg: 'from-red-500/20' };
  };

  const color = getColor(score);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-800"
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color.stroke}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', color.text)}>{score}%</span>
          {label && <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>}
        </div>
      </div>
    </div>
  );
}
