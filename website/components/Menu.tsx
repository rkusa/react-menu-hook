import React, { ReactNode } from "react";
import { useMenu, useMenuCheckboxState } from "react-menu-hook/src/index";
import { ItemCheckboxProps, ItemProps } from "react-menu-hook/src/useMenu";
import { useTransition } from "react-css-transition-hook";

export default function Menu() {
  const {
    isOpen,
    buttonProps,
    menuProps,
    getItemProps,
    getItemCheckboxProps,
  } = useMenu("main", { defaultIsOpen: true });
  const checkbox = useMenuCheckboxState(false);

  const [showMenu, { className, ...props }] = useTransition(isOpen, {
    disableInitialEnterTransition: true,
    entering: "transition ease-out duration-100 transform opacity-0 scale-95",
    entered: "transition ease-out duration-100 transform opacity-100 scale-100",
    exiting: "transition ease-in duration-75 transform opacity-100 scale-100",
    exited: "transition ease-in duration-75 transform opacity-0 scale-95",
  });

  return (
    <div className="relative inline-block">
      <button
        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium"
        {...buttonProps}
      >
        <span>Options</span>
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showMenu && (
        <ul
          className={`justify-stretch ul-y absolute right-0 flex flex-col w-64 origin-top-right bg-white border border-gray-200 divide-gray-100 rounded-md shadow-lg outline-none ${className}`}
          {...menuProps}
          {...props}
        >
          <MenuAction {...getItemProps(() => {})}>Action 1</MenuAction>
          <MenuAction {...getItemProps(() => {})}>Action 2</MenuAction>
          <MenuAction {...getItemCheckboxProps(checkbox)}>
            <input
              type="checkbox"
              tabIndex={-1}
              {...checkbox.props}
              className="mr-2"
            />{" "}
            Checkbox
          </MenuAction>
        </ul>
      )}
    </div>
  );
}

function MenuAction({
  children,
  ...props
}: { children: ReactNode } & (ItemProps | ItemCheckboxProps)) {
  return (
    <li
      className="hover:bg-gray-200 flex items-center px-4 py-2 text-sm text-left cursor-pointer"
      {...props}
    >
      {children}
    </li>
  );
}
