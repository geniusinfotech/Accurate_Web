"use client";

import { useEffect } from "react";

export function useFormTabNavigation() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement)?.tagName === "INPUT") {
        const input = e.target as HTMLInputElement;
        if (input.type === "submit" || input.type === "button") return;
        const form = input.form;
        if (!form) return;
        const elements = Array.from(
          form.querySelectorAll<HTMLElement>("input, select, textarea, button")
        ).filter(
          (el) =>
            !el.hasAttribute("disabled") &&
            el.tabIndex >= 0 &&
            el.offsetParent !== null
        );
        const index = elements.indexOf(input);
        if (index >= 0 && index < elements.length - 1) {
          e.preventDefault();
          elements[index + 1].focus();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
