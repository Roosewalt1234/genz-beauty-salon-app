import React from 'react';
import { IconProps } from './Icon';

const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm-4.502 9.422a.75.75 0 0 1 .634-.596h14.736a.75.75 0 0 1 .634.596c.331.956.331 2.023 0 2.979a.75.75 0 0 1-.634.596H3.634a.75.75 0 0 1-.634-.596c-.331-.956-.331-2.023 0-2.979Z" clipRule="evenodd" />
    </svg>
);
export default UserIcon;
