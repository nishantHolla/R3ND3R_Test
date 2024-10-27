import os
import subprocess
import requests
import json

# API configuration
API_KEY = "AIzaSyBd08xaokvbxUQ2VzYZ3ncLFQ5LiAFwBig"
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"


def create_component_file(component_name: str) -> str:
    """Create a sample React component file dynamically."""
    component_content = f"""import React from 'react';

const {component_name} = ({{ text, onClick, className = 'custom-button' }}) => (
    <button className={{className}} onClick={{onClick}}>
        {{text}}
    </button>
);

export default {component_name};
"""
    filename = f"{component_name}.jsx"
    with open(filename, "w") as f:
        f.write(component_content)
    print(f"{filename} created.\n")
    return component_content  # Return component content for parsing


def generate_test_file(component_name: str) -> str:
    """Generate a test file with a proper structure for the component."""
    return f"""import React from 'react';
import {{ render, screen, fireEvent }} from '@testing-library/react';
import '@testing-library/jest-dom';
import {component_name} from './{component_name}';

describe('{component_name}', () => {{
    it('renders with text prop', () => {{
        const mockOnClick = jest.fn();
        render(<{component_name} text="Click me" onClick={{mockOnClick}} />);

        const button = screen.getByText('Click me');
        expect(button).toBeInTheDocument();
    }});

    it('handles click events', () => {{
        const mockOnClick = jest.fn();
        render(<{component_name} text="Click me" onClick={{mockOnClick}} />);

        const button = screen.getByText('Click me');
        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    }});

    it('applies custom className', () => {{
        const mockOnClick = jest.fn();
        render(<{component_name} text="Click me" onClick={{mockOnClick}} />);

        const button = screen.getByText('Click me');
        expect(button).toHaveClass('custom-button');
    }});

    it('renders with different text props', () => {{
        const mockOnClick = jest.fn();
        const {{ rerender }} = render(<{component_name} text="Initial" onClick={{mockOnClick}} />);
        expect(screen.getByText('Initial')).toBeInTheDocument();

        rerender(<{component_name} text="Updated" onClick={{mockOnClick}} />);
        expect(screen.getByText('Updated')).toBeInTheDocument();
    }});

    it('maintains accessibility features', () => {{
        const mockOnClick = jest.fn();
        render(<{component_name} text="Click me" onClick={{mockOnClick}} />);

        const button = screen.getByRole('button', {{ name: /click me/i }});
        expect(button).toBeEnabled();
    }});
}});"""


def parse_component_with_g1(component_code: str) -> dict:
    """Run g1.js to parse the component code and return the JSON object."""
    result = subprocess.run(
        ["node", "g1.js", component_code], capture_output=True, text=True, check=True
    )
    return json.loads(result.stdout)


def main():
    try:
        # Define component name
        component_name = "Button"

        # Create the component file and get its content
        component_code = create_component_file(component_name)

        # Parse component using g1.js
        component_info = parse_component_with_g1(component_code)
        print("Parsed component info:")
        print(json.dumps(component_info, indent=2))

        # Generate the test file content
        test_file_content = generate_test_file(component_name)

        # Save the test file
        test_filename = f"{component_name}.test.jsx"
        with open(test_filename, "w") as f:
            f.write(test_file_content)

        print(f"\nTest file generated: {test_filename}")
        print("\nTest file content:")
        print(test_file_content)

        # Run npm test
        print("Running npm test...")
        subprocess.run(["npm", "test", "--", "--watchAll=false"], check=True)
        print("Tests completed.")

    except subprocess.CalledProcessError as e:
        print(f"Error running subprocess: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    main()
