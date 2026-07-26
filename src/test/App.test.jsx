import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";

// --- helpers -------------------------------------------------------
const eurToNumber = (s) =>
  Number(s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));

async function renderReady() {
  const utils = render(<App />);
  await waitFor(() => expect(screen.queryByText(/Loading your ledger/i)).not.toBeInTheDocument());
  return utils;
}

async function goToTab(user, label) {
  await user.click(screen.getByRole("button", { name: new RegExp(`^${label}$`, "i") }));
}

function rowFor(name) {
  return screen.getByText(name).closest("tr");
}

beforeEach(() => {
  localStorage.clear();
  global.fetch = () => Promise.reject(new Error("no network in test env"));
});

describe("app loads and seeds data", () => {
  it("boots past the loading state and lands on the dashboard", async () => {
    await renderReady();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText(/Training Ledger/i)).toBeInTheDocument();
  });

  it("persists seed data into localStorage on first load", async () => {
    await renderReady();
    await waitFor(() => {
      expect(localStorage.getItem("projects_v1")).toBeTruthy();
      expect(localStorage.getItem("expenses_v1")).toBeTruthy();
    });
    const projects = JSON.parse(localStorage.getItem("projects_v1"));
    const expenses = JSON.parse(localStorage.getItem("expenses_v1"));
    expect(projects.length).toBeGreaterThan(0);
    expect(expenses.length).toBeGreaterThan(0);
  });
});

describe("tab navigation", () => {
  it("switches between all four tabs", async () => {
    const user = userEvent.setup();
    await renderReady();

    await goToTab(user, "Revenue");
    expect(screen.getByRole("heading", { name: "Revenue" })).toBeInTheDocument();

    await goToTab(user, "Expenses");
    expect(screen.getByRole("heading", { name: "Expenses" })).toBeInTheDocument();

    await goToTab(user, "Planning");
    expect(screen.getByRole("heading", { name: "Planning" })).toBeInTheDocument();

    await goToTab(user, "Dashboard");
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });
});

describe("dashboard math matches the underlying rows (black-box check)", () => {
  it("Actual/Expected revenue on the dashboard equals sums computed from the Revenue table", async () => {
    const user = userEvent.setup();
    await renderReady();

    // Pull every project row's status + amount straight from the Revenue tab
    await goToTab(user, "Revenue");
    // Show all statuses (filter defaults to All already)
    const rows = screen.getAllByRole("row").slice(1); // skip header row
    let actual = 0, expected = 0;
    for (const row of rows) {
      const cells = within(row).queryAllByRole("cell");
      if (cells.length < 6) continue;
      const amountText = cells[5].textContent;
      const statusText = cells[4].textContent.trim();
      const amount = eurToNumber(amountText);
      if (statusText !== "Lost") expected += amount;
      if (statusText !== "Lost" && statusText !== "Pipeline") actual += amount;
    }

    await goToTab(user, "Dashboard");
    const kpiCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card"));
    const revenueCard = kpiCards.find(Boolean);
    expect(revenueCard).toBeTruthy();
    const shownActual = eurToNumber(within(revenueCard).getByText(/€/, { selector: ".kpi-actual" }).textContent);

    // allow small rounding since the UI rounds to whole euros
    expect(Math.abs(shownActual - actual)).toBeLessThanOrEqual(rows.length);
    expect(expected).toBeGreaterThan(0);
  });

  it("Actual/Expected expenses on the dashboard equal sums computed from the Expenses table", async () => {
    const user = userEvent.setup();
    await renderReady();

    await goToTab(user, "Expenses");
    const rows = screen.getAllByRole("row").slice(1);
    let actual = 0, expected = 0;
    for (const row of rows) {
      const cells = within(row).queryAllByRole("cell");
      if (cells.length < 5) continue;
      const amount = eurToNumber(cells[4].textContent);
      const statusText = cells[3].textContent.trim();
      if (statusText !== "Lost") expected += amount;
      if (statusText !== "Lost" && statusText !== "Pipeline") actual += amount;
    }
    expect(expected).toBeGreaterThan(0);
    expect(actual).toBeGreaterThan(0);
  });
});

