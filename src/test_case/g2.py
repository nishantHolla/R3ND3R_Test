import os
import subprocess
import json
import pandas as pd  # To create and save tables easily

# API configuration (if needed for additional purposes)
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
    test_content = f"""import React from 'react';
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
    test_filename = f"{component_name}.test.jsx"
    with open(test_filename, "w") as f:
        f.write(test_content)
    print(f"\nTest file generated: {test_filename}")
    print("\nTest file content:")
    print(test_content)
    return test_filename

def run_tests():
    """Run the npm test command and save results in a JSON file."""
    try:
        # Run Jest with JSON output
        subprocess.run(
            ["npx", "jest", "--json", "--outputFile=jest-results.json", "--watchAll=false"],
            check=True
        )
        print("Tests completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running tests: {str(e)}")
        raise

def generate_table_from_jest(json_file="jest-results.json", output_csv="test_results.csv"):
    """Generate a table from Jest JSON output and save it as a CSV file."""
    try:
        with open(json_file, "r") as f:
            data = json.load(f)
        
        # Extract relevant test case information
        test_cases = []
        for suite in data["testResults"]:
            for test in suite["assertionResults"]:
                test_cases.append({
                    "Test Case": test["title"],
                    "Status": test["status"],
                    "Suite": suite["name"]
                })

        # Create a DataFrame for better formatting and saving
        df = pd.DataFrame(test_cases)

        # Print the table
        print("\nTest Results Table:\n")
        print(df.to_string(index=False))

        # Save the table as a CSV file
        df.to_csv(output_csv, index=False)
        print(f"\nTest results saved to {output_csv}")

    except Exception as e:
        print(f"Error generating table: {e}")

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

        # Parse component using g1.js (optional)
        parse_component_with_g1(component_code)

        # Generate the test file
        generate_test_file(component_name)

        # Run the tests and generate the table
        run_tests()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Generate the result table from Jest's JSON output
        generate_table_from_jest()

if __name__ == "__main__":
    main()