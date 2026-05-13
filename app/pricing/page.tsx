"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteState, setInviteState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(d.signedIn))
      .catch(() => setSignedIn(false));
  }, []);

  // Auto-redeem any code stashed in sessionStorage right after sign-up so the
  // user lands in the app without re-entering the code.
  useEffect(() => {
    if (signedIn !== true) return;
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem("pendingInviteCode");
    } catch {
      return;
    }
    if (!pending) return;
    sessionStorage.removeItem("pendingInviteCode");
    (async () => {
      try {
        const res = await fetch("/api/invite/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: pending }),
        });
        if (res.ok) {
          window.location.href = "/";
        } else {
          // Surface the error in the form so the user can fix it.
          const data = await res.json().catch(() => ({}));
          setInviteCode(pending!);
          setInviteState("error");
          setInviteMessage(data.error || "redeem failed — re-enter your code");
        }
      } catch {
        setInviteCode(pending!);
        setInviteState("error");
        setInviteMessage("redeem failed — re-enter your code");
      }
    })();
  }, [signedIn]);

  async function subscribe() {
    if (!signedIn) {
      router.push("/sign-up?redirect_url=/pricing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function redeemInvite(e: React.FormEvent) {
    e.preventDefault();
    const code = inviteCode.trim();
    if (!code) return;
    setInviteState("loading");
    setInviteMessage("");
    try {
      const res = await fetch("/api/invite/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteState("error");
        setInviteMessage(data.error || "redeem failed");
        return;
      }
      // Anonymous redemption (no Clerk account) — stash a local premium flag
      // the SPA reads on load. Signed-in redemption already updated the User row.
      if (data.anonymous) {
        try {
          localStorage.setItem(
            "paddockiq_invite_premium",
            JSON.stringify({ code: data.code, grantsDays: data.grantsDays ?? null, at: Date.now() })
          );
        } catch {
          /* private mode — premium unlock won't persist past tab close */
        }
      }
      setInviteState("ok");
      setInviteMessage("Code redeemed — taking you in…");
      setTimeout(() => {
        window.location.href = "/";
      }, 600);
    } catch {
      setInviteState("error");
      setInviteMessage("redeem failed");
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "inline-block", background: "#0d3d2e", color: "#f5ecd3", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 4, marginBottom: 10 }}>
          POC — STRIPE TEST MODE
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          No real charges. Use card <code style={{ background: "#f4f1e8", padding: "2px 6px", borderRadius: 3 }}>4242 4242 4242 4242</code>, any future expiry, any CVC.
        </div>
      </div>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>PaddockIQ Premium</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Full analysis, backtests, Kelly sim, Venmo importer, and your personal bet log.
      </p>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24 }}>
        <div style={{ display: "inline-block", background: "#0d3d2e", color: "#f5ecd3", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 4, marginBottom: 10 }}>
          7-DAY FREE TRIAL
        </div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>
          $5<span style={{ fontSize: 14, color: "#888" }}> / race day</span>
          <span style={{ fontSize: 13, color: "#0d3d2e", fontWeight: 600, marginLeft: 10 }}>after 7-day trial</span>
        </div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          Pay only on days there&apos;s live racing on your tracks. No monthly commitment.
        </div>
        <ul style={{ margin: "16px 0", paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
          <li>Full Analysis tab — 609K-runner backtests, component charts, ROI by gap-size</li>
          <li>Kelly sim using your actual bankroll, compounded race-by-race</li>
          <li>Personal bet log with date filters</li>
          <li>Venmo CSV importer for buy-in matching</li>
          <li>Personal bankroll, persisted across sessions</li>
        </ul>
        <button
          onClick={subscribe}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 15,
            fontWeight: 600,
            background: "#0d3d2e",
            color: "#f5ecd3",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading…" : signedIn ? "Start 7-day free trial" : "Sign up to start free trial"}
        </button>
        <div style={{ fontSize: 12, color: "#888", marginTop: 10, textAlign: "center" }}>
          Card required. You won&apos;t be charged for 7 days. Cancel anytime before then — no charge.
        </div>
      </div>

      <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 24 }}>
        <div style={{ display: "inline-block", background: "#0d3d2e", color: "#f5ecd3", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 4, marginBottom: 10 }}>
          INVITE CODE
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          Have an invite code?
        </div>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          Enter a code to unlock full access — no card required.
        </div>
        <form onSubmit={redeemInvite}>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="PADDOCK-XXXX"
            autoCapitalize="characters"
            spellCheck={false}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.04em",
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={inviteState === "loading" || !inviteCode.trim()}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 15,
              fontWeight: 600,
              background: "#0d3d2e",
              color: "#f5ecd3",
              border: "none",
              borderRadius: 6,
              cursor: inviteState === "loading" ? "default" : "pointer",
              opacity: inviteState === "loading" || !inviteCode.trim() ? 0.6 : 1,
            }}
          >
            {inviteState === "loading" ? "Loading…" : "Redeem invite code"}
          </button>
        </form>
        <div style={{ fontSize: 12, color: "#888", marginTop: 10, textAlign: "center" }}>
          No card required. Full access activates immediately.
        </div>
        {inviteMessage && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 13,
              background: inviteState === "ok" ? "#e8f3ec" : "#fdecea",
              color: inviteState === "ok" ? "#0d3d2e" : "#b00020",
              border: `1px solid ${inviteState === "ok" ? "#bcd9c4" : "#f5b5ad"}`,
            }}
          >
            {inviteMessage}
          </div>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "#999" }}>
        <a href="/">← Back to PaddockIQ</a>
      </p>
    </div>
  );
}
