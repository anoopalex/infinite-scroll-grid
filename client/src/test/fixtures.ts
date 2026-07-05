import type { User } from "../api/types";

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    avatar: "https://example.com/avatar.png",
    first_name: "Ada",
    last_name: "Lovelace",
    age: 28,
    nationality: "British",
    hobbies: ["Reading", "Chess"],
    ...overrides,
  };
}
