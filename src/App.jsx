import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, CalendarClock, Plus, Trash2,
  Pencil, X, Check, ChevronDown, Wallet, Receipt, Clock3, Target,
  List, Calendar, ChevronLeft, ChevronRight, AlertTriangle, Copy
} from "lucide-react";

/* ---------------------------------------------------------------
   SEED DATA - imported from the user's existing tracking sheet
--------------------------------------------------------------- */
const SEED_PROJECTS_ALL = [{"id": "p1", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Efrei - Cloud Intro", "startDate": "2026-03-09", "endDate": "2026-03-13", "status": "Paid", "expectedAmount": 2765, "notes": ""}, {"id": "p2", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Efrei - DP600 - Aug (1/2)", "startDate": "2026-07-06", "endDate": "2026-07-07", "status": "Scheduled", "expectedAmount": 1176, "notes": ""}, {"id": "p3", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Efrei - DP600 - Aug (2/2)", "startDate": "2026-08-31", "endDate": "2026-09-02", "status": "Scheduled", "expectedAmount": 1764, "notes": ""}, {"id": "p4", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Monaim Touinsi", "topic": "Training", "name": "Efrei - DP600 - Sep", "startDate": "2026-08-31", "endDate": "2026-09-04", "status": "Scheduled", "expectedAmount": 2940, "notes": ""}, {"id": "p5", "type": "revenue", "client": "Crossthink ", "contact": "Arnaud ", "source": "Ilyes & Alexis", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Crossthink  - Apr - Week 1", "startDate": "2026-03-30", "endDate": "2026-04-03", "status": "Lost", "expectedAmount": 4750, "notes": ""}, {"id": "p6", "type": "revenue", "client": "Crossthink ", "contact": "Arnaud ", "source": "Ilyes & Alexis", "trainer": "Salahedine Bejaoui", "topic": "Training", "name": "Crossthink  - Apr - Week 2 & 3", "startDate": "2026-04-07", "endDate": "2026-04-17", "status": "Lost", "expectedAmount": 8550, "notes": ""}, {"id": "p7", "type": "revenue", "client": "Crossthink ", "contact": "Arnaud ", "source": "Ilyes & Alexis", "trainer": "Mouad MIKOU", "topic": "Training", "name": "Crossthink  - Apr - Week 4", "startDate": "2026-04-20", "endDate": "2026-04-24", "status": "Lost", "expectedAmount": 4750, "notes": ""}, {"id": "p8", "type": "revenue", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Monaim Touinsi", "topic": "Training", "name": "FastLane - AZ204", "startDate": "2026-05-18", "endDate": "2026-05-22", "status": "Lost", "expectedAmount": 2300, "notes": ""}, {"id": "p9", "type": "revenue", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Youssef ElGandouli", "topic": "Training", "name": "FastLane - AZ700", "startDate": "2026-04-07", "endDate": "2026-04-10", "status": "Lost", "expectedAmount": 1840, "notes": ""}, {"id": "p10", "type": "revenue", "client": "Cellenza", "contact": "Alain\u00a0GIANSILY", "source": "N/A", "trainer": "Mouad MIKOU", "topic": "Training", "name": "Cellenza - AZ500", "startDate": "2026-03-16", "endDate": "2026-03-19", "status": "Paid", "expectedAmount": 3000, "notes": ""}, {"id": "p11", "type": "internal", "client": "Pearson Vue", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Pearson AZ-500", "startDate": "2026-02-27", "endDate": "2026-02-27", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p12", "type": "internal", "client": "Pearson Vue", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Pearson AZ-204", "startDate": "2026-03-01", "endDate": "2026-03-01", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p13", "type": "internal", "client": "Eni Editions", "contact": "Vanessa Dallerac", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Eni - Certification Formateur", "startDate": "2026-03-06", "endDate": "2026-03-06", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p14", "type": "internal", "client": "Eni Editions", "contact": "Vanessa Dallerac", "source": "N/A", "trainer": "N/A", "topic": "Certification", "name": "Eni - Devis Habilitation (3 certifs)", "startDate": "2026-03-12", "endDate": "2026-03-12", "status": "Paid", "expectedAmount": 0, "notes": ""}, {"id": "p15", "type": "revenue", "client": "IWG", "contact": "N/A", "source": "N/A", "trainer": "N/A", "topic": "Office", "name": "IWG - Office - Retour Caution", "startDate": "2026-03-12", "endDate": "2026-03-12", "status": "Paid", "expectedAmount": 186.9, "notes": ""}, {"id": "p16", "type": "revenue", "client": "Cellenza", "contact": "Alain\u00a0GIANSILY", "source": "N/A", "trainer": "Ahmed Tahri", "topic": "Training", "name": "Cellenza - Custom", "startDate": "2026-05-19", "endDate": "2026-05-20", "status": "Invoiced", "expectedAmount": 4500, "notes": ""}, {"id": "p17", "type": "revenue", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Youssef ElGandouli", "topic": "Training", "name": "FastLane MD-102", "startDate": "2026-05-18", "endDate": "2026-05-22", "status": "Invoiced", "expectedAmount": 2300, "notes": ""}, {"id": "p18", "type": "revenue", "client": "FastLane", "contact": "Sarah Medjeber", "source": "N/A", "trainer": "Youssef ElGandouli", "topic": "Training", "name": "FastLane MD-102", "startDate": "2026-06-01", "endDate": "2026-06-05", "status": "Scheduled", "expectedAmount": 2300, "notes": ""}, {"id": "p19", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Oussama EDDAI", "topic": "Training", "name": "Efrei - Cloud Intro 2 (1/2)", "startDate": "2027-01-04", "endDate": "2027-01-05", "status": "Scheduled", "expectedAmount": 0, "notes": ""}, {"id": "p20", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Oussama EDDAI", "topic": "Training", "name": "Efrei - Cloud Intro 2 (2/2)", "startDate": "2027-01-12", "endDate": "2027-01-13", "status": "Scheduled", "expectedAmount": 0, "notes": ""}, {"id": "p21", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": "Oussama EDDAI or Monaim", "topic": "Training", "name": "Efrei - Cloud Intro 3", "startDate": null, "endDate": null, "status": "Scheduled", "expectedAmount": 2212, "notes": ""}, {"id": "p22", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei -  AZ104 - 1", "startDate": null, "endDate": null, "status": "Signed", "expectedAmount": 0, "notes": ""}, {"id": "p23", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei -  AZ104 - 2", "startDate": null, "endDate": null, "status": "Signed", "expectedAmount": 0, "notes": ""}, {"id": "p24", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei - DP700 - 1", "startDate": null, "endDate": null, "status": "Signed", "expectedAmount": 0, "notes": ""}, {"id": "p25", "type": "revenue", "client": "Efrei", "contact": "Julien", "source": "Ilyes & Alexis", "trainer": null, "topic": "Training", "name": "Efrei - DP700 - 2", "startDate": null, "endDate": null, "status": "Signed", "expectedAmount": 0, "notes": ""}];

