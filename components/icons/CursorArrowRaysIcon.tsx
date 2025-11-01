import React from 'react';
import { IconProps } from './Icon';

const CursorArrowRaysIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 12h-2.25m-1.666 5.834-1.591-1.591M12 21.75V19.5m-5.834-.166 1.591-1.591M3.75 12h2.25m1.666-5.834 1.591 1.591" />
    </svg>
);

export default CursorArrowRaysIcon;