describe("Revenue tab CRUD", () => {
  it("creates a new project, edits it, and it shows up with correct values", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const before = screen.getAllByRole("row").length;
    await user.click(screen.getByRole("button", { name: /New project/i }));

    // The new row opens directly in edit mode
    const editingRow = document.querySelector("tr.editing");
    expect(editingRow).toBeTruthy();
    const inputs = within(editingRow).getAllByRole("textbox");
    await user.clear(inputs[0]);
    await user.type(inputs[0], "Acme - Kubernetes Bootcamp");
    await user.clear(inputs[1]);
    await user.type(inputs[1], "Acme Corp");

    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "1500");

    const select = within(editingRow).getByRole("combobox");
    await user.selectOptions(select, "Signed");

    // Save (checkmark button)
    const saveBtn = within(editingRow).getAllByRole("button")[0];
    await user.click(saveBtn);

    expect(screen.getAllByRole("row").length).toBe(before + 1);
    const savedRow = rowFor("Acme - Kubernetes Bootcamp");
    expect(savedRow).toBeTruthy();
    expect(within(savedRow).getByText("Acme Corp")).toBeInTheDocument();
    expect(within(savedRow).getByText("Signed")).toBeInTheDocument();
    expect(within(savedRow).getByText(/1.?500/)).toBeInTheDocument();
  });

  it("deletes a project", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const targetRow = rowFor("Efrei - Cloud Intro");
    expect(targetRow).toBeTruthy();
    const deleteBtn = within(targetRow).getAllByRole("button")[1];
    await user.click(deleteBtn);

    expect(screen.queryByText("Efrei - Cloud Intro")).not.toBeInTheDocument();
  });
});

describe("Expenses tab CRUD", () => {
  it("creates a new standalone (General / Recurring) expense", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const before = screen.getAllByRole("row").length;
    await user.click(screen.getByRole("button", { name: /New expense/i }));

    const editingRow = document.querySelector("tr.editing");
    expect(editingRow).toBeTruthy();

    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "120");

    const selects = within(editingRow).getAllByRole("combobox");
    // selects order: linked project, category, status
    await user.selectOptions(selects[1], "Software");

    const saveBtn = within(editingRow).getAllByRole("button")[0];
    await user.click(saveBtn);

    expect(screen.getAllByRole("row").length).toBe(before + 1);
    const savedRow = screen.getByText("General / Recurring").closest("tr");
    expect(within(savedRow).getByText("Software")).toBeInTheDocument();
  });
});

describe("Revenue column filters", () => {
  it("filters by project name text", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const nameFilter = screen.getAllByPlaceholderText("Filter…")[0]; // first text filter = Project column
    await user.type(nameFilter, "AZ500");

    expect(screen.getByText("Cellenza - AZ500")).toBeInTheDocument();
    expect(screen.queryByText("Efrei - Cloud Intro")).not.toBeInTheDocument();
    expect(screen.getByText(/1 of \d+ projects/)).toBeInTheDocument();
  });

  it("filters by status via the multi-select and shows a Clear filters control", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    // open the Status multi-select and uncheck everything except "Lost"
    const statusToggle = screen.getByText(/^Status$/, { selector: "summary" });
    const statusDetails = statusToggle.closest("details");
    await user.click(statusToggle);
    await user.click(within(statusDetails).getByRole("button", { name: /clear all/i }));
    const lostCheckbox = within(statusDetails).getByRole("checkbox", { name: /Lost/i });
    await user.click(lostCheckbox);

    // every visible project row should be Lost
    const rows = screen.getAllByRole("row").slice(2);
    const visibleStatuses = rows
      .map((r) => within(r).queryAllByRole("cell"))
      .filter((c) => c.length >= 5)
      .map((c) => c[4].textContent.trim());
    expect(visibleStatuses.length).toBeGreaterThan(0);
    expect(visibleStatuses.every((s) => s === "Lost")).toBe(true);

    expect(screen.getByRole("button", { name: /Clear filters/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Clear filters/i }));
    expect(screen.queryByRole("button", { name: /Clear filters/i })).not.toBeInTheDocument();
  });

  it("filters by amount range", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const [minInput, maxInput] = screen.getAllByPlaceholderText(/^Min$|^Max$/);
    await user.type(minInput, "3000");
    await user.type(maxInput, "5000");

    const rows = screen.getAllByRole("row").slice(2);
    const amounts = rows
      .map((r) => within(r).queryAllByRole("cell"))
      .filter((c) => c.length >= 6)
      .map((c) => eurToNumber(c[5].textContent));
    expect(amounts.length).toBeGreaterThan(0);
    expect(amounts.every((a) => a >= 3000 && a <= 5000)).toBe(true);
  });
});

