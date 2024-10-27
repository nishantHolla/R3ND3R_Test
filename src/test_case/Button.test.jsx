import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button', () => {
    it('renders with text prop', () => {
        const mockOnClick = jest.fn();
        render(<Button text="Click me" onClick={mockOnClick} />);

        const button = screen.getByText('Click me');
        expect(button).toBeInTheDocument();
    });

    it('handles click events', () => {
        const mockOnClick = jest.fn();
        render(<Button text="Click me" onClick={mockOnClick} />);

        const button = screen.getByText('Click me');
        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
        const mockOnClick = jest.fn();
        render(<Button text="Click me" onClick={mockOnClick} />);

        const button = screen.getByText('Click me');
        expect(button).toHaveClass('custom-button');
    });

    it('renders with different text props', () => {
        const mockOnClick = jest.fn();
        const { rerender } = render(<Button text="Initial" onClick={mockOnClick} />);
        expect(screen.getByText('Initial')).toBeInTheDocument();

        rerender(<Button text="Updated" onClick={mockOnClick} />);
        expect(screen.getByText('Updated')).toBeInTheDocument();
    });

    it('maintains accessibility features', () => {
        const mockOnClick = jest.fn();
        render(<Button text="Click me" onClick={mockOnClick} />);

        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeEnabled();
    });
});