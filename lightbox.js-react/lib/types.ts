import { ComponentPropsWithoutRef, ElementType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type As<Props = any> = ElementType<Props>;

/**
 * Extract the props of a React element or component
 */
export type PropsOf<T extends As> = ComponentPropsWithoutRef<T> & {
  as?: As;
};

export type HTMLProps<
  T extends As = "div",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OmitKeys extends keyof any = never
> = Omit<PropsOf<T>, "ref" | "color" | "slot" | OmitKeys> & {
  as?: As;
};
