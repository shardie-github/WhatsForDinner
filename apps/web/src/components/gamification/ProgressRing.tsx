"use client";
import { motion } from "framer-motion";
export default function ProgressRing({ value, size=80, stroke=10 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke)/2; const c = 2*Math.PI*r; const o = c*(1 - Math.min(1, Math.max(0, value)));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      <circle r={r} cx={size/2} cy={size/2} stroke="hsl(var(--border))" strokeWidth={stroke} fill="none"/>
      <motion.circle
        r={r} cx={size/2} cy={size/2}
        stroke="hsl(var(--accent))" strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round"
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: o }} transition={{ type:"spring", damping:18 }}
      />
    </svg>
  );
}
