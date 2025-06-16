
import { SVGProps } from 'react';

const Trumpet = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M11 16c0-2 2-4 4-4" />
    <path d="M15 12a4 4 0 0 1 4 4" />
    <path d="M3 12v8" />
    <path d="M3 8c8 0 10-4 10-4s-.168 4 5 4" />
    <path d="M3 8V4c5 0 9 1 10 4" />
  </svg>
);

export default Trumpet;
