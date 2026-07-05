import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState, ErrorState, LoadingState } from "./StatusViews";

describe("LoadingState", () => {
  it("renders the default label", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<LoadingState label="Loading insights…" />);
    expect(screen.getByText("Loading insights…")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders the default message", () => {
    render(<EmptyState />);
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("renders a custom message", () => {
    render(<EmptyState message="No data available." />);
    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders the error message without a retry button when onRetry is omitted", () => {
    render(<ErrorState message="Network failure" />);

    expect(screen.getByText("Network failure")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Network failure" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
