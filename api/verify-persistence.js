// Not part of the deployed app — a one-off script to prove the versioned
// /api/data and /api/versions functions actually persist data to blob
// storage correctly, using Azurite (a local Azure Storage emulator) instead
// of trusting the code by inspection alone.
process.env.AZURE_STORAGE_CONNECTION_STRING =
  "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;";

const dataHandler = require("./data/index.js");
const versionsHandler = require("./versions/index.js");

function makeContext() {
  return {
    log: Object.assign((...a) => console.log("[log]", ...a), { error: (...a) => console.error("[log:error]", ...a) }),
    res: null,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const v1 = {
    projects: [{ id: "p1", name: "Month 1 Project", client: "Acme", status: "Paid", expectedAmount: 1000, startDate: "2026-06-01" }],
    expenses: [{ id: "e1", category: "Trainer Fee", expectedAmount: 400, status: "Paid", date: "2026-06-01" }],
  };
  const v2 = {
    projects: [
      ...v1.projects,
      { id: "p2", name: "Month 2 Project", client: "Beta", status: "Signed", expectedAmount: 2000, startDate: "2026-07-01" },
    ],
    expenses: v1.expenses,
  };

  // 1. GET before anything written -> nulls, no version
  let ctx = makeContext();
  await dataHandler(ctx, { method: "GET" });
  console.log("GET before any save:", JSON.stringify(ctx.res.body));
  if (ctx.res.body.projects !== null || ctx.res.body.version !== null) throw new Error("expected nulls before first save");

  // 2. First save ("month 1")
  ctx = makeContext();
  await dataHandler(ctx, { method: "POST", body: v1 });
  const version1 = ctx.res.body.version;
  console.log("Saved version 1:", version1);
  if (!version1) throw new Error("expected a version name back from POST");

  await sleep(1100); // ensure the next ISO timestamp actually differs

  // 3. Second save ("month 2") -> must be a DIFFERENT blob, not an overwrite
  ctx = makeContext();
  await dataHandler(ctx, { method: "POST", body: v2 });
  const version2 = ctx.res.body.version;
  console.log("Saved version 2:", version2);
  if (version2 === version1) throw new Error("expected a distinct blob name for the second save, got the same name");

  // 4. GET with no version param -> must return the LATEST (version 2's data)
  ctx = makeContext();
  await dataHandler(ctx, { method: "GET" });
  console.log("GET latest -> version:", ctx.res.body.version, "projects:", ctx.res.body.projects.length);
  if (ctx.res.body.version !== version2) throw new Error(`expected latest GET to return ${version2}, got ${ctx.res.body.version}`);
  if (ctx.res.body.projects.length !== 2) throw new Error("expected latest snapshot to have 2 projects");

  // 5. GET the OLDER version explicitly by name -> must still be retrievable (this is the "versioned history" guarantee)
  ctx = makeContext();
  await dataHandler(ctx, { method: "GET", query: { version: version1 } });
  console.log("GET explicit old version -> projects:", ctx.res.body.projects.length);
  if (ctx.res.body.projects.length !== 1) throw new Error("expected the older version to still have exactly 1 project");

  // 6. /api/versions -> lists both, newest first
  ctx = makeContext();
  await versionsHandler(ctx, {});
  const listed = ctx.res.body.versions;
  console.log("Versions listed:", listed.map((v) => v.name));
  if (listed.length !== 2) throw new Error(`expected 2 versions listed, got ${listed.length}`);
  if (listed[0].name !== version2) throw new Error("expected the newest version first in the list");
  if (listed[1].name !== version1) throw new Error("expected the older version second in the list");

  // 7. Path-traversal guard: a version param outside snapshots/ must be rejected
  ctx = makeContext();
  await dataHandler(ctx, { method: "GET", query: { version: "../../secrets.json" } });
  if (ctx.res.status !== 400) throw new Error("expected 400 for a version param outside the snapshots/ prefix");
  console.log("Path traversal attempt correctly rejected with 400");

  console.log("\n✅ All versioning checks passed: saves never overwrite, GET always returns the latest by default, and any past version is still retrievable.");
}

run().catch((err) => {
  console.error("\n❌ FAILED:", err.message);
  process.exit(1);
});
