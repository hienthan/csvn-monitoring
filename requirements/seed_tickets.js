/**
 * Seed ticket data for testing GUI
 * Creates sample tickets, comments, and events
 *
 * Run:
 * PB_URL="http://127.0.0.1:8090" \
 * PB_EMAIL="admin@example.com" \
 * PB_PASSWORD="your_password" \
 * node requirements/seed_tickets.js
 */

import PocketBase from "pocketbase";
import { PB_CONFIG } from "../src/config/pb.config.js";

const pbUrl = PB_CONFIG.URL.replace(/\/$/, "");
const pb = new PocketBase(pbUrl);

async function auth() {
  try {
    await pb.admins.authWithPassword(PB_CONFIG.EMAIL, PB_CONFIG.PASSWORD);
    console.log("[OK] Admin authenticated (SDK)");
  } catch (e) {
    console.log("[WARN] SDK auth failed, trying direct fetch...");
    const authUrl = `${pbUrl}/api/admins/auth-with-password`;
    const response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: PB_CONFIG.EMAIL,
        password: PB_CONFIG.PASSWORD,
      }),
    });
    const authData = await response.json();
    pb.authStore.save(authData.token, authData.record);
    console.log("[OK] Admin authenticated (direct fetch)");
  }
}

async function main() {
  await auth();

  console.log("\n[INFO] Creating sample tickets...\n");

  // Ticket 1: New ticket - urgent bugfix
  const t1 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000001",
    title: "Deploy bugfix: login redirect loop",
    description:
      "Please deploy hotfix for login redirect loop.\n\n" +
      "- Repo: internal-app\n" +
      "- Branch: hotfix/login-redirect\n" +
      "- Env: dev\n" +
      "- Verify: user can login and stay on dashboard\n" +
      "- Rollback: revert to previous image tag",
    types: "deploy_bugfix",
    priority: "urgent",
    status: "new",
    environment: ["dev"],
    app_name: "internal-app",
    requestor_name: "Nguyen Van A",
    service_tags: "docker",
  });
  console.log(`[OK] Created ticket: ${t1.code}`);

  // Ticket 2: In progress - new app setup
  const t2 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000002",
    title: "Setup docker for new service + test env",
    description:
      "Need Dockerize new service and prepare test environment.\n\n" +
      "- Service: api-gateway\n" +
      "- Ports: 8201\n" +
      "- Env vars: see attached doc\n" +
      "- Verify: /health returns 200\n" +
      "- Notes: use named volume for DB",
    types: "new_app_setup",
    priority: "normal",
    status: "in_process",
    environment: ["test"],
    app_name: "api-gateway",
    requestor_name: "Tran Thi B",
    assignee: "DevOps Team",
    service_tags: "docker",
    started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days ago
  });
  console.log(`[OK] Created ticket: ${t2.code}`);

  // Ticket 3: Done - domain SSL
  const t3 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000003",
    title: "Setup SSL certificate for production domain",
    description:
      "Configure SSL certificate for api.example.com\n\n" +
      "- Domain: api.example.com\n" +
      "- Certificate: Let's Encrypt\n" +
      "- Auto-renewal: enabled",
    types: "domain_ssl",
    priority: "normal",
    status: "done",
    environment: ["prd"],
    app_name: "api-gateway",
    requestor_name: "Le Van C",
    assignee: "DevOps Team",
    service_tags: "nginx",
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  console.log(`[OK] Created ticket: ${t3.code}`);

  // Ticket 4: Blocked - DB migration
  const t4 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000004",
    title: "Database migration for user schema",
    description:
      "Migrate user table to new schema.\n\n" +
      "- Current: users_v1\n" +
      "- Target: users_v2\n" +
      "- Blocked: waiting for backup completion",
    types: "db_migration",
    priority: "hight",
    status: "blocked",
    environment: ["prd"],
    app_name: "user-service",
    requestor_name: "Pham Van D",
    assignee: "Backend Team",
    service_tags: "mysql",
    started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  console.log(`[OK] Created ticket: ${t4.code}`);

  // Ticket 5: Triage - monitoring alert
  const t5 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000005",
    title: "High CPU usage alert on server-01",
    description:
      "Server-01 showing high CPU usage (95%) for the last 2 hours.\n\n" +
      "- Server: server-01\n" +
      "- CPU: 95%\n" +
      "- Memory: 60%\n" +
      "- Need investigation",
    types: "monitoring_alert",
    priority: "hight",
    status: "triage",
    environment: ["prd"],
    app_name: "server-01",
    requestor_name: "Monitoring System",
    service_tags: "other",
  });
  console.log(`[OK] Created ticket: ${t5.code}`);

  // Ticket 6: Waiting dev - CI/CD
  const t6 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000006",
    title: "Setup CI/CD pipeline for frontend",
    description:
      "Configure GitHub Actions for frontend deployment.\n\n" +
      "- Repo: frontend-app\n" +
      "- Build: npm run build\n" +
      "- Deploy: S3 + CloudFront\n" +
      "- Waiting: dev team to provide build config",
    types: "ci_cd",
    priority: "normal",
    status: "waiting_dev",
    environment: ["dev", "test"],
    app_name: "frontend-app",
    requestor_name: "Hoang Thi E",
    assignee: "DevOps Team",
    service_tags: "docker",
    started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  console.log(`[OK] Created ticket: ${t6.code}`);

  console.log("\n[INFO] Creating comments...\n");

  // Comments for t1
  await pb.collection("ma_ticket_comments").create({
    ticket: t1.id,
    author_name: "DevOps",
    message: "Received. Please confirm the image tag naming convention and whether any DB migration is included.",
  });
  await pb.collection("ma_ticket_comments").create({
    ticket: t1.id,
    author_name: "Nguyen Van A",
    message: "No DB migration. Image tag format: internal-app:<git-sha>. Please deploy latest commit on branch hotfix/login-redirect.",
  });

  // Comments for t2
  await pb.collection("ma_ticket_comments").create({
    ticket: t2.id,
    author_name: "DevOps",
    message: "Need Dockerfile + docker-compose baseline from dev. Also confirm whether this service requires SSL termination.",
  });
  await pb.collection("ma_ticket_comments").create({
    ticket: t2.id,
    author_name: "Tran Thi B",
    message: "Dockerfile and docker-compose.yml attached. SSL termination is handled by nginx reverse proxy.",
  });
  await pb.collection("ma_ticket_comments").create({
    ticket: t2.id,
    author_name: "DevOps",
    message: "Thanks! Starting deployment now.",
  });

  // Comments for t4
  await pb.collection("ma_ticket_comments").create({
    ticket: t4.id,
    author_name: "Backend Team",
    message: "Migration script is ready. Waiting for backup to complete before proceeding.",
  });
  await pb.collection("ma_ticket_comments").create({
    ticket: t4.id,
    author_name: "Pham Van D",
    message: "Backup is in progress. Estimated completion: 2 hours.",
  });

  // Comments for t5
  await pb.collection("ma_ticket_comments").create({
    ticket: t5.id,
    author_name: "DevOps",
    message: "Investigating the high CPU usage. Initial check shows a runaway process.",
  });

  console.log("[OK] Created 7 comments");

  console.log("\n[INFO] Creating events...\n");

  // Events for t1
  await pb.collection("ma_ticket_events").create({
    ticket: t1.id,
    event_type: "stauts_changed",
    from_value: "",
    to_value: "new",
    actor_name: "System",
    note: "Ticket created",
  });

  // Events for t2
  await pb.collection("ma_ticket_events").create({
    ticket: t2.id,
    event_type: "stauts_changed",
    from_value: "new",
    to_value: "triage",
    actor_name: "DevOps",
    note: "Ticket moved to triage",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t2.id,
    event_type: "assigned",
    from_value: "",
    to_value: "DevOps Team",
    actor_name: "DevOps",
    note: "Assigned to DevOps Team",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t2.id,
    event_type: "stauts_changed",
    from_value: "triage",
    to_value: "in_process",
    actor_name: "DevOps",
    note: "Started working on deployment",
  });

  // Events for t3
  await pb.collection("ma_ticket_events").create({
    ticket: t3.id,
    event_type: "stauts_changed",
    from_value: "new",
    to_value: "in_process",
    actor_name: "DevOps",
    note: "Started SSL configuration",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t3.id,
    event_type: "assigned",
    from_value: "",
    to_value: "DevOps Team",
    actor_name: "DevOps",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t3.id,
    event_type: "stauts_changed",
    from_value: "in_process",
    to_value: "done",
    actor_name: "DevOps",
    note: "SSL certificate configured and verified",
  });

  // Events for t4
  await pb.collection("ma_ticket_events").create({
    ticket: t4.id,
    event_type: "stauts_changed",
    from_value: "new",
    to_value: "in_process",
    actor_name: "Backend Team",
    note: "Started migration preparation",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t4.id,
    event_type: "priority_changed",
    from_value: "normal",
    to_value: "hight",
    actor_name: "Backend Team",
    note: "Increased priority due to production impact",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t4.id,
    event_type: "stauts_changed",
    from_value: "in_process",
    to_value: "blocked",
    actor_name: "Backend Team",
    note: "Blocked: waiting for backup completion",
  });

  // Events for t5
  await pb.collection("ma_ticket_events").create({
    ticket: t5.id,
    event_type: "stauts_changed",
    from_value: "",
    to_value: "new",
    actor_name: "Monitoring System",
    note: "Alert triggered automatically",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t5.id,
    event_type: "stauts_changed",
    from_value: "new",
    to_value: "triage",
    actor_name: "DevOps",
    note: "Moved to triage for investigation",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t5.id,
    event_type: "note",
    from_value: "",
    to_value: "",
    actor_name: "DevOps",
    note: "Initial investigation shows high CPU from a background job. Checking logs.",
  });

  // Events for t6
  await pb.collection("ma_ticket_events").create({
    ticket: t6.id,
    event_type: "stauts_changed",
    from_value: "new",
    to_value: "in_process",
    actor_name: "DevOps",
    note: "Started CI/CD setup",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t6.id,
    event_type: "assigned",
    from_value: "",
    to_value: "DevOps Team",
    actor_name: "DevOps",
  });
  await pb.collection("ma_ticket_events").create({
    ticket: t6.id,
    event_type: "stauts_changed",
    from_value: "in_process",
    to_value: "waiting_dev",
    actor_name: "DevOps",
    note: "Waiting for dev team to provide build configuration",
  });

  console.log("[OK] Created 14 events");

  console.log("\n[DONE] Seeded data:");
  console.log(`  - 6 tickets (various statuses)`);
  console.log(`  - 7 comments`);
  console.log(`  - 14 events`);
}

main().catch((e) => {
  console.error("\n[FAIL] Error:");
  console.error("Status:", e?.status);
  console.error("Message:", e?.message);
  console.error("Data:", e?.data);
  process.exit(1);
});
