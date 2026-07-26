import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, PieChart, Pie
} from "recharts";
import {
  LayoutDashboard, TrendingUp, TrendingDown, CalendarClock, Plus, Trash2,
  Pencil, X, Check, ChevronDown, Wallet, Receipt, Clock3, Target
} from "lucide-react";

/* ---------------------------------------------------------------
   SEED DATA — imported from the user's existing tracking sheet
--------------------------------------------------------------- */
const SEED_PROJECTS_ALL = [{"id": "p1", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Efrei - Cloud Intro", "startDate": "2026-03-09", "endDate": "2026-03-13", "status": "Paid", "expectedAmount": 2765, "notes": ""}, {"id": "p2", "client": "IWG", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Office", "name": "IWG - Office", "startDate": "2026-01-01", "endDate": "2026-01-31", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p3", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Efrei - DP600 - Aug (1/2)", "startDate": "2026-07-06", "endDate": "2026-07-07", "status": "Signed", "expectedAmount": 1176, "notes": ""}, {"id": "p4", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Efrei - DP600 - Aug (2/2)", "startDate": "2026-08-31", "endDate": "2026-09-02", "status": "Signed", "expectedAmount": 1764, "notes": ""}, {"id": "p5", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Monaim Touinsi", "topic": "Training", "name": "Efrei - DP600 - Sep", "startDate": "2026-08-31", "endDate": "2026-09-04", "status": "Signed", "expectedAmount": 2940, "notes": ""}, {"id": "p6", "client": "Crossthink ", "contact": "Arnaud ", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Crossthink  - Apr - Week 1", "startDate": "2026-03-30", "endDate": "2026-04-03", "status": "Lost", "expectedAmount": 4750, "notes": ""}, {"id": "p7", "client": "Crossthink ", "contact": "Arnaud ", "source": "Ilyes & Alexis", "trainer": "Salahedine Bejaoui", "topic": "Training", "name": "Crossthink  - Apr - Week 2 & 3", "startDate": "2026-04-07", "endDate": "2026-04-17", "status": "Lost", "expectedAmount": 8550, "notes": ""}, {"id": "p8", "client": "Crossthink ", "contact": "Arnaud ", "source": "Ilyes & Alexis", "trainer": "Mouad MIKOU", "topic": "Training", "name": "Crossthink  - Apr - Week 4", "startDate": "2026-04-20", "endDate": "2026-04-24", "status": "Lost", "expectedAmount": 4750, "notes": ""}, {"id": "p9", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Monaim Touinsi", "topic": "Training", "name": "FastLane - AZ204", "startDate": "2026-05-18", "endDate": "2026-05-22", "status": "Lost", "expectedAmount": 2300, "notes": ""}, {"id": "p10", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Youssef ElGandouli", "topic": "Training", "name": "FastLane - AZ700", "startDate": "2026-04-07", "endDate": "2026-04-10", "status": "Lost", "expectedAmount": 1840, "notes": ""}, {"id": "p11", "client": "Cellenza", "contact": "Alain\u00a0GIANSILY", "source": "N/A", "trainer": "Mouad MIKOU", "topic": "Training", "name": "Cellenza - AZ500", "startDate": "2026-03-16", "endDate": "2026-03-19", "status": "Paid", "expectedAmount": 3000, "notes": ""}, {"id": "p12", "client": "Ichrak", "contact": "Ichrak", "source": "N/A", "trainer": "N/A", "topic": "Salary", "name": "Ichrak - Janvier", "startDate": "2026-01-01", "endDate": "2026-01-30", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p13", "client": "Ichrak", "contact": "Ichrak", "source": "N/A", "trainer": "N/A", "topic": "Salary", "name": "Ichrak - Fevrier", "startDate": "2026-02-01", "endDate": "2026-02-28", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p14", "client": "IWG", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Office", "name": "IWG - Office", "startDate": "2026-02-01", "endDate": "2026-02-28", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p15", "client": "Pearson Vue", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Pearson AZ-500", "startDate": "2026-02-27", "endDate": "2026-02-27", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p16", "client": "Pearson Vue", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Pearson AZ-204", "startDate": "2026-03-01", "endDate": "2026-03-01", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p17", "client": "Eni Editions", "contact": "Vanessa Dallerac", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Eni - Certification Formateur", "startDate": "2026-03-06", "endDate": "2026-03-06", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p18", "client": "Eni Editions", "contact": "Vanessa Dallerac", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Eni - Devis Habilitation (3 certifs)", "startDate": "2026-03-12", "endDate": "2026-03-12", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p19", "client": "IWG", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Office", "name": "IWG - Office - Retour Caution", "startDate": "2026-03-12", "endDate": "2026-03-12", "status": "Paid", "expectedAmount": 186.9, "notes": ""}, {"id": "p20", "client": "Cellenza", "contact": "Alain\u00a0GIANSILY", "source": "N/A", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Cellenza - Custom", "startDate": "2026-05-19", "endDate": "2026-05-20", "status": "Invoiced", "expectedAmount": 4500, "notes": ""}, {"id": "p21", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Youssef ElGandouli", "topic": "Training", "name": "FastLane MD-102", "startDate": "2026-05-18", "endDate": "2026-05-22", "status": "Invoiced", "expectedAmount": 2300, "notes": ""}, {"id": "p22", "client": "Ichrak", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Salary", "name": "Ichrak - Mars", "startDate": "2026-03-01", "endDate": "2026-03-31", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p23", "client": "FZ", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Salary", "name": "FZ - Avril & Mai", "startDate": "2026-04-01", "endDate": "2026-05-31", "status": "Invoiced", "expectedAmount": 0, "notes": ""}, {"id": "p24", "client": "Microsoft", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Subscription", "name": "Teams Sub", "startDate": "2026-04-01", "endDate": "2026-04-30", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p25", "client": "Ossama Dghoughi", "contact": "Ossama Dghoughi", "source": "N/A", "trainer": "N/A", "topic": "Salary", "name": "WebSite + Intranet Dev ", "startDate": "2026-02-02", "endDate": "2026-05-29", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p26", "client": "Amine Mokrani", "contact": "Amine Mokrani", "source": "N/A", "trainer": "N/A", "topic": "Salary", "name": "Amine - Avril & Mai", "startDate": "2026-04-01", "endDate": "2026-05-29", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p27", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Youssef ElGandouli", "topic": "Training", "name": "FastLane MD-102", "startDate": "2026-06-01", "endDate": "2026-06-05", "status": "Scheduled", "expectedAmount": 2300, "notes": ""}, {"id": "p28", "client": "Microsoft", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Subscription", "name": "Teams Sub", "startDate": "2026-05-01", "endDate": "2026-05-31", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Oussama EDDAI", "topic": "Training", "name": "Efrei - Cloud Intro 2 (1/2)", "startDate": "2027-01-04", "endDate": "2027-01-05", "status": "Signed", "expectedAmount": 1176, "notes": "", "id": "p29"}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Oussama EDDAI", "topic": "Training", "name": "Efrei - Cloud Intro 2 (2/2)", "startDate": "2027-01-12", "endDate": "2027-01-13", "status": "Signed", "expectedAmount": 1176, "notes": "", "id": "p30"}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Oussama EDDAI or Monaim", "topic": "Training", "name": "Efrei - Cloud Intro 3", "startDate": null, "endDate": null, "status": "Pipeline", "expectedAmount": 2212, "notes": "Trainer fee estimate 2000", "id": "p31"}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei - AZ104 - 1", "startDate": null, "endDate": null, "status": "Pipeline", "expectedAmount": 0, "notes": "", "id": "p32"}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei - AZ104 - 2", "startDate": null, "endDate": null, "status": "Pipeline", "expectedAmount": 0, "notes": "", "id": "p33"}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei - DP700 - 1", "startDate": null, "endDate": null, "status": "Pipeline", "expectedAmount": 0, "notes": "", "id": "p34"}, {"client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei - DP700 - 2", "startDate": null, "endDate": null, "status": "Pipeline", "expectedAmount": 0, "notes": "", "id": "p35"}];

