import React from 'react';

const Button = ({ text, onClick, className = 'custom-button' }) => (
    <button className={className} onClick={onClick}>
        {text}
    </button>
);

export default Button;
