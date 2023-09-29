# svelte-node-compat

This is a library that makes SvelteKit's Cloudflare adapter compatible with Node.js.

## Installation

```bash
npm install -D svelte-node-compat
```

## Usage

```js
// svelte.config.js

import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { nodeCompat } from 'svelte-node-compat';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: nodeCompat(adapter()),
    },
};

export default config;
```