const SEED_EXPENSES = [{"id": "e1", "projectId": "p1", "projectName": "Efrei - Cloud Intro", "category": "Trainer Fee", "date": "2026-03-09", "status": "Paid", "expectedAmount": 2150, "notes": ""}, {"id": "e2", "projectId": "p1", "projectName": "Efrei - Cloud Intro", "category": "Commission", "date": "2026-03-09", "status": "Paid", "expectedAmount": 307.5, "notes": ""}, {"id": "e3", "projectId": "p2", "projectName": "IWG - Office", "category": "Office", "date": "2026-01-01", "status": "Paid", "expectedAmount": 278.58, "notes": ""}, {"id": "e4", "projectId": "p3", "projectName": "Efrei - DP600 - Aug (1/2)", "category": "Trainer Fee", "date": "2026-07-06", "status": "Signed", "expectedAmount": 860, "notes": ""}, {"id": "e5", "projectId": "p3", "projectName": "Efrei - DP600 - Aug (1/2)", "category": "Commission", "date": "2026-07-06", "status": "Signed", "expectedAmount": 158, "notes": ""}, {"id": "e6", "projectId": "p4", "projectName": "Efrei - DP600 - Aug (2/2)", "category": "Trainer Fee", "date": "2026-08-31", "status": "Signed", "expectedAmount": 1290, "notes": ""}, {"id": "e7", "projectId": "p4", "projectName": "Efrei - DP600 - Aug (2/2)", "category": "Commission", "date": "2026-08-31", "status": "Signed", "expectedAmount": 237, "notes": ""}, {"id": "e8", "projectId": "p5", "projectName": "Efrei - DP600 - Sep", "category": "Trainer Fee", "date": "2026-08-31", "status": "Signed", "expectedAmount": 2150, "notes": ""}, {"id": "e9", "projectId": "p5", "projectName": "Efrei - DP600 - Sep", "category": "Commission", "date": "2026-08-31", "status": "Signed", "expectedAmount": 395, "notes": ""}, {"id": "e10", "projectId": "p6", "projectName": "Crossthink  - Apr - Week 1", "category": "Trainer Fee", "date": "2026-03-30", "status": "Lost", "expectedAmount": 4000, "notes": ""}, {"id": "e11", "projectId": "p6", "projectName": "Crossthink  - Apr - Week 1", "category": "Commission", "date": "2026-03-30", "status": "Lost", "expectedAmount": 375, "notes": ""}, {"id": "e12", "projectId": "p7", "projectName": "Crossthink  - Apr - Week 2 & 3", "category": "Trainer Fee", "date": "2026-04-07", "status": "Lost", "expectedAmount": 4950, "notes": ""}, {"id": "e13", "projectId": "p7", "projectName": "Crossthink  - Apr - Week 2 & 3", "category": "Commission", "date": "2026-04-07", "status": "Lost", "expectedAmount": 1800, "notes": ""}, {"id": "e14", "projectId": "p8", "projectName": "Crossthink  - Apr - Week 4", "category": "Trainer Fee", "date": "2026-04-20", "status": "Lost", "expectedAmount": 4000, "notes": ""}, {"id": "e15", "projectId": "p8", "projectName": "Crossthink  - Apr - Week 4", "category": "Commission", "date": "2026-04-20", "status": "Lost", "expectedAmount": 375, "notes": ""}, {"id": "e16", "projectId": "p9", "projectName": "FastLane - AZ204", "category": "Trainer Fee", "date": "2026-05-18", "status": "Lost", "expectedAmount": 1750, "notes": ""}, {"id": "e17", "projectId": "p10", "projectName": "FastLane - AZ700", "category": "Trainer Fee", "date": "2026-04-07", "status": "Lost", "expectedAmount": 1000, "notes": ""}, {"id": "e18", "projectId": "p10", "projectName": "FastLane - AZ700", "category": "Other Cost", "date": "2026-04-07", "status": "Lost", "expectedAmount": 100, "notes": ""}, {"id": "e19", "projectId": "p11", "projectName": "Cellenza - AZ500", "category": "Trainer Fee", "date": "2026-03-16", "status": "Paid", "expectedAmount": 2800, "notes": ""}, {"id": "e20", "projectId": "p12", "projectName": "Ichrak - Janvier", "category": "Salary", "date": "2026-01-01", "status": "Paid", "expectedAmount": 200, "notes": ""}, {"id": "e21", "projectId": "p13", "projectName": "Ichrak - Fevrier", "category": "Salary", "date": "2026-02-01", "status": "Paid", "expectedAmount": 300, "notes": ""}, {"id": "e22", "projectId": "p14", "projectName": "IWG - Office", "category": "Office", "date": "2026-02-01", "status": "Paid", "expectedAmount": 69.2, "notes": ""}, {"id": "e23", "projectId": "p15", "projectName": "Pearson AZ-500", "category": "Certification", "date": "2026-02-27", "status": "Paid", "expectedAmount": 37.8, "notes": ""}, {"id": "e24", "projectId": "p16", "projectName": "Pearson AZ-204", "category": "Certification", "date": "2026-03-01", "status": "Paid", "expectedAmount": 37.8, "notes": ""}, {"id": "e25", "projectId": "p17", "projectName": "Eni - Certification Formateur", "category": "Certification", "date": "2026-03-06", "status": "Paid", "expectedAmount": 420, "notes": ""}, {"id": "e26", "projectId": "p18", "projectName": "Eni - Devis Habilitation (3 certifs)", "category": "Certification", "date": "2026-03-12", "status": "Paid", "expectedAmount": 630, "notes": ""}, {"id": "e27", "projectId": "p20", "projectName": "Cellenza - Custom", "category": "Trainer Fee", "date": "2026-05-19", "status": "Invoiced", "expectedAmount": 3500, "notes": ""}, {"id": "e28", "projectId": "p21", "projectName": "FastLane MD-102", "category": "Trainer Fee", "date": "2026-05-18", "status": "Invoiced", "expectedAmount": 1250, "notes": ""}, {"id": "e29", "projectId": "p21", "projectName": "FastLane MD-102", "category": "Other Cost", "date": "2026-05-18", "status": "Invoiced", "expectedAmount": 100, "notes": ""}, {"id": "e30", "projectId": "p22", "projectName": "Ichrak - Mars", "category": "Salary", "date": "2026-03-01", "status": "Paid", "expectedAmount": 280, "notes": ""}, {"id": "e31", "projectId": "p23", "projectName": "FZ - Avril & Mai", "category": "Salary", "date": "2026-04-01", "status": "Invoiced", "expectedAmount": 200, "notes": ""}, {"id": "e32", "projectId": "p24", "projectName": "Teams Sub", "category": "Software", "date": "2026-04-01", "status": "Paid", "expectedAmount": 6.24, "notes": ""}, {"id": "e33", "projectId": "p25", "projectName": "WebSite + Intranet Dev ", "category": "Salary", "date": "2026-02-02", "status": "Paid", "expectedAmount": 1200, "notes": ""}, {"id": "e34", "projectId": "p26", "projectName": "Amine - Avril & Mai", "category": "Salary", "date": "2026-04-01", "status": "Paid", "expectedAmount": 380, "notes": ""}, {"id": "e35", "projectId": "p27", "projectName": "FastLane MD-102", "category": "Trainer Fee", "date": "2026-06-01", "status": "Scheduled", "expectedAmount": 1250, "notes": ""}, {"id": "e36", "projectId": "p28", "projectName": "Teams Sub", "category": "Software", "date": "2026-05-01", "status": "Paid", "expectedAmount": 6.24, "notes": ""}, {"id": "e37", "projectId": "p29", "projectName": "Efrei - Cloud Intro 2 (1/2)", "category": "Trainer Fee", "date": "2027-01-04", "status": "Signed", "expectedAmount": 850, "notes": ""}, {"id": "e38", "projectId": "p30", "projectName": "Efrei - Cloud Intro 2 (2/2)", "category": "Trainer Fee", "date": "2027-01-12", "status": "Signed", "expectedAmount": 850, "notes": ""}, {"id": "e39", "projectId": "p31", "projectName": "Efrei - Cloud Intro 3", "category": "Trainer Fee", "date": null, "status": "Pipeline", "expectedAmount": 2000, "notes": ""}];