const SEED_EXPENSES = [{"id": "e1", "projectId": "p1", "projectName": "Efrei - Cloud Intro", "category": "Trainer Fee", "date": "2026-03-09", "status": "Paid", "expectedAmount": 2150, "notes": ""}, {"id": "e2", "projectId": "p1", "projectName": "Efrei - Cloud Intro", "category": "Commission", "date": "2026-03-09", "status": "Paid", "expectedAmount": 307.5, "notes": ""}, {"id": "e3", "projectId": null, "projectName": "IWG - Office", "category": "Office", "date": "2026-01-01", "status": "Paid", "expectedAmount": 278.58, "notes": ""}, {"id": "e4", "projectId": "p2", "projectName": "Efrei - DP600 - Aug (1/2)", "category": "Trainer Fee", "date": "2026-07-06", "status": "Signed", "expectedAmount": 860, "notes": ""}, {"id": "e5", "projectId": "p2", "projectName": "Efrei - DP600 - Aug (1/2)", "category": "Commission", "date": "2026-07-06", "status": "Signed", "expectedAmount": 158, "notes": ""}, {"id": "e6", "projectId": "p3", "projectName": "Efrei - DP600 - Aug (2/2)", "category": "Trainer Fee", "date": "2026-08-31", "status": "Signed", "expectedAmount": 1290, "notes": ""}, {"id": "e7", "projectId": "p3", "projectName": "Efrei - DP600 - Aug (2/2)", "category": "Commission", "date": "2026-08-31", "status": "Signed", "expectedAmount": 237, "notes": ""}, {"id": "e8", "projectId": "p4", "projectName": "Efrei - DP600 - Sep", "category": "Trainer Fee", "date": "2026-08-31", "status": "Signed", "expectedAmount": 2150, "notes": ""}, {"id": "e9", "projectId": "p4", "projectName": "Efrei - DP600 - Sep", "category": "Commission", "date": "2026-08-31", "status": "Signed", "expectedAmount": 395, "notes": ""}, {"id": "e10", "projectId": "p5", "projectName": "Crossthink  - Apr - Week 1", "category": "Trainer Fee", "date": "2026-03-30", "status": "Signed", "expectedAmount": 4000, "notes": ""}, {"id": "e11", "projectId": "p5", "projectName": "Crossthink  - Apr - Week 1", "category": "Commission", "date": "2026-03-30", "status": "Signed", "expectedAmount": 375, "notes": ""}, {"id": "e12", "projectId": "p6", "projectName": "Crossthink  - Apr - Week 2 & 3", "category": "Trainer Fee", "date": "2026-04-07", "status": "Signed", "expectedAmount": 4950, "notes": ""}, {"id": "e13", "projectId": "p6", "projectName": "Crossthink  - Apr - Week 2 & 3", "category": "Commission", "date": "2026-04-07", "status": "Signed", "expectedAmount": 1800, "notes": ""}, {"id": "e14", "projectId": "p7", "projectName": "Crossthink  - Apr - Week 4", "category": "Trainer Fee", "date": "2026-04-20", "status": "Signed", "expectedAmount": 4000, "notes": ""}, {"id": "e15", "projectId": "p7", "projectName": "Crossthink  - Apr - Week 4", "category": "Commission", "date": "2026-04-20", "status": "Signed", "expectedAmount": 375, "notes": ""}, {"id": "e16", "projectId": "p8", "projectName": "FastLane - AZ204", "category": "Trainer Fee", "date": "2026-05-18", "status": "Signed", "expectedAmount": 1750, "notes": ""}, {"id": "e17", "projectId": "p9", "projectName": "FastLane - AZ700", "category": "Trainer Fee", "date": "2026-04-07", "status": "Signed", "expectedAmount": 1000, "notes": ""}, {"id": "e18", "projectId": "p9", "projectName": "FastLane - AZ700", "category": "Other Cost", "date": "2026-04-07", "status": "Signed", "expectedAmount": 100, "notes": ""}, {"id": "e19", "projectId": "p10", "projectName": "Cellenza - AZ500", "category": "Trainer Fee", "date": "2026-03-16", "status": "Paid", "expectedAmount": 2800, "notes": ""}, {"id": "e20", "projectId": null, "projectName": "Ichrak - Janvier", "category": "Salary", "date": "2026-01-01", "status": "Paid", "expectedAmount": 200, "notes": ""}, {"id": "e21", "projectId": null, "projectName": "Ichrak - Fevrier", "category": "Salary", "date": "2026-02-01", "status": "Paid", "expectedAmount": 300, "notes": ""}, {"id": "e22", "projectId": null, "projectName": "IWG - Office", "category": "Office", "date": "2026-02-01", "status": "Paid", "expectedAmount": 69.2, "notes": ""}, {"id": "e23", "projectId": "p11", "projectName": "Pearson AZ-500", "category": "Certification", "date": "2026-02-27", "status": "Paid", "expectedAmount": 37.8, "notes": ""}, {"id": "e24", "projectId": "p12", "projectName": "Pearson AZ-204", "category": "Certification", "date": "2026-03-01", "status": "Paid", "expectedAmount": 37.8, "notes": ""}, {"id": "e25", "projectId": "p13", "projectName": "Eni - Certification Formateur", "category": "Certification", "date": "2026-03-06", "status": "Paid", "expectedAmount": 420, "notes": ""}, {"id": "e26", "projectId": "p14", "projectName": "Eni - Devis Habilitation (3 certifs)", "category": "Certification", "date": "2026-03-12", "status": "Paid", "expectedAmount": 630, "notes": ""}, {"id": "e27", "projectId": "p16", "projectName": "Cellenza - Custom", "category": "Trainer Fee", "date": "2026-05-19", "status": "Invoiced", "expectedAmount": 3500, "notes": ""}, {"id": "e28", "projectId": "p17", "projectName": "FastLane MD-102", "category": "Trainer Fee", "date": "2026-05-18", "status": "Invoiced", "expectedAmount": 1250, "notes": ""}, {"id": "e29", "projectId": "p17", "projectName": "FastLane MD-102", "category": "Other Cost", "date": "2026-05-18", "status": "Invoiced", "expectedAmount": 100, "notes": ""}, {"id": "e30", "projectId": null, "projectName": "Ichrak - Mars", "category": "Salary", "date": "2026-03-01", "status": "Paid", "expectedAmount": 280, "notes": ""}, {"id": "e31", "projectId": null, "projectName": "FZ - Avril & Mai", "category": "Salary", "date": "2026-04-01", "status": "Invoiced", "expectedAmount": 200, "notes": ""}, {"id": "e32", "projectId": null, "projectName": "Teams Sub", "category": "Software", "date": "2026-04-01", "status": "Paid", "expectedAmount": 6.24, "notes": ""}, {"id": "e33", "projectId": null, "projectName": "WebSite + Intranet Dev ", "category": "Salary", "date": "2026-02-02", "status": "Paid", "expectedAmount": 1200, "notes": ""}, {"id": "e34", "projectId": null, "projectName": "Amine - Avril & Mai", "category": "Salary", "date": "2026-04-01", "status": "Paid", "expectedAmount": 380, "notes": ""}, {"id": "e35", "projectId": "p18", "projectName": "FastLane MD-102", "category": "Trainer Fee", "date": "2026-06-01", "status": "Signed", "expectedAmount": 1250, "notes": ""}, {"id": "e36", "projectId": null, "projectName": "Teams Sub", "category": "Software", "date": "2026-05-01", "status": "Paid", "expectedAmount": 6.24, "notes": ""}, {"id": "e37", "projectId": "p21", "projectName": "Efrei - Cloud Intro 3", "category": "Trainer Fee", "date": null, "status": "Signed", "expectedAmount": 2000, "notes": ""}];

const STATUS_ORDER = ["Signed", "Scheduled", "Delivered", "Invoiced", "Paid", "Lost"];
// Expenses have a simpler payment lifecycle than Revenue deals - just these 3.
const EXPENSE_STATUS_ORDER = ["Signed", "Invoiced", "Paid"];
const STATUS_COLORS = {
  Signed: "#6FA8D8",
  Scheduled: "#D9A24A",
  Delivered: "#5FBF95",
  Invoiced: "#9B85D1",
  Paid: "#34A87A",
  Lost: "#E0695A",
};
const EXPENSE_CATEGORIES = ["Trainer Fee", "Commission", "Certification", "Other Cost", "Office", "Salary", "Software", "Travel", "Other"];

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return "-";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const uid = (p) => p + Math.random().toString(36).slice(2, 9);

/* ---------------------------------------------------------------
   Storage - the source of truth is a shared Azure Function
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
/** Lets a single project (one payment) have extra, non-contiguous session dates
 *  beyond its primary start/end range — e.g. a training split across scattered days. */
