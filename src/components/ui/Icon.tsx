import type { SVGProps } from "react";

const PATHS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
  note: <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  redo: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  more: (
    <>
      <circle cx="12" cy="5" r="1.5" className="fill" />
      <circle cx="12" cy="12" r="1.5" className="fill" />
      <circle cx="12" cy="19" r="1.5" className="fill" />
    </>
  ),
  logo: <path d="M9 22l5-12 4 8 2-4 3 8" />,
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg viewBox={name === "logo" ? "0 0 32 32" : "0 0 24 24"} aria-hidden="true" focusable="false" {...props}>
      {PATHS[name]}
    </svg>
  );
}
