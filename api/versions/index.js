const { getContainerClient, listSnapshots } = require("../shared/storage");

const MAX_RESULTS = 200; // plenty of headroom for monthly snapshots for years

module.exports = async function (context, req) {
  try {
    const containerClient = getContainerClient();
    await containerClient.createIfNotExists();
    const snapshots = await listSnapshots(containerClient); // newest first
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { versions: snapshots.slice(0, MAX_RESULTS) },
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { error: err.message } };
  }
};
