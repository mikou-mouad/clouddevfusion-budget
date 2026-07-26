const { BlobServiceClient } = require("@azure/storage-blob");

const CONTAINER_NAME = "training-ledger";
const SNAPSHOT_PREFIX = "snapshots/";

function getContainerClient() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) {
    throw new Error(
      "AZURE_STORAGE_CONNECTION_STRING is not configured. Add it under " +
        "Static Web App > Configuration > Application settings."
    );
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

async function streamToString(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

/** ISO timestamps sort lexicographically the same as chronologically, so blob
 *  names built this way can be sorted by plain string comparison to find the latest. */
function snapshotBlobName(date = new Date()) {
  const safe = date.toISOString().replace(/[:.]/g, "-"); // e.g. 2026-07-26T14-30-00-000Z
  return `${SNAPSHOT_PREFIX}${safe}.json`;
}

/** List every snapshot blob, most recent first. */
async function listSnapshots(containerClient) {
  const items = [];
  for await (const blob of containerClient.listBlobsFlat({ prefix: SNAPSHOT_PREFIX })) {
    items.push({
      name: blob.name,
      savedAt: blob.properties.lastModified ? blob.properties.lastModified.toISOString() : null,
      sizeBytes: blob.properties.contentLength || 0,
    });
  }
  items.sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0)); // descending by name = newest first
  return items;
}

module.exports = { getContainerClient, streamToString, snapshotBlobName, listSnapshots, SNAPSHOT_PREFIX, CONTAINER_NAME };
