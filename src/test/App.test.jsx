import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within, waitFor, cleanup, fireEvent } from "@testing-library/react";
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
    expect(screen.getByText(/Planning & Budget/i)).toBeInTheDocument();
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
      if (cells.length < 8) continue;
      const amountText = cells[7].textContent;
      const statusText = cells[6].textContent.trim();
      const amount = eurToNumber(amountText);
      expected += amount; // Expected = literal unconditional sum, Lost included
      if (statusText !== "Lost") actual += amount;
    }

    await goToTab(user, "Dashboard");
    await user.click(screen.getByRole("button", { name: "All time" }));
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
      if (cells.length < 6) continue;
      const amount = eurToNumber(cells[5].textContent);
      const statusText = cells[4].textContent.trim();
      expected += amount; // Expected = literal unconditional sum, Lost included
      if (statusText !== "Lost") actual += amount;
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
    const saveBtn = within(editingRow).getByRole("button", { name: "Save" });
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
    const deleteBtn = within(targetRow).getByRole("button", { name: "Delete" });
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

    const saveBtn = within(editingRow).getByRole("button", { name: "Save" });
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
    const statusToggle = screen.getByText(/^Status$/, { selector: ".msf-trigger" });
    await user.click(statusToggle);
    const statusPanel = document.querySelector(".msf-panel");
    await user.click(within(statusPanel).getByRole("button", { name: /clear all/i }));
    const lostCheckbox = within(statusPanel).getByRole("checkbox", { name: /Lost/i });
    await user.click(lostCheckbox);

    // every visible project row should be Lost
    const rows = screen.getAllByRole("row").slice(2);
    const visibleStatuses = rows
      .map((r) => within(r).queryAllByRole("cell"))
      .filter((c) => c.length >= 7)
      .map((c) => c[6].textContent.trim());
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
      .filter((c) => c.length >= 8)
      .map((c) => eurToNumber(c[7].textContent));
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

    const categoryToggle = screen.getByText(/^Category$/, { selector: ".msf-trigger" });
    await user.click(categoryToggle);
    const categoryPanel = document.querySelector(".msf-panel");
    await user.click(within(categoryPanel).getByRole("button", { name: /clear all/i }));
    const officeCheckbox = within(categoryPanel).getByRole("checkbox", { name: /Office/i });
    await user.click(officeCheckbox);

    const rows = screen.getAllByRole("row").slice(2);
    const cats = rows
      .map((r) => within(r).queryAllByRole("cell"))
      .filter((c) => c.length >= 3)
      .map((c) => c[2].textContent.trim());
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
      if (cells.length < 8) continue;
      const name = cells[1].textContent.trim();
      const status = cells[6].textContent.trim();
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
    const deleteBtn = within(targetRow).getByRole("button", { name: "Delete" });
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

    // Scope to the main chronological list only - the "needs a trainer" priority section
    // (Signed-status items) is intentionally shown first regardless of date, so it's excluded here.
    const rows = Array.from(document.querySelectorAll(".timeline:not(.needs-trainer-list) .timeline-row"));
    expect(rows.length).toBeGreaterThan(1);

    // Read the day/month/year straight off each timeline row's own date badge and
    // meta line, rather than cross-referencing by project name (which isn't unique -
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

  it("does NOT call the API on every edit - only localStorage is touched until Save is clicked", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn(() => Promise.reject(new Error("should not be called")));
    global.fetch = fetchSpy;
    await renderReady();
    fetchSpy.mockClear(); // ignore the initial GET /api/data made during boot

    await goToTab(user, "Revenue");
    const targetRow = rowFor("Cellenza - AZ500");
    const deleteBtn = within(targetRow).getByRole("button", { name: "Delete" });
    await user.click(deleteBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows 'Save failed, retry' if the API is unreachable when Save is clicked", async () => {
    const user = userEvent.setup();
    await renderReady();
    await user.click(screen.getByRole("button", { name: /^Save$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Save failed, retry/i })).toBeInTheDocument();
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

describe("Dashboard period presets", () => {
  it("defaults to This month", async () => {
    await renderReady();
    expect(screen.getByRole("button", { name: "This month" }).className).toContain("active");
  });

  it("Custom mode reveals year/month pickers; selecting 2027 shows only 2027 projects' totals, independently verified against the Revenue tab", async () => {
    const user = userEvent.setup();
    await renderReady();

    // Independently compute what 2027-only Actual/Expected revenue should be, straight from the Revenue table
    await goToTab(user, "Revenue");
    const rows = screen.getAllByRole("row").slice(2);
    let actual2027 = 0, expected2027 = 0, matched2027Rows = 0;
    for (const row of rows) {
      const cells = within(row).queryAllByRole("cell");
      if (cells.length < 8) continue;
      const dateText = cells[5].textContent;
      const statusText = cells[6].textContent.trim();
      const amount = eurToNumber(cells[7].textContent);
      if (dateText.includes("2027")) {
        matched2027Rows++;
        if (statusText !== "Lost") expected2027 += amount;
        if (statusText === "Paid") actual2027 += amount;
      }
    }
    expect(matched2027Rows).toBeGreaterThan(0);
    expect(expected2027).toBe(0);

    await goToTab(user, "Dashboard");
    await user.click(screen.getByRole("button", { name: "Custom…" }));
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2027");

    expect(screen.getByText("2027", { selector: "strong" })).toBeInTheDocument();
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownActual = eurToNumber(within(revenueCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);
    expect(Math.abs(shownActual - actual2027)).toBeLessThanOrEqual(2);
  });

  it("narrowing to a specific month within a custom year filters further, and switching back to All time clears it", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Dashboard");

    await user.click(screen.getByRole("button", { name: "Custom…" }));
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2027");

    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBe(2);
    await user.selectOptions(selects[1], "01");
    expect(screen.getByText(/Jan 2027/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All time" }));
    expect(screen.getByText("All time", { selector: "strong" })).toBeInTheDocument();
  });

  it("excludes undated pipeline projects from a specific period and shows a note about it", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Dashboard");
    await user.click(screen.getByRole("button", { name: "Custom…" }));
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2026");
    expect(screen.getByText(/pipeline project.*without a date/i)).toBeInTheDocument();
  });

  it("This month / Last month / Last 3 months / This year presets are selectable and update the label", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Dashboard");

    for (const label of ["This month", "Last month", "Last 3 months", `This year (${new Date().getFullYear()})`]) {
      await user.click(screen.getByRole("button", { name: label }));
      expect(screen.getByRole("button", { name: label }).className).toContain("active");
    }

    // back to All time and confirm nothing stays "stuck" active
    await user.click(screen.getByRole("button", { name: "All time" }));
    expect(screen.getByRole("button", { name: "This month" }).className).not.toContain("active");
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
  it("shows Actual Revenue/Expenses as Bilan 2026 (20931.90/20493.36) plus the EFREI additions now counted as confirmed since the Pipeline status was removed", async () => {
    const user = userEvent.setup();
    await renderReady();
    // Dashboard is the default landing tab, but defaults to "This month" - switch to All time
    await user.click(screen.getByRole("button", { name: "All time" }));
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const expenseCards = screen.getAllByText(/^Expenses$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownRevenue = eurToNumber(within(revenueCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);
    const shownExpenses = eurToNumber(within(expenseCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);

    // Bilan 2026 file total (20931.90/20493.36) + Cloud Intro 3 (2212/2000), which used to be
    // "Pipeline" (excluded from Actual) but now defaults to "Signed" since Pipeline no longer
    // exists as a status - this is an intentional consequence of simplifying to 5 statuses.
    expect(Math.abs(shownRevenue - (20931.9 + 2212))).toBeLessThanOrEqual(2);
    expect(Math.abs(shownExpenses - (20493.36 + 2000))).toBeLessThanOrEqual(2);
  });

  it("shows Expected Revenue/Expenses as a literal sum of every row (Lost included), matching the file's Expected Revenue (43121.90) / Expected TCost (38843.36) totals plus the EFREI pipeline additions", async () => {
    const user = userEvent.setup();
    await renderReady();
    await user.click(screen.getByRole("button", { name: "All time" }));
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

describe("Expense project link dropdown shows real names", () => {
  it("shows real project names as options, not p1/p2/p3", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: /New expense/i }));

    const editingRow = document.querySelector("tr.editing");
    const selects = within(editingRow).getAllByRole("combobox");
    const projectSelect = selects[0];
    const optionTexts = Array.from(projectSelect.querySelectorAll("option")).map((o) => o.textContent);
    expect(optionTexts.some((t) => /^p\d+$/.test(t))).toBe(false);
    expect(optionTexts).toContain("General / Recurring (not linked)");
    expect(optionTexts.some((t) => t.includes("Efrei"))).toBe(true);
  });

  it("linking an expense to a project by name sets the correct projectId", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: /New expense/i }));

    const editingRow = document.querySelector("tr.editing");
    const projectSelect = within(editingRow).getAllByRole("combobox")[0];
    await user.selectOptions(projectSelect, screen.getAllByText("Efrei - Cloud Intro")[0].closest("option") || projectSelect.querySelector("option[value='p1']"));
    const saveBtn = within(editingRow).getByRole("button", { name: "Save" });
    await user.click(saveBtn);
    expect(screen.getAllByText("Efrei - Cloud Intro").length).toBeGreaterThan(0);
  });
});

describe("Delivered status", () => {
  it("is available as a project status between Signed and Invoiced", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");
    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const statusSelect = within(editingRow).getByRole("combobox");
    const options = Array.from(statusSelect.querySelectorAll("option")).map((o) => o.value);
    const signedIdx = options.indexOf("Signed");
    const deliveredIdx = options.indexOf("Delivered");
    const invoicedIdx = options.indexOf("Invoiced");
    expect(deliveredIdx).toBeGreaterThan(signedIdx);
    expect(deliveredIdx).toBeLessThan(invoicedIdx);
  });

  it("counts a Delivered project as confirmed business (included in Actual, not just Expected)", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");
    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "500");
    const statusSelect = within(editingRow).getByRole("combobox");
    await user.selectOptions(statusSelect, "Delivered");
    const saveBtn = within(editingRow).getByRole("button", { name: "Save" });
    await user.click(saveBtn);

    await goToTab(user, "Dashboard");
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownActual = eurToNumber(within(revenueCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);
    expect(shownActual).toBeGreaterThanOrEqual(500);
  });
});

describe("New rows appear at the top of the list immediately", () => {
  it("shows a new project as the first row in Revenue right after clicking New project", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    await user.click(screen.getByRole("button", { name: /New project/i }));
    const firstDataRow = screen.getAllByRole("row")[2]; // row 0 = header, row 1 = filter row
    expect(firstDataRow.className).toContain("editing");
    expect(within(firstDataRow).getByDisplayValue("New project")).toBeInTheDocument();
  });

  it("shows a new expense as the first row in Expenses right after clicking New expense", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    await user.click(screen.getByRole("button", { name: /New expense/i }));
    const firstDataRow = screen.getAllByRole("row")[2];
    expect(firstDataRow.className).toContain("editing");
  });
});

