# use-menu

Minimal, zero-dependency React hook to create accessible menus (aka dropdowns).

[Demo](https://use-menu.vercel.app) | [NPM](http://npmjs.com/package/@rkusa/use-menu)

## Example

Minimal example:

```tsx
import { useMenu } from "@rkusa/use-menu";

export default function Menu() {
  const { isOpen, buttonProps, menuProps, getItemProps } = useMenu("main");

  return (
    <div>
      <button {...buttonProps}>Menu</button>

      {isOpen && (
        <ul {...menuProps}>
          <li {...getItemProps(() => {})}>Action 1</li>
          <li {...getItemProps(() => {})}>Action 2</li>
      )}
    </div>
  );
}
```

More advanced examples:

- [website/components/Menu.tsx](website/components/Menu.tsx)
- [use-menu/test/Menu.tsx](use-menu/test/Menu.tsx)

## License

[MIT](./LICENSE)