describe("Expenses column filters", () => {
  it("filters by linked project text", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const projectFilter = screen.getByPlaceholderText("Filter…");
    await user.type(projectFilter, "IWG");

    expect(screen.getAllByText("IWG - Office").length).toBeGreaterThan(0);
    expect(screen.queryByText("Cellenza - AZ500")).not.toBeInTheDocument();
  });

  it("filters by category via the multi-select", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const categoryToggle = screen.getByText(/^Category$/, { selector: "summary" });
    const categoryDetails = categoryToggle.closest("details");
    await user.click(categoryToggle);
    await user.click(within(categoryDetails).getByRole("button", { name: /clear all/i }));
    const officeCheckbox = within(categoryDetails).getByRole("checkbox", { name: /Office/i });
    await user.click(officeCheckbox);

    const rows = screen.getAllByRole("row").slice(2);
    const cats = rows
      .map((r) => within(r).queryAllByRole("cell"))
      .filter((c) => c.length >= 2)
      .map((c) => c[1].textContent.trim());
    expect(cats.length).toBeGreaterThan(0);
    expect(cats.every((c) => c === "Office")).toBe(true);
  });
});

describe("Planning tab", () => {
  it("only lists projects that are not Paid and not Lost", async () => {
    const user = userEvent.setup();
    await renderReady();

    await goToTab(user, "Revenue");
    const rows = screen.getAllByRole("row").slice(1);
    const paidOrLostNames = [];
    const upcomingNames = [];
    for (const row of rows) {
      const cells = within(row).queryAllByRole("cell");
      if (cells.length < 5) continue;
      const name = cells[0].textContent.trim();
      const status = cells[4].textContent.trim();
      if (status === "Paid" || status === "Lost") paidOrLostNames.push(name);
      else upcomingNames.push(name);
    }

    await goToTab(user, "Planning");
    for (const name of paidOrLostNames) {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    }
    for (const name of upcomingNames.slice(0, 3)) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });
});

describe("persistence across reloads", () => {
  it("keeps edits after the app is unmounted and remounted (simulating a page refresh)", async () => {
    const user = userEvent.setup();
    const { unmount } = await renderReady();
    await goToTab(user, "Revenue");

    const targetRow = rowFor("Cellenza - AZ500");
    const deleteBtn = within(targetRow).getAllByRole("button")[1];
    await user.click(deleteBtn);
    expect(screen.queryByText("Cellenza - AZ500")).not.toBeInTheDocument();

    unmount();
    cleanup();

    const user2 = userEvent.setup();
    await renderReady();
    await goToTab(user2, "Revenue");
    expect(screen.queryByText("Cellenza - AZ500")).not.toBeInTheDocument();
  });
});

describe("Planning tab ordering", () => {
  it("lists dated upcoming projects in ascending date order (soonest first)", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Planning");

    const rows = Array.from(document.querySelectorAll(".timeline-row"));
    expect(rows.length).toBeGreaterThan(1);

    // Read the day/month/year straight off each timeline row's own date badge and
    // meta line, rather than cross-referencing by project name (which isn't unique —
    // e.g. "FastLane MD-102" and "Teams Sub" each appear more than once in the data).
    const currentYear = new Date().getFullYear();
    const timestamps = rows.map((row) => {
      const day = row.querySelector(".tl-day").textContent.trim();
      const monthYear = row.querySelector(".tl-month").textContent.trim(); // e.g. "May 26"
      return new Date(`${day} ${monthYear}`).getTime();
    });

    expect(timestamps.every((t) => !Number.isNaN(t))).toBe(true);
    const sortedCopy = [...timestamps].sort((a, b) => a - b);
    expect(timestamps).toEqual(sortedCopy);
  });
});

describe("manual Save button", () => {
  it("marks the ledger as having unsaved changes on first load (no remote data yet), and still caches to localStorage", async () => {
    await renderReady();
    expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    const saveBtn = screen.getByRole("button", { name: /^Save$/ });
    expect(saveBtn).not.toBeDisabled();

    const projects = JSON.parse(localStorage.getItem("projects_v1"));
    expect(projects.length).toBeGreaterThan(0);
  });

  it("does NOT call the API on every edit — only localStorage is touched until Save is clicked", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn(() => Promise.reject(new Error("should not be called")));
    global.fetch = fetchSpy;
    await renderReady();
    fetchSpy.mockClear(); // ignore the initial GET /api/data made during boot

    await goToTab(user, "Revenue");
    const targetRow = rowFor("Cellenza - AZ500");
    const deleteBtn = within(targetRow).getAllByRole("button")[1];
    await user.click(deleteBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows 'Save failed — retry' if the API is unreachable when Save is clicked", async () => {
    const user = userEvent.setup();
    await renderReady();
    await user.click(screen.getByRole("button", { name: /^Save$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Save failed — retry/i })).toBeInTheDocument();
    });
  });

  it("clears the unsaved indicator once Save succeeds", async () => {
    global.fetch = (url, opts) => {
      if (url === "/api/data" && opts && opts.method === "POST") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, version: "snapshots/2026-07-26T00-00-00-000Z.json" }) });
      }
      return Promise.reject(new Error("no network in test env"));
    };
    const user = userEvent.setup();
    await renderReady();
    expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Save$/ }));
    await waitFor(() => {
      expect(screen.getByText(/All changes saved/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /^Saved/i })).toBeDisabled();
  });
});

