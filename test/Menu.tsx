import React from "react";
import useMenu from "../src";

export default function Menu() {
  useMenu();
  return (
    <div>
      <button>Dropdown Trigger</button>

      <div role="menu">
        <button type="button" role="menuitem">
          Action 1
        </button>
        <button type="button" role="menuitem">
          Action 2
        </button>
      </div>
    </div>
  );
}
