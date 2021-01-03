import { renderHook, act } from "@testing-library/react-hooks";
import { FormEvent } from "react";
import { useMenuCheckboxState } from "../src";

describe("useMenuCheckboxState", () => {
  test("`true` as initial state", () => {
    const { result } = renderHook(() => useMenuCheckboxState(true));
    expect(result.current.checked).toEqual(true);
  });

  test("`false` as initial state", () => {
    const { result } = renderHook(() => useMenuCheckboxState(false));
    expect(result.current.checked).toEqual(false);
  });

  test("function that returns `true` as initial state", () => {
    const { result } = renderHook(() => useMenuCheckboxState(() => true));
    expect(result.current.checked).toEqual(true);
  });

  test("function that returns `false` as initial state", () => {
    const { result } = renderHook(() => useMenuCheckboxState(() => false));
    expect(result.current.checked).toEqual(false);
  });

  test("initial state change does not change actual state", () => {
    const { result, rerender } = renderHook(
      (initialState: boolean) => useMenuCheckboxState(initialState),
      {
        initialProps: true,
      }
    );

    expect(result.current.checked).toEqual(true);
    rerender(false);
    expect(result.current.checked).toEqual(true);
  });

  test("onToggle() toggles the state", () => {
    const { result } = renderHook(() => useMenuCheckboxState(true));
    expect(result.current.checked).toEqual(true);
    act(() => result.current.onToggle());
    expect(result.current.checked).toEqual(false);
    act(() => result.current.onToggle());
    expect(result.current.checked).toEqual(true);
  });

  test("props.checked === checked", () => {
    const { result } = renderHook(() => useMenuCheckboxState(true));
    expect(result.current.checked).toEqual(true);
    expect(result.current.props.checked).toEqual(true);
    act(() => result.current.onToggle());
    expect(result.current.checked).toEqual(false);
    expect(result.current.props.checked).toEqual(false);
  });

  test("props.onChange() updates the state based on event target.checked", () => {
    const { result } = renderHook(() => useMenuCheckboxState(true));
    expect(result.current.checked).toEqual(true);
    act(() =>
      result.current.props.onChange({
        target: ({ checked: false } as unknown) as EventTarget,
      } as FormEvent)
    );
    expect(result.current.checked).toEqual(false);
    act(() =>
      result.current.props.onChange({
        target: ({ checked: true } as unknown) as EventTarget,
      } as FormEvent)
    );
    expect(result.current.checked).toEqual(true);
  });
});
