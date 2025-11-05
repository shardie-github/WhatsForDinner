"use client";
import ReactionBar from "@/components/social/ReactionBar";
export default function Community(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Community</h1>
      <article className="rounded-2xl border p-4 bg-card">
        <header className="font-semibold">Welcome!</header>
        <p className="text-sm text-muted-foreground">Share progress, ask questions, give kudos.</p>
        <div className="mt-3"><ReactionBar/></div>
      </article>
    </div>
  );
}
