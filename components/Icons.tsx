
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" {...props}>
        <rect width="200" height="100" fill="#1e528c"/>
        <text x="10" y="70" fontFamily="Arial, sans-serif" fontSize="60" fill="#ffbc0d" fontWeight="bold">PT</text>
        <path d="M110 20 L130 50 L110 80" stroke="#ffbc0d" strokeWidth="10" fill="none"/>
        <path d="M140 20 L160 50 L140 80" stroke="#ffbc0d" strokeWidth="10" fill="none"/>
        <text x="165" y="70" fontFamily="Arial, sans-serif" fontSize="60" fill="#fff" fontWeight="bold">C</text>
    </svg>
);