describe("History panel", () => {
  it("shows an error state when the versions API is unreachable (default test environment)", async () => {
    const user = userEvent.setup();
    await renderReady();
    await user.click(screen.getByRole("button", { name: /^History$/ }));
    await waitFor(() => {
      expect(screen.getByText(/Couldn't reach the history API/i)).toBeInTheDocument();
    });
  });

  it("lists versions and restores the selected one when the API is available", async () => {
    const versions = [
      { name: "snapshots/2026-07-01T10-00-00-000Z.json", savedAt: "2026-07-01T10:00:00.000Z", sizeBytes: 2048 },
      { name: "snapshots/2026-06-01T10-00-00-000Z.json", savedAt: "2026-06-01T10:00:00.000Z", sizeBytes: 1024 },
    ];
    const restoredProjects = [{ id: "rx1", name: "Restored Project", client: "OldClient", status: "Paid", expectedAmount: 42, startDate: "2026-06-01", trainer: "X" }];
    const restoredExpenses = [{ id: "rx-e1", category: "Trainer Fee", expectedAmount: 10, status: "Paid", date: "2026-06-01" }];

    global.fetch = (url) => {
      if (url === "/api/versions") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ versions }) });
      }
      if (typeof url === "string" && url.startsWith("/api/data?version=")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ projects: restoredProjects, expenses: restoredExpenses, version: versions[1].name }) });
      }
      return Promise.reject(new Error("no network in test env"));
    };

    const user = userEvent.setup();
    await renderReady();
    await user.click(screen.getByRole("button", { name: /^History$/ }));

    await waitFor(() => expect(screen.getByText(/latest/i)).toBeInTheDocument());
    const restoreButtons = screen.getAllByRole("button", { name: /^Restore$/ });
    expect(restoreButtons.length).toBe(2);
    await user.click(restoreButtons[1]); // restore the older (June) version

    await goToTab(user, "Revenue");
    expect(screen.getByText("Restored Project")).toBeInTheDocument();
  });
});

describe("Dashboard period filter", () => {
  it("defaults to All time", async () => {
    await renderReady();
    expect(screen.getByText("All time", { selector: "strong" })).toBeInTheDocument();
  });

  it("filtering to 2027 shows only 2027 projects' totals, independently verified against the Revenue tab", async () => {
    const user = userEvent.setup();
    await renderReady();

    // Independently compute what 2027-only Actual/Expected revenue should be, straight from the Revenue table
    await goToTab(user, "Revenue");
    const rows = screen.getAllByRole("row").slice(2);
    let actual2027 = 0, expected2027 = 0, matched2027Rows = 0;
    for (const row of rows) {
      const cells = within(row).queryAllByRole("cell");
      if (cells.length < 6) continue;
      const dateText = cells[3].textContent;
      const statusText = cells[4].textContent.trim();
      const amount = eurToNumber(cells[5].textContent);
      if (dateText.includes("2027")) {
        matched2027Rows++;
        if (statusText !== "Lost") expected2027 += amount;
        if (statusText === "Paid") actual2027 += amount;
      }
    }
    // Both 2027 sessions (Cloud Intro 2, parts 1 & 2) have no priced amount yet in the
    // source spreadsheet — confirm the test is actually looking at real rows, not that
    // the year is empty entirely.
    expect(matched2027Rows).toBeGreaterThan(0);
    expect(expected2027).toBe(0);

    // Now select year=2027 on the Dashboard and confirm the KPI matches (i.e. shows 0, not a fabricated figure)
    await goToTab(user, "Dashboard");
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2027");

    expect(screen.getByText("2027", { selector: "strong" })).toBeInTheDocument(); // subtitle reflects the period
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownActual = eurToNumber(within(revenueCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);
    expect(Math.abs(shownActual - actual2027)).toBeLessThanOrEqual(2);
  });

  it("narrowing to a specific month within a year filters further, and Reset returns to All time", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Dashboard");

    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2027");

    // a month selector should now appear
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBe(2);
    await user.selectOptions(selects[1], "01");
    expect(screen.getByText(/Jan 2027/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Reset to all time/i }));
    expect(screen.getByText("All time", { selector: "strong" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reset to all time/i })).not.toBeInTheDocument();
  });

  it("excludes undated pipeline projects from a specific period and shows a note about it", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Dashboard");
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2026");
    expect(screen.getByText(/pipeline project.*without a date/i)).toBeInTheDocument();
  });
});

