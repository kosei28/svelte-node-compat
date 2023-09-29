import NodeGlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill';
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill';
import * as esbuild from 'esbuild';
import { glob } from 'glob';
import * as path from 'node:path';

export default function (adapter) {
    return {
        name: `svelte-node-compat & ${adapter.name}`,
        async adapt(builder) {
            const build_dir = builder.getBuildDirectory('node-compat');

            builder.rimraf(build_dir);

            const server_dir = builder.getServerDirectory();
            const sources = await glob(path.join(server_dir, '**/*.js'), {
                nodir: true,
            });

            await esbuild.build({
                conditions: ['worker', 'workerd', 'browser'],
                entryPoints: sources,
                outdir: build_dir,
                format: 'esm',
                bundle: true,
                loader: {
                    '.wasm': 'copy',
                },
                external: ['cloudflare:*'],
                plugins: [
                    NodeGlobalsPolyfills['default']({ buffer: true }),
                    NodeModulesPolyfills['default'](),
                ],
            });

            builder.getServerDirectory = () => build_dir;

            adapter.adapt(builder);
        },
    };
}