const STATUS_ORDER = ["Pipeline", "Scheduled", "Signed", "Invoiced", "Paid", "Lost"];
const STATUS_COLORS = {
  Pipeline: "#9AA39C",
  Scheduled: "#C68A2E",
  Signed: "#3E7CB1",
  Invoiced: "#7A5FB5",
  Paid: "#1F6E4A",
  Lost: "#B3402F",
};
const EXPENSE_CATEGORIES = ["Trainer Fee", "Commission", "Certification", "Other Cost", "Office", "Salary", "Software", "Travel", "Other"];

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return "—";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const monthKey = (d) => (d ? d.slice(0, 7) : "unscheduled");
const uid = (p) => p + Math.random().toString(36).slice(2, 9);

/* ---------------------------------------------------------------
   Storage — the source of truth is a shared Azure Function
   (/api/data, backed by Blob Storage) so data survives across
   devices/browsers once deployed. Every save creates a brand new
   snapshot blob rather than overwriting one, so history is kept
   automatically; loading always fetches whichever snapshot is
   newest unless a specific version is requested. localStorage is
   kept as a fast local cache and an offline fallback.
--------------------------------------------------------------- */
async function fetchLatestRemote() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.projects) && Array.isArray(data.expenses)) return data;
    return null;
  } catch {
    return null;
  }
}

async function fetchRemoteVersion(versionName) {
  try {
    const res = await fetch(`/api/data?version=${encodeURIComponent(versionName)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.projects) && Array.isArray(data.expenses)) return data;
    return null;
  } catch {
    return null;
  }
}

async function fetchVersionList() {
  try {
    const res = await fetch("/api/versions");
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.versions) ? data.versions : null;
  } catch {
    return null;
  }
}

function readLocalCache() {
  try {
    const p = localStorage.getItem("projects_v1");
    const e = localStorage.getItem("expenses_v1");
    return { projects: p ? JSON.parse(p) : null, expenses: e ? JSON.parse(e) : null };
  } catch {
    return { projects: null, expenses: null };
  }
}

function writeLocalCache(projects, expenses) {
  try {
    localStorage.setItem("projects_v1", JSON.stringify(projects));
    localStorage.setItem("expenses_v1", JSON.stringify(expenses));
  } catch {}
}

/** Load on boot: prefer the latest snapshot from the API, fall back to the local cache, then to seed data. */
async function loadData() {
  const remote = await fetchLatestRemote();
  if (remote) {
    writeLocalCache(remote.projects, remote.expenses);
    return { projects: remote.projects, expenses: remote.expenses, version: remote.version, source: "remote" };
  }
  const local = readLocalCache();
  if (local.projects && local.expenses) return { ...local, version: null, source: "local" };
  return { projects: null, expenses: null, version: null, source: "none" };
}

/** Save on every change: local cache is instant; this call creates a brand new version blob (never overwrites). */
async function persistRemote(projects, expenses) {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projects, expenses }),
  });
  if (!res.ok) throw new Error("sync failed");
  return res.json(); // { ok, version, savedAt }
}

function downloadBackup(projects, expenses) {
  const blob = new Blob([JSON.stringify({ projects, expenses }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `training-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function restoreBackup(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.projects && data.expenses) onDone(data.projects, data.expenses);
    } catch {}
  };
  reader.readAsText(file);
}

/* ---------------------------------------------------------------
   Small UI atoms
--------------------------------------------------------------- */
function Badge({ status }) {
  const c = STATUS_COLORS[status] || "#9AA39C";
  return (
    <span
      style={{
        background: `${c}1A`,
        color: c,
        border: `1px solid ${c}55`,
      }}
      className="badge"
    >
      {status}
    </span>
  );
}

function KpiCard({ icon: Icon, label, actual, expected, tone }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: `${tone}17`, color: tone }}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-actual">{fmt(actual)}</div>
      <div className="kpi-expected">
        <Target size={12} style={{ marginRight: 4, position: "relative", top: 1 }} />
        {fmt(expected)} if everything closes
      </div>
    </div>
  );
}

function Select({ value, onChange, options, labelFor }) {
  return (
    <div className="select-wrap">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{labelFor ? labelFor(o) : o}</option>
        ))}
      </select>
      <ChevronDown size={13} className="select-chevron" />
    </div>
  );
}

/** Multi-select checkbox dropdown, used for column filters (Status / Category). */
function MultiSelectFilter({ label, options, selected, onChange, colorFor }) {
  const allSelected = selected.size === options.length;
  const toggle = (opt) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(next);
  };
  const summary = allSelected ? label : selected.size === 0 ? `${label}: none` : `${label}: ${selected.size}`;
  return (
    <details className="msf">
      <summary>{summary}<ChevronDown size={12} /></summary>
      <div className="msf-panel">
        <button type="button" className="msf-all" onClick={() => onChange(allSelected ? new Set() : new Set(options))}>
          {allSelected ? "Clear all" : "Select all"}
        </button>
        {options.map((opt) => (
          <label key={opt} className="msf-option">
            <input type="checkbox" checked={selected.has(opt)} onChange={() => toggle(opt)} />
            {colorFor && <span className="msf-dot" style={{ background: colorFor(opt) }} />}
            {opt}
          </label>
        ))}
      </div>
    </details>
  );
}

