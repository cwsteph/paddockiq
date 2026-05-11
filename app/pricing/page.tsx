"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(d.signedIn))
      .catch(() => setSignedIn(false));
  }, []);

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

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <div style={{ background: "#fff8e1", border: "1px solid #f0c060", borderRadius: 6, padding: 12, marginBottom: 24, fontSize: 13 }}>
        <strong>POC — Stripe test mode.</strong> No real charges. Use card <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
      </div>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>PaddockIQ Premium</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Personal bankroll tracking, Kelly sim, Venmo importer, your bet log.
      </p>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>
          $9<span style={{ fontSize: 14, color: "#888" }}>/mo</span>
        </div>
        <ul style={{ margin: "16px 0", paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
          <li>Personal bankroll, persisted across sessions</li>
          <li>Kelly sim using your actual bankroll</li>
          <li>Venmo CSV importer for buy-in matching</li>
          <li>Full bet log + date filters over your bets</li>
          <li>All public features (rankings, odds, exotics, backtest charts)</li>
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
          {loading ? "Loading…" : signedIn ? "Subscribe — $9/mo (test mode)" : "Sign up to subscribe"}
        </button>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "#999" }}>
        <a href="/">← Back to PaddockIQ</a>
      </p>
    </div>
  );
}
