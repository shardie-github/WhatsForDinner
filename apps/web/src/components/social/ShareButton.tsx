"use client";
export default function ShareButton({ title="Check this out", text="Loving my progress on Hardonia!", url="/" }:{title?:string;text?:string;url?:string}) {
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title, text, url }); } catch {} }
    else { await navigator.clipboard.writeText(new URL(url, location.origin).toString()); alert("Link copied!"); }
  };
  return <button className="h-10 px-4 rounded-xl bg-secondary" onClick={share}>Share</button>;
}
