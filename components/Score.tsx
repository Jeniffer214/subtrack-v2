export function Score({ value }: { value: number }) {
  const level = value >= 7 ? "high" : value >= 4 ? "mid" : "low";
  return <span className={`score ${level}`} title="透明影响分 1-10，点开事件查看计算过程">{value}</span>;
}
