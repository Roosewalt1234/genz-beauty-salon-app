import React from 'react';
import { IconProps } from './Icon';

const PresentationChartBarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3.75m-16.5 0h16.5m-16.5 0a2.25 2.25 0 0 0-2.25 2.25v1.5A2.25 2.25 0 0 0 6 9h12a2.25 2.25 0 0 0 2.25-2.25v-1.5A2.25 2.25 0 0 0 18 3.75m-16.5 0h16.5" />
    </svg>
);

export default PresentationChartBarIcon;