import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortControls } from "./SortControls";

describe("SortControls", () => {
  it("renders all sort field options with the current selection", () => {
    render(<SortControls sortBy="age" sortDir="asc" onChange={vi.fn()} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("age");
    expect(screen.getByRole("option", { name: "First name" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Last name" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Age" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Nationality" })).toBeInTheDocument();
  });

  it("shows ascending label and calls onChange with the same field when direction toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortControls sortBy="first_name" sortDir="asc" onChange={onChange} />);

    expect(screen.getByRole("button", { name: /ascending/i })).toHaveTextContent("↑ Asc");

    await user.click(screen.getByRole("button", { name: /ascending/i }));

    expect(onChange).toHaveBeenCalledWith("first_name", "desc");
  });

  it("shows descending label and toggles back to ascending", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortControls sortBy="last_name" sortDir="desc" onChange={onChange} />);

    expect(screen.getByRole("button", { name: /descending/i })).toHaveTextContent("↓ Desc");

    await user.click(screen.getByRole("button", { name: /descending/i }));

    expect(onChange).toHaveBeenCalledWith("last_name", "asc");
  });

  it("calls onChange with the new field and existing direction when the select changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortControls sortBy="first_name" sortDir="asc" onChange={onChange} />);

    await user.selectOptions(screen.getByRole("combobox"), "nationality");

    expect(onChange).toHaveBeenCalledWith("nationality", "asc");
  });
});
