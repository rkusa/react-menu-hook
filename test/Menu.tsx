import React from "react";
import useMenu from "../src";

export default function Menu() {
  const { isOpen, buttonProps, menuProps } = useMenu();
  return (
    <div>
      <button {...buttonProps}>Open Dropdown</button>

      {isOpen && (
        <div {...menuProps}>
          <button type="button" role="menuitem">
            Action 1
          </button>
          <button type="button" role="menuitem">
            Action 2
          </button>
          <button type="button" role="menuitem">
            Action 3
          </button>
        </div>
      )}
    </div>
  );
}
