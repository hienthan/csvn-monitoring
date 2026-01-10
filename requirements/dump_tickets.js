/**
 * Dump ticket collections data to JSON
 * Collections:
 * - ma_tickets
 * - ma_ticket_comments
 * - ma_ticket_events
 *
 * Run:
 * PB_URL="http://127.0.0.1:8090" \
 * PB_EMAIL="admin@example.com" \
 * PB_PASSWORD="your_password" \
 * node requirements/dump_tickets.js
 */

import PocketBase from "pocketbase";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PB_CONFIG } from "../src/config/pb.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTIONS = [
  "ma_tickets",
  "ma_ticket_comments",
  "ma_ticket_events",
];

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(
    d.getHours()
  )}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

async function fetchAll(pb, collection) {
  const pageSize = 200;
  let page = 1;
  let all = [];

  while (true) {
    const res = await pb.collection(collection).getList(page, pageSize, {
      sort: "+created",
    });

    all.push(...res.items);
    if (res.items.length < pageSize) break;
    page++;
  }

  return all;
}

async function main() {
  const pbUrl = PB_CONFIG.URL.replace(/\/$/, "");
  const pb = new PocketBase(pbUrl);

  // ---- Admin auth
  try {
    await pb.admins.authWithPassword(PB_CONFIG.EMAIL, PB_CONFIG.PASSWORD);
    console.log("[OK] Admin authenticated (SDK)");
  } catch (e) {
    console.log("[WARN] SDK auth failed, trying direct fetch...");
    try {
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
    } catch (fetchError) {
      console.error("[FAIL] Admin auth failed");
      console.error("SDK error:", e?.data || e?.message);
      console.error("Fetch error:", fetchError?.message);
      process.exit(1);
    }
  }

  // ---- Verify collections exist
  const existing = await pb.collections.getFullList({ sort: "+name" });
  const existingNames = new Set(existing.map((c) => c.name));

  for (const c of COLLECTIONS) {
    if (!existingNames.has(c)) {
      console.error(
        `[FAIL] Collection "${c}" not found. Existing: ${[
          ...existingNames,
        ].join(", ")}`
      );
      process.exit(1);
    }
  }
  console.log("[OK] All collections exist");

  // ---- Dump data
  const dump = {
    meta: {
      pb_url: pbUrl,
      dumped_at: new Date().toISOString(),
      collections: COLLECTIONS,
    },
    data: {},
  };

  for (const c of COLLECTIONS) {
    console.log(`[INFO] Dumping ${c} ...`);
    const records = await fetchAll(pb, c);
    dump.data[c] = records;
    console.log(`[INFO]   → ${records.length} records`);
  }

  const outDir = path.resolve("dump_out");
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `tickets_dump_${ts()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(dump, null, 2), "utf-8");

  console.log(`\n[DONE] Dump saved to ${outFile}`);
  console.log(`\nTo restore, you can use this data with a restore script.`);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
