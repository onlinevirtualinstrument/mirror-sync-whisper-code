
import { SVGProps } from 'react';

const Saxophone = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 3v10c0 1-1 2-2 2s-2-1-2-2V9" />
    <path d="M16 9.344C16 8.603 15.4 8 14.661 8H9.339C8.6 8 8 8.603 8 9.344c0 .692.256 1.362.713 1.882L10.74 13.7c.15.17.366.3.56.3H13.7c.194 0 .41-.13.56-.3l2.027-2.474c.457-.52.713-1.19.713-1.882Z" />
    <path d="M14 13.5c0 1.381-1.119 2.5-2.5 2.5S9 14.881 9 13.5M8 16l2 6M16 16l-2 6" />
  </svg>
);

export default Saxophone;
