import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

describe("MultiSelectDropdown", () => {
  it("shows the label without a count badge when nothing is selected", () => {
    render(
      <MultiSelectDropdown label="Hobbies" options={["Chess", "Reading"]} selected={[]} onApply={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /Hobbies/ })).toBeInTheDocument();
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it("shows a count badge when options are selected", () => {
    render(
      <MultiSelectDropdown
        label="Hobbies"
        options={["Chess", "Reading"]}
        selected={["Chess"]}
        onApply={vi.fn()}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("is closed by default and opens on click, showing checked options", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelectDropdown
        label="Hobbies"
        options={["Chess", "Reading"]}
        selected={["Chess"]}
        onApply={vi.fn()}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Hobbies/ }));

    const chess = screen.getByRole("checkbox", { name: "Chess" });
    const reading = screen.getByRole("checkbox", { name: "Reading" });
    expect(chess).toBeChecked();
    expect(reading).not.toBeChecked();
  });

  it("shows a placeholder message when there are no options", async () => {
    const user = userEvent.setup();
    render(<MultiSelectDropdown label="Hobbies" options={[]} selected={[]} onApply={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Hobbies/ }));

    expect(screen.getByText("No options available.")).toBeInTheDocument();
  });

  it("calls onApply with the toggled draft selection and closes the panel", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <MultiSelectDropdown label="Hobbies" options={["Chess", "Reading"]} selected={[]} onApply={onApply} />
    );

    await user.click(screen.getByRole("button", { name: /Hobbies/ }));
    await user.click(screen.getByRole("checkbox", { name: "Chess" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith(["Chess"]);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("calls onApply with an empty array and closes the panel when Clear is clicked", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <MultiSelectDropdown
        label="Hobbies"
        options={["Chess", "Reading"]}
        selected={["Chess"]}
        onApply={onApply}
      />
    );

    await user.click(screen.getByRole("button", { name: /Hobbies/ }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onApply).toHaveBeenCalledWith([]);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("discards draft changes without calling onApply when clicking outside", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <div>
        <MultiSelectDropdown label="Hobbies" options={["Chess", "Reading"]} selected={[]} onApply={onApply} />
        <button>Outside</button>
      </div>
    );

    await user.click(screen.getByRole("button", { name: /Hobbies/ }));
    await user.click(screen.getByRole("checkbox", { name: "Chess" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("closes the panel when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelectDropdown label="Hobbies" options={["Chess", "Reading"]} selected={[]} onApply={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: /Hobbies/ }));
    expect(screen.getByRole("checkbox", { name: "Chess" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
