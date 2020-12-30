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
    test("The element that opens the menu has role button.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button.getAttribute("role")).toEqual("button");
    });

    test("The element with role button has aria-haspopup set to either menu or true.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button.getAttribute("aria-haspopup")).toEqual("menu");
    });

    test("When the menu is displayed, the element with role button has aria-expanded set to true. When the menu is hidden, it is recommended that aria-expanded is not present. If aria-expanded is specified when the menu is hidden, it is set to false.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button.hasAttribute("aria-expanded")).toEqual(false);

      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(button.getAttribute("aria-expanded")).toEqual("true");
    });

    test("The element that contains the menu items displayed by activating the button has role menu.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });

      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      expect(screen.getByRole("menu").getAttribute("role")).toEqual("menu");
    });

    test("Optionally, the element with role button has a value specified for aria-controls that refers to the element with role menu.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button.getAttribute("aria-controls")).toEqual("use-menu-test");
      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
      expect(screen.getByRole("menu").id).toEqual("use-menu-test");
    });
  });
});

// https://www.w3.org/TR/wai-aria-practices-1.2/#menu
// The following tests ignore everything related to horizontal menus and submenus, it only assums
// vertical one-level menus (for now).
describe("Menu", () => {
  // https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
  describe("Keyboard Interaction", () => {
    describe("Enter", () => {
      test.todo(
        "When focus is on a menuitemcheckbox, toggles the item and closes the menu"
      );
      test.todo(
        "When focus is on a menuitemradio, toggles the item and closes the menu"
      );
      test.todo(
        "When focus is on a menuitem, activates the item and closes the menu"
      );
    });

    describe("Space", () => {
      test.todo(
        "When focus is on a menuitemcheckbox, changes the state without closing the menu"
      );
      test.todo(
        "When focus is on a menuitemradio that is not checked, without closing the menu, checks the focused menuitemradio and unchecks any other checked menuitemradio element in the same group"
      );
      test.todo(
        "When focus is on a menuitem, activates the menuitem and closes the menu"
      );
    });

    describe("Down Arrow", () => {
      test.todo("When focus is in a menu, moves focus to the next item");
      test.todo("Wraps from the last to the first menuitem");
    });

    describe("Up Arrow", () => {
      test.todo("When focus is in a menu, moves focus to the previous item");
      test.todo("Wraps from the first to the last menuitem");
    });

    describe("Escape", () => {
      test.todo(
        "Close the menu that contains focus and return focus to the menu button from which the menu was opened"
      );
    });

    describe("Tab", () => {
      test.todo("Moves focus to the next element in the tab sequence");
      test.todo("Closes the menu if element outside of the menu got focused");
    });

    describe("Shift + Tab", () => {
      test.todo("Moves focus to the previous element in the tab sequence");
      test.todo("Closes the menu if element outside of the menu got focused");
    });

    test.todo("Disabled menu items are focusable but cannot be activated");
  });

  // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-13
  describe("WAI-ARIA Roles, States, and Properties", () => {
    test.todo(
      "The items contained in a menu are child elements of the containing menu and have any of the following roles: menuitem, menuitemcheckbox, menuitemradio"
    );
    test.todo("Each item in the menu has tabindex set to -1");
    test.todo(
      "When a menuitemcheckbox or menuitemradio is checked, aria-checked is set to true"
    );
    test.todo("When a menu item is disabled, aria-disabled is set to true.");
    test.todo(
      "All separators should have aria-orientation consistent with the separator's orientation."
    );
    test.todo(
      "The menu has aria-labelledby set to a value that refers to the button that controls its display"
    );
  });
});
