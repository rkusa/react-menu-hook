import { useCallback, useState } from "react";

export default function useMenuCheckboxState(
  initialState: boolean | (() => boolean)
) {
  const [checked, setChecked] = useState(initialState);
  const onChange = useCallback((e) => setChecked(e.target.checked), []);
  const onToggle = useCallback(() => setChecked((checked) => !checked), []);
  return { checked, onToggle, props: { checked, onChange } };
}
