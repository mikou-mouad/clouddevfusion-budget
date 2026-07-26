import "@testing-library/jest-dom/vitest";

// recharts' ResponsiveContainer needs ResizeObserver, which jsdom doesn't implement
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// jsdom doesn't implement layout, so give charts a non-zero size
Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, value: 800 });
Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, value: 400 });

// No /api/data in the test environment — simulate "API unreachable" so the
// app exercises its localStorage fallback path, same as it would running
// locally without `swa start`.
global.fetch = () => Promise.reject(new Error("no network in test env"));

// URL.createObjectURL is used by the Backup button; jsdom doesn't implement it
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:mock";
if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = () => {};
