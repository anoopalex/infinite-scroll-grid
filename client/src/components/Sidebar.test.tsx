import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import type { ValueCount } from "../api/types";
import { Sidebar } from "./Sidebar";

const topHobbies: ValueCount[] = [
  { value: "Chess", count: 10 },
  { value: "Reading", count: 5 },
];
const topNationalities: ValueCount[] = [
  { value: "British", count: 8 },
  { value: "American", count: 3 },
];

function renderSidebar(overrides: Partial<ComponentProps<typeof Sidebar>> = {}) {
  const props: ComponentProps<typeof Sidebar> = {
    loading: false,
    error: null,
    topHobbies,
    topNationalities,
    selectedHobbies: [],
    selectedNationalities: [],
    onToggleHobby: vi.fn(),
    onToggleNationality: vi.fn(),
    onClearFilters: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<Sidebar {...props} />) };
}

describe("Sidebar", () => {
  it("shows a loading state and hides the lists", () => {
    renderSidebar({ loading: true });

    expect(screen.getByText("Loading insights…")).toBeInTheDocument();
    expect(screen.queryByText("Chess")).not.toBeInTheDocument();
  });

  it("shows an error state with retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderSidebar({ error: "Failed to load", onRetry });

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders top hobbies and nationalities with counts", () => {
    renderSidebar();

    expect(screen.getByText("Top Hobbies")).toBeInTheDocument();
    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Top Nationalities")).toBeInTheDocument();
    expect(screen.getByText("British")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("shows an empty message when there is no stat data", () => {
    renderSidebar({ topHobbies: [], topNationalities: [] });

    expect(screen.getAllByText("No data available.")).toHaveLength(2);
  });

  it("marks selected items as pressed and calls onToggleHobby / onToggleNationality", async () => {
    const user = userEvent.setup();
    const onToggleHobby = vi.fn();
    const onToggleNationality = vi.fn();
    renderSidebar({
      selectedHobbies: ["Chess"],
      onToggleHobby,
      onToggleNationality,
    });

    const chessButton = screen.getByRole("button", { name: "Chess10" });
    expect(chessButton).toHaveAttribute("aria-pressed", "true");

    await user.click(chessButton);
    expect(onToggleHobby).toHaveBeenCalledWith("Chess");

    await user.click(screen.getByRole("button", { name: "British8" }));
    expect(onToggleNationality).toHaveBeenCalledWith("British");
  });

  it("does not render active filter chips when nothing is selected", () => {
    renderSidebar();

    expect(screen.queryByText("Active filters")).not.toBeInTheDocument();
  });

  it("renders active filter chips and removes a filter when its chip is clicked", async () => {
    const user = userEvent.setup();
    const onToggleHobby = vi.fn();
    renderSidebar({
      selectedHobbies: ["Chess"],
      selectedNationalities: ["British"],
      onToggleHobby,
    });

    expect(screen.getByText("Active filters")).toBeInTheDocument();
    const chip = screen.getByRole("button", { name: "Chess" });
    await user.click(chip);
    expect(onToggleHobby).toHaveBeenCalledWith("Chess");
  });

  it("calls onClearFilters when Clear all is clicked", async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    renderSidebar({ selectedHobbies: ["Chess"], onClearFilters });

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
