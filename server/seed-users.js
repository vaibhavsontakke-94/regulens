import { db } from "./store.js";
import { hashPassword } from "./auth.js";

let seeded = false;

export const DEMO_ACCOUNTS = {
  government: { email: "analyst@regulens.gov.ng", password: "DemoPass#123", name: "Amina Yusuf" },
  business: { email: "ops@nortextextiles.demo", password: "DemoPass#123", name: "James Carter" },
};

export function ensureDemoUsers() {
  if (seeded) return;
  seeded = true;
  const existing = new Set(db.state.users.map((u) => u.email.toLowerCase()));
  for (const [role, account] of Object.entries(DEMO_ACCOUNTS)) {
    if (existing.has(account.email.toLowerCase())) continue;
    db.state.users.push({
      id: `usr-demo-${role}`,
      role,
      email: account.email,
      name: account.name,
      passwordHash: hashPassword(account.password),
      verified: true,
      createdAt: db.now(),
      accountType: "demo",
      profile:
        role === "government"
          ? { department: "Ministry of Commerce", designation: "Policy Officer", organization: "Regulatory Authority" }
          : { businessName: "Nortex Textiles Ltd", industry: "Manufacturing", location: "Kaduna, Nigeria" },
    });
  }
  if (!db.state.sessions) db.state.sessions = { active: {} };
  db.persist();
}