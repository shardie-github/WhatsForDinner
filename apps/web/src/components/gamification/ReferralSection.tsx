"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import ShareButton from "@/components/social/ShareButton";
import { hapticTap } from "./Haptics";
import { awardXp } from "./GamificationProvider";

export default function ReferralSection() {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    loadReferralData();
  }, []);

  async function loadReferralData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's referral code
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    }

    // Get user's referrals
    const { data: refs } = await supabase
      .from("referrals")
      .select("*, profiles!referrals_referred_id_fkey(display_name)")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (refs) setReferrals(refs);
  }

  async function useReferralCode() {
    if (!inputCode.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("referrals")
      .insert({
        referrer_id: null, // Will be set by backend
        referred_id: user.id,
        referral_code: inputCode.toUpperCase(),
        status: "completed"
      });

    if (!error) {
      hapticTap();
      awardXp(25);
      setInputCode("");
      loadReferralData();
    }
  }

  function getShareUrl() {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/r/${referralCode}`;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Referrals</h2>

      {referralCode && (
        <div className="rounded-xl border p-4 bg-card">
          <div className="text-sm text-muted-foreground mb-2">Your Referral Code</div>
          <div className="flex items-center gap-2 mb-3">
            <code className="text-2xl font-mono font-bold">{referralCode}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
                hapticTap();
              }}
              className="px-3 py-1 rounded-lg bg-secondary text-sm"
            >
              Copy
            </button>
          </div>
          <ShareButton
            title="Join me on Hardonia!"
            text={`Use my referral code ${referralCode} to get started!`}
            url={getShareUrl()}
          />
        </div>
      )}

      <div className="rounded-xl border p-4 bg-card">
        <div className="text-sm font-semibold mb-2">Have a referral code?</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={e => setInputCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 rounded-lg border border-border p-2 text-sm uppercase"
            maxLength={8}
          />
          <button
            onClick={useReferralCode}
            className="px-4 rounded-lg bg-primary text-primary-fg text-sm"
            disabled={!inputCode.trim()}
          >
            Apply
          </button>
        </div>
      </div>

      {referrals.length > 0 && (
        <div className="rounded-xl border p-4 bg-card">
          <div className="text-sm font-semibold mb-2">Your Referrals ({referrals.length})</div>
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between text-sm">
                <span>{ref.profiles?.display_name || "Anonymous"}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  ref.status === "completed" ? "bg-green-100 text-green-800" : "bg-muted"
                }`}>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
