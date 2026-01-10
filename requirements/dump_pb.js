/**
 * Dump PocketBase collections to JSON
 * Collections:
 * - ma_tickets
 * - ma_ticket_comments
 * - ma_ticket_events
 *
 * Run:
 * PB_URL="http://127.0.0.1:8090" \
 * PB_EMAIL="admin@example.com" \
 * PB_PASSWORD="your_password" \
 * node dump_pb.js
 */

import PocketBase from "pocketbase";
import fs from "fs";
import path from "path";
import { PB_CONFIG } from "../src/config/pb.config.js";

// ✅ Correct collection names
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
  const pb = new PocketBase(PB_CONFIG.URL);

  // ---- Admin auth
  try {
    await pb.admins.authWithPassword(PB_CONFIG.EMAIL, PB_CONFIG.PASSWORD);
    console.log("[OK] Admin authenticated");
  } catch (e) {
    console.error("[FAIL] Admin auth failed");
    console.error(e?.data || e?.message);
    process.exit(1);
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
      pb_url: PB_CONFIG.URL,
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

  const outFile = path.join(outDir, `pb_dump_${ts()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(dump, null, 2), "utf-8");

  console.log(`[DONE] Dump saved to ${outFile}`);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
