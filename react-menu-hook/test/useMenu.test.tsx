import React, {
  Children,
  cloneElement,
  isValidElement,
  MouseEvent,
  ReactNode,
} from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Menu from "./Menu";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { useMenu } from "../src";
import { renderHook, act } from "@testing-library/react-hooks";

// WAI-ARIA:
// https://www.w3.org/TR/wai-aria-practices-1.2/#menu
// https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton

describe("Menu Button", () => {
  test("focus menu button", () => {
    render(<Menu />);
    const button = screen.getByRole("button", { name: "Open Dropdown" });
    userEvent.tab();
    expect(document.activeElement).toEqual(button);
  });

  describe("Mouse Interaction", () => {
    test("Clicking the button opens the menu", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);
      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(button).toHaveFocus();
    });
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
      expect(button).toHaveAttribute("role", "button");
    });

    test("The element with role button has aria-haspopup set to either menu or true.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button).toHaveAttribute("aria-haspopup", "menu");
    });

    test("When the menu is displayed, the element with role button has aria-expanded set to true. When the menu is hidden, it is recommended that aria-expanded is not present. If aria-expanded is specified when the menu is hidden, it is set to false.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button).not.toHaveAttribute("aria-expanded");

      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    test("The element that contains the menu items displayed by activating the button has role menu.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });

      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      expect(screen.getByRole("menu")).toHaveAttribute("role", "menu");
    });

    test("Optionally, the element with role button has a value specified for aria-controls that refers to the element with role menu.", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button).toHaveAttribute("aria-controls", "use-menu-test");
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
  test("default isOpen", () => {
    render(<Menu defaultIsOpen />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  describe("Mouse Interaction", () => {
    test("Clicking a menuitem activates it and closes the menu", async () => {
      const handleAction1 = jest.fn();
      render(<Menu onAction1={handleAction1} />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
      const action1 = screen.getByRole("menuitem", { name: "Action 1" });
      userEvent.click(action1);
      expect(handleAction1).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    test("Clicking a menuitemcheckbox toggles it and does not close the menu", async () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
      expect(screen.getByTestId("firstCheckbox")).not.toBeChecked();
      const checkbox1 = screen.getByRole("menuitemcheckbox", {
        name: "Checkbox 1",
      });
      userEvent.click(checkbox1);
      expect(screen.getByTestId("firstCheckbox")).toBeChecked();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
  });

  // https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
  describe("Keyboard Interaction", () => {
    describe("Enter", () => {
      test("When focus is on a menuitemcheckbox, toggles the item and closes the menu", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.click(button);
        const checkbox1 = screen.getByRole("menuitemcheckbox", {
          name: "Checkbox 1",
        });
        checkbox1.focus();
        expect(screen.getByTestId("firstCheckbox")).not.toBeChecked();
        fireEvent.keyDown(checkbox1, { key: "Enter", code: "Enter" });
        expect(screen.getByTestId("firstCheckbox")).toBeChecked();
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      test.todo(
        "When focus is on a menuitemradio, toggles the item and closes the menu"
      );

      test("When focus is on a menuitem, activates the item and closes the menu", () => {
        const handleAction1 = jest.fn();
        render(<Menu onAction1={handleAction1} />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        const action1 = screen.getByRole("menuitem", { name: "Action 1" });
        fireEvent.keyDown(action1, { key: "Enter", code: "Enter" });
        expect(handleAction1).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    describe("Space", () => {
      test("When focus is on a menuitemcheckbox, changes the state without closing the menu", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.click(button);
        const checkbox1 = screen.getByRole("menuitemcheckbox", {
          name: "Checkbox 1",
        });
        checkbox1.focus();
        expect(screen.getByTestId("firstCheckbox")).not.toBeChecked();
        fireEvent.keyDown(checkbox1, { key: "Space", code: "Space" });
        expect(screen.getByTestId("firstCheckbox")).toBeChecked();
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      test.todo(
        "When focus is on a menuitemradio that is not checked, without closing the menu, checks the focused menuitemradio and unchecks any other checked menuitemradio element in the same group"
      );

      test("When focus is on a menuitem, activates the menuitem and closes the menu", () => {
        const handleAction1 = jest.fn();
        render(<Menu onAction1={handleAction1} />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        const action1 = screen.getByRole("menuitem", { name: "Action 1" });
        fireEvent.keyDown(action1, { key: "Space", code: "Space" });
        expect(handleAction1).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    describe("Down Arrow", () => {
      test("When focus is in a menu, moves focus to the next item", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        expect(
          screen.getByRole("menuitem", { name: "Action 1" })
        ).toHaveFocus();
        const menu = screen.getByRole("menu");
        fireEvent.keyDown(menu, { key: "ArrowDown", code: "ArrowDown" });
        expect(
          screen.getByRole("menuitem", { name: "Action 2" })
        ).toHaveFocus();
        fireEvent.keyDown(menu, { key: "ArrowDown", code: "ArrowDown" });
        expect(
          screen.getByRole("menuitemcheckbox", { name: "Checkbox 1" })
        ).toHaveFocus();
        fireEvent.keyDown(menu, { key: "ArrowDown", code: "ArrowDown" });
        expect(
          screen.getByRole("menuitemcheckbox", { name: "X Checkbox 2" })
        ).toHaveFocus();
        fireEvent.keyDown(menu, { key: "ArrowDown", code: "ArrowDown" });
        expect(
          screen.getByRole("menuitem", { name: "Action 3" })
        ).toHaveFocus();
      });

      test("Wraps from the last to the first menuitem", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        const menu = screen.getByRole("menu");
        screen.getByRole("menuitem", { name: "Action 3" }).focus();
        fireEvent.keyDown(menu, { key: "ArrowDown", code: "ArrowDown" });
        expect(
          screen.getByRole("menuitem", { name: "Action 1" })
        ).toHaveFocus();
      });
    });

    describe("Up Arrow", () => {
      test("When focus is in a menu, moves focus to the previous item", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        screen.getByRole("menuitem", { name: "Action 3" }).focus();
        const menu = screen.getByRole("menu");
        fireEvent.keyDown(menu, { key: "ArrowUp", code: "ArrowUp" });
        expect(
          screen.getByRole("menuitemcheckbox", { name: "X Checkbox 2" })
        ).toHaveFocus();
        fireEvent.keyDown(menu, { key: "ArrowUp", code: "ArrowUp" });
        expect(
          screen.getByRole("menuitemcheckbox", { name: "Checkbox 1" })
        ).toHaveFocus();
        fireEvent.keyDown(menu, { key: "ArrowUp", code: "ArrowUp" });
        expect(
          screen.getByRole("menuitem", { name: "Action 2" })
        ).toHaveFocus();
        fireEvent.keyDown(menu, { key: "ArrowUp", code: "ArrowUp" });
        expect(
          screen.getByRole("menuitem", { name: "Action 1" })
        ).toHaveFocus();
      });

      test("Wraps from the first to the last menuitem", () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        screen.getByRole("menuitem", { name: "Action 1" }).focus();
        const menu = screen.getByRole("menu");
        fireEvent.keyDown(menu, { key: "ArrowUp", code: "ArrowUp" });
        expect(
          screen.getByRole("menuitem", { name: "Action 3" })
        ).toHaveFocus();
      });
    });

    describe("Escape", () => {
      test("Close the menu that contains focus and return focus to the menu button from which the menu was opened", () => {
        const handleAction1 = jest.fn();
        render(<Menu onAction1={handleAction1} />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        const action1 = screen.getByRole("menuitem", { name: "Action 1" });
        fireEvent.keyDown(action1, { key: "Escape", code: "Escape" });
        expect(handleAction1).not.toHaveBeenCalled();
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    describe("Tab", () => {
      test("Moves focus to the next element in the tab sequence", () => {
        render(
          <>
            <Menu />
            <button type="submit">outside</button>
          </>
        );
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.click(button);
        expect(button).toHaveFocus();

        userEvent.tab();
        expect(screen.getByRole("button", { name: "outside" })).toHaveFocus();
      });

      test("Closes the menu if element outside of the menu got focused", async () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });

        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        userEvent.tab();
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });

      test("Closes the menu if focused is moved away from menu button", async () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });

        userEvent.click(button);
        expect(button).toHaveFocus();
        userEvent.tab();
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    describe("Shift + Tab", () => {
      test("Moves focus to the previous element in the tab sequence", () => {
        render(
          <>
            <button type="submit">outside</button>
            <Menu />
          </>
        );
        const button = screen.getByRole("button", { name: "Open Dropdown" });
        userEvent.click(button);
        expect(button).toHaveFocus();

        userEvent.tab({ shift: true });
        expect(screen.getByRole("button", { name: "outside" })).toHaveFocus();
      });

      test("Closes the menu if element outside of the menu got focused", async () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });

        userEvent.tab();
        fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
        userEvent.tab({ shift: true });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });

      test("Closes the menu if focused is moved away from menu button", async () => {
        render(<Menu />);
        const button = screen.getByRole("button", { name: "Open Dropdown" });

        userEvent.click(button);
        expect(button).toHaveFocus();
        userEvent.tab({ shift: true });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    test.todo("Disabled menu items are focusable but cannot be activated");
  });

  // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-13
  describe("WAI-ARIA Roles, States, and Properties", () => {
    test("Each item in the menu has tabindex set to -1", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      const items = screen.getAllByRole("menuitem");
      expect(items).toHaveLength(3);
      for (const item of items) {
        expect(item.tabIndex).toEqual(-1);
      }
    });

    test("When a menuitemcheckbox is checked, aria-checked is set to true", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);
      const checkbox1 = screen.getByRole("menuitemcheckbox", {
        name: "Checkbox 1",
      });
      checkbox1.focus();
      expect(checkbox1).toHaveAttribute("aria-checked", "false");
      fireEvent.keyDown(checkbox1, { key: "Enter", code: "Enter" });
      expect(checkbox1).toHaveAttribute("aria-checked", "true");
    });

    test.todo("When a menuitemradio is checked, aria-checked is set to true");

    test("When a menu item is disabled, aria-disabled is set to true", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);

      const action3 = screen.getByRole("menuitem", { name: "Action 1" });
      expect(action3).not.toHaveAttribute("aria-disabled");
      const checkbox1 = screen.getByRole("menuitemcheckbox", {
        name: "Checkbox 1",
      });
      expect(checkbox1).not.toHaveAttribute("aria-disabled");

      const action1 = screen.getByRole("menuitem", { name: "Action 3" });
      expect(action1).toHaveAttribute("aria-disabled", "true");
      const checkbox2 = screen.getByRole("menuitemcheckbox", {
        name: "X Checkbox 2",
      });
      expect(checkbox2).toHaveAttribute("aria-disabled", "true");
    });

    test.todo(
      "All separators should have aria-orientation consistent with the separator's orientation."
    );

    test("The menu has aria-labelledby set to a value that refers to the button that controls its display", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      expect(button.id).toEqual("use-menu-test-trigger");
      userEvent.click(button);
      expect(screen.getByRole("menu")).toHaveAttribute(
        "aria-labelledby",
        "use-menu-test-trigger"
      );
    });
  });
});

describe("Menu item", () => {
  describe("disabled items", () => {
    test("clicking a disabled menuitem isn't doing anything", () => {
      const handleAction3 = jest.fn();
      render(<Menu onAction3={handleAction3} />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);
      const action3 = screen.getByRole("menuitem", { name: "Action 3" });
      userEvent.click(action3);
      expect(handleAction3).not.toHaveBeenCalled();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("Enter/Space on a disabled menuitem isn't doing anything", () => {
      const handleAction3 = jest.fn();
      render(<Menu onAction3={handleAction3} />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);
      const action3 = screen.getByRole("menuitem", { name: "Action 3" });
      action3.focus();
      fireEvent.keyDown(action3, { key: " ", code: "Space" });
      fireEvent.keyDown(action3, { key: "Enter", code: "Enter" });
      expect(handleAction3).not.toHaveBeenCalled();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("clicking a disabled menuitemcheckbox isn't doing anything", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);
      const checkbox2 = screen.getByRole("menuitemcheckbox", {
        name: "X Checkbox 2",
      });
      expect(checkbox2).toHaveAttribute("aria-checked", "true");
      userEvent.click(checkbox2);
      expect(checkbox2).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("Enter/Space on a disabled menuitem isn't doing anything", () => {
      render(<Menu />);
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.click(button);
      const checkbox2 = screen.getByRole("menuitemcheckbox", {
        name: "X Checkbox 2",
      });
      expect(checkbox2).toHaveAttribute("aria-checked", "true");
      checkbox2.focus();
      fireEvent.keyDown(checkbox2, { key: " ", code: "Space" });
      fireEvent.keyDown(checkbox2, { key: "Enter", code: "Enter" });
      expect(checkbox2).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
  });

  describe("memoize onClick", () => {
    test("don't memoize if no deps list is provided", () => {
      const { result, rerender } = renderHook(() => useMenu("test"));
      const first = jest.fn();
      const second = jest.fn();

      act(() => {
        result.current
          .getItemProps(first)
          .onClick(({} as unknown) as MouseEvent);
      });

      rerender();

      act(() => {
        result.current
          .getItemProps(second)
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });

    test("memoize until deps change", () => {
      const { result, rerender } = renderHook(() => useMenu("test"));
      const first = jest.fn();
      const second = jest.fn();
      const third = jest.fn();

      act(() => {
        result.current
          .getItemProps(first, [1])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(1);
      rerender();

      act(() => {
        result.current
          .getItemProps(second, [1])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(2);
      expect(second).toHaveBeenCalledTimes(0);
      rerender();

      act(() => {
        result.current
          .getItemProps(third, [2])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(2);
      expect(second).toHaveBeenCalledTimes(0);
      expect(third).toHaveBeenCalledTimes(1);
    });

    test("memoize until deps length change", () => {
      const { result, rerender } = renderHook(() => useMenu("test"));
      const first = jest.fn();
      const second = jest.fn();
      const third = jest.fn();

      act(() => {
        result.current
          .getItemProps(first, [1])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(1);
      rerender();

      act(() => {
        result.current
          .getItemProps(second, [1])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(2);
      expect(second).toHaveBeenCalledTimes(0);
      rerender();

      act(() => {
        result.current
          .getItemProps(third, [1, {}])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(2);
      expect(second).toHaveBeenCalledTimes(0);
      expect(third).toHaveBeenCalledTimes(1);
    });

    test("memoize for multiple menu items", () => {
      const { result, rerender } = renderHook(() => useMenu("test"));
      const first = jest.fn();
      const second = jest.fn();

      act(() => {
        result.current
          .getItemProps(first, [1])
          .onClick(({} as unknown) as MouseEvent);
        result.current
          .getItemProps(second, [2])
          .onClick(({} as unknown) as MouseEvent);
      });

      rerender();

      act(() => {
        result.current
          .getItemProps(jest.fn(), [1])
          .onClick(({} as unknown) as MouseEvent);
        result.current
          .getItemProps(jest.fn(), [2])
          .onClick(({} as unknown) as MouseEvent);
      });

      expect(first).toHaveBeenCalledTimes(2);
      expect(second).toHaveBeenCalledTimes(2);
    });
  });

  describe("patched actions", () => {
    function MenuPatched({ children }: { children?: ReactNode }) {
      const { isOpen, buttonProps, menuProps, getItemProps } = useMenu("test");

      return (
        <div>
          <button {...buttonProps}>Open Dropdown</button>

          {isOpen && (
            <ul {...menuProps}>
              {Children.map(children, (child) =>
                isValidElement(child)
                  ? cloneElement(child, getItemProps())
                  : child
              )}
            </ul>
          )}
        </div>
      );
    }

    it("should not overwrite click handlers of children", () => {
      const handleAction1 = jest.fn();
      render(
        <MenuPatched>
          <button type="button" onClick={handleAction1}>
            Action 1
          </button>
        </MenuPatched>
      );
      const button = screen.getByRole("button", { name: "Open Dropdown" });
      userEvent.tab();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
      const action1 = screen.getByRole("menuitem", { name: "Action 1" });
      userEvent.click(action1);
      expect(handleAction1).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