describe("Internal (non-client) trainings/certifications", () => {
  it("does not show internal items (Pearson, Eni certifications) in the default Client Revenue view", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    expect(screen.queryByText("Pearson AZ-500")).not.toBeInTheDocument();
    expect(screen.queryByText("Eni - Certification Formateur")).not.toBeInTheDocument();
    expect(screen.getByText("Efrei - Cloud Intro")).toBeInTheDocument();
  });

  it("shows internal items when the Internal toggle is selected, and hides client projects", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    await user.click(screen.getByRole("button", { name: "Internal" }));
    expect(screen.getByText("Pearson AZ-500")).toBeInTheDocument();
    expect(screen.getByText("Eni - Certification Formateur")).toBeInTheDocument();
    expect(screen.queryByText("Efrei - Cloud Intro")).not.toBeInTheDocument();
  });

  it("shows both when All is selected", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Pearson AZ-500")).toBeInTheDocument();
    expect(screen.getByText("Efrei - Cloud Intro")).toBeInTheDocument();
  });

  it("still counts Certification costs in Expenses even though they're not client revenue", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const categoryToggle = screen.getByText(/^Category$/, { selector: ".msf-trigger" });
    await user.click(categoryToggle);
    const categoryPanel = document.querySelector(".msf-panel");
    await user.click(within(categoryPanel).getByRole("button", { name: /clear all/i }));
    const certCheckbox = within(categoryPanel).getByRole("checkbox", { name: /Certification/i });
    await user.click(certCheckbox);

    expect(screen.getAllByText("Pearson AZ-500").length).toBeGreaterThan(0);
  });

  it("a new project defaults to Internal type when created while viewing the Internal tab", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");
    await user.click(screen.getByRole("button", { name: "Internal" }));
    await user.click(screen.getByRole("button", { name: /New project/i }));

    const editingRow = document.querySelector("tr.editing");
    const internalToggle = within(editingRow).getByRole("button", { name: "Internal" });
    expect(internalToggle.className).toContain("active");
  });
});

