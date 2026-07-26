# Training Ledger

A small web app to track training projects, separate revenue from expenses, plan
upcoming engagements, and see a dashboard of actual vs. expected results.

## How data persistence works

Data is stored **twice**, on purpose:

1. **Local cache (`localStorage`)** — every edit (add/edit/delete a project or
   expense) is written here instantly, so nothing is ever lost even if you
   close the tab mid-session. This is *not* shared across devices — it's just
   a safety net for your current browser.
2. **Shared storage (the source of truth)** — an Azure Function at
   `/api/data`, backed by Azure Blob Storage, using **versioned snapshots**.
   This is what makes data persist across devices: open the app elsewhere
   and you'll see whatever was last saved.

**Saving is manual, on purpose** — matching how you actually work (edit
throughout the month, then review and save once). Editing a project or
expense does **not** immediately create a new file. Instead:

- A pill in the header shows **Unsaved changes** the moment you make any
  edit, and **All changes saved** once you've saved.
- Click **Save** to push everything to the shared storage. This is the only
  action that creates a new snapshot blob (`snapshots/<timestamp>.json`) —
  never an overwrite of a previous one.
- Do a whole session of edits, then click Save once, and you end up with
  roughly one new file per session (for most people, close to one per
  month) rather than one per edit.
- If you try to close the tab with unsaved changes, the browser will warn
  you first.
- Every past snapshot stays retrievable via `/api/data?version=<name>`, and
  `/api/versions` lists all of them. The **History** button in the header
  lists every saved version (newest first, with size/timestamp) and lets you
  **Restore** any of them — restoring loads that snapshot into the app and
  marks it as unsaved, so you review it and click Save yourself to make it
  the new current version (nothing is overwritten automatically).

The **Backup** / **Restore** buttons remain as a separate, extra safety net —
export a full JSON snapshot to your own computer any time, independent of the
above.

> **Running `npm run dev` locally without the API wired up (see below) is
> fine** — Save will just show "Save failed — retry" and your edits stay
> safe in `localStorage`, exactly like it does in the test suite.

## Run locally

```bash
npm install
npm run dev
```

To also exercise the real `/api/data` function locally (recommended before
deploying), use the Azure Static Web Apps CLI instead, which runs the built
app together with the Functions runtime:

```bash
npm install -g @azure/static-web-apps-cli
npm run build
swa start dist --api-location api
```

You'll need an `AZURE_STORAGE_CONNECTION_STRING` environment variable available
to the `api` process for this to actually read/write (see setup below) —
without it, `/api/data` will return a 500 and the app will fall back to
`localStorage`, same as always.

## Run the test suite

```bash
npm install
npm test
```

22 tests cover: dashboard math against the Revenue/Expenses tables, tab
navigation, creating/editing/deleting projects and expenses, per-column
filters (text, status/category multi-select, date range, amount range), the
Planning tab's date ordering and filtering, persistence across a simulated
page reload, the manual Save button (edits don't call the API until Save is
clicked, error handling, success clearing the unsaved indicator), and the
History panel (error state + listing/restoring a past version).

There's also `api/verify-persistence.js`, a standalone script (not part of
the deployed app) that exercises the real versioned GET/POST/list behavior
against [Azurite](https://github.com/Azure/Azurite) (a local Azure Storage
emulator), rather than trusting the code by inspection. To re-run it:

```bash
cd api
npm install
npm install azurite --no-save
npx azurite-blob --silent --skipApiVersionCheck --location /tmp/azurite-data &
node verify-persistence.js
```

It checks: reading before anything's been written returns nulls, two
consecutive saves produce two distinct blobs (never an overwrite), a GET
with no version returns the latest one, an older version is still fetchable
by name, `/api/versions` lists both newest-first, and a version parameter
pointing outside the `snapshots/` prefix is rejected with a 400.

## Deploy to Azure Static Web Apps (Free tier)

### 1. Create a Storage Account for the shared data

This is the one piece that isn't literally the Static Web Apps free tier —
you need somewhere for the shared JSON to live. An Azure Storage Account is
the simplest option, and for a personal tracker like this (a few KB, read/
written occasionally) the cost is a fraction of a cent per month — in
practice it will round to $0 on most bills.

1. In the [Azure Portal](https://portal.azure.com), create a **Storage account**
   (any redundancy tier — **Locally-redundant storage (LRS)** is cheapest and
   plenty for this).
2. Once created, go to **Access keys** and copy a **Connection string**.

### 2. Create the Static Web App

1. Push this folder to a GitHub repository.
2. In the Azure Portal, create a new **Static Web App** → **Free** hosting plan
   → sign in with GitHub → pick your repo/branch.
3. Build details:
   - App location: `/`
   - **Api location: `api`**
   - Output location: `dist`
4. Create. Azure commits a GitHub Actions workflow to your repo (one is also
   already included here — keep whichever has the matching deployment token
   and delete the other so you don't get two deployments per push).

### 3. Connect the Storage Account to the Static Web App

1. On your new Static Web App resource, go to **Settings → Configuration →
   Application settings**.
2. Add a setting named `AZURE_STORAGE_CONNECTION_STRING` with the connection
   string you copied in step 1.
3. Save — this triggers a restart of the Functions runtime.

From then on, every push to `main` rebuilds and redeploys the site *and* the
API, and the app will persist data centrally for anyone who opens the URL.

### Optional: pruning old snapshots

There's no automatic deletion of old snapshots — by design, so nothing is
ever silently lost. At a monthly cadence this is a non-issue for years. If
you ever want to trim very old versions (e.g. keep only the last N), that
would be a small addition to the `/api/versions` function — ask if you'd
like it added later.

### Optional but recommended: restrict who can use it

Right now `/api/data` has no authentication — anyone with the URL can read or
write your data. For a personal financial tracker, it's worth locking this
down using Static Web Apps' built-in authentication (GitHub/Microsoft login)
and restricting the `/api/*` route to the `authenticated` role in
`staticwebapp.config.json`. Ask me if you'd like this wired up — it's a small
addition once you've confirmed the basic deployment works.

## What's in the free tier

- Static Web Apps free tier: 100 GB bandwidth/month, free custom domain + SSL,
  and a generous free quota of Functions executions.
- The Storage Account is billed separately (not part of the SWA free tier),
  but at this data volume it's effectively free in practice.
