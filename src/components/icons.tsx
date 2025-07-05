import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3v18" />
      <path d="M18 3v18" />
      <path d="M10 12h4" />
      <path d="M10 6h4" />
      <path d="M10 18h4" />
      <path d="M12 3l4 3-4 3" />
      <path d="M12 21l-4-3 4-3" />
    </svg>
  );
}
