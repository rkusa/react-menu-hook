import React from "react";
import useMenu from "../src";

export default function Menu() {
  const { isOpen, buttonProps, menuProps, getItemProps } = useMenu();
  return (
    <div>
      <button {...buttonProps}>Open Dropdown</button>

      {isOpen && (
        <ul {...menuProps}>
          <li {...getItemProps(() => {})}>Action 1</li>
          <li {...getItemProps(() => {})}>Action 2</li>
          <li {...getItemProps(() => {})}>Action 3</li>
        </ul>
      )}
    </div>
  );
}
