import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { makeUser } from "../test/fixtures";
import { UserList } from "./UserList";

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, "isIntersecting">[]) => void;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
  }
}

function renderList(overrides: Partial<ComponentProps<typeof UserList>> = {}) {
  const props: ComponentProps<typeof UserList> = {
    users: [makeUser({ id: 1 }), makeUser({ id: 2, first_name: "Grace", last_name: "Hopper" })],
    hasMore: true,
    loadingMore: false,
    loadMoreError: null,
    onLoadMore: vi.fn(),
    hasPrevious: false,
    loadingPrevious: false,
    loadPreviousError: null,
    onLoadPrevious: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<UserList {...props} />) };
}

describe("UserList", () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  it("renders a card for each user", () => {
    renderList();

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  it("calls onLoadMore when the bottom sentinel intersects", () => {
    const onLoadMore = vi.fn();
    renderList({ onLoadMore, hasMore: true });

    const bottomObserver = FakeIntersectionObserver.instances[0];
    bottomObserver.trigger(true);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not observe a bottom sentinel when there is no more data", () => {
    renderList({ hasMore: false });

    expect(FakeIntersectionObserver.instances).toHaveLength(0);
  });

  it("calls onLoadPrevious when the top sentinel intersects", () => {
    const onLoadPrevious = vi.fn();
    renderList({ onLoadPrevious, hasPrevious: true, hasMore: false });

    const topObserver = FakeIntersectionObserver.instances[0];
    topObserver.trigger(true);

    expect(onLoadPrevious).toHaveBeenCalledTimes(1);
  });

  it("shows loading indicators for forward and backward pagination", () => {
    renderList({ loadingMore: true, loadingPrevious: true, hasPrevious: true });

    expect(screen.getAllByText("Loading more…")).toHaveLength(2);
  });

  it("shows a retry button for a load-more error and calls onLoadMore when clicked", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    renderList({ loadMoreError: "Failed to load more", onLoadMore });

    expect(screen.getByText("Failed to load more")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("shows a retry button for a load-previous error and calls onLoadPrevious when clicked", async () => {
    const user = userEvent.setup();
    const onLoadPrevious = vi.fn();
    renderList({ hasPrevious: true, loadPreviousError: "Failed to load previous", onLoadPrevious });

    expect(screen.getByText("Failed to load previous")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onLoadPrevious).toHaveBeenCalledTimes(1);
  });
});
