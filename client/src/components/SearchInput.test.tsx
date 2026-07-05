import { fireEvent, render, screen } from "@testing-library/react";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders the provided value and placeholder", () => {
    render(<SearchInput value="Ada" onChange={vi.fn()} placeholder="Search…" />);

    expect(screen.getByPlaceholderText("Search…")).toHaveValue("Ada");
  });

  it("uses the default placeholder when none is provided", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText("Search by name…")).toBeInTheDocument();
  });

  it("does not call onChange until the debounce delay has elapsed", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Ada" } });
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledWith("Ada");
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("does not call onChange when the draft matches the current value", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="Ada" onChange={onChange} />);

    vi.advanceTimersByTime(400);

    expect(onChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("resets the draft when the value prop changes externally", () => {
    const { rerender } = render(<SearchInput value="Ada" onChange={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toHaveValue("Ada");

    rerender(<SearchInput value="Grace" onChange={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toHaveValue("Grace");
  });
});
