module.exports =  {
    parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
    plugins: ['jest'],
    extends:  [
        'airbnb-typescript/base', // use the AirBnB style guide
        'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:jest/recommended', // eslint for jest
        'plugin:jest/style', // eslint for jest
        'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parserOptions:  {
        ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
        sourceType:  'module',  // Allows for the use of imports
        project: [
            './src/tsconfig.json',
            './antlr_ts_build/tsconfig.json',
            './test/tsconfig.json'
        ],
        tsconfigRootDir: __dirname
    },
    env: {
        node: true,
        browser: true,
        jest: true,
    },
    rules:  {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        "no-console": "off",
        "no-plusplus": "off",
        "class-methods-use-this": "off",
        "radix": "off",
        "no-restricted-syntax": "off",
        "prefer-destructuring": "off"
    },
};