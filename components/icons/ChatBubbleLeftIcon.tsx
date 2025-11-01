import React from 'react';
import { IconProps } from './Icon';

const ChatBubbleLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.372c-1.041.104-1.98-.8-1.98-1.932V8.511c0-.97.616-1.813 1.5-2.097L16.5 6.25l2.25 2.25-1.503.211Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 10.5c.884-.284 1.5-1.128 1.5-2.097V6.25c0-1.136.847-2.1 1.98-2.193l3.722-.372c1.041-.104 1.98.8 1.98 1.932V10.5c0 .97-.616 1.813-1.5 2.097L9 13.25l-2.25-2.25 1.503-.211Z" />
    </svg>
);

export default ChatBubbleLeftIcon;