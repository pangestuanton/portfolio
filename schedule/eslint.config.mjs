export default [{
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
        ecmaVersion: 'latest',
        globals: Object.fromEntries([
            'window', 'document', 'localStorage', 'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame',
            'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'CustomEvent', 'Node',
            'HTMLElement', 'HTMLButtonElement', 'HTMLDialogElement', 'HTMLMetaElement',
            'setTimeout', 'clearTimeout', 'AbortController', 'fetch', 'console', 'URL',
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