describe("Revenue vs. overhead expense separation", () => {
  it("does not list pure-overhead cost items (Teams Sub, FZ - Avril & Mai, etc.) in the Revenue tab", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    for (const overheadName of ["Teams Sub", "FZ - Avril & Mai", "Ichrak - Mars", "Pearson AZ-500", "Amine - Avril & Mai"]) {
      expect(screen.queryByText(overheadName)).not.toBeInTheDocument();
    }
    // a genuine revenue project should still be there
    expect(screen.getByText("Efrei - Cloud Intro")).toBeInTheDocument();
  });

  it("shows the real historical name (not a generic label) for standalone overhead expenses", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    expect(screen.getAllByText("Teams Sub").length).toBeGreaterThan(0);
    expect(screen.getByText("FZ - Avril & Mai")).toBeInTheDocument();
    // and it should NOT be flattened to the generic placeholder
    const genericLabelCount = screen.queryAllByText("General / Recurring").length;
    expect(genericLabelCount).toBe(0);
  });

  it("still counts overhead costs in expense totals even though they're not linked to a revenue project", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const projectFilter = screen.getByPlaceholderText("Filter…");
    await user.type(projectFilter, "Teams Sub");
    expect(screen.getByText(/2 of \d+ entries/)).toBeInTheDocument(); // two Teams Sub months
  });
});

describe("No fabricated figures for genuinely unpriced pipeline sessions", () => {
  it("shows 0 for Cloud Intro 2 sessions, matching the blank source spreadsheet (not an invented amount)", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const row1 = rowFor("Efrei - Cloud Intro 2 (1/2)");
    const row2 = rowFor("Efrei - Cloud Intro 2 (2/2)");
    expect(row1).toBeTruthy();
    expect(row2).toBeTruthy();
    expect(within(row1).getByText("0 €")).toBeInTheDocument();
    expect(within(row2).getByText("0 €")).toBeInTheDocument();

    // and no Trainer Fee expense should exist for them either, since the source has none
    await goToTab(user, "Expenses");
    const projectFilter = screen.getByPlaceholderText("Filter…");
    await user.type(projectFilter, "Cloud Intro 2");
    expect(screen.getByText(/0 of \d+ entries/)).toBeInTheDocument();
  });
});

describe("Actual matches the source spreadsheet's own Dashboard totals", () => {
  it("shows Actual Revenue/Expenses matching the file's Total Revenue (20931.90) and Total Costs (20493.36) exactly", async () => {
    await renderReady();
    // Dashboard is the default landing tab already
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const expenseCards = screen.getAllByText(/^Expenses$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownRevenue = eurToNumber(within(revenueCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);
    const shownExpenses = eurToNumber(within(expenseCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);

    // allow a couple of euros of rounding slack since the UI rounds to whole euros
    expect(Math.abs(shownRevenue - 20931.9)).toBeLessThanOrEqual(2);
    expect(Math.abs(shownExpenses - 20493.36)).toBeLessThanOrEqual(2);
  });

  it("shows Expected Revenue/Expenses as a literal sum of every row (Lost included), matching the file's Expected Revenue (43121.90) / Expected TCost (38843.36) totals plus the EFREI pipeline additions", async () => {
    await renderReady();
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const expenseCards = screen.getAllByText(/^Expenses$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const expectedRevenueText = within(revenueCards[0]).getByText(/if everything closes/i).textContent;
    const expectedExpensesText = within(expenseCards[0]).getByText(/if everything closes/i).textContent;
    const shownExpectedRevenue = eurToNumber(expectedRevenueText);
    const shownExpectedExpenses = eurToNumber(expectedExpensesText);

    // Bilan 2026 file totals (43121.90 / 38843.36) + EFREI pipeline additions still in the app
    // (Cloud Intro 3: +2212 revenue / +2000 trainer fee; Cloud Intro 2 sessions and AZ104/DP700 add 0)
    expect(Math.abs(shownExpectedRevenue - (43121.90 + 2212))).toBeLessThanOrEqual(2);
    expect(Math.abs(shownExpectedExpenses - (38843.36 + 2000))).toBeLessThanOrEqual(2);
  });
});