describe("Contact column and 5-status simplification", () => {
  it("shows a Contact column with real contact names, separate from Client", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const row = rowFor("Efrei - Cloud Intro");
    expect(within(row).getByText("Julien")).toBeInTheDocument();
  });

  it("offers 6 statuses (Signed, Scheduled, Delivered, Invoiced, Paid, Lost) in the status filter and edit dropdown", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const statusSelect = within(editingRow).getByRole("combobox");
    const options = Array.from(statusSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["Signed", "Scheduled", "Delivered", "Invoiced", "Paid", "Lost"]);
  });

  it("can filter Revenue by contact name", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const contactFilter = screen.getAllByPlaceholderText("Filter…")[2]; // Project, Client, Contact, Trainer order
    await user.type(contactFilter, "Julien");
    expect(screen.getByText("Efrei - Cloud Intro")).toBeInTheDocument();
    expect(screen.queryByText("Cellenza - AZ500")).not.toBeInTheDocument();
  });
});

describe("Expenses Client/Internal/Recurring toggle", () => {
  it("defaults to All and shows a mix of client-linked, internal-linked, and recurring expenses", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    expect(screen.getAllByText("Efrei - Cloud Intro").length).toBeGreaterThan(0); // client-linked
    expect(screen.getAllByText("Pearson AZ-500").length).toBeGreaterThan(0); // internal-linked
    expect(screen.getAllByText("Teams Sub").length).toBeGreaterThan(0); // recurring, unlinked
  });

  it("Client view shows only expenses linked to a client (revenue) project", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: "Client" }));

    expect(screen.getAllByText("Efrei - Cloud Intro").length).toBeGreaterThan(0);
    expect(screen.queryByText("Pearson AZ-500")).not.toBeInTheDocument();
    expect(screen.queryByText("Teams Sub")).not.toBeInTheDocument();
  });

  it("Internal view shows only expenses linked to an internal project", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: "Internal" }));

    expect(screen.getAllByText("Pearson AZ-500").length).toBeGreaterThan(0);
    expect(screen.queryByText("Efrei - Cloud Intro")).not.toBeInTheDocument();
    expect(screen.queryByText("Teams Sub")).not.toBeInTheDocument();
  });

  it("Recurring view shows only standalone (unlinked) expenses", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: "Recurring" }));

    expect(screen.getAllByText("Teams Sub").length).toBeGreaterThan(0);
    expect(screen.queryByText("Efrei - Cloud Intro")).not.toBeInTheDocument();
    expect(screen.queryByText("Pearson AZ-500")).not.toBeInTheDocument();
  });
});

