export default function Badge({ name, desc }: { name: string; desc?: string }) {
  return (
    <div className="rounded-2xl border border-border p-3 shadow-card bg-card">
      <div className="text-sm font-semibold">{name}</div>
      {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
    </div>
  );
}
