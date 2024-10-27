const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Function to parse the component
function parseComponent(codeString) {
    const ast = babelParser.parse(codeString, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });

    const componentInfo = {
        componentName: null,
        props: [],
        state: [],
        functions: [],
        elements: [],
    };

    traverse(ast, {
        FunctionDeclaration(path) {
            if (path.node.id && path.node.id.name) {
                componentInfo.componentName = path.node.id.name;
            }
        },

        VariableDeclarator(path) {
            if (path.node.id.name) {
                componentInfo.componentName = path.node.id.name;
            }

            const init = path.node.init;
            if (
                init &&
                init.type === 'CallExpression' &&
                init.callee.name === 'useState'
            ) {
                const stateVariable = path.node.id.elements[0]?.name;
                if (stateVariable) {
                    componentInfo.state.push(stateVariable);
                }
            }
        },

        ArrowFunctionExpression(path) {
            const parent = path.parent;
            if (parent.type === 'VariableDeclarator' && parent.id.name) {
                componentInfo.componentName = parent.id.name;
            }

            // Check for destructured props in arrow function params
            const param = path.node.params[0];
            if (param && param.type === 'ObjectPattern') {
                param.properties.forEach((prop) => {
                    if (prop.key && prop.key.name) {
                        componentInfo.props.push(prop.key.name);
                    }
                });
            }
        },

        JSXOpeningElement(path) {
            componentInfo.elements.push(path.node.name.name);
        },

    });

    return componentInfo;
}

// Get the input from the command line
const codeString = process.argv[2];

// Parse and output the component information
const result = parseComponent(codeString);
console.log(JSON.stringify(result, null, 2));
