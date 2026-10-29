import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /** The DWM app launcher web component from dwm-apps.js. */
      "dwm-apps": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { current?: string };
    }
  }
}
