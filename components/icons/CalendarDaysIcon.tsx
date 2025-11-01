import React from 'react';
import { IconProps } from './Icon';

const CalendarDaysIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        <path fillRule="evenodd" d="M3.75 3a2.25 2.25 0 0 1 2.25-2.25h12a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25V3ZM6 4.5a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75H6Zm8.25 3.75a.75.75 0 1 0-1.5 0v.75h-3v-.75a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-.75Z" clipRule="evenodd" />
    </svg>
);
export default CalendarDaysIcon;
