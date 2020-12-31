import {
  KeyboardEvent,
  KeyboardEventHandler,
  useReducer,
  useCallback,
  RefCallback,
  useMemo,
  useRef,
  DependencyList,
} from "react";

export default function useMenu(): MenuState {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const id = useMemo(
    () => `use-menu-${process.env.NODE_ENV === "test" ? "test" : nextId++}`,
    []
  );
  let itemClickHandlerIndex = 0;
  const itemClickHandlers = useRef<Array<[() => void, DependencyList]>>([]);

  return {
    isOpen: state.isOpen,
    buttonProps: {
      role: "button",
      "aria-haspopup": "menu",
      "aria-expanded": state.isOpen ? "true" : undefined,
      "aria-controls": id,
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
      id,
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

    getItemProps(callback: () => void, deps?: DependencyList) {
      const memorized = itemClickHandlers.current[itemClickHandlerIndex];
      let onClick;

      if (memorized && deps) {
        const [previousOnClick, previousDeps] = memorized;
        if (shallowEqual(deps, previousDeps)) {
          onClick = previousOnClick;
        }
      }

      onClick = onClick ?? (() => callback());
      itemClickHandlers.current[itemClickHandlerIndex] = [
        onClick,
        deps ? deps.slice() : [],
      ];
      itemClickHandlerIndex++;

      return {
        role: "menuitem",
        tabIndex: -1,
        onClick,
      };
    },
  };
}

function shallowEqual(lhs: DependencyList, rhs: DependencyList): boolean {
  if (lhs.length !== rhs.length) {
    return false;
  }
  for (let i = 0; i < lhs.length; ++i) {
    if (lhs[i] !== rhs[i]) {
      return false;
    }
  }
  return true;
}

let nextId = 1;

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
  getItemProps(callback: () => void, deps?: DependencyList): ItemProps;
}

export interface ButtonProps {
  role: "button";
  "aria-haspopup": "menu";
  "aria-expanded"?: "true";
  "aria-controls": string;
  onKeyDown: KeyboardEventHandler;
}

export interface MenuProps {
  role: "menu";
  id: string;
  ref: RefCallback<HTMLElement | null>;
}

export interface ItemProps {
  role: "menuitem";
  tabIndex: -1;
  onClick(): void;
}
