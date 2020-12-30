import {
  KeyboardEvent,
  KeyboardEventHandler,
  useReducer,
  useCallback,
  RefCallback,
} from "react";

export default function useMenu(): MenuState {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return {
    isOpen: state.isOpen,
    buttonProps: {
      role: "button",
      "aria-haspopup": "menu",
      "aria-expanded": state.isOpen ? "true" : undefined,
      onKeyDown: useCallback(
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
            case "ArrowDown":
              dispatch({ type: "openFocusFirst" });
              break;

            case "ArrowUp":
              dispatch({ type: "openFocusLast" });
              break;
          }
        },
        [dispatch]
      ),
    },
    menuProps: {
      role: "menu",
      ref: useCallback(
        (menu: HTMLElement | null) => {
          if (!menu) {
            return;
          }

          switch (state.pendingFocus) {
            case "first":
              const first = menu.querySelector<HTMLElement>("[role=menuitem]");
              if (first) {
                first.focus();
              }
              break;
            case "last":
              const items = menu.querySelectorAll<HTMLElement>(
                "[role=menuitem]"
              );
              if (items.length > 0) {
                items[items.length - 1].focus();
              }
              break;
          }
        },
        [state.pendingFocus]
      ),
    },
  };
}

interface State {
  isOpen: boolean;
  pendingFocus: "first" | "last" | null;
}

interface ActionOpenFocusFirst {
  type: "openFocusFirst";
}

interface ActionOpenFocusLast {
  type: "openFocusLast";
}

type Action = ActionOpenFocusFirst | ActionOpenFocusLast;

const INITIAL_STATE: State = { isOpen: false, pendingFocus: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "openFocusFirst":
      return { isOpen: true, pendingFocus: "first" };
    case "openFocusLast":
      return { isOpen: true, pendingFocus: "last" };
    default:
      return state;
  }
}

export interface MenuState {
  isOpen: boolean;
  buttonProps: ButtonProps;
  menuProps: MenuProps;
}

export interface ButtonProps {
  role: "button";
  "aria-haspopup": "menu";
  "aria-expanded"?: "true";
  onKeyDown: KeyboardEventHandler;
}

export interface MenuProps {
  role: "menu";
  ref: RefCallback<HTMLElement | null>;
}
