import { SignIn } from "@clerk/nextjs";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function Page() {
  if (!hasClerk) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: 24, fontFamily: "system-ui" }}>
        <h2>Auth not configured</h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6 }}>
          Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> in <code>.env</code>, then restart the dev server.
        </p>
        <p style={{ marginTop: 16 }}>
          <a href="/">← Back</a>
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 20px" }}>
      <SignIn />
    </div>
  );
}
