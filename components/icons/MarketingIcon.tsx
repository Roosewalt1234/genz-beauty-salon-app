import React from 'react';
import { IconProps } from './Icon';

const MarketingIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 0 12h-3a7.5 7.5 0 0 0-7.5-7.5h1.5v-1.5a7.5 7.5 0 0 1 7.5-7.5h1.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.75h2.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h3.75" />
    </svg>
);

export default MarketingIcon;