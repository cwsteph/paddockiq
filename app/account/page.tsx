"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

type Me = { signedIn: boolean; isPremium: boolean; email: string | null };

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ signedIn: false, isPremium: false, email: null }));
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "portal failed");
    } finally {
      setPortalLoading(false);
    }
  }

  if (!me) return <div style={{ padding: 40 }}>Loading…</div>;

  if (!me.signedIn) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <p>
          You are signed out. <a href="/sign-in">Sign in</a> or <a href="/sign-up">create an account</a>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Account</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <p style={{ color: "#666" }}>
        Signed in as <strong>{me.email}</strong>
      </p>
      <p style={{ marginTop: 16 }}>
        Plan: <strong>{me.isPremium ? "Premium ✓" : "Free"}</strong>
      </p>

      {me.isPremium ? (
        <button
          onClick={openPortal}
          disabled={portalLoading}
          style={{
            marginTop: 24,
            padding: "10px 18px",
            background: "#0d3d2e",
            color: "#f5ecd3",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {portalLoading ? "Loading…" : "Manage billing"}
        </button>
      ) : (
        <a
          href="/pricing"
          style={{
            display: "inline-block",
            marginTop: 24,
            padding: "10px 18px",
            background: "#0d3d2e",
            color: "#f5ecd3",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Subscribe — $5 / race day
        </a>
      )}

      <p style={{ marginTop: 32, fontSize: 12, color: "#999" }}>
        <a href="/">← Back to PaddockIQ</a>
      </p>
    </div>
  );
}
