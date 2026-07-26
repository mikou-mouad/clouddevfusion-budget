const { getContainerClient, streamToString, snapshotBlobName, listSnapshots, SNAPSHOT_PREFIX } = require("../shared/storage");

module.exports = async function (context, req) {
  try {
    const containerClient = getContainerClient();
    await containerClient.createIfNotExists();

    if (req.method === "GET") {
      const requestedVersion = req.query && req.query.version;

      let targetName = requestedVersion;
      if (!targetName) {
        const snapshots = await listSnapshots(containerClient); // newest first
        if (snapshots.length === 0) {
          context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { projects: null, expenses: null, version: null } };
          return;
        }
        targetName = snapshots[0].name;
      }

      // guard against path traversal / fetching anything outside the snapshots/ prefix
      if (!targetName.startsWith(SNAPSHOT_PREFIX)) {
        context.res = { status: 400, body: { error: "Invalid version" } };
        return;
      }

      const blockBlobClient = containerClient.getBlockBlobClient(targetName);
      const exists = await blockBlobClient.exists();
      if (!exists) {
        context.res = { status: 404, body: { error: "Version not found" } };
        return;
      }
      const downloadResponse = await blockBlobClient.download(0);
      const raw = await streamToString(downloadResponse.readableStreamBody);
      const parsed = JSON.parse(raw);
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { projects: parsed.projects, expenses: parsed.expenses, savedAt: parsed.savedAt, version: targetName },
      };
      return;
    }

    if (req.method === "POST") {
      const { projects, expenses } = req.body || {};
      if (!Array.isArray(projects) || !Array.isArray(expenses)) {
        context.res = { status: 400, body: { error: "Body must be { projects: [], expenses: [] }" } };
        return;
      }
      const savedAt = new Date();
      const blobName = snapshotBlobName(savedAt);
      const payload = JSON.stringify({ projects, expenses, savedAt: savedAt.toISOString() });
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      // never overwrite: each save is a brand new blob, so history is preserved automatically
      await blockBlobClient.upload(payload, Buffer.byteLength(payload), {
        overwrite: false,
        blobHTTPHeaders: { blobContentType: "application/json" },
      });
      context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { ok: true, version: blobName, savedAt: savedAt.toISOString() } };
      return;
    }

    context.res = { status: 405, body: { error: "Method not allowed" } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { error: err.message } };
  }
};
