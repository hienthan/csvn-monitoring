/**
 * Global PocketBase configuration
 * Used by seed_pb.js, dump_pb.js, and other scripts
 */

export const PB_CONFIG = {
  URL: process.env.PB_URL || "http://127.0.0.1:8090",
  EMAIL: process.env.PB_EMAIL || "hien.thanquang@gmail.com",
  PASSWORD: process.env.PB_PASSWORD || "12345678x@X",
};