function ExtraDatesEditor({ dates, onChange }) {
  const [draftDate, setDraftDate] = useState("");
  const add = () => {
    if (!draftDate || dates.includes(draftDate)) return;
    onChange([...dates, draftDate].sort());
    setDraftDate("");
  };
  const remove = (d) => onChange(dates.filter((x) => x !== d));

  return (
    <div className="extra-dates-editor">
      {dates.length > 0 && (
        <div className="extra-dates-list">
          {dates.map((d) => (
            <span className="extra-date-chip" key={d}>
              {fmtDate(d)}
              <button type="button" onClick={() => remove(d)} aria-label={`Remove ${d}`}><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="extra-dates-add">
        <input type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
        <button type="button" className="icon-btn" onClick={add} aria-label="Add date"><Plus size={12} /></button>
      </div>
    </div>
  );
}

function MultiSelectFilter({ label, options, selected, onChange, colorFor }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const allSelected = selected.size === options.length;
  const toggle = (opt) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(next);
  };
  const summary = allSelected ? label : selected.size === 0 ? `${label}: none` : `${label}: ${selected.size}`;

  const openPanel = () => {
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="msf">
      <button type="button" ref={btnRef} className="msf-trigger" onClick={() => (open ? setOpen(false) : openPanel())}>
        {summary}<ChevronDown size={12} />
      </button>
      {open && createPortal(
        <div className="msf-panel" ref={panelRef} style={{ top: pos.top, left: pos.left }}>
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
        </div>,
        document.body
      )}
    </div>
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
          {error && <div className="history-empty">Couldn't reach the history API. Is the app deployed with the Storage Account connected?</div>}
          {versions && versions.length === 0 && <div className="history-empty">No saved versions yet. Your first save will show up here.</div>}
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
  name: "", client: "", contact: "", trainer: "",
  statuses: new Set(STATUS_ORDER),
  dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
};

function RevenueTab({ projects, setProjects }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [pendingNewId, setPendingNewId] = useState(null); // id of a just-created row not yet saved
  const [filters, setFilters] = useState(EMPTY_REVENUE_FILTERS);
  const [typeView, setTypeView] = useState("revenue"); // "revenue" | "internal" | "all"
  const setF = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const startEdit = (p) => { setEditingId(p.id); setDraft({ ...p }); };
  const startNew = () => {
    const p = { id: uid("p"), type: typeView === "internal" ? "internal" : "revenue", client: "", contact: "", source: "", trainer: "", topic: "Training", name: "New project", startDate: null, endDate: null, extraDates: [], status: "Signed", expectedAmount: 0, notes: "" };
    setProjects([p, ...projects]);
    setPendingNewId(p.id);
    startEdit(p);
  };
  const save = () => {
    setProjects(projects.map((p) => (p.id === editingId ? draft : p)));
    setEditingId(null); setDraft(null); setPendingNewId(null);
  };
  const cancelEdit = () => {
    if (pendingNewId === editingId) {
      // never actually saved - discard the row rather than leaving a stray blank/duplicate behind
      setProjects(projects.filter((p) => p.id !== editingId));
    }
    setEditingId(null); setDraft(null); setPendingNewId(null);
  };
  const remove = (id) => setProjects(projects.filter((p) => p.id !== id));
  const duplicate = (p) => {
    const copy = { ...p, id: uid("p"), extraDates: [...(p.extraDates || [])] };
    setProjects([copy, ...projects]);
    setPendingNewId(copy.id);
    startEdit(copy);
  };

  const inTypeView = projects.filter((p) => typeView === "all" || (p.type || "revenue") === typeView);
  const filtered = inTypeView.filter((p) => {
    if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.client && !(p.client || "").toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.contact && !(p.contact || "").toLowerCase().includes(filters.contact.toLowerCase())) return false;
    if (filters.trainer && !(p.trainer || "").toLowerCase().includes(filters.trainer.toLowerCase())) return false;
    if (!filters.statuses.has(p.status)) return false;
    if (filters.dateFrom && (!p.startDate || p.startDate < filters.dateFrom)) return false;
    if (filters.dateTo && (!p.startDate || p.startDate > filters.dateTo)) return false;
    if (filters.amountMin !== "" && (p.expectedAmount || 0) < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax !== "" && (p.expectedAmount || 0) > parseFloat(filters.amountMax)) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (pendingNewId === editingId) {
      if (a.id === editingId) return -1;
      if (b.id === editingId) return 1;
    }
    return (b.startDate || "0000").localeCompare(a.startDate || "0000");
  });
  const total = filtered.reduce((s, p) => s + (p.expectedAmount || 0), 0);
  const isFiltered = JSON.stringify([...filters.statuses].sort()) !== JSON.stringify([...STATUS_ORDER].sort())
    || filters.name || filters.client || filters.contact || filters.trainer || filters.dateFrom || filters.dateTo || filters.amountMin !== "" || filters.amountMax !== "";

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Revenue</h2>
          <p className="sub">Client engagements that bring in money. Your own trainings/certifications live under "Internal" (no client, but still worth tracking).</p>
        </div>
        <button className="btn-primary" onClick={startNew}><Plus size={15} /> New project</button>
      </div>

      <div className="type-toggle">
        <button className={typeView === "all" ? "active" : ""} onClick={() => setTypeView("all")}>All</button>
        <button className={typeView === "revenue" ? "active" : ""} onClick={() => setTypeView("revenue")}>Client</button>
        <button className={typeView === "internal" ? "active" : ""} onClick={() => setTypeView("internal")}>Internal</button>
      </div>

      <div className="toolbar">
        <div className="toolbar-total">{filtered.length} of {inTypeView.length} {typeView === "internal" ? "internal items" : "projects"} · <strong>{fmt(total)}</strong> {typeView === "internal" ? "cost" : "pipeline value"}</div>
        {isFiltered && <button className="link-btn" onClick={() => setFilters(EMPTY_REVENUE_FILTERS)}>Clear filters</button>}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th></th><th>Project</th><th>Client</th><th>Contact</th><th>Trainer</th><th>Dates</th><th>Status</th><th className="num" title="Always enter amounts excluding VAT (HT)">Amount (HT)</th>
            </tr>
            <tr className="filter-row">
              <th></th>
              <th><input className="col-filter" placeholder="Filter…" value={filters.name} onChange={(e) => setF({ name: e.target.value })} /></th>
              <th><input className="col-filter" placeholder="Filter…" value={filters.client} onChange={(e) => setF({ client: e.target.value })} /></th>
              <th><input className="col-filter" placeholder="Filter…" value={filters.contact} onChange={(e) => setF({ contact: e.target.value })} /></th>
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
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isEdit = editingId === p.id;
              return (
                <tr key={p.id} className={isEdit ? "editing" : ""}>
                  {isEdit ? (
                    <>
                      <td className="actions">
                        <button className="icon-btn ok" onClick={save} aria-label="Save"><Check size={14} /></button>
                        <button className="icon-btn" onClick={cancelEdit} aria-label="Cancel"><X size={14} /></button>
                      </td>
                      <td>
                        <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                        <div className="inline-type-toggle">
                          <button type="button" className={draft.type !== "internal" ? "active" : ""} onClick={() => setDraft((d) => ({ ...d, type: "revenue" }))}>Client</button>
                          <button type="button" className={draft.type === "internal" ? "active" : ""} onClick={() => setDraft((d) => ({ ...d, type: "internal" }))}>Internal</button>
                        </div>
                      </td>
                      <td><input value={draft.client} onChange={(e) => setDraft((d) => ({ ...d, client: e.target.value }))} /></td>
                      <td><input value={draft.contact || ""} onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))} /></td>
                      <td><input value={draft.trainer || ""} onChange={(e) => setDraft((d) => ({ ...d, trainer: e.target.value }))} /></td>
                      <td className="date-cell">
                        <input type="date" value={draft.startDate || ""} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value || null }))} />
                        <input type="date" value={draft.endDate || ""} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value || null }))} />
                        <ExtraDatesEditor
                          dates={draft.extraDates || []}
                          onChange={(next) => setDraft((d) => ({ ...d, extraDates: next }))}
                        />
                      </td>
                      <td><Select value={draft.status} onChange={(v) => setDraft((d) => ({ ...d, status: v }))} options={STATUS_ORDER} /></td>
                      <td className="num"><input className="num-input" type="number" value={draft.expectedAmount} onChange={(e) => setDraft((d) => ({ ...d, expectedAmount: parseFloat(e.target.value) || 0 }))} /><div className="ht-hint">HT (excl. VAT)</div></td>
                    </>
                  ) : (
                    <>
                      <td className="actions">
                        <button className="icon-btn" onClick={() => startEdit(p)} aria-label="Edit"><Pencil size={13} /></button>
                        <button className="icon-btn" onClick={() => duplicate(p)} aria-label="Duplicate"><Copy size={13} /></button>
                        <button className="icon-btn danger" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 size={13} /></button>
                      </td>
                      <td className="proj-name">{p.name}{p.type === "internal" && <span className="type-tag">Internal</span>}</td>
                      <td>{p.client}</td>
                      <td>{p.contact || "-"}</td>
                      <td>{p.trainer || "-"}</td>
                      <td className="date-cell">
                        {fmtDate(p.startDate)}{p.endDate && p.endDate !== p.startDate ? ` → ${fmtDate(p.endDate)}` : ""}
                        {p.extraDates && p.extraDates.length > 0 && (
                          <span className="extra-dates-tag" title={p.extraDates.map(fmtDate).join(", ")}>
                            +{p.extraDates.length} more date{p.extraDates.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td><Badge status={p.status} /></td>
                      <td className="num strong">{fmt(p.expectedAmount)}</td>
                    </>
                  )}
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={8} className="empty-row">No projects match these filters.</td></tr>
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
  statuses: new Set(EXPENSE_STATUS_ORDER),
  dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
};

/** Where an expense "belongs": linked to a client (revenue) project, linked to an internal
 *  (non-client) project, or standalone/recurring with no project link at all. */
function expenseScope(e, projects) {
  if (!e.projectId) return "recurring";
  const proj = projects.find((p) => p.id === e.projectId);
  return proj ? (proj.type || "revenue") : "revenue";
}

function ExpensesTab({ expenses, setExpenses, projects }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [pendingNewId, setPendingNewId] = useState(null); // id of a just-created row not yet saved
  const [filters, setFilters] = useState(EMPTY_EXPENSE_FILTERS);
  const [typeView, setTypeView] = useState("all"); // "all" | "revenue" | "internal" | "recurring"
  const setF = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const startEdit = (e) => { setEditingId(e.id); setDraft({ ...e }); };
  const startNew = () => {
    const e = { id: uid("e"), projectId: null, projectName: "", category: "Other Cost", date: null, status: "Signed", expectedAmount: 0, notes: "" };
    setExpenses([e, ...expenses]);
    setPendingNewId(e.id);
    startEdit(e);
    // a brand new expense isn't linked to any project yet, so it only matches
    // the "All" or "Recurring" scope. Switch to "All" so it's never invisible
    // right after creation.
    if (typeView === "revenue" || typeView === "internal") setTypeView("all");
  };
  const save = () => {
    setExpenses(expenses.map((e) => (e.id === editingId ? draft : e)));
    setEditingId(null); setDraft(null); setPendingNewId(null);
  };
  const cancelEdit = () => {
    if (pendingNewId === editingId) {
      setExpenses(expenses.filter((e) => e.id !== editingId));
    }
    setEditingId(null); setDraft(null); setPendingNewId(null);
  };
  const remove = (id) => setExpenses(expenses.filter((e) => e.id !== id));
  const duplicate = (e) => {
    const copy = { ...e, id: uid("e") };
    setExpenses([copy, ...expenses]);
    setPendingNewId(copy.id);
    startEdit(copy);
  };

  const inTypeView = expenses.filter((e) => typeView === "all" || expenseScope(e, projects) === typeView);
  const filtered = inTypeView.filter((e) => {
    const name = e.projectName || "General / Recurring";
    const linkedProject = e.projectId ? projects.find((p) => p.id === e.projectId) : null;
    const client = linkedProject?.client || "";
    if (filters.project) {
      const q = filters.project.toLowerCase();
      const matchesName = name.toLowerCase().includes(q);
      const matchesClient = client.toLowerCase().includes(q);
      if (!matchesName && !matchesClient) return false;
    }
    if (!filters.categories.has(e.category)) return false;
    if (!filters.statuses.has(e.status)) return false;
    if (filters.dateFrom && (!e.date || e.date < filters.dateFrom)) return false;
    if (filters.dateTo && (!e.date || e.date > filters.dateTo)) return false;
    if (filters.amountMin !== "" && (e.expectedAmount || 0) < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax !== "" && (e.expectedAmount || 0) > parseFloat(filters.amountMax)) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (pendingNewId === editingId) {
      if (a.id === editingId) return -1;
      if (b.id === editingId) return 1;
    }
    return (b.date || "0000").localeCompare(a.date || "0000");
  });
  const total = filtered.reduce((s, e) => s + (e.expectedAmount || 0), 0);
  const isFiltered = filters.categories.size !== EXPENSE_CATEGORIES.length || filters.statuses.size !== EXPENSE_STATUS_ORDER.length
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

      <div className="type-toggle">
        <button className={typeView === "all" ? "active" : ""} onClick={() => setTypeView("all")}>All</button>
        <button className={typeView === "revenue" ? "active" : ""} onClick={() => setTypeView("revenue")}>Client</button>
        <button className={typeView === "internal" ? "active" : ""} onClick={() => setTypeView("internal")}>Internal</button>
        <button className={typeView === "recurring" ? "active" : ""} onClick={() => setTypeView("recurring")}>Recurring</button>
      </div>

      <div className="toolbar">
        <div className="toolbar-total">{filtered.length} of {inTypeView.length} entries · <strong>{fmt(total)}</strong> total</div>
        {isFiltered && <button className="link-btn" onClick={() => setFilters(EMPTY_EXPENSE_FILTERS)}>Clear filters</button>}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th></th><th>Linked project</th><th>Category</th><th>Date</th><th>Status</th><th className="num" title="Always enter amounts excluding VAT (HT)">Amount (HT)</th>
            </tr>
            <tr className="filter-row">
              <th></th>
              <th><input className="col-filter" placeholder="Project or client…" value={filters.project} onChange={(e) => setF({ project: e.target.value })} /></th>
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
                <MultiSelectFilter label="Status" options={EXPENSE_STATUS_ORDER} selected={filters.statuses} onChange={(s) => setF({ statuses: s })} colorFor={(o) => STATUS_COLORS[o]} />
              </th>
              <th className="num">
                <div className="range-filter">
                  <input className="col-filter num-input" type="number" placeholder="Min" value={filters.amountMin} onChange={(e) => setF({ amountMin: e.target.value })} />
                  <input className="col-filter num-input" type="number" placeholder="Max" value={filters.amountMax} onChange={(e) => setF({ amountMax: e.target.value })} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const isEdit = editingId === e.id;
              return (
                <tr key={e.id} className={isEdit ? "editing" : ""}>
                  {isEdit ? (
                    <>
                      <td className="actions">
                        <button className="icon-btn ok" onClick={save} aria-label="Save"><Check size={14} /></button>
                        <button className="icon-btn" onClick={cancelEdit} aria-label="Cancel"><X size={14} /></button>
                      </td>
                      <td>
                        <Select
                          value={draft.projectId || "none"}
                          onChange={(v) => {
                            if (v === "none") setDraft((d) => ({ ...d, projectId: null, projectName: "General / Recurring" }));
                            else {
                              const proj = projects.find((p) => p.id === v);
                              setDraft((d) => ({ ...d, projectId: v, projectName: proj ? proj.name : "" }));
                            }
                          }}
                          options={["none", ...projects.map((p) => p.id)]}
                          labelFor={(v) => (v === "none" ? "General / Recurring (not linked)" : (projects.find((p) => p.id === v)?.name || v))}
                        />
                      </td>
                      <td><Select value={draft.category} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} options={EXPENSE_CATEGORIES} /></td>
                      <td><input type="date" value={draft.date || ""} onChange={(ev) => setDraft((d) => ({ ...d, date: ev.target.value || null }))} /></td>
                      <td><Select value={draft.status} onChange={(v) => setDraft((d) => ({ ...d, status: v }))} options={EXPENSE_STATUS_ORDER} /></td>
                      <td className="num"><input className="num-input" type="number" value={draft.expectedAmount} onChange={(ev) => setDraft((d) => ({ ...d, expectedAmount: parseFloat(ev.target.value) || 0 }))} /><div className="ht-hint">HT (excl. VAT)</div></td>
                    </>
                  ) : (
                    <>
                      <td className="actions">
                        <button className="icon-btn" onClick={() => startEdit(e)} aria-label="Edit"><Pencil size={13} /></button>
                        <button className="icon-btn" onClick={() => duplicate(e)} aria-label="Duplicate"><Copy size={13} /></button>
                        <button className="icon-btn danger" onClick={() => remove(e.id)} aria-label="Delete"><Trash2 size={13} /></button>
                      </td>
                      <td className="proj-name">{e.projectId ? e.projectName : e.projectName ? <span className="unlinked-name">{e.projectName}</span> : <em>General / Recurring</em>}</td>
                      <td><span className="cat-pill">{e.category}</span></td>
                      <td className="date-cell">{fmtDate(e.date)}</td>
                      <td><Badge status={e.status} /></td>
                      <td className="num strong neg">{fmt(e.expectedAmount)}</td>
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
   Planning Tab - upcoming projects
--------------------------------------------------------------- */
function PlanningTab({ projects }) {
  const [sortDir, setSortDir] = useState("asc");
  const [view, setView] = useState("list"); // "list" | "calendar"
  const today = new Date().toISOString().slice(0, 10);
  const upcomingProjects = projects.filter((p) => p.status !== "Paid" && p.status !== "Lost");

  // One row per project (never split across its dates) - uses the EARLIEST of its
  // primary + extra dates so a scattered multi-date training still sorts sensibly.
  const toPlanningEntry = (p) => {
    const allDates = [p.startDate, ...(p.extraDates || [])].filter(Boolean).sort();
    return { ...p, sessionDate: allDates[0] || null, sessionKey: p.id, extraCount: Math.max(0, allDates.length - 1) };
  };

  // The calendar wants one pill per actual session date, so it keeps the full breakdown.
  const flattenToSessions = (list) => {
    const out = [];
    list.forEach((p) => {
      const allDates = [p.startDate, ...(p.extraDates || [])].filter(Boolean);
      if (allDates.length === 0) out.push({ ...p, sessionDate: null, sessionKey: p.id });
      else allDates.forEach((d) => out.push({ ...p, sessionDate: d, sessionKey: `${p.id}-${d}` }));
    });
    return out;
  };

  // Priority section: Signed = contract signed but no trainer found yet. Surfaced first, in
  // red, so it's obvious which deals need a trainer before they can move to Scheduled.
  const needsTrainerProjects = upcomingProjects.filter((p) => p.status === "Signed");
  const restProjects = upcomingProjects.filter((p) => p.status !== "Signed");

  const needsTrainerSessions = needsTrainerProjects.map(toPlanningEntry).sort((a, b) =>
    (a.sessionDate || "9999").localeCompare(b.sessionDate || "9999")
  );

  const allSessions = flattenToSessions(upcomingProjects); // for the calendar, which shows everything together

  const restSessions = restProjects.map(toPlanningEntry).sort((a, b) => {
    const cmp = (a.sessionDate || "9999").localeCompare(b.sessionDate || "9999");
    return sortDir === "asc" ? cmp : -cmp;
  });
  const dated = restSessions.filter((p) => p.sessionDate);
  const undated = restSessions.filter((p) => !p.sessionDate);

  const daysUntil = (d) => {
    const diff = Math.ceil((new Date(d) - new Date(today)) / 86400000);
    if (diff < 0) return "in progress / past start";
    if (diff === 0) return "starts today";
    return `in ${diff} day${diff > 1 ? "s" : ""}`;
  };

  const totalValue = upcomingProjects.reduce((s, p) => s + (p.expectedAmount || 0), 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Planning</h2>
          <p className="sub">Everything not yet paid or lost, ordered by date, so you can see what's coming and organise around it.</p>
        </div>
        <div className="planning-controls">
          <div className="type-toggle view-toggle">
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List size={13} /> List</button>
            <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><Calendar size={13} /> Calendar</button>
          </div>
          {view === "list" && (
            <button className="link-btn sort-toggle" onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}>
              {sortDir === "asc" ? "Soonest first ↑" : "Furthest first ↓"}
            </button>
          )}
          <div className="toolbar-total">{upcomingProjects.length} upcoming · <strong>{fmt(totalValue)}</strong> at stake</div>
        </div>
      </div>

      {needsTrainerSessions.length > 0 && (
        <div className="needs-trainer-block">
          <div className="needs-trainer-banner">
            <AlertTriangle size={16} />
            <span><strong>{needsTrainerSessions.length} session{needsTrainerSessions.length > 1 ? "s" : ""}</strong> {needsTrainerSessions.length > 1 ? "are" : "is"} Signed but still need{needsTrainerSessions.length === 1 ? "s" : ""} a trainer, find one to move {needsTrainerSessions.length > 1 ? "them" : "it"} to Scheduled.</span>
          </div>
          <div className="timeline needs-trainer-list">
            {needsTrainerSessions.map((p) => (
              <div className="timeline-row needs-trainer-row" key={p.sessionKey}>
                <div className="timeline-date">
                  {p.sessionDate ? (
                    <>
                      <div className="tl-day">{new Date(p.sessionDate + "T00:00:00").getDate()}</div>
                      <div className="tl-month">{new Date(p.sessionDate + "T00:00:00").toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}</div>
                    </>
                  ) : (
                    <div className="tl-month">No date</div>
                  )}
                </div>
                <div className="timeline-line" />
                <div className="timeline-content">
                  <div className="tl-top">
                    <span className="tl-name">{p.name}</span>
                    {p.type === "internal" && <span className="type-tag">Internal</span>}
                    {p.extraCount > 0 && <span className="extra-dates-tag">+{p.extraCount} more date{p.extraCount > 1 ? "s" : ""}</span>}
                    <Badge status={p.status} />
                  </div>
                  <div className="tl-meta">{p.client} · no trainer assigned{p.sessionDate ? ` · ${daysUntil(p.sessionDate)}` : ""}</div>
                </div>
                <div className="tl-amount">{fmt(p.expectedAmount)}</div>
              </div>
            ))}
          </div>
          <div className="section-divider">Rest, by date</div>
        </div>
      )}

      {view === "calendar" ? (
        <PlanningCalendar sessions={allSessions} />
      ) : (
        <>
          <div className="timeline">
            {dated.map((p) => (
              <div className="timeline-row" key={p.sessionKey}>
                <div className="timeline-date">
                  <div className="tl-day">{new Date(p.sessionDate + "T00:00:00").getDate()}</div>
                  <div className="tl-month">{new Date(p.sessionDate + "T00:00:00").toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}</div>
                </div>
                <div className="timeline-line" />
                <div className="timeline-content">
                  <div className="tl-top">
                    <span className="tl-name">{p.name}</span>
                    {p.type === "internal" && <span className="type-tag">Internal</span>}
                    {p.extraCount > 0 && <span className="extra-dates-tag">+{p.extraCount} more date{p.extraCount > 1 ? "s" : ""}</span>}
                    <Badge status={p.status} />
                  </div>
                  <div className="tl-meta">{p.client} · {p.trainer || "trainer TBD"} · {daysUntil(p.sessionDate)}</div>
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
                  <div className="pipeline-card" key={p.sessionKey}>
                    <div className="tl-top"><span className="tl-name">{p.name}</span>{p.type === "internal" && <span className="type-tag">Internal</span>}<Badge status={p.status} /></div>
                    <div className="tl-meta">{p.client} · {p.trainer || "trainer TBD"}</div>
                    <div className="tl-amount">{fmt(p.expectedAmount)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Simple month-grid calendar showing every upcoming session as a small colored pill on its day. */
function PlanningCalendar({ sessions }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!s.sessionDate) return;
      (map[s.sessionDate] = map[s.sessionDate] || []).push(s);
    });
    return map;
  }, [sessions]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) => `${year}-${pad2(month + 1)}-${pad2(d)}`;

  return (
    <div className="planning-calendar">
      <div className="cal-nav">
        <button className="icon-btn" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month"><ChevronLeft size={15} /></button>
        <div className="cal-title">{cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
        <button className="icon-btn" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month"><ChevronRight size={15} /></button>
        <button className="link-btn" onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button>
      </div>
      <div className="cal-weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div className="cal-cell empty" key={`e${i}`} />;
          const ds = dateStr(d);
          const daySessions = byDate[ds] || [];
          return (
            <div className={`cal-cell ${ds === todayStr ? "today" : ""}`} key={ds}>
              <div className="cal-day-num">{d}</div>
              <div className="cal-day-sessions">
                {daySessions.slice(0, 3).map((s) => (
                  <div className="cal-pill" key={s.sessionKey} style={{ background: `${STATUS_COLORS[s.status]}22`, color: STATUS_COLORS[s.status], borderColor: `${STATUS_COLORS[s.status]}55` }} title={`${s.name} · ${s.status}`}>
                    {s.name}
                  </div>
                ))}
                {daySessions.length > 3 && <div className="cal-more">+{daySessions.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
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

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Quick presets (mirroring the kind of range picker Azure Cost Management offers), plus a
 *  "custom" mode that falls back to an explicit year/month pair. Returns { from, to, label }
 *  in YYYY-MM-DD, or null for "all time" (no filter). */
function getPeriodRange(mode, customYear, customMonth) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  const monthRange = (year, monthIndex0) => {
    const from = new Date(year, monthIndex0, 1);
    const to = new Date(year, monthIndex0 + 1, 0);
    return { from: toISODate(from), to: toISODate(to) };
  };

  if (mode === "all") return null;
  if (mode === "thisMonth") return { ...monthRange(y, m), label: `${MONTH_NAMES[m]} ${y}` };
  if (mode === "lastMonth") {
    const d = new Date(y, m - 1, 1);
    return { ...monthRange(d.getFullYear(), d.getMonth()), label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` };
  }
  if (mode === "last3Months") {
    const from = new Date(y, m - 2, 1);
    const to = new Date(y, m + 1, 0);
    return { from: toISODate(from), to: toISODate(to), label: "Last 3 months" };
  }
  if (mode === "thisYear") return { from: `${y}-01-01`, to: `${y}-12-31`, label: String(y) };
  if (mode === "custom") {
    if (customYear === "all") return null;
    if (customMonth === "all") return { from: `${customYear}-01-01`, to: `${customYear}-12-31`, label: customYear };
    const mi = parseInt(customMonth, 10) - 1;
    return { ...monthRange(parseInt(customYear, 10), mi), label: `${MONTH_NAMES[mi]} ${customYear}` };
  }
  return null;
}

function inRange(dateStr, range) {
  if (!range) return true; // no period filter active
  if (!dateStr) return false; // undated items can't belong to a specific period
  return dateStr >= range.from && dateStr <= range.to;
}

/** A multi-date project passes a period filter if ANY of its session dates (primary
 *  startDate, or any extra non-contiguous date) actually falls within the range - not
 *  just its primary date, and not merely because the range spans between two sessions. */
function projectInRange(p, range) {
  if (!range) return true;
  const dates = [p.startDate, ...(p.extraDates || [])].filter(Boolean);
  if (dates.length === 0) return false;
  return dates.some((d) => d >= range.from && d <= range.to);
}

function DashboardTab({ projects, expenses }) {
  const years = useMemo(() => availableYears(projects, expenses), [projects, expenses]);
  const [periodMode, setPeriodMode] = useState("thisMonth"); // "all" | "thisMonth" | "lastMonth" | "last3Months" | "thisYear" | "custom"
  const [customYear, setCustomYear] = useState("all");
  const [customMonth, setCustomMonth] = useState("all");

  const range = useMemo(() => getPeriodRange(periodMode, customYear, customMonth), [periodMode, customYear, customMonth]);

  const periodProjects = useMemo(
    () => (range === null ? projects : projects.filter((p) => projectInRange(p, range))),
    [projects, range]
  );
  const periodExpenses = useMemo(
    () => (range === null ? expenses : expenses.filter((e) => inRange(e.date, range))),
    [expenses, range]
  );
  const excludedUndated = range === null ? 0 : projects.filter((p) => !p.startDate).length;

  const periodLabel = range === null ? "All time" : range.label;

  // "Actual" = confirmed business, everything except Lost (there's no more speculative
  // Pipeline stage now that statuses were simplified). "Expected" (below) is a literal
  // unfiltered sum including Lost, matching the source file's own column totals.
  const isConfirmed = (x) => x.status !== "Lost";
  const actualRevenue = periodProjects.filter(isConfirmed).reduce((s, p) => s + (p.expectedAmount || 0), 0);
  // "Expected" matches the spreadsheet's own column totals exactly: a plain sum with no
  // status filtering at all, so Lost deals' original target amounts still count (that's
  // literally how the source file's Expected Revenue / Expected TCost totals are computed).
  const expectedRevenue = periodProjects.reduce((s, p) => s + (p.expectedAmount || 0), 0);
  // Expenses count in full the moment they're entered, regardless of status
  // (Signed/Invoiced/Paid) - once you've committed to a cost, it's real.
  const actualExpenses = periodExpenses.reduce((s, e) => s + (e.expectedAmount || 0), 0);
  const expectedExpenses = periodExpenses.reduce((s, e) => s + (e.expectedAmount || 0), 0);
  const actualProfit = actualRevenue - actualExpenses;
  const expectedProfit = expectedRevenue - expectedExpenses;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Dashboard</h2>
          <p className="sub">Where the business actually stands, and where it lands if every open deal closes, showing <strong>{periodLabel}</strong>.</p>
        </div>
      </div>

      <div className="period-presets">
        {[
          { key: "all", label: "All time" },
          { key: "thisMonth", label: "This month" },
          { key: "lastMonth", label: "Last month" },
          { key: "last3Months", label: "Last 3 months" },
          { key: "thisYear", label: `This year (${new Date().getFullYear()})` },
        ].map((preset) => (
          <button
            key={preset.key}
            className={periodMode === preset.key ? "active" : ""}
            onClick={() => { setPeriodMode(preset.key); setCustomYear("all"); setCustomMonth("all"); }}
          >
            {preset.label}
          </button>
        ))}
        <button className={periodMode === "custom" ? "active" : ""} onClick={() => setPeriodMode("custom")}>Custom…</button>
      </div>

      {periodMode === "custom" && (
        <div className="period-picker">
          <Select
            value={customYear}
            onChange={(v) => { setCustomYear(v); setCustomMonth("all"); }}
            options={["all", ...years]}
            labelFor={(v) => (v === "all" ? "Pick a year" : v)}
          />
          {customYear !== "all" && (
            <Select
              value={customMonth}
              onChange={setCustomMonth}
              options={["all", ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))]}
              labelFor={(v) => (v === "all" ? "Whole year" : MONTH_NAMES[parseInt(v, 10) - 1])}
            />
          )}
        </div>
      )}
      {excludedUndated > 0 && (
        <div className="period-note">{excludedUndated} pipeline project{excludedUndated > 1 ? "s" : ""} without a date {excludedUndated > 1 ? "aren't" : "isn't"} shown for this period.</div>
      )}

      <div className="kpi-grid">
        <KpiCard icon={TrendingUp} label="Revenue" actual={actualRevenue} expected={expectedRevenue} tone="#34A87A" />
        <KpiCard icon={TrendingDown} label="Expenses" actual={actualExpenses} expected={expectedExpenses} tone="#E0695A" />
        <KpiCard icon={Clock3} label="Profit" actual={actualProfit} expected={expectedProfit} tone="#6FA8D8" />
      </div>

      <div className="ledger-hero">
        <div className="ledger-col">
          <div className="ledger-tag">ACTUAL: confirmed business (Scheduled, Signed, Invoiced &amp; Paid)</div>
          <div className="ledger-figure" style={{ color: actualProfit >= 0 ? "#34A87A" : "#E0695A" }}>{fmt(actualProfit)}</div>
          <div className="ledger-sub-row">
            <span><Wallet size={13} /> Revenue {fmt(actualRevenue)}</span>
            <span><Receipt size={13} /> Expenses {fmt(actualExpenses)}</span>
          </div>
        </div>
        <div className="ledger-stitch"><span>VS</span></div>
        <div className="ledger-col">
          <div className="ledger-tag">EXPECTED: every row's target, exactly as in the file</div>
          <div className="ledger-figure" style={{ color: expectedProfit >= 0 ? "#D9A24A" : "#E0695A" }}>{fmt(expectedProfit)}</div>
          <div className="ledger-sub-row">
            <span><Wallet size={13} /> Revenue {fmt(expectedRevenue)}</span>
            <span><Receipt size={13} /> Expenses {fmt(expectedExpenses)}</span>
          </div>
        </div>
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
        // seed data, or an unsaved local cache from last time - keep it locally and
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

  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed, retry" : dirty ? "Save" : "Saved ✓";

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="header-top">
          <div className="brand">
            <img className="brand-mark" src="https://www.academy.clouddevfusion.com/assets/cdfL.png" alt="CloudDevFusion" />
            <div>
              <div className="brand-title">Planning & Budget</div>
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
  background: #131316;
  color: #F1F0ED;
  min-height: 100vh;
}
.loading-shell { display:flex; align-items:center; justify-content:center; min-height: 400px; }
.loader { font-family: 'Fraunces', serif; font-size: 18px; color: #9B9BA3; }

.app-header {
  background: #131316;
  color: #EFEEE5;
  padding: 20px 28px 0 28px;
}
.header-top { display:flex; align-items:flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.header-actions { display:flex; gap: 8px; margin-top: 2px; align-items: center; }
.dirty-pill {
  font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px;
  border: 1px solid #3B3B42; white-space: nowrap;
}
.dirty-pill.clean { color: #4CA97A; border-color: #4CA97A55; }
.dirty-pill.dirty { color: #C68A2E; border-color: #C68A2E55; }
.save-btn { padding: 8px 16px; font-size: 12.5px; }
.save-btn:disabled { opacity: 0.55; cursor: default; }
.save-btn.save-error { background: #C25644; }
.save-btn.save-error:hover { background: #A8493A; }

.history-wrap { position: relative; }
.history-panel {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 30;
  background: #1C1C20; border: 1px solid #2E2E34; border-radius: 10px;
  width: 260px; max-height: 320px; overflow-y: auto;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35); color: #F1F0ED;
}
.history-head {
  display:flex; align-items:center; justify-content:space-between;
  padding: 10px 12px; font-size: 12px; font-weight: 700; color: #9B9BA3;
  text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2E2E34;
  position: sticky; top: 0; background: #1C1C20;
}
.history-empty { padding: 16px 12px; font-size: 12.5px; color: #9AA39C; }
.history-row {
  display:flex; align-items:center; justify-content:space-between; gap: 10px;
  padding: 10px 12px; border-bottom: 1px solid #27272C; font-size: 12.5px;
}
.history-row:last-child { border-bottom: none; }
.history-date { font-weight: 600; }
.history-latest { color: #34A87A; font-weight: 700; }
.history-size { color: #9AA39C; font-size: 11px; margin-top: 2px; }
.ghost-btn {
  background: transparent; border: 1px solid #3B3B42; color: #9AA39C;
  padding: 6px 12px; border-radius: 7px; font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: 'Inter', sans-serif; position: relative;
}
.ghost-btn:hover { color: #EFEEE5; border-color: #5A6A64; }
.file-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
.brand { display:flex; align-items:center; gap: 12px; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 8px; object-fit: contain;
  background: #fff; padding: 4px;
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
.period-presets { display:flex; align-items:center; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.period-presets button {
  background: #1C1C20; border: 1px solid #2E2E34; color: #9B9BA3;
  padding: 7px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif; white-space: nowrap;
}
.period-presets button:hover { border-color: #3B3B42; color: #F1F0ED; }
.period-presets button.active { background: #2F8F63; border-color: #2F8F63; color: #141416; }
.period-picker { display:flex; align-items:center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.period-note { font-size: 12px; color: #9B9BA3; margin: -12px 0 16px 0; }
.panel-header h2 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 600; margin: 0 0 4px 0; }
.panel-header .sub { margin: 0; font-size: 13px; color: #9B9BA3; max-width: 480px; }

.btn-primary {
  display:flex; align-items:center; gap: 6px;
  background: #2F8F63; color: #141416; border: none;
  padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif;
  transition: background .15s ease;
}
.btn-primary:hover { background: #279068; }

/* Ledger hero */
.ledger-hero {
  display:flex; align-items:stretch; gap: 0;
  background: #1C1C20; border: 1px solid #2E2E34; border-radius: 14px;
  padding: 26px 30px; margin-bottom: 22px; position: relative;
}
.ledger-col { flex: 1; display:flex; flex-direction: column; gap: 8px; }
.ledger-tag { font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase; color: #9B9BA3; font-weight: 600; }
.ledger-figure { font-family: 'IBM Plex Mono', monospace; font-size: 34px; font-weight: 500; }
.ledger-sub-row { display:flex; gap: 18px; font-size: 12.5px; color: #9B9BA3; }
.ledger-sub-row span { display:flex; align-items:center; gap: 5px; }
.ledger-stitch {
  width: 60px; display:flex; align-items:center; justify-content:center;
  position: relative;
}
.ledger-stitch::before {
  content: ""; position: absolute; top: 4px; bottom: 4px; left: 50%;
  border-left: 2px dashed #3B3B42;
}
.ledger-stitch span {
  background: #131316; border: 1px solid #3B3B42; color: #9AA39C;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  padding: 4px 6px; border-radius: 20px; z-index: 1; position: relative;
  font-family: 'IBM Plex Mono', monospace;
}

.kpi-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
.kpi-card { background: #1C1C20; border: 1px solid #2E2E34; border-radius: 12px; padding: 16px 18px; }
.kpi-top { display:flex; align-items:center; gap: 8px; margin-bottom: 10px; }
.kpi-icon { width: 26px; height: 26px; border-radius: 7px; display:flex; align-items:center; justify-content:center; }
.kpi-label { font-size: 12.5px; font-weight: 600; color: #9B9BA3; }
.kpi-actual { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 500; color: #F1F0ED; }
.kpi-expected { font-size: 11.5px; color: #9B9BA3; margin-top: 4px; display:flex; align-items:center; }

.chart-grid { display:grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-bottom: 14px; }
.chart-card { background: #1C1C20; border: 1px solid #2E2E34; border-radius: 12px; padding: 16px 18px 6px 18px; }
.chart-card h3 { font-size: 13.5px; font-weight: 600; margin: 0 0 6px 0; color: #F1F0ED; }

.toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }

.type-toggle { display:inline-flex; gap: 2px; background: #1C1C20; border: 1px solid #2E2E34; border-radius: 8px; padding: 3px; margin-bottom: 14px; }
.type-toggle button {
  background: transparent; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600;
  color: #9B9BA3; cursor: pointer; font-family: 'Inter', sans-serif;
}
.type-toggle button.active { background: #34A87A; color: #141416; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }

.inline-type-toggle { display:inline-flex; gap: 3px; margin-top: 5px; }
.inline-type-toggle button {
  background: #26262B; border: 1px solid #2E2E34; padding: 2px 8px; border-radius: 5px; font-size: 10.5px; font-weight: 600;
  color: #9B9BA3; cursor: pointer; font-family: 'Inter', sans-serif;
}
.inline-type-toggle button.active { background: #34A87A; color: #141416; border-color: #34A87A; }

.type-tag {
  display: inline-block; margin-left: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
  color: #9B85D1; background: #9B85D11A; border: 1px solid #9B85D155; padding: 2px 7px; border-radius: 20px; vertical-align: middle;
}
.toolbar-total { font-size: 12.5px; color: #9B9BA3; }
.toolbar-total strong { color: #F1F0ED; }
.link-btn {
  background: none; border: none; color: #6FA8D8; font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif; padding: 0;
}
.link-btn:hover { text-decoration: underline; }
.planning-controls { display:flex; align-items:center; gap: 16px; flex-wrap: wrap; }
.view-toggle { margin-bottom: 0; }
.view-toggle button { display:flex; align-items:center; gap: 5px; }

.needs-trainer-block { margin-bottom: 6px; }
.needs-trainer-banner {
  display:flex; align-items:center; gap: 10px; background: #E0695A1A; border: 1px solid #E0695A55;
  color: #E0695A; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 10px;
}
.needs-trainer-banner strong { color: #F1F0ED; }
.needs-trainer-row { background: #E0695A0D; border-radius: 8px; padding-left: 6px; padding-right: 6px; }
.needs-trainer-row .tl-name { color: #F1F0ED; }

.planning-calendar { margin-top: 4px; }
.cal-nav { display:flex; align-items:center; gap: 10px; margin-bottom: 14px; }
.cal-title { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; min-width: 160px; text-align: center; }
.cal-weekdays { display:grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; }
.cal-weekdays div { text-align: center; font-size: 11px; font-weight: 700; color: #9B9BA3; text-transform: uppercase; letter-spacing: 0.4px; }
.cal-grid { display:grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.cal-cell {
  min-height: 92px; background: #1C1C20; border: 1px solid #2E2E34; border-radius: 8px;
  padding: 6px; display:flex; flex-direction: column; gap: 4px;
}
.cal-cell.empty { background: transparent; border: none; }
.cal-cell.today { border-color: #34A87A; box-shadow: inset 0 0 0 1px #34A87A; }
.cal-day-num { font-size: 11.5px; font-weight: 700; color: #9B9BA3; }
.cal-cell.today .cal-day-num { color: #34A87A; }
.cal-day-sessions { display:flex; flex-direction: column; gap: 3px; overflow: hidden; }
.cal-pill {
  font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 5px; border: 1px solid;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cal-more { font-size: 10px; color: #9B9BA3; padding-left: 2px; }

@media (max-width: 780px) {
  .cal-cell { min-height: 64px; }
  .cal-title { min-width: auto; }
}
.sort-toggle { white-space: nowrap; }

/* Per-column filter row */
tr.filter-row th { padding: 7px 10px; background: #1B1B1F; border-bottom: 1px solid #2E2E34; }
.col-filter {
  border: 1px solid #3B3B42; border-radius: 6px; padding: 5px 8px; font-size: 12px;
  font-family: 'Inter', sans-serif; width: 100%; color: #F1F0ED; background: #1C1C20;
}
.range-filter { display:flex; gap: 4px; }
.range-filter input { min-width: 0; }
.range-filter input[type="date"] { font-size: 11px; padding: 5px 4px; }

.msf { position: relative; display:inline-block; }
.msf-trigger {
  list-style: none; cursor: pointer; display:flex; align-items:center; gap: 5px;
  border: 1px solid #3B3B42; border-radius: 6px; padding: 5px 9px; font-size: 12px;
  color: #F1F0ED; background: #1C1C20; white-space: nowrap; font-family: 'Inter', sans-serif;
}
.msf-panel {
  position: fixed; z-index: 200;
  background: #1C1C20; border: 1px solid #2E2E34; border-radius: 8px;
  padding: 6px; min-width: 160px; box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  display:flex; flex-direction: column; gap: 2px; max-height: 260px; overflow-y: auto;
  color: #F1F0ED; font-family: 'Inter', sans-serif;
}
.msf-option { display:flex; align-items:center; gap: 7px; font-size: 12.5px; padding: 5px 6px; border-radius: 5px; cursor: pointer; white-space: nowrap; color: #F1F0ED; }
.msf-option:hover { background: #26262B; }
.msf-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.msf-all {
  font-size: 11px; font-weight: 600; color: #6FA8D8; background: none; border: none;
  text-align: left; padding: 5px 6px; cursor: pointer; border-bottom: 1px solid #2E2E34; margin-bottom: 2px;
}
.empty-row { text-align: center; color: #9B9BA3; font-size: 13px; padding: 28px 0 !important; }

.select-wrap { position: relative; display:inline-flex; align-items:center; }
.select-wrap select {
  appearance: none; background: #1C1C20; border: 1px solid #3B3B42; border-radius: 7px;
  padding: 6px 26px 6px 10px; font-size: 12.5px; color: #F1F0ED; font-family: 'Inter', sans-serif;
  cursor: pointer;
}
.select-chevron { position: absolute; right: 8px; pointer-events: none; color: #9B9BA3; }

.badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }

.table-scroll { overflow-x: auto; background: #1C1C20; border: 1px solid #2E2E34; border-radius: 12px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px;
  color: #9B9BA3; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #2E2E34;
}
th.num, td.num { text-align: right; }
tbody td { padding: 11px 14px; border-bottom: 1px solid #27272C; vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #1B1B1F; }
tbody tr.editing { background: #2B2A1E; }
.proj-name { font-weight: 600; }
.unlinked-name { font-weight: 500; font-style: italic; color: #9B9BA3; }
.date-cell { display:flex; gap: 6px; font-size: 12.5px; color: #9B9BA3; align-items:center; flex-wrap: wrap; }

.extra-dates-editor { width: 100%; margin-top: 4px; }
.extra-dates-list { display:flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.extra-date-chip {
  display:inline-flex; align-items:center; gap: 4px; background: #26262B; border: 1px solid #3B3B42;
  color: #F1F0ED; font-size: 10.5px; padding: 2px 4px 2px 7px; border-radius: 20px;
}
.extra-date-chip button { background: none; border: none; color: #9B9BA3; cursor: pointer; display:flex; padding: 2px; }
.extra-date-chip button:hover { color: #E0695A; }
.extra-dates-add { display:flex; gap: 4px; align-items:center; }
.extra-dates-add input { font-size: 11px; padding: 4px 6px; }
.extra-dates-tag {
  font-size: 10px; font-weight: 600; color: #9B9BA3; background: #26262B; border: 1px solid #3B3B42;
  padding: 2px 7px; border-radius: 20px; margin-left: 4px; cursor: help;
}
.session-tag { color: #D9A24A; background: #D9A24A1A; border-color: #D9A24A55; }
.num.strong { font-family: 'IBM Plex Mono', monospace; font-weight: 500; }
.num.strong.neg { color: #E0695A; }
.actions { display:flex; gap: 6px; justify-content: flex-start; }
.icon-btn {
  background: transparent; border: 1px solid #2E2E34; color: #9B9BA3;
  width: 26px; height: 26px; border-radius: 6px; display:flex; align-items:center; justify-content:center;
  cursor: pointer;
}
.icon-btn:hover { background: #26262B; }
.icon-btn.danger:hover { color: #E0695A; border-color: #E0695A55; }
.icon-btn.ok { color: #34A87A; border-color: #34A87A55; }
.cat-pill { background: #26262B; padding: 3px 9px; border-radius: 6px; font-size: 11.5px; color: #F1F0ED; }

input[type="text"], input[type="number"], input[type="date"], input:not([type]) {
  border: 1px solid #3B3B42; border-radius: 6px; padding: 6px 8px; font-size: 12.5px;
  font-family: 'Inter', sans-serif; width: 100%; color: #F1F0ED; background: #1C1C20;
}
.num-input { text-align: right; font-family: 'IBM Plex Mono', monospace; }
.ht-hint { font-size: 9.5px; color: #9B9BA3; text-align: right; margin-top: 3px; font-style: italic; }

/* Planning timeline */
.timeline { display:flex; flex-direction: column; }
.timeline-row { display:flex; align-items:center; gap: 16px; padding: 14px 6px; border-bottom: 1px solid #2E2E34; }
.timeline-row:last-child { border-bottom: none; }
.timeline-date { width: 52px; text-align:center; flex-shrink: 0; }
.tl-day { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; line-height: 1; }
.tl-month { font-size: 10.5px; color: #9B9BA3; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }
.timeline-line { width: 2px; align-self: stretch; background: #2E2E34; flex-shrink: 0; }
.timeline-content { flex: 1; min-width: 0; }
.tl-top { display:flex; align-items:center; gap: 10px; margin-bottom: 4px; }
.tl-name { font-weight: 600; font-size: 13.5px; }
.tl-meta { font-size: 12px; color: #9B9BA3; }
.tl-amount { font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 14px; flex-shrink: 0; }

.section-divider {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #9B9BA3; font-weight: 700;
  margin: 22px 0 12px 4px;
}
.pipeline-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.pipeline-card { background: #1C1C20; border: 1px solid #2E2E34; border-radius: 10px; padding: 14px; }

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
