import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("redirects an unauthenticated user to the sign-in screen", async () => {
    render(<App />);
    expect(
      await screen.findByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });
});
