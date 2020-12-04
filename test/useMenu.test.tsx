import React from "react";
import { render, screen } from "@testing-library/react";
import Menu from "./Menu";
import "@testing-library/jest-dom";

it("should render menu", () => {
  render(<Menu />);
  expect(screen.getByRole("menu")).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: "Action 1" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: "Action 2" })
  ).toBeInTheDocument();
});
