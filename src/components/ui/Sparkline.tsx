interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** Stroke color — defaults to the primary ocean blue. */
  color?: string;
  className?: string;
}

/**
 * Tiny inline trend line. Pure SVG, no dependencies, no logic.
 * Renders nothing when there are fewer than two points.
 */
export function Sparkline({ data, width = 80, height = 24, color = "#0ea5e9", className }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
