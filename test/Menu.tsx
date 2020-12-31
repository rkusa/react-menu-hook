import React from "react";
import useMenu from "../src";

interface MenuProps {
  onAction1?: () => void;
  onAction2?: () => void;
  onAction3?: () => void;
}

export default function Menu({ onAction1, onAction2, onAction3 }: MenuProps) {
  const { isOpen, buttonProps, menuProps, getItemProps } = useMenu();
  return (
    <div>
      <button {...buttonProps}>Open Dropdown</button>

      {isOpen && (
        <ul {...menuProps}>
          <li {...getItemProps(onAction1)}>Action 1</li>
          <li {...getItemProps(onAction2)}>Action 2</li>
          <li {...getItemProps(onAction3)}>Action 3</li>
        </ul>
      )}
    </div>
  );
}
