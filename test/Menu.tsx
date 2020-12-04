import React from "react";
import useMenu from "../src";

export default function Menu() {
  const { isOpen, menuButtonProps } = useMenu();
  return (
    <div>
      <button {...menuButtonProps}>Open Dropdown</button>

      {isOpen && (
        <div role="menu">
          <button type="button" role="menuitem">
            Action 1
          </button>
          <button type="button" role="menuitem">
            Action 2
          </button>
        </div>
      )}
    </div>
  );
}
