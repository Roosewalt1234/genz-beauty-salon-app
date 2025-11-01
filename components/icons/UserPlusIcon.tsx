import React from 'react';
import { IconProps } from './Icon';

const UserPlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.12v-.002ZM16.749 20.406a.75.75 0 0 1 .375 0l2.25.75a.75.75 0 0 1 0 1.5l-2.25-.75a.75.75 0 0 1-.375 0ZM17.25 12a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5H18v2.25a.75.75 0 0 1-1.5 0V16.5h-2.25a.75.75 0 0 1 0-1.5H16.5V12.75a.75.75 0 0 1 .75-.75Z" />
    </svg>
);
export default UserPlusIcon;
