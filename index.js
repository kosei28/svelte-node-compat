import NodeGlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill';
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill';
import * as esbuild from 'esbuild';
import { readdirSync, statSync } from 'node:fs';
import * as path from 'node:path';

export default function (adapter) {
    return {
        name: `svelte-node-compat & ${adapter.name}`,
        async adapt(builder) {
            const build_dir = builder.getBuildDirectory('node-compat');

            builder.rimraf(build_dir);

            const server_dir = builder.getServerDirectory();

            await build(server_dir, build_dir, '');

            builder.getServerDirectory = () => build_dir;

            adapter.adapt(builder);
        },
    };
}

async function build(server_dir, out_dir, current_dir) {
    const sources = readdirSync(path.join(server_dir, current_dir));
    const files = sources
        .filter((src) => src.endsWith('.js'))
        .map((file) => path.join(server_dir, current_dir, file));

    await esbuild.build({
        entryPoints: files,
        outdir: path.join(out_dir, current_dir),
        format: 'esm',
        bundle: true,
        plugins: [
            NodeGlobalsPolyfills['default']({ buffer: true }),
            NodeModulesPolyfills['default'](),
        ],
    });

    for (const src of sources) {
        if (statSync(path.join(server_dir, current_dir, src)).isDirectory()) {
            await build(server_dir, out_dir, path.join(current_dir, src));
        }
    }
}
