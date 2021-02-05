import { FormEventHandler, useCallback, useState } from "react";

/**
 * A hook to simplify keeping track of a checkbox form input state.
 *
 * @param initialState - the initial state of the checkbox
 */
export default function useMenuCheckboxState(
  initialState: boolean | (() => boolean)
): CheckboxState {
  const [checked, setChecked] = useState(initialState);
  const onChange = useCallback((e) => setChecked(e.target.checked), []);
  const onToggle = useCallback(() => setChecked((checked) => !checked), []);
  return { checked, onToggle, props: { checked, onChange } };
}

/**
 * Checkbox form input state.
 */
export interface CheckboxState {
  /**
   * Whether the checkbox is checked or not.
   */
  checked: boolean;

  /**
   * Toggle the checkbox's state (either from `true` to `false`, or from `false` to `true`).
   */
  onToggle(): void;

  /**
   * Properties meant to be destructed into a checkbox input.
   * @example
   * ```
   * const { props } = useMenuCheckboxState();
   * <input type="checkbox" {...props} />
   * ```
   */
  props: {
    /**
     * Whether the checkbox is checked or not.
     * @remarks
     * This is the same as the parent `checked`, but part of the `props` property to make it easier
     * to destruct it into an actual input.
     */
    checked: boolean;
    onChange: FormEventHandler;
  };
}
