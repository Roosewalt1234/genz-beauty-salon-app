import React from 'react';
import { IconProps } from './Icon';

const TargetIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a6 6 0 0 0-7.38-5.84m2.56 5.84a6 6 0 0 1 7.38 5.84m-12.24 0a6 6 0 0 1 5.84-7.38m5.84 2.56a6 6 0 0 0-5.84-7.38m-5.84 7.38a6 6 0 0 0 7.38 5.84" />
    </svg>
);

export default TargetIcon;