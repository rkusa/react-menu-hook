# React Menu Hook

Minimal, zero-dependency React hook to create accessible menus (aka. dropdowns).

[Demo](https://react-menu-hook.vercel.app) | [NPM](http://npmjs.com/package/react-menu-hook)

## Example

Minimal example:

```tsx
import { useMenu } from "react-menu-hook";

export default function Menu() {
  const { isOpen, buttonProps, menuProps, getItemProps } = useMenu("main");

  return (
    <div>
      <button {...buttonProps}>Menu</button>

      {isOpen && (
        <ul {...menuProps}>
          <li {...getItemProps(() => {})}>Action 1</li>
          <li {...getItemProps(() => {})}>Action 2</li>
        </ul>
      )}
    </div>
  );
}
```

More advanced examples:

- [website/components/Menu.tsx](website/components/Menu.tsx)
- [react-menu-hook/test/Menu.tsx](react-menu-hook/test/Menu.tsx)

## License

[MIT](./LICENSE)
