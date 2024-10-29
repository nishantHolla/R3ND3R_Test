import os
import subprocess
import json
import pandas as pd  # To create and save tables easily
import requests  # To interact with the Gemini API

# API configuration for Gemini
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
    return component_content

def parse_component_with_g1(component_code: str) -> dict:
    """Run Babel parser via g1.js to extract component details."""
    result = subprocess.run(
        ["node", "g1.js", component_code], capture_output=True, text=True, check=True
    )
    return json.loads(result.stdout)

def generate_test_file_with_gemini(component_name: str, component_code: str) -> str:
    """Generate test cases using Gemini API."""
    prompt = f"Generate test cases for the following React component:\n{component_code}"

    # Send request to Gemini API
    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        json={"prompt": prompt, "temperature": 0.7}
    )

    if response.status_code == 200:
        gemini_response = response.json()
        test_content = gemini_response.get("content", "Error: No content received.")
    else:
        raise Exception(f"Error calling Gemini API: {response.text}")

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
        
        test_cases = [
            {
                "Test Case": test["title"],
                "Status": test["status"],
                "Suite": suite["name"]
            }
            for suite in data["testResults"]
            for test in suite["assertionResults"]
        ]

        df = pd.DataFrame(test_cases)
        print("\nTest Results Table:\n")
        print(df.to_string(index=False))
        df.to_csv(output_csv, index=False)
        print(f"\nTest results saved to {output_csv}")
    except Exception as e:
        print(f"Error generating table: {e}")

def main():
    try:
        component_name = "Button"
        component_code = create_component_file(component_name)
        parsed_component = parse_component_with_g1(component_code)
        print("\nParsed Component Info:\n", parsed_component)
        generate_test_file_with_gemini(component_name, component_code)
        run_tests()
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        generate_table_from_jest()

if __name__ == "__main__":
    main()