/** Dropdown listing every saved version (newest first), with a Restore action per row. */
function HistoryPanel({ onRestore }) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [restoringName, setRestoringName] = useState(null);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && versions === null) {
      setLoading(true);
      setError(false);
      const list = await fetchVersionList();
      setLoading(false);
      if (list === null) setError(true);
      else setVersions(list);
    }
  };

  const handleRestore = async (name) => {
    setRestoringName(name);
    const data = await fetchRemoteVersion(name);
    setRestoringName(null);
    if (data) {
      onRestore(data.projects, data.expenses);
      setOpen(false);
    }
  };

  const fmtWhen = (iso) => {
    if (!iso) return "Unknown time";
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="history-wrap">
      <button className="ghost-btn" onClick={toggle}>History</button>
      {open && (
        <div className="history-panel">
          <div className="history-head">
            <span>Saved versions</span>
            <button className="icon-btn" onClick={() => setOpen(false)}><X size={12} /></button>
          </div>
          {loading && <div className="history-empty">Loading versions…</div>}
          {error && <div className="history-empty">Couldn't reach the history API — is the app deployed with the Storage Account connected?</div>}
          {versions && versions.length === 0 && <div className="history-empty">No saved versions yet — your first save will show up here.</div>}
          {versions && versions.map((v, i) => (
            <div className="history-row" key={v.name}>
              <div>
                <div className="history-date">{fmtWhen(v.savedAt)}{i === 0 ? <span className="history-latest"> · latest</span> : null}</div>
                <div className="history-size">{((v.sizeBytes || 0) / 1024).toFixed(1)} KB</div>
              </div>
              <button className="link-btn" disabled={restoringName === v.name} onClick={() => handleRestore(v.name)}>
                {restoringName === v.name ? "Restoring…" : "Restore"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ---------------------------------------------------------------
   Revenue (Projects) Table
--------------------------------------------------------------- */
const EMPTY_REVENUE_FILTERS = {
  name: "", client: "", trainer: "",
  statuses: new Set(STATUS_ORDER),
  dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
};

function RevenueTab({ projects, setProjects }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [filters, setFilters] = useState(EMPTY_REVENUE_FILTERS);
  const setF = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const startEdit = (p) => { setEditingId(p.id); setDraft({ ...p }); };
  const startNew = () => {
    const p = { id: uid("p"), client: "", contact: "", source: "", trainer: "", topic: "Training", name: "New project", startDate: null, endDate: null, status: "Pipeline", expectedAmount: 0, notes: "" };
    setProjects([p, ...projects]);
    startEdit(p);
  };
  const save = () => {
    setProjects(projects.map((p) => (p.id === editingId ? draft : p)));
    setEditingId(null); setDraft(null);
  };
  const remove = (id) => setProjects(projects.filter((p) => p.id !== id));

  const filtered = projects.filter((p) => {
    if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.client && !(p.client || "").toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.trainer && !(p.trainer || "").toLowerCase().includes(filters.trainer.toLowerCase())) return false;
    if (!filters.statuses.has(p.status)) return false;
    if (filters.dateFrom && (!p.startDate || p.startDate < filters.dateFrom)) return false;
    if (filters.dateTo && (!p.startDate || p.startDate > filters.dateTo)) return false;
    if (filters.amountMin !== "" && (p.expectedAmount || 0) < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax !== "" && (p.expectedAmount || 0) > parseFloat(filters.amountMax)) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => (b.startDate || "0000").localeCompare(a.startDate || "0000"));
  const total = filtered.reduce((s, p) => s + (p.expectedAmount || 0), 0);
  const isFiltered = JSON.stringify([...filters.statuses].sort()) !== JSON.stringify([...STATUS_ORDER].sort())
    || filters.name || filters.client || filters.trainer || filters.dateFrom || filters.dateTo || filters.amountMin !== "" || filters.amountMax !== "";

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Revenue</h2>
          <p className="sub">Every training / project engagement that brings in money.</p>
        </div>
        <button className="btn-primary" onClick={startNew}><Plus size={15} /> New project</button>
      </div>

      <div className="toolbar">
        <div className="toolbar-total">{filtered.length} of {projects.length} projects · <strong>{fmt(total)}</strong> pipeline value</div>
        {isFiltered && <button className="link-btn" onClick={() => setFilters(EMPTY_REVENUE_FILTERS)}>Clear filters</button>}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Project</th><th>Client</th><th>Trainer</th><th>Dates</th><th>Status</th><th className="num">Amount</th><th></th>
            </tr>
            <tr className="filter-row">
              <th><input className="col-filter" placeholder="Filter…" value={filters.name} onChange={(e) => setF({ name: e.target.value })} /></th>
              <th><input className="col-filter" placeholder="Filter…" value={filters.client} onChange={(e) => setF({ client: e.target.value })} /></th>
              <th><input className="col-filter" placeholder="Filter…" value={filters.trainer} onChange={(e) => setF({ trainer: e.target.value })} /></th>
              <th>
                <div className="range-filter">
                  <input type="date" value={filters.dateFrom} onChange={(e) => setF({ dateFrom: e.target.value })} title="From" />
                  <input type="date" value={filters.dateTo} onChange={(e) => setF({ dateTo: e.target.value })} title="To" />
                </div>
              </th>
              <th>
                <MultiSelectFilter label="Status" options={STATUS_ORDER} selected={filters.statuses} onChange={(s) => setF({ statuses: s })} colorFor={(o) => STATUS_COLORS[o]} />
              </th>
              <th className="num">
                <div className="range-filter">
                  <input className="col-filter num-input" type="number" placeholder="Min" value={filters.amountMin} onChange={(e) => setF({ amountMin: e.target.value })} />
                  <input className="col-filter num-input" type="number" placeholder="Max" value={filters.amountMax} onChange={(e) => setF({ amountMax: e.target.value })} />
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isEdit = editingId === p.id;
              return (
                <tr key={p.id} className={isEdit ? "editing" : ""}>
                  {isEdit ? (
                    <>
                      <td><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></td>
                      <td><input value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} /></td>
                      <td><input value={draft.trainer || ""} onChange={(e) => setDraft({ ...draft, trainer: e.target.value })} /></td>
                      <td className="date-cell">
                        <input type="date" value={draft.startDate || ""} onChange={(e) => setDraft({ ...draft, startDate: e.target.value || null })} />
                        <input type="date" value={draft.endDate || ""} onChange={(e) => setDraft({ ...draft, endDate: e.target.value || null })} />
                      </td>
                      <td><Select value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={STATUS_ORDER} /></td>
                      <td className="num"><input className="num-input" type="number" value={draft.expectedAmount} onChange={(e) => setDraft({ ...draft, expectedAmount: parseFloat(e.target.value) || 0 })} /></td>
                      <td className="actions">
                        <button className="icon-btn ok" onClick={save}><Check size={14} /></button>
                        <button className="icon-btn" onClick={() => { setEditingId(null); }}><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="proj-name">{p.name}</td>
                      <td>{p.client}</td>
                      <td>{p.trainer || "—"}</td>
                      <td className="date-cell">{fmtDate(p.startDate)}{p.endDate && p.endDate !== p.startDate ? ` → ${fmtDate(p.endDate)}` : ""}</td>
                      <td><Badge status={p.status} /></td>
                      <td className="num strong">{fmt(p.expectedAmount)}</td>
                      <td className="actions">
                        <button className="icon-btn" onClick={() => startEdit(p)}><Pencil size={13} /></button>
                        <button className="icon-btn danger" onClick={() => remove(p.id)}><Trash2 size={13} /></button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="empty-row">No projects match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Expenses Table
--------------------------------------------------------------- */
const EMPTY_EXPENSE_FILTERS = {
  project: "",
  categories: new Set(EXPENSE_CATEGORIES),
  statuses: new Set(STATUS_ORDER),
  dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
};

function ExpensesTab({ expenses, setExpenses, projects }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [filters, setFilters] = useState(EMPTY_EXPENSE_FILTERS);
  const setF = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const startEdit = (e) => { setEditingId(e.id); setDraft({ ...e }); };
  const startNew = () => {
    const e = { id: uid("e"), projectId: null, projectName: "", category: "Other Cost", date: null, status: "Pipeline", expectedAmount: 0, notes: "" };
    setExpenses([e, ...expenses]);
    startEdit(e);
  };
  const save = () => {
    setExpenses(expenses.map((e) => (e.id === editingId ? draft : e)));
    setEditingId(null); setDraft(null);
  };
  const remove = (id) => setExpenses(expenses.filter((e) => e.id !== id));

  const filtered = expenses.filter((e) => {
    const name = e.projectId ? e.projectName : "General / Recurring";
    if (filters.project && !name.toLowerCase().includes(filters.project.toLowerCase())) return false;
    if (!filters.categories.has(e.category)) return false;
    if (!filters.statuses.has(e.status)) return false;
    if (filters.dateFrom && (!e.date || e.date < filters.dateFrom)) return false;
    if (filters.dateTo && (!e.date || e.date > filters.dateTo)) return false;
    if (filters.amountMin !== "" && (e.expectedAmount || 0) < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax !== "" && (e.expectedAmount || 0) > parseFloat(filters.amountMax)) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => (b.date || "0000").localeCompare(a.date || "0000"));
  const total = filtered.reduce((s, e) => s + (e.expectedAmount || 0), 0);
  const isFiltered = filters.categories.size !== EXPENSE_CATEGORIES.length || filters.statuses.size !== STATUS_ORDER.length
    || filters.project || filters.dateFrom || filters.dateTo || filters.amountMin !== "" || filters.amountMax !== "";

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Expenses</h2>
          <p className="sub">Trainer fees, commissions, office, salary and everything else that goes out.</p>
        </div>
        <button className="btn-primary" onClick={startNew}><Plus size={15} /> New expense</button>
      </div>

      <div className="toolbar">
        <div className="toolbar-total">{filtered.length} of {expenses.length} entries · <strong>{fmt(total)}</strong> total</div>
        {isFiltered && <button className="link-btn" onClick={() => setFilters(EMPTY_EXPENSE_FILTERS)}>Clear filters</button>}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Linked project</th><th>Category</th><th>Date</th><th>Status</th><th className="num">Amount</th><th></th>
            </tr>
            <tr className="filter-row">
              <th><input className="col-filter" placeholder="Filter…" value={filters.project} onChange={(e) => setF({ project: e.target.value })} /></th>
              <th>
                <MultiSelectFilter label="Category" options={EXPENSE_CATEGORIES} selected={filters.categories} onChange={(s) => setF({ categories: s })} />
              </th>
              <th>
                <div className="range-filter">
                  <input type="date" value={filters.dateFrom} onChange={(e) => setF({ dateFrom: e.target.value })} title="From" />
                  <input type="date" value={filters.dateTo} onChange={(e) => setF({ dateTo: e.target.value })} title="To" />
                </div>
              </th>
              <th>
                <MultiSelectFilter label="Status" options={STATUS_ORDER} selected={filters.statuses} onChange={(s) => setF({ statuses: s })} colorFor={(o) => STATUS_COLORS[o]} />
              </th>
              <th className="num">
                <div className="range-filter">
                  <input className="col-filter num-input" type="number" placeholder="Min" value={filters.amountMin} onChange={(e) => setF({ amountMin: e.target.value })} />
                  <input className="col-filter num-input" type="number" placeholder="Max" value={filters.amountMax} onChange={(e) => setF({ amountMax: e.target.value })} />
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const isEdit = editingId === e.id;
              return (
                <tr key={e.id} className={isEdit ? "editing" : ""}>
                  {isEdit ? (
                    <>
                      <td>
                        <Select
                          value={draft.projectId || "none"}
                          onChange={(v) => {
                            if (v === "none") setDraft({ ...draft, projectId: null, projectName: "General / Recurring" });
                            else {
                              const proj = projects.find((p) => p.id === v);
                              setDraft({ ...draft, projectId: v, projectName: proj ? proj.name : "" });
                            }
                          }}
                          options={["none", ...projects.map((p) => p.id)]}
                        />
                      </td>
                      <td><Select value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={EXPENSE_CATEGORIES} /></td>
                      <td><input type="date" value={draft.date || ""} onChange={(ev) => setDraft({ ...draft, date: ev.target.value || null })} /></td>
                      <td><Select value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={STATUS_ORDER} /></td>
                      <td className="num"><input className="num-input" type="number" value={draft.expectedAmount} onChange={(ev) => setDraft({ ...draft, expectedAmount: parseFloat(ev.target.value) || 0 })} /></td>
                      <td className="actions">
                        <button className="icon-btn ok" onClick={save}><Check size={14} /></button>
                        <button className="icon-btn" onClick={() => setEditingId(null)}><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="proj-name">{e.projectId ? e.projectName : <em>General / Recurring</em>}</td>
                      <td><span className="cat-pill">{e.category}</span></td>
                      <td className="date-cell">{fmtDate(e.date)}</td>
                      <td><Badge status={e.status} /></td>
                      <td className="num strong neg">{fmt(e.expectedAmount)}</td>
                      <td className="actions">
                        <button className="icon-btn" onClick={() => startEdit(e)}><Pencil size={13} /></button>
                        <button className="icon-btn danger" onClick={() => remove(e.id)}><Trash2 size={13} /></button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No expenses match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Planning Tab — upcoming projects
--------------------------------------------------------------- */
function PlanningTab({ projects }) {
  const [sortDir, setSortDir] = useState("asc");
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = projects
    .filter((p) => p.status !== "Paid" && p.status !== "Lost")
    .sort((a, b) => {
      const cmp = (a.startDate || "9999").localeCompare(b.startDate || "9999");
      return sortDir === "asc" ? cmp : -cmp;
    });

  const dated = upcoming.filter((p) => p.startDate);
  const undated = upcoming.filter((p) => !p.startDate);

  const daysUntil = (d) => {
    const diff = Math.ceil((new Date(d) - new Date(today)) / 86400000);
    if (diff < 0) return "in progress / past start";
    if (diff === 0) return "starts today";
    return `in ${diff} day${diff > 1 ? "s" : ""}`;
  };

  const totalValue = upcoming.reduce((s, p) => s + (p.expectedAmount || 0), 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Planning</h2>
          <p className="sub">Everything not yet paid or lost, ordered by date — so you can see what's coming and organise around it.</p>
        </div>
        <div className="planning-controls">
          <button className="link-btn sort-toggle" onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}>
            {sortDir === "asc" ? "Soonest first ↑" : "Furthest first ↓"}
          </button>
          <div className="toolbar-total">{upcoming.length} upcoming · <strong>{fmt(totalValue)}</strong> at stake</div>
        </div>
      </div>

      <div className="timeline">
        {dated.map((p) => (
          <div className="timeline-row" key={p.id}>
            <div className="timeline-date">
              <div className="tl-day">{new Date(p.startDate + "T00:00:00").getDate()}</div>
              <div className="tl-month">{new Date(p.startDate + "T00:00:00").toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}</div>
            </div>
            <div className="timeline-line" />
            <div className="timeline-content">
              <div className="tl-top">
                <span className="tl-name">{p.name}</span>
                <Badge status={p.status} />
              </div>
              <div className="tl-meta">{p.client} · {p.trainer || "trainer TBD"} · {daysUntil(p.startDate)}</div>
            </div>
            <div className="tl-amount">{fmt(p.expectedAmount)}</div>
          </div>
        ))}
      </div>

      {undated.length > 0 && (
        <>
          <div className="section-divider">Not scheduled yet</div>
          <div className="pipeline-grid">
            {undated.map((p) => (
              <div className="pipeline-card" key={p.id}>
                <div className="tl-top"><span className="tl-name">{p.name}</span><Badge status={p.status} /></div>
                <div className="tl-meta">{p.client} · {p.trainer || "trainer TBD"}</div>
                <div className="tl-amount">{fmt(p.expectedAmount)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Dashboard Tab
--------------------------------------------------------------- */
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function availableYears(projects, expenses) {
  const years = new Set();
  projects.forEach((p) => { if (p.startDate) years.add(p.startDate.slice(0, 4)); });
  expenses.forEach((e) => { if (e.date) years.add(e.date.slice(0, 4)); });
  return Array.from(years).sort();
}

function matchesPeriod(dateStr, year, month) {
  if (year === "all") return true; // no period filter active
  if (!dateStr) return false; // undated items can't belong to a specific period
  if (dateStr.slice(0, 4) !== year) return false;
  if (month !== "all" && dateStr.slice(5, 7) !== month) return false;
  return true;
}

function DashboardTab({ projects, expenses }) {
  const notLost = (arr) => arr.filter((x) => x.status !== "Lost");
  const years = useMemo(() => availableYears(projects, expenses), [projects, expenses]);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");

  const periodProjects = useMemo(
    () => (year === "all" ? projects : projects.filter((p) => matchesPeriod(p.startDate, year, month))),
    [projects, year, month]
  );
  const periodExpenses = useMemo(
    () => (year === "all" ? expenses : expenses.filter((e) => matchesPeriod(e.date, year, month))),
    [expenses, year, month]
  );
  const excludedUndated = year === "all" ? 0 : projects.filter((p) => !p.startDate).length;

  const periodLabel =
    year === "all" ? "All time" : month === "all" ? year : `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;

  const actualRevenue = periodProjects.filter((p) => p.status === "Paid").reduce((s, p) => s + (p.expectedAmount || 0), 0);
  const expectedRevenue = notLost(periodProjects).reduce((s, p) => s + (p.expectedAmount || 0), 0);
  const actualExpenses = periodExpenses.filter((e) => e.status === "Paid").reduce((s, e) => s + (e.expectedAmount || 0), 0);
  const expectedExpenses = notLost(periodExpenses).reduce((s, e) => s + (e.expectedAmount || 0), 0);
  const actualProfit = actualRevenue - actualExpenses;
  const expectedProfit = expectedRevenue - expectedExpenses;

  const monthly = useMemo(() => {
    const map = {};
    periodProjects.forEach((p) => {
      const k = monthKey(p.startDate);
      if (!map[k]) map[k] = { month: k, actual: 0, expected: 0 };
      if (p.status !== "Lost") map[k].expected += p.expectedAmount || 0;
      if (p.status === "Paid") map[k].actual += p.expectedAmount || 0;
    });
    return Object.values(map)
      .filter((m) => m.month !== "unscheduled")
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({ ...m, label: new Date(m.month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) }));
  }, [periodProjects]);

  const byCategory = useMemo(() => {
    const map = {};
    periodExpenses.forEach((e) => {
      if (e.status === "Lost") return;
      map[e.category] = (map[e.category] || 0) + (e.expectedAmount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodExpenses]);

  const statusFunnel = useMemo(() => {
    const map = {};
    STATUS_ORDER.forEach((s) => (map[s] = 0));
    periodProjects.forEach((p) => { map[p.status] = (map[p.status] || 0) + (p.expectedAmount || 0); });
    return STATUS_ORDER.map((s) => ({ status: s, value: map[s] }));
  }, [periodProjects]);

  const PIE_COLORS = ["#1F6E4A", "#C68A2E", "#3E7CB1", "#B3402F", "#7A5FB5", "#6B7A72", "#9AA39C", "#D9895A"];

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Dashboard</h2>
          <p className="sub">Where the business actually stands, and where it lands if every open deal closes — showing <strong>{periodLabel}</strong>.</p>
        </div>
        <div className="period-picker">
          <Select
            value={year}
            onChange={(v) => { setYear(v); setMonth("all"); }}
            options={["all", ...years]}
            labelFor={(v) => (v === "all" ? "All time" : v)}
          />
          {year !== "all" && (
            <Select
              value={month}
              onChange={setMonth}
              options={["all", ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))]}
              labelFor={(v) => (v === "all" ? "Whole year" : MONTH_NAMES[parseInt(v, 10) - 1])}
            />
          )}
          {year !== "all" && <button className="link-btn" onClick={() => { setYear("all"); setMonth("all"); }}>Reset to all time</button>}
        </div>
      </div>
      {excludedUndated > 0 && (
        <div className="period-note">{excludedUndated} pipeline project{excludedUndated > 1 ? "s" : ""} without a date {excludedUndated > 1 ? "aren't" : "isn't"} shown for this period.</div>
      )}

      <div className="ledger-hero">
        <div className="ledger-col">
          <div className="ledger-tag">ACTUAL — cash in the bank</div>
          <div className="ledger-figure" style={{ color: actualProfit >= 0 ? "#1F6E4A" : "#B3402F" }}>{fmt(actualProfit)}</div>
          <div className="ledger-sub-row">
            <span><Wallet size={13} /> Revenue {fmt(actualRevenue)}</span>
            <span><Receipt size={13} /> Expenses {fmt(actualExpenses)}</span>
          </div>
        </div>
        <div className="ledger-stitch"><span>VS</span></div>
        <div className="ledger-col">
          <div className="ledger-tag">EXPECTED — if every open deal closes</div>
          <div className="ledger-figure" style={{ color: expectedProfit >= 0 ? "#C68A2E" : "#B3402F" }}>{fmt(expectedProfit)}</div>
          <div className="ledger-sub-row">
            <span><Wallet size={13} /> Revenue {fmt(expectedRevenue)}</span>
            <span><Receipt size={13} /> Expenses {fmt(expectedExpenses)}</span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon={TrendingUp} label="Revenue" actual={actualRevenue} expected={expectedRevenue} tone="#1F6E4A" />
        <KpiCard icon={TrendingDown} label="Expenses" actual={actualExpenses} expected={expectedExpenses} tone="#B3402F" />
        <KpiCard icon={Clock3} label="Profit" actual={actualProfit} expected={expectedProfit} tone="#3E7CB1" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Revenue by month — actual vs expected</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7A72" }} axisLine={{ stroke: "#E4E1D6" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7A72" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `€${v}`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E4E1D6", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="expected" name="Expected" fill="#C68A2E" radius={[4, 4, 0, 0]} opacity={0.55} />
              <Bar dataKey="actual" name="Actual" fill="#1F6E4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Expenses by category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {byCategory.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E4E1D6", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Pipeline by status</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statusFunnel} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7A72" }} axisLine={{ stroke: "#E4E1D6" }} tickLine={false} tickFormatter={(v) => `€${v}`} />
            <YAxis type="category" dataKey="status" tick={{ fontSize: 12, fill: "#14231F" }} axisLine={false} tickLine={false} width={80} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: "1px solid #E4E1D6", fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {statusFunnel.map((entry) => <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   App
--------------------------------------------------------------- */
export default function App() {
  const [projects, setProjectsState] = useState(null);
  const [expenses, setExpensesState] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | error

  const projectsRef = useRef(null);
  const expensesRef = useRef(null);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { expensesRef.current = expenses; }, [expenses]);

  useEffect(() => {
    (async () => {
      const { projects: p, expenses: e, source, version } = await loadData();
      const initP = p || SEED_PROJECTS_ALL;
      const initE = e || SEED_EXPENSES;
      setProjectsState(initP);
      setExpensesState(initE);
      setReady(true);
      if (source === "remote") {
        setCurrentVersion(version);
        setDirty(false);
      } else {
        // seed data, or an unsaved local cache from last time — keep it locally and
        // let the person hit Save when they're ready, rather than pushing automatically
        writeLocalCache(initP, initE);
        setDirty(true);
      }
    })();
  }, []);

  // Every local edit updates the instant local cache and marks the ledger as unsaved.
  // Nothing is sent to the API until the person clicks Save.
  const setProjects = useCallback((next) => {
    setProjectsState(next);
    writeLocalCache(next, expensesRef.current);
    setDirty(true);
  }, []);
  const setExpenses = useCallback((next) => {
    setExpensesState(next);
    writeLocalCache(projectsRef.current, next);
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    try {
      const r = await persistRemote(projectsRef.current, expensesRef.current);
      writeLocalCache(projectsRef.current, expensesRef.current);
      setCurrentVersion(r.version);
      setDirty(false);
      setSaveState("idle");
    } catch {
      setSaveState("error");
    }
  }, []);

  // Warn before closing/navigating away with unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (!ready) {
    return (
      <div className="app-shell loading-shell">
        <div className="loader">Loading your ledger…</div>
        <style>{baseCss}</style>
      </div>
    );
  }

  const NAV = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "revenue", label: "Revenue", icon: TrendingUp },
    { key: "expenses", label: "Expenses", icon: TrendingDown },
    { key: "planning", label: "Planning", icon: CalendarClock },
  ];

  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed — retry" : dirty ? "Save" : "Saved ✓";

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="header-top">
          <div className="brand">
            <div className="brand-mark">TL</div>
            <div>
              <div className="brand-title">Training Ledger</div>
              <div className="brand-sub">Projects · Revenue · Expenses · Planning</div>
            </div>
          </div>
          <div className="header-actions">
            <span
              className={`dirty-pill ${dirty ? "dirty" : "clean"}`}
              title={currentVersion ? `Latest saved version: ${currentVersion}` : "Not saved yet"}
            >
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <button
              className={`btn-primary save-btn ${saveState === "error" ? "save-error" : ""}`}
              onClick={handleSave}
              disabled={saveState === "saving" || !dirty}
            >
              {saveLabel}
            </button>
            <HistoryPanel onRestore={(p, ex) => { setProjects(p); setExpenses(ex); }} />
            <button className="ghost-btn" onClick={() => downloadBackup(projects, expenses)}>Backup</button>
            <label className="ghost-btn file-btn">
              Restore
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) restoreBackup(f, (p, ex) => { setProjects(p); setExpenses(ex); });
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <nav className="tabs">
          {NAV.map((n) => (
            <button key={n.key} className={`tab-btn ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
              <n.icon size={15} /> {n.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="app-body">
        {tab === "dashboard" && <DashboardTab projects={projects} expenses={expenses} />}
        {tab === "revenue" && <RevenueTab projects={projects} setProjects={setProjects} />}
        {tab === "expenses" && <ExpensesTab expenses={expenses} setExpenses={setExpenses} projects={projects} />}
        {tab === "planning" && <PlanningTab projects={projects} />}
      </div>

      <style>{baseCss}</style>
    </div>
  );
}

/* ---------------------------------------------------------------
   Styles
--------------------------------------------------------------- */
const baseCss = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }

.app-shell {
  font-family: 'Inter', system-ui, sans-serif;
  background: #EFEEE5;
  color: #14231F;
  min-height: 100vh;
}
.loading-shell { display:flex; align-items:center; justify-content:center; min-height: 400px; }
.loader { font-family: 'Fraunces', serif; font-size: 18px; color: #6B7A72; }

.app-header {
  background: #14231F;
  color: #EFEEE5;
  padding: 20px 28px 0 28px;
}
.header-top { display:flex; align-items:flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.header-actions { display:flex; gap: 8px; margin-top: 2px; align-items: center; }
.dirty-pill {
  font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px;
  border: 1px solid #3A4A44; white-space: nowrap;
}
.dirty-pill.clean { color: #4CA97A; border-color: #4CA97A55; }
.dirty-pill.dirty { color: #C68A2E; border-color: #C68A2E55; }
.save-btn { padding: 8px 16px; font-size: 12.5px; }
.save-btn:disabled { opacity: 0.55; cursor: default; }
.save-btn.save-error { background: #B3402F; }
.save-btn.save-error:hover { background: #94331F; }

.history-wrap { position: relative; }
.history-panel {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 30;
  background: #fff; border: 1px solid #E4E1D6; border-radius: 10px;
  width: 260px; max-height: 320px; overflow-y: auto;
  box-shadow: 0 10px 28px rgba(20,35,31,0.18); color: #14231F;
}
.history-head {
  display:flex; align-items:center; justify-content:space-between;
  padding: 10px 12px; font-size: 12px; font-weight: 700; color: #6B7A72;
  text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #EFEEE5;
  position: sticky; top: 0; background: #fff;
}
.history-empty { padding: 16px 12px; font-size: 12.5px; color: #9AA39C; }
.history-row {
  display:flex; align-items:center; justify-content:space-between; gap: 10px;
  padding: 10px 12px; border-bottom: 1px solid #FAF9F4; font-size: 12.5px;
}
.history-row:last-child { border-bottom: none; }
.history-date { font-weight: 600; }
.history-latest { color: #1F6E4A; font-weight: 700; }
.history-size { color: #9AA39C; font-size: 11px; margin-top: 2px; }
.ghost-btn {
  background: transparent; border: 1px solid #3A4A44; color: #9AA39C;
  padding: 6px 12px; border-radius: 7px; font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: 'Inter', sans-serif; position: relative;
}
.ghost-btn:hover { color: #EFEEE5; border-color: #5A6A64; }
.file-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
.brand { display:flex; align-items:center; gap: 12px; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 8px;
  background: #1F6E4A; color: #EFEEE5;
  display:flex; align-items:center; justify-content:center;
  font-family: 'Fraunces', serif; font-weight: 600; font-size: 15px;
}
.brand-title { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; letter-spacing: 0.2px; }
.brand-sub { font-size: 11.5px; color: #9AA39C; margin-top: 1px; }

.tabs { display:flex; gap: 4px; }
.tab-btn {
  display:flex; align-items:center; gap: 7px;
  background: transparent; border: none; color: #9AA39C;
  padding: 10px 16px; font-size: 13.5px; font-weight: 500;
  cursor: pointer; border-bottom: 2px solid transparent;
  font-family: 'Inter', sans-serif;
  transition: color .15s ease;
}
.tab-btn:hover { color: #EFEEE5; }
.tab-btn.active { color: #EFEEE5; border-bottom: 2px solid #C68A2E; }

.app-body { padding: 26px 28px 36px 28px; }

.panel-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.period-picker { display:flex; align-items:center; gap: 8px; flex-wrap: wrap; }
.period-note { font-size: 12px; color: #9AA39C; margin: -12px 0 16px 0; }
.panel-header h2 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 600; margin: 0 0 4px 0; }
.panel-header .sub { margin: 0; font-size: 13px; color: #6B7A72; max-width: 480px; }

.btn-primary {
  display:flex; align-items:center; gap: 6px;
  background: #1F6E4A; color: #fff; border: none;
  padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif;
  transition: background .15s ease;
}
.btn-primary:hover { background: #195A3B; }

/* Ledger hero */
.ledger-hero {
  display:flex; align-items:stretch; gap: 0;
  background: #fff; border: 1px solid #E4E1D6; border-radius: 14px;
  padding: 26px 30px; margin-bottom: 22px; position: relative;
}
.ledger-col { flex: 1; display:flex; flex-direction: column; gap: 8px; }
.ledger-tag { font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase; color: #6B7A72; font-weight: 600; }
.ledger-figure { font-family: 'IBM Plex Mono', monospace; font-size: 34px; font-weight: 500; }
.ledger-sub-row { display:flex; gap: 18px; font-size: 12.5px; color: #6B7A72; }
.ledger-sub-row span { display:flex; align-items:center; gap: 5px; }
.ledger-stitch {
  width: 60px; display:flex; align-items:center; justify-content:center;
  position: relative;
}
.ledger-stitch::before {
  content: ""; position: absolute; top: 4px; bottom: 4px; left: 50%;
  border-left: 2px dashed #D8D4C6;
}
.ledger-stitch span {
  background: #EFEEE5; border: 1px solid #D8D4C6; color: #9AA39C;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  padding: 4px 6px; border-radius: 20px; z-index: 1; position: relative;
  font-family: 'IBM Plex Mono', monospace;
}

.kpi-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
.kpi-card { background: #fff; border: 1px solid #E4E1D6; border-radius: 12px; padding: 16px 18px; }
.kpi-top { display:flex; align-items:center; gap: 8px; margin-bottom: 10px; }
.kpi-icon { width: 26px; height: 26px; border-radius: 7px; display:flex; align-items:center; justify-content:center; }
.kpi-label { font-size: 12.5px; font-weight: 600; color: #6B7A72; }
.kpi-actual { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 500; color: #14231F; }
.kpi-expected { font-size: 11.5px; color: #9AA39C; margin-top: 4px; display:flex; align-items:center; }

.chart-grid { display:grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-bottom: 14px; }
.chart-card { background: #fff; border: 1px solid #E4E1D6; border-radius: 12px; padding: 16px 18px 6px 18px; }
.chart-card h3 { font-size: 13.5px; font-weight: 600; margin: 0 0 6px 0; color: #14231F; }

.toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
.toolbar-total { font-size: 12.5px; color: #6B7A72; }
.toolbar-total strong { color: #14231F; }
.link-btn {
  background: none; border: none; color: #3E7CB1; font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif; padding: 0;
}
.link-btn:hover { text-decoration: underline; }
.planning-controls { display:flex; align-items:center; gap: 16px; }
.sort-toggle { white-space: nowrap; }

/* Per-column filter row */
tr.filter-row th { padding: 7px 10px; background: #FAF9F4; border-bottom: 1px solid #E4E1D6; }
.col-filter {
  border: 1px solid #D8D4C6; border-radius: 6px; padding: 5px 8px; font-size: 12px;
  font-family: 'Inter', sans-serif; width: 100%; color: #14231F; background: #fff;
}
.range-filter { display:flex; gap: 4px; }
.range-filter input { min-width: 0; }
.range-filter input[type="date"] { font-size: 11px; padding: 5px 4px; }

.msf { position: relative; }
.msf summary {
  list-style: none; cursor: pointer; display:flex; align-items:center; gap: 5px;
  border: 1px solid #D8D4C6; border-radius: 6px; padding: 5px 9px; font-size: 12px;
  color: #14231F; background: #fff; white-space: nowrap;
}
.msf summary::-webkit-details-marker { display: none; }
.msf-panel {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: 20;
  background: #fff; border: 1px solid #E4E1D6; border-radius: 8px;
  padding: 6px; min-width: 160px; box-shadow: 0 6px 18px rgba(20,35,31,0.12);
  display:flex; flex-direction: column; gap: 2px; max-height: 220px; overflow-y: auto;
}
.msf-option { display:flex; align-items:center; gap: 7px; font-size: 12.5px; padding: 5px 6px; border-radius: 5px; cursor: pointer; white-space: nowrap; }
.msf-option:hover { background: #FAF9F4; }
.msf-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.msf-all {
  font-size: 11px; font-weight: 600; color: #3E7CB1; background: none; border: none;
  text-align: left; padding: 5px 6px; cursor: pointer; border-bottom: 1px solid #EFEEE5; margin-bottom: 2px;
}
.empty-row { text-align: center; color: #9AA39C; font-size: 13px; padding: 28px 0 !important; }

.select-wrap { position: relative; display:inline-flex; align-items:center; }
.select-wrap select {
  appearance: none; background: #fff; border: 1px solid #D8D4C6; border-radius: 7px;
  padding: 6px 26px 6px 10px; font-size: 12.5px; color: #14231F; font-family: 'Inter', sans-serif;
  cursor: pointer;
}
.select-chevron { position: absolute; right: 8px; pointer-events: none; color: #9AA39C; }

.badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }

.table-scroll { overflow-x: auto; background: #fff; border: 1px solid #E4E1D6; border-radius: 12px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px;
  color: #9AA39C; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #E4E1D6;
}
th.num, td.num { text-align: right; }
tbody td { padding: 11px 14px; border-bottom: 1px solid #EFEEE5; vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #FAF9F4; }
tbody tr.editing { background: #FBF6EA; }
.proj-name { font-weight: 600; }
.date-cell { display:flex; gap: 6px; font-size: 12.5px; color: #6B7A72; align-items:center; flex-wrap: wrap; }
.num.strong { font-family: 'IBM Plex Mono', monospace; font-weight: 500; }
.num.strong.neg { color: #B3402F; }
.actions { display:flex; gap: 6px; justify-content: flex-end; }
.icon-btn {
  background: transparent; border: 1px solid #E4E1D6; color: #6B7A72;
  width: 26px; height: 26px; border-radius: 6px; display:flex; align-items:center; justify-content:center;
  cursor: pointer;
}
.icon-btn:hover { background: #F3F1E7; }
.icon-btn.danger:hover { color: #B3402F; border-color: #B3402F55; }
.icon-btn.ok { color: #1F6E4A; border-color: #1F6E4A55; }
.cat-pill { background: #EFEEE5; padding: 3px 9px; border-radius: 6px; font-size: 11.5px; color: #14231F; }

input[type="text"], input[type="number"], input[type="date"], input:not([type]) {
  border: 1px solid #D8D4C6; border-radius: 6px; padding: 6px 8px; font-size: 12.5px;
  font-family: 'Inter', sans-serif; width: 100%; color: #14231F;
}
.num-input { text-align: right; font-family: 'IBM Plex Mono', monospace; }

/* Planning timeline */
.timeline { display:flex; flex-direction: column; }
.timeline-row { display:flex; align-items:center; gap: 16px; padding: 14px 6px; border-bottom: 1px solid #E4E1D6; }
.timeline-row:last-child { border-bottom: none; }
.timeline-date { width: 52px; text-align:center; flex-shrink: 0; }
.tl-day { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; line-height: 1; }
.tl-month { font-size: 10.5px; color: #9AA39C; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }
.timeline-line { width: 2px; align-self: stretch; background: #E4E1D6; flex-shrink: 0; }
.timeline-content { flex: 1; min-width: 0; }
.tl-top { display:flex; align-items:center; gap: 10px; margin-bottom: 4px; }
.tl-name { font-weight: 600; font-size: 13.5px; }
.tl-meta { font-size: 12px; color: #6B7A72; }
.tl-amount { font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 14px; flex-shrink: 0; }

.section-divider {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #9AA39C; font-weight: 700;
  margin: 22px 0 12px 4px;
}
.pipeline-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.pipeline-card { background: #fff; border: 1px solid #E4E1D6; border-radius: 10px; padding: 14px; }

@media (max-width: 780px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .chart-grid { grid-template-columns: 1fr; }
  .ledger-hero { flex-direction: column; gap: 18px; }
  .ledger-stitch { display:none; }
  .app-header { padding: 16px 16px 0 16px; }
  .app-body { padding: 18px 14px 30px 14px; }
  .tabs { overflow-x: auto; }
}
`;
