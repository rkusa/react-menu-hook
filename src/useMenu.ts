import {
  KeyboardEvent,
  KeyboardEventHandler,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  DependencyList,
  MouseEventHandler,
  FocusEventHandler,
  RefCallback,
} from "react";

export default function useMenu(): MenuState {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [menuId, buttonId] = useMemo(() => {
    const id = process.env.NODE_ENV === "test" ? "test" : nextId++;
    return [`use-menu-${id}`, `use-menu-${id}-trigger`];
  }, []);
  let itemEventHandlerIndex = 0;
  const itemEventHandlers = useRef<
    Array<[MouseEventHandler, KeyboardEventHandler, DependencyList]>
  >([]);

  return {
    isOpen: state.isOpen,
    buttonProps: {
      role: "button",
      id: buttonId,
      "aria-haspopup": "menu",
      "aria-expanded": state.isOpen ? "true" : undefined,
      "aria-controls": menuId,
      onClick: useCallback(() => {
        dispatch({ type: "open" });
      }, [dispatch]),
      onKeyDown: useCallback(
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
            case "ArrowDown":
              dispatch({ type: "open", focus: "first" });
              break;

            case "ArrowUp":
              dispatch({ type: "open", focus: "last" });
              break;
          }
        },
        [dispatch]
      ),
      onBlur: useCallback(() => {
        // Close the menu, unless something inside the menu is focused
        if (state.pendingFocus === null) {
          // console.log(document.activeElement);
          dispatch({ type: "close" });
        }
      }, [dispatch, state.pendingFocus]),
    },
    menuProps: {
      role: "menu",
      id: menuId,
      "aria-labelledby": buttonId,
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
      onKeyDown: useCallback(
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Escape":
              dispatch({ type: "close" });
              break;
          }
        },
        [dispatch]
      ),
      onBlur: useCallback(() => {
        dispatch({ type: "close" });
      }, [dispatch]),
    },

    getItemProps(callback?: () => void, deps?: DependencyList) {
      const memorized = itemEventHandlers.current[itemEventHandlerIndex];
      let onClick, onKeyDown;

      if (memorized && deps) {
        const [previousOnClick, previousOnKeyDown, previousDeps] = memorized;
        if (shallowEqual(deps, previousDeps)) {
          onClick = previousOnClick;
          onKeyDown = previousOnKeyDown;
        }
      }

      onClick =
        onClick ??
        (() => {
          callback?.();
          dispatch({ type: "close" });
        });
      onKeyDown =
        onKeyDown ??
        ((e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
              callback?.();
              dispatch({ type: "close" });
              break;
          }
        });

      itemEventHandlers.current[itemEventHandlerIndex] = [
        onClick,
        onKeyDown,
        deps ? deps.slice() : [],
      ];
      itemEventHandlerIndex++;

      return {
        role: "menuitem",
        tabIndex: -1,
        onClick,
        onKeyDown,
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

interface ActionOpen {
  type: "open";
  focus?: "first" | "last";
}

interface ActionClose {
  type: "close";
}

type Action = ActionOpen | ActionClose;

const INITIAL_STATE: State = { isOpen: false, pendingFocus: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return { isOpen: true, pendingFocus: action.focus ?? null };
    case "close":
      return { isOpen: false, pendingFocus: null };
    default:
      return state;
  }
}

export interface MenuState {
  isOpen: boolean;
  buttonProps: ButtonProps;
  menuProps: MenuProps;
  getItemProps(callback?: () => void, deps?: DependencyList): ItemProps;
}

export interface ButtonProps {
  role: "button";
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded"?: "true";
  "aria-controls": string;
  onClick: MouseEventHandler;
  onKeyDown: KeyboardEventHandler;
  onBlur: FocusEventHandler;
}

export interface MenuProps {
  role: "menu";
  id: string;
  "aria-labelledby": string;
  ref: RefCallback<HTMLElement | null>;
  onKeyDown: KeyboardEventHandler;
  onBlur: FocusEventHandler;
}

export interface ItemProps {
  role: "menuitem";
  tabIndex: -1;
  onClick: MouseEventHandler;
  onKeyDown: KeyboardEventHandler;
}