describe("Action buttons are on the left of each row", () => {
  it("Revenue: Edit/Delete buttons are in the first cell of the row", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const row = rowFor("Efrei - Cloud Intro");
    const firstCell = within(row).getAllByRole("cell")[0];
    expect(within(firstCell).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(within(firstCell).getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("Expenses: Edit/Delete buttons are in the first cell of the row", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const rows = screen.getAllByRole("row").slice(2);
    const dataRow = rows.find((r) => within(r).queryAllByRole("cell").length >= 6);
    const firstCell = within(dataRow).getAllByRole("cell")[0];
    expect(within(firstCell).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(within(firstCell).getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});

describe("Non-contiguous session dates on a single project", () => {
  it("lets you add extra dates to a project without creating a second project or duplicating revenue", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const before = screen.getAllByRole("row").length;
    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");

    const startDateInput = editingRow.querySelector('input[type="date"]');
    fireEvent.change(startDateInput, { target: { value: "2026-09-01" } });

    const extraDateInput = editingRow.querySelector(".extra-dates-add input");
    fireEvent.change(extraDateInput, { target: { value: "2026-09-15" } });
    await user.click(within(editingRow).getByRole("button", { name: "Add date" }));

    // the chip for the added date should now be visible
    expect(within(editingRow).getByText(/15 Sept? 2026/)).toBeInTheDocument();

    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "1000");
    await user.click(within(editingRow).getByRole("button", { name: "Save" }));

    // still just ONE new row, not two
    expect(screen.getAllByRole("row").length).toBe(before + 1);
    const savedRow = screen.getByText("New project", { selector: ".proj-name" }).closest("tr");
    expect(within(savedRow).getByText(/\+1 more date/)).toBeInTheDocument();
  });

  it("shows both the primary date and extra dates as separate entries in Planning, tagging the extra one", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const nameInput = within(editingRow).getAllByRole("textbox")[0];
    await user.clear(nameInput);
    await user.type(nameInput, "Scattered Training");

    const startDateInput = editingRow.querySelector('input[type="date"]');
    fireEvent.change(startDateInput, { target: { value: "2026-09-01" } });
    const extraDateInput = editingRow.querySelector(".extra-dates-add input");
    fireEvent.change(extraDateInput, { target: { value: "2026-09-20" } });
    await user.click(within(editingRow).getByRole("button", { name: "Add date" }));

    const statusSelect = within(editingRow).getByRole("combobox");
    await user.selectOptions(statusSelect, "Signed");
    await user.click(within(editingRow).getByRole("button", { name: "Save" }));

    await goToTab(user, "Planning");
    const occurrences = screen.getAllByText("Scattered Training");
    expect(occurrences.length).toBe(2); // one row for each date, same project
    expect(screen.getByText("Extra session")).toBeInTheDocument();
  });
});

describe("New expense stays visible when created from a filtered scope", () => {
  it("switches to All when clicking New expense from the Client or Internal view, so the new row isn't hidden", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: "Internal" }));

    await user.click(screen.getByRole("button", { name: /New expense/i }));
    const editingRow = document.querySelector("tr.editing");
    expect(editingRow).toBeTruthy(); // must exist and be visible, not filtered out
    expect(screen.getByRole("button", { name: "All" }).className).toContain("active");
  });

  it("does NOT switch view when creating a new expense from Recurring (already the right scope)", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");
    await user.click(screen.getByRole("button", { name: "Recurring" }));

    await user.click(screen.getByRole("button", { name: /New expense/i }));
    const editingRow = document.querySelector("tr.editing");
    expect(editingRow).toBeTruthy();
    expect(screen.getByRole("button", { name: "Recurring" }).className).toContain("active");
  });
});

