import PocketBase from "pocketbase";
import { PB_CONFIG } from "../src/config/pb.config.js";

async function main() {
  const pb = new PocketBase(PB_CONFIG.URL);
  await pb.admins.authWithPassword(PB_CONFIG.EMAIL, PB_CONFIG.PASSWORD);

  // --- Create tickets
  const t1 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000001",
    title: "Deploy bugfix: login redirect loop",
    description:
      "Please deploy hotfix for login redirect loop.\n\n- Repo: internal-app\n- Branch: hotfix/login-redirect\n- Env: dev\n- Verify: user can login and stay on dashboard\n- Rollback: revert to previous image tag",
    type: "deploy_bugfix",
    priority: "urgent",
    status: "new",
    environment: "dev",
    app_name: "internal-app",
    requester_name: "Dev A",
  });

  const t2 = await pb.collection("ma_tickets").create({
    code: "TCK-2026-000002",
    title: "Setup docker for new service + test env",
    description:
      "Need Dockerize new service and prepare test environment.\n\n- Service: api-gateway\n- Ports: 8201\n- Env vars: see attached doc (will provide)\n- Verify: /health returns 200\n- Notes: use named volume for DB",
    type: "new_app_setup",
    priority: "normal",
    status: "triage",
    environment: "test",
    app_name: "api-gateway",
    requester_name: "Dev B",
  });

  // --- Comments
  await pb.collection("ma_ticket_comments").create({
    ticket: t1.id,
    author_name: "DevOps",
    message:
      "Received. Please confirm the image tag naming convention and whether any DB migration is included.",
  });

  await pb.collection("ma_ticket_comments").create({
    ticket: t1.id,
    author_name: "Dev A",
    message:
      "No DB migration. Image tag format: internal-app:<git-sha>. Please deploy latest commit on branch hotfix/login-redirect.",
  });

  await pb.collection("ma_ticket_comments").create({
    ticket: t2.id,
    author_name: "DevOps",
    message:
      "Need Dockerfile + docker-compose baseline from dev. Also confirm whether this service requires SSL termination.",
  });

  // --- Events (status changes, triage, etc.)
  await pb.collection("ma_ticket_events").create({
    ticket: t1.id,
    event_type: "status_changed",
    from_value: "new",
    to_value: "in_progress",
    actor_name: "DevOps",
    note: "Started dev deploy preparation.",
  });

  await pb.collection("ma_ticket_events").create({
    ticket: t2.id,
    event_type: "note",
    from_value: "",
    to_value: "",
    actor_name: "DevOps",
    note: "Pending dev to provide Dockerfile and env spec.",
  });

  console.log("[DONE] Seeded 2 tickets + comments + events");
}

main().catch((e) => {
  console.error("Status:", e?.status);
  console.error("Message:", e?.message);
  console.error("Data:", e?.data);
  process.exit(1);
});
