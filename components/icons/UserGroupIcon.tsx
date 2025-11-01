import React from 'react';
import { IconProps } from './Icon';

const UserGroupIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.12v-.002ZM16.5 19.125a5.625 5.625 0 0 1 11.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 11.52 11.52 0 0 1-5.262 1.586 11.52 11.52 0 0 1-5.262-1.586.75.75 0 0 1-.364-.63l-.001-.12v-.002Z" />
    </svg>
);
export default UserGroupIcon;