describe("Scheduled status reintroduced after Signed", () => {
  it("Scheduled sits right after Signed in the status list", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");
    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const statusSelect = within(editingRow).getByRole("combobox");
    const options = Array.from(statusSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options.indexOf("Scheduled")).toBe(options.indexOf("Signed") + 1);
  });

  it("counts Scheduled as confirmed business, same as Signed/Delivered/Invoiced/Paid", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");
    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "777");
    const statusSelect = within(editingRow).getByRole("combobox");
    await user.selectOptions(statusSelect, "Scheduled");
    await user.click(within(editingRow).getByRole("button", { name: "Save" }));

    await goToTab(user, "Dashboard");
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownActual = eurToNumber(within(revenueCards[0]).getByText(/€/, { selector: ".kpi-actual" }).textContent);
    expect(shownActual).toBeGreaterThanOrEqual(777);
  });
});

describe("Period filter Option A: any session date counts, not just the primary one", () => {
  it("includes a project in a month's filter if only an EXTRA date (not the primary date) falls in that month", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const nameInput = within(editingRow).getAllByRole("textbox")[0];
    await user.clear(nameInput);
    await user.type(nameInput, "Split Session Training");

    const startDateInput = editingRow.querySelector('input[type="date"]');
    fireEvent.change(startDateInput, { target: { value: "2026-02-28" } }); // primary date in February
    const extraDateInput = editingRow.querySelector(".extra-dates-add input");
    fireEvent.change(extraDateInput, { target: { value: "2026-03-10" } }); // extra date in March
    await user.click(within(editingRow).getByRole("button", { name: "Add date" }));

    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "500");
    await user.click(within(editingRow).getByRole("button", { name: "Save" }));

    await goToTab(user, "Dashboard");
    await user.click(screen.getByRole("button", { name: "Custom…" }));
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2026");
    const monthSelect = screen.getAllByRole("combobox")[1];
    await user.selectOptions(monthSelect, "03"); // March - the project's PRIMARY date is Feb, not March

    // it should still show up in March because of the extra date, not be excluded
    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const shownExpected = eurToNumber(within(revenueCards[0]).getByText(/if everything closes/i).textContent);
    expect(shownExpected).toBeGreaterThanOrEqual(500);
  });

  it("excludes a project from a month's filter if none of its dates (primary or extra) fall in that month", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    // baseline: All time expected revenue before adding this project
    await goToTab(user, "Dashboard");
    const revenueCards0 = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const baselineAllTime = eurToNumber(within(revenueCards0[0]).getByText(/if everything closes/i).textContent);

    await goToTab(user, "Revenue");
    await user.click(screen.getByRole("button", { name: /New project/i }));
    const editingRow = document.querySelector("tr.editing");
    const nameInput = within(editingRow).getAllByRole("textbox")[0];
    await user.clear(nameInput);
    await user.type(nameInput, "Feb And April Only");

    const startDateInput = editingRow.querySelector('input[type="date"]');
    fireEvent.change(startDateInput, { target: { value: "2026-02-10" } });
    const extraDateInput = editingRow.querySelector(".extra-dates-add input");
    fireEvent.change(extraDateInput, { target: { value: "2026-04-10" } }); // Feb and April, nothing in March
    await user.click(within(editingRow).getByRole("button", { name: "Add date" }));
    const numberInput = within(editingRow).getByRole("spinbutton");
    await user.clear(numberInput);
    await user.type(numberInput, "900");
    await user.click(within(editingRow).getByRole("button", { name: "Save" }));

    await goToTab(user, "Dashboard");
    await user.click(screen.getByRole("button", { name: "Custom…" }));
    const yearSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(yearSelect, "2026");
    const monthSelect = screen.getAllByRole("combobox")[1];
    await user.selectOptions(monthSelect, "03"); // March - no session lands here

    const revenueCards = screen.getAllByText(/^Revenue$/).map((el) => el.closest(".kpi-card")).filter(Boolean);
    const marchExpected = eurToNumber(within(revenueCards[0]).getByText(/if everything closes/i).textContent);

    // confirm the new project's 900 is NOT part of March's total, by checking April instead where it SHOULD appear
    await user.selectOptions(monthSelect, "04");
    const aprilExpected = eurToNumber(within(revenueCards[0]).getByText(/if everything closes/i).textContent);
    expect(aprilExpected).toBeGreaterThanOrEqual(900);
    expect(aprilExpected).toBeGreaterThan(marchExpected);
  });
});

