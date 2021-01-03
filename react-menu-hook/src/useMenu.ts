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

/**
 * Options of the {@link useMenu} hook.
 */
export interface MenuOpts {
  /**
   * Whether the menu is already opened initially.
   */
  defaultIsOpen?: boolean;
}

/**
 * Create everything necessary to construct an accessible menu (or dropdown).
 * @param key - a key that uniquely identifies the menu on the current page
 * @param opts - options to further customize the menu's behavior
 */
export default function useMenu(key: string, opts?: MenuOpts): MenuState {
  // The main internal state of the menu
  const [state, dispatch] = useReducer(
    reducer,
    opts?.defaultIsOpen
      ? { ...INITIAL_STATE, isOpen: opts?.defaultIsOpen ?? false }
      : INITIAL_STATE
  );

  // Create IDs for the menu and menu button
  const [menuId, buttonId] = useMemo(
    () => [`use-menu-${key}`, `use-menu-${key}-trigger`],
    [key]
  );

  // Initialize a helper to memoize event handlers of all menu items
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
                const menu = e.currentTarget as HTMLElement;
                const items = menu.querySelectorAll(SELECTOR_ITEMS);
                if (items.length === 0) {
                  break;
                }

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
                const menu = e.currentTarget as HTMLElement;
                const items = menu.querySelectorAll(SELECTOR_ITEMS);
                if (items.length === 0) {
                  break;
                }

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

    getItemProps(
      callback?: () => void,
      deps?: DependencyList,
      opts?: ItemOptions
    ): ItemProps {
      const [onClick, onKeyDown] = nextMemoizedHandlers(
        () => {
          if (opts?.disabled) {
            return;
          }
          callback?.();
          dispatch({ type: "close" });
        },
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
              if (opts?.disabled) {
                break;
              }
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
        "aria-disabled": opts?.disabled ? true : undefined,
        onClick,
        onKeyDown,
      };
    },

    getItemCheckboxProps(opts: ItemCheckboxOptions): ItemCheckboxProps {
      const [onClick, onKeyDown] = nextMemoizedHandlers(
        () => {
          if (opts.disabled) {
            return;
          }
          opts.onToggle();
        },
        (e: KeyboardEvent) => {
          switch (e.code) {
            case "Enter":
            case "Space":
              if (opts.disabled) {
                break;
              }
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
        "aria-disabled": opts.disabled ? true : undefined,
        onClick,
        onKeyDown,
      };
    },
  };
}

/**
 * A selector for all possible menu item types.
 */
const SELECTOR_ITEMS =
  "[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio]";

/**
 * Determine whether two dependency lists are shallowly equal or not.
 */
function shallowEqual(lhs: DependencyList, rhs: DependencyList): boolean {
  if (lhs.length !== rhs.length) {
  // If they have a different length, they are definitely not shallowly equal.
  return false;
  }
  for (let i = 0; i < lhs.length; ++i) {
    if (lhs[i] !== rhs[i]) {
      return false;
    }
  }
  return true;
}

/**
 * The internal state of the menu.
 */
interface State {
  /**
   * Whether the menu is open or not.
   */
  isOpen: boolean;

  /**
   * Whether the menu should focus its first or last item once it is opened.
   */
  pendingFocus: "first" | "last" | null;
}

/**
 * The open action for the {@link reducer}.
 */
interface ActionOpen {
  type: "open";
  focus?: "first" | "last";
}

/**
 * The close action for the {@link reducer}.
 */
interface ActionClose {
  type: "close";
}

/**
 * The initial internal state of the menu.
 */
const INITIAL_STATE: State = { isOpen: false, pendingFocus: null };

/**
 * The reducer used to execute state changes.
 * @param state - the current state
 * @param action - the action applied on the current state
 */
function reducer(state: State, action: ActionOpen | ActionClose): State {
  switch (action.type) {
    case "open":
      // The open action acts like a toogle, if the menu is already open, it is closed
      if (!state.isOpen) {
        return { isOpen: true, pendingFocus: action.focus ?? null };
      } else {
        return { isOpen: false, pendingFocus: null };
      }

    case "close":
      return { isOpen: false, pendingFocus: null };
  }
}

/**
 * Memoize event handlers for an arbitrary length of menu items.
 */
function useMemoizedEventHandlers() {
  // The index of the next menu item. This is increased each time a set of event handlers is
  // memoized.
  let itemEventHandlerIndex = 0;

  // The array of memoized event handlers and their dependency list (which determines whether the
  // handlers have changed or not).
  const itemEventHandlers = useRef<
    Array<[MouseEventHandler, KeyboardEventHandler, DependencyList]>
  >([]);

  return {
    /**
     * Get the next set of memoized event handlers (or update them if necessary).
     *
     * @param defaultOnClick - the default `onClick` handler, which is used if there is no memoized
     *    handler, or if the dependencies have changed
     * @param defaultOnKeyDown - the default `onKeyDown` handler, which is used if there is no
     *    memoized handler, or if the dependencies have changed
     * @param deps - the dependencies which are used to determine whether the handlers should be
     *    updated or not
     *
     * @returns a pair of event handlers, where the first one is the `onClick` and the second one
     *  is the `onKeyDown` handler
     */
    nextMemoizedHandlers(
      defaultOnClick: MouseEventHandler,
      defaultOnKeyDown: KeyboardEventHandler,
      deps?: DependencyList
    ): [MouseEventHandler, KeyboardEventHandler] {
      const memorized = itemEventHandlers.current[itemEventHandlerIndex];
      let onClick, onKeyDown;

      // Update the memoized handlers if the dependencies have changed
      if (memorized && deps) {
        const [previousOnClick, previousOnKeyDown, previousDeps] = memorized;
        if (shallowEqual(deps, previousDeps)) {
          onClick = previousOnClick;
          onKeyDown = previousOnKeyDown;
        }
      }

      // Always update the handlers if no dependencies are provided
      onClick = onClick ?? defaultOnClick;
      onKeyDown = onKeyDown ?? defaultOnKeyDown;

      // Memoized the updated event handlers
      itemEventHandlers.current[itemEventHandlerIndex] = [
        onClick,
        onKeyDown,
        deps ? deps.slice() : [],
      ];

      // Increase the index so that the handlers for the next menu item are returned when
      // `nextMemoizedHandlers` is called again
      itemEventHandlerIndex++;

      return [onClick, onKeyDown];
    },
  };
}

/**
 * All properties and event handlers necessary to construct an accessible menu.
 */
export interface MenuState {
  /**
   * Whether the menu is currently open or not.
   * @example
   * ```
   * {isOpen ? <div {...menuProps}>...</div>}
   * ```
   */
  isOpen: boolean;

  /**
   * The properties and event handlers for the button that opens and closes the menu.
   * @example
   * ```
   * <button {...buttonProps}>Open Menu</button>
   * ```
   */
  buttonProps: ButtonProps;

  /**
   * The properties and event handlers for the menu.
   * @example
   * ```
   * {isOpen ? <div {...menuProps}>...</div>}
   * ```
   */
  menuProps: MenuProps;

  /**
   * Get the properties and event handlers for the next menu item. Each call to this function refers
   * to one menu item.
   * @example
   * ```
   * <li {...getItemProps(() => {})}>Menu Action</li>
   * ```
   *
   * @param callback - the callback that is executed if the menu action is activated
   * @param deps - the optional dependencies that determine whether `callback` changed
   * @param opts - additional options for the menu item
   */
  getItemProps(
    callback?: () => void,
    deps?: DependencyList,
    opts?: ItemOptions
  ): ItemProps;

  /**
   * Get the properties and event handlers for the next checkbox menu item. Each call to this
   * function refers to one checkbox menu item.
   * @example
   * ```
   * const checkbox = useMenuCheckboxState(false);
   * <li {...getItemCheckboxProps(const)}>
   *   <input type="checkbox" tabIndex={-1} {...checkbox.props} /> Checkbox
   * </li>
   * ```
   *
   * @param opts - options for the checkbox menu item
   */
  getItemCheckboxProps(opts: ItemCheckboxOptions): ItemCheckboxProps;
}

/**
 * The properties and event handlers for the button that opens and closes the menu.
 */
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

/**
 * The properties and event handlers for the menu.
 */
export interface MenuProps {
  role: "menu";
  id: string;
  "aria-labelledby": string;
  ref: RefCallback<HTMLElement | null>;
  onKeyDown: KeyboardEventHandler;
  onBlur: FocusEventHandler;
}

/**
 * The properties and event handlers for a menu item.
 */
export interface ItemProps {
  role: "menuitem";
  tabIndex: -1;
  "aria-disabled"?: true;
  onClick: MouseEventHandler;
  onKeyDown: KeyboardEventHandler;
}

/**
 * Additional options for a menu item.
 */
export interface ItemOptions {
  /**
   * Whether the menu item is disabled.
   */
  disabled?: boolean;
}

/**
 * The options for a checkbox menu item.
 */
export interface ItemCheckboxOptions {
  /**
   * Whether the checkbox is checked.
   */
  checked: boolean;

  /**
   * Whether the checkbox menu item is disabled.
   */
  disabled?: boolean;

  /**
   * A function to toggle the checkbox on and off.
   */
  onToggle(): void;
}

/**
 * The properties and event handlers for a checkbox menu item.
 */
export interface ItemCheckboxProps {
  role: "menuitemcheckbox";
  tabIndex: -1;
  "aria-checked": boolean;
  "aria-disabled"?: true;
  onClick: MouseEventHandler;
  onKeyDown: KeyboardEventHandler;
}
