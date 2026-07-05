import { render, screen } from "@testing-library/react";
import { makeUser } from "../test/fixtures";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("renders the user's name, nationality, and age", () => {
    render(
      <UserCard
        user={makeUser({ first_name: "Grace", last_name: "Hopper", nationality: "American", age: 85 })}
      />
    );

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("American")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders the avatar with an empty alt attribute", () => {
    const { container } = render(makeCard({ avatar: "https://example.com/grace.png" }));

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/grace.png");
    expect(img).toHaveAttribute("alt", "");
  });

  it("shows up to two hobbies without a remainder badge", () => {
    render(makeCard({ hobbies: ["Chess", "Reading"] }));

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("shows a +N badge for hobbies beyond the visible limit", () => {
    render(makeCard({ hobbies: ["Chess", "Reading", "Hiking", "Cooking"] }));

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.queryByText("Hiking")).not.toBeInTheDocument();

    const badge = screen.getByText("+2");
    expect(badge).toHaveAttribute("title", "Chess, Reading, Hiking, Cooking");
  });

  it("shows a placeholder message when there are no hobbies", () => {
    render(makeCard({ hobbies: [] }));

    expect(screen.getByText("No hobbies listed")).toBeInTheDocument();
  });
});

function makeCard(overrides: Parameters<typeof makeUser>[0]) {
  return <UserCard user={makeUser(overrides)} />;
}