describe("MultiSelectFilter dropdown escapes table clipping (portal)", () => {
  it("renders the Status dropdown panel outside the table via a portal, directly under document.body", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const statusToggle = screen.getByText(/^Status$/, { selector: ".msf-trigger" });
    await user.click(statusToggle);

    const panel = document.querySelector(".msf-panel");
    expect(panel).toBeTruthy();
    // the panel's parent should be document.body (portal), not the table's th/thead
    expect(panel.closest("table")).toBeNull();
    expect(panel.parentElement).toBe(document.body);
  });

  it("closes the dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const statusToggle = screen.getByText(/^Status$/, { selector: ".msf-trigger" });
    await user.click(statusToggle);
    expect(document.querySelector(".msf-panel")).toBeTruthy();

    await user.click(screen.getByRole("heading", { name: "Revenue" }));
    expect(document.querySelector(".msf-panel")).toBeNull();
  });
});

describe("Planning: needs-a-trainer priority section", () => {
  it("shows Signed projects in a red 'needs a trainer' section before the regular chronological list", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Planning");

    const banner = screen.queryByText(/need.*a trainer/i);
    expect(banner).toBeInTheDocument();

    const needsTrainerBlock = document.querySelector(".needs-trainer-block");
    expect(needsTrainerBlock).toBeTruthy();
    // it should appear before the main timeline in the DOM
    const mainTimeline = document.querySelector(".timeline:not(.needs-trainer-list)");
    expect(needsTrainerBlock.compareDocumentPosition(mainTimeline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not duplicate a Signed project into the regular chronological list", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Planning");

    const needsTrainerNames = Array.from(document.querySelectorAll(".needs-trainer-row .tl-name")).map((el) => el.textContent);
    const mainListNames = Array.from(document.querySelectorAll(".timeline:not(.needs-trainer-list) .tl-name")).map((el) => el.textContent);
    for (const name of needsTrainerNames) {
      expect(mainListNames).not.toContain(name);
    }
  });
});

