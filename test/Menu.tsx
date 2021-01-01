import React from "react";
import { useMenu, useMenuCheckboxState } from "../src";

interface MenuProps {
  onAction1?: () => void;
  onAction2?: () => void;
  onAction3?: () => void;
}

export default function Menu({ onAction1, onAction2, onAction3 }: MenuProps) {
  const {
    isOpen,
    buttonProps,
    menuProps,
    getItemProps,
    getItemCheckboxProps,
  } = useMenu();
  const firstCheckbox = useMenuCheckboxState(false);
  const secondCheckbox = useMenuCheckboxState(true);

  return (
    <div>
      <button {...buttonProps}>Open Dropdown</button>

      {isOpen && (
        <ul {...menuProps}>
          <li {...getItemProps(onAction1)}>Action 1</li>
          <li {...getItemProps(onAction2)}>Action 2</li>
          <li {...getItemCheckboxProps(firstCheckbox)}>
            <input
              type="checkbox"
              data-testid="firstCheckbox"
              tabIndex={-1}
              {...firstCheckbox.props}
            />{" "}
            Checkbox 1
          </li>
          <li {...getItemCheckboxProps({ ...secondCheckbox, disabled: true })}>
            {secondCheckbox.checked && "X "}Checkbox 2
          </li>
          <li {...getItemProps(onAction3, [], { disabled: true })}>Action 3</li>
        </ul>
      )}
    </div>
  );
}
