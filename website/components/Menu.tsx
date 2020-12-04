import React from "react";
import useMenu from "use-menu";

export default function Menu() {
  useMenu();
  return (
    <div className="relative inline-block">
      <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium">
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

      <div
        role="menu"
        className="absolute flex justify-stretch flex-col right-0 w-64 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
      >
        <button
          type="button"
          role="menuitem"
          className="block px-4 py-2 text-sm text-left"
        >
          Action 1
        </button>
        <button
          type="button"
          role="menuitem"
          className="block px-4 py-2 text-sm text-left"
        >
          Action 2
        </button>
      </div>
    </div>
  );
}