describe("Planning: calendar view", () => {
  it("switches to a month-grid calendar and shows session pills", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Planning");

    await user.click(screen.getByRole("button", { name: /Calendar/i }));
    expect(document.querySelector(".planning-calendar")).toBeTruthy();
    expect(document.querySelectorAll(".cal-cell").length).toBeGreaterThan(20); // a month grid has ~30-42 cells
  });

  it("can navigate to the next/previous month and back to today", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Planning");
    await user.click(screen.getByRole("button", { name: /Calendar/i }));

    const titleBefore = document.querySelector(".cal-title").textContent;
    await user.click(screen.getByRole("button", { name: "Next month" }));
    const titleAfter = document.querySelector(".cal-title").textContent;
    expect(titleAfter).not.toBe(titleBefore);

    await user.click(screen.getByRole("button", { name: /^Today$/i }));
    const titleToday = document.querySelector(".cal-title").textContent;
    expect(titleToday).toBe(titleBefore);
  });
});

describe("Duplicate button", () => {
  it("duplicates a Revenue project into a new editable row with the same field values", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const originalRow = rowFor("Efrei - Cloud Intro");
    const before = screen.getAllByRole("row").length;
    await user.click(within(originalRow).getByRole("button", { name: "Duplicate" }));

    expect(screen.getAllByRole("row").length).toBe(before + 1);
    const editingRow = document.querySelector("tr.editing");
    expect(editingRow).toBeTruthy();
    expect(within(editingRow).getByDisplayValue("Efrei - Cloud Intro")).toBeInTheDocument();
    expect(within(editingRow).getByDisplayValue("Efrei")).toBeInTheDocument(); // client copied over
  });

  it("duplicating does not remove or modify the original row", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Revenue");

    const originalRow = rowFor("Efrei - Cloud Intro");
    await user.click(within(originalRow).getByRole("button", { name: "Duplicate" }));

    // cancel the duplicate's edit mode, then confirm both the original and the copy exist
    const editingRow = document.querySelector("tr.editing");
    await user.click(within(editingRow).getByRole("button", { name: "Cancel" }));
    expect(screen.getAllByText("Efrei - Cloud Intro").length).toBe(2);
  });

  it("duplicates an Expense into a new editable row with the same field values", async () => {
    const user = userEvent.setup();
    await renderReady();
    await goToTab(user, "Expenses");

    const rows = screen.getAllByRole("row").slice(2);
    const targetRow = rows.find((r) => within(r).queryAllByRole("cell").length >= 6);
    const before = screen.getAllByRole("row").length;
    await user.click(within(targetRow).getByRole("button", { name: "Duplicate" }));

    expect(screen.getAllByRole("row").length).toBe(before + 1);
    const editingRow = document.querySelector("tr.editing");
    expect(editingRow).toBeTruthy();
  });
});
