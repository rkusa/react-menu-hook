// WAI-ARIA:
// https://www.w3.org/TR/wai-aria-practices-1.2/#menu
// https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Menu from "./Menu";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

// it("should render menu", () => {
//   render(<Menu />);
//   expect(screen.getByRole("menu")).toBeInTheDocument();
//   expect(
//     screen.getByRole("menuitem", { name: "Action 1" })
//   ).toBeInTheDocument();
//   expect(
//     screen.getByRole("menuitem", { name: "Action 2" })
//   ).toBeInTheDocument();
// });

describe("Menu Button", () => {
  test("focus menu button", () => {
    render(<Menu />);
    const button = screen.getByRole("button", { name: "Open Dropdown" });
    userEvent.tab();
    expect(document.activeElement).toEqual(button);
  });

  // https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
  describe("Keyboard Interaction", () => {
    describe("With focus on the button", () => {
      test("Enter: opens the menu and places focus on the first menu item.", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        expect(screen.getByRole("menu")).toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: "Action 1" })
        ).toHaveFocus();
      });

      test("Space: Opens the menu and places focus on the first menu item.", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        userEvent.tab();
        fireEvent.keyDown(button, { key: " ", code: "Space" });
        expect(screen.getByRole("menu")).toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: "Action 1" })
        ).toHaveFocus();
      });

      test("(Optional) Down Arrow: opens the menu and moves focus to the first menu item.", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        userEvent.tab();
        fireEvent.keyDown(button, { key: "ArrowDown", code: "ArrowDown" });
        expect(screen.getByRole("menu")).toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: "Action 1" })
        ).toHaveFocus();
      });

      test("(Optional) Up Arrow: opens the menu and moves focus to the last menu item.", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        userEvent.tab();
        fireEvent.keyDown(button, { key: "ArrowUp", code: "ArrowUp" });
        expect(screen.getByRole("menu")).toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: "Action 3" })
        ).toHaveFocus();
      });
    });
  });

  // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-14
  describe("WAI-ARIA Roles, States, and Properties", () => {
    test.todo("The element that opens the menu has role button.");
    test.todo(
      "The element with role button has aria-haspopup set to either menu or true."
    );
    test.todo(
      "When the menu is displayed, the element with role button has aria-expanded set to true. When the menu is hidden, it is recommended that aria-expanded is not present. If aria-expanded is specified when the menu is hidden, it is set to false."
    );
    test.todo(
      "The element that contains the menu items displayed by activating the button has role menu."
    );
    test.todo(
      "Optionally, the element with role button has a value specified for aria-controls that refers to the element with role menu."
    );
  });
});
