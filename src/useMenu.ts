import { useState, KeyboardEvent, KeyboardEventHandler } from "react";

export default function useMenu(): MenuState {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    menuButtonProps: {
      onKeyDown(e: KeyboardEvent) {
        switch (e.code) {
          case "Enter":
          case "Space":
            setIsOpen(true);
            break;
        }
      },
    },
  };
}

export interface MenuState {
  isOpen: boolean;
  menuButtonProps: MenuButtonProps;
}

export interface MenuButtonProps {
  onKeyDown: KeyboardEventHandler;
}
