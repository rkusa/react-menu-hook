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
  FocusEvent,
} from "react";

export default function useMenu(): MenuState {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [menuId, buttonId] = useMemo(() => {
    const id = process.env.NODE_ENV === "test" ? "test" : nextId++;
    return [`use-menu-${id}`, `use-menu-${id}-trigger`];
  }, []);
  const { nextMemoizedHandlers } = useMemoizedEventHandlers();

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
      onBlur: useCallback(
        (e: FocusEvent) => {
          // Close the menu, unless something inside the menu is focused
          const menu = document.getElementById(menuId);
          if (
            !menu ||
            !e.relatedTarget ||
            !menu.contains(e.relatedTarget as Node)
          ) {
            dispatch({ type: "close" });
          }
        },
        [dispatch, menuId]
      ),
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
              const first = menu.querySelector<HTMLElement>(SELECTOR_ITEMS);
              if (first) {
                first.focus();
              }
              break;
            case "last":
              const items = menu.querySelectorAll<HTMLElement>(SELECTOR_ITEMS);
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

            case "ArrowDown":
              {
                const menu = e.target as HTMLElement;
                const items = menu.querySelectorAll(SELECTOR_ITEMS);
                for (let i = 1; i < items.length; ++i) {
                  if (items[i - 1] === document.activeElement) {
                    (items[i] as HTMLElement).focus();
                    return;
                  }
                }

                // no next sibling found, wrap around
                (items[0] as HTMLElement).focus();
              }
              break;

            case "ArrowUp":
              {
                const menu = e.target as HTMLElement;
                const items = menu.querySelectorAll(SELECTOR_ITEMS);
                for (let i = items.length - 2; i >= 0; --i) {
                  if (items[i + 1] === document.activeElement) {
                    (items[i] as HTMLElement).focus();
                    return;
                  }
                }

                // no previous sibling found, wrap around
                (items[items.length - 1] as HTMLElement).focus();
              }
              break;
          }
        },
        [dispatch]
      ),
      onBlur: useCallback(
        (e: FocusEvent) => {
          const menu = e.currentTarget as HTMLElement;
          if (!e.relatedTarget || !menu.contains(e.relatedTarget as Node)) {
            dispatch({ type: "close" });
          }
        },
        [dispatch]
      ),
    },

    getItemProps(callback?: () => void, deps?: DependencyList): ItemProps {
      const [onClick, onKeyDown] = nextMemoizedHandlers(
        () => {
          callback?.();
          dispatch({ type: "close" });
        },
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
              callback?.();
              dispatch({ type: "close" });
              break;
          }
        },
        deps
      );

      return {
        role: "menuitem",
        tabIndex: -1,
        onClick,
        onKeyDown,
      };
    },

    getItemCheckboxProps(opts: ItemCheckboxOptions): ItemCheckboxProps {
      const [onClick, onKeyDown] = nextMemoizedHandlers(
        () => {
          opts.onToggle();
        },
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
              opts.onToggle();
              break;
          }
        },
        [opts.onToggle]
      );

      return {
        role: "menuitemcheckbox",
        tabIndex: -1,
        "aria-checked": opts.checked,
        onClick,
        onKeyDown,
      };
    },
  };
}

const SELECTOR_ITEMS =
  "[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio]";

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

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return { isOpen: true, pendingFocus: action.focus ?? null };
    case "close":
      return { isOpen: false, pendingFocus: null };
  }
}

function useMemoizedEventHandlers() {
  let itemEventHandlerIndex = 0;
  const itemEventHandlers = useRef<
    Array<[MouseEventHandler, KeyboardEventHandler, DependencyList]>
  >([]);

  return {
    nextMemoizedHandlers(
      defaultOnClick: MouseEventHandler,
      defaultOnKeyDown: KeyboardEventHandler,
      deps?: DependencyList
    ): [MouseEventHandler, KeyboardEventHandler] {
      const memorized = itemEventHandlers.current[itemEventHandlerIndex];
      let onClick, onKeyDown;

      if (memorized && deps) {
        const [previousOnClick, previousOnKeyDown, previousDeps] = memorized;
        if (shallowEqual(deps, previousDeps)) {
          onClick = previousOnClick;
          onKeyDown = previousOnKeyDown;
        }
      }

      onClick = onClick ?? defaultOnClick;
      onKeyDown = onKeyDown ?? defaultOnKeyDown;

      itemEventHandlers.current[itemEventHandlerIndex] = [
        onClick,
        onKeyDown,
        deps ? deps.slice() : [],
      ];
      itemEventHandlerIndex++;

      return [onClick, onKeyDown];
    },
  };
}

export interface MenuState {
  isOpen: boolean;
  buttonProps: ButtonProps;
  menuProps: MenuProps;
  getItemProps(callback?: () => void, deps?: DependencyList): ItemProps;
  getItemCheckboxProps(opts: ItemCheckboxOptions): ItemCheckboxProps;
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

export interface ItemCheckboxOptions {
  checked: boolean;
  onToggle(): void;
}

export interface ItemCheckboxProps {
  role: "menuitemcheckbox";
  tabIndex: -1;
  "aria-checked": boolean;
  onClick: MouseEventHandler;
  onKeyDown: KeyboardEventHandler;
}
