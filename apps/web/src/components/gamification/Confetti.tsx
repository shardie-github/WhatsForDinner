"use client";
import { useEffect } from "react";
export default function Confetti({ when=false }: { when?: boolean }) {
  useEffect(()=>{ if(!when) return; import("canvas-confetti").then(({default:confetti})=>{
    confetti({ particleCount: 120, spread: 60, origin: { y: 0.6 } });
  }); }, [when]);
  return null;
}
