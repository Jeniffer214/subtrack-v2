const W = 420;
const H = 260;
const PAD = 36;

export function Scatter({ points, slope, unit }: { points: { z: number; h1: number; releaseUtc: string }[]; slope: number; unit: string }) {
  const maxZ = Math.max(1, ...points.map((p) => Math.abs(p.z))) * 1.1;
  const maxY = Math.max(1, ...points.map((p) => Math.abs(p.h1))) * 1.1;
  const x = (z: number) => PAD + ((z + maxZ) / (2 * maxZ)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - ((v + maxY) / (2 * maxY)) * (H - 2 * PAD);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="意外度与1小时反应散点图">
      <line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke="var(--border)" />
      <line x1={x(0)} x2={x(0)} y1={PAD} y2={H - PAD} stroke="var(--border)" />
      <line x1={x(-maxZ)} y1={y(-maxZ * slope)} x2={x(maxZ)} y2={y(maxZ * slope)} stroke="var(--accent)" strokeDasharray="4 3" />
      {points.map((p) => (
        <circle key={p.releaseUtc} cx={x(p.z)} cy={y(p.h1)} r={4} fill="var(--accent)" fillOpacity={0.7}>
          <title>{`${p.releaseUtc.slice(0, 10)}  z=${p.z.toFixed(2)}  1h=${p.h1.toFixed(1)}${unit}`}</title>
        </circle>
      ))}
      <text x={W - PAD} y={H - 8} textAnchor="end" fontSize="11" fill="var(--muted)">
        意外度 z（σ）
      </text>
      <text x={8} y={PAD - 12} fontSize="11" fill="var(--muted)">
        1h 反应（{unit}）
      </text>
      <text x={PAD - 4} y={y(maxY / 1.1) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
        {Math.round(maxY / 1.1)}
      </text>
      <text x={PAD - 4} y={y(-maxY / 1.1) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
        {-Math.round(maxY / 1.1)}
      </text>
    </svg>
  );
}
