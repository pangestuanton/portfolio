export default [{
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
        ecmaVersion: 'latest',
        globals: Object.fromEntries([
            'window', 'document', 'localStorage', 'matchMedia', 'requestAnimationFrame',
            'IntersectionObserver', 'HTMLElement', 'HTMLButtonElement', 'setInterval', 'URL',
        ].map(name => [name, 'readonly'])),
    },
    rules: {
        'no-undef': 'error',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-unreachable': 'error',
        'no-dupe-keys': 'error',
        'no-constant-condition': 'error',
        'no-duplicate-imports': 'error',
        'valid-typeof': 'error',
        eqeqeq: 'error',
    },
}];
