const path = require('path')

const forceBundleConfigDeps = () => {
    const virtualFileId = '/virtual:/@storybook/builder-vite/vite-app.js';
    const nodeModuleStr = 'node_modules/';

    return {
        name: 'force-bundle-config-dep',
        enforce: 'pre',
        /**
         * @param {string} code
         */
        transform(code, id) {
            if (id !== virtualFileId) {
                return;
            }

            const transformedCode = code.replace(
                /import \* as (config_.*?) from '(.*?)'/g,
                (substr, name, mpath) => {
                    const idx = mpath.lastIndexOf(nodeModuleStr);
                    if (idx !== -1) {
                        return `import * as ${name} from '${mpath.slice(
                            idx + nodeModuleStr.length
                        )}'`;
                    }
                    return substr;
                }
            );

            return {
                code: transformedCode,
                map: null,
            };
        },
    };
};

module.exports = {
    stories: [
        '../stories/**/*.stories.mdx',
        '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        // "@storybook/addon-a11y", // still breaks
        '@storybook/addon-links',
        '@storybook/addon-essentials',
    ],
    core: {
        builder: 'storybook-builder-vite',
    },
    async viteFinal(config, options) {
        // customize the Vite config here
        return {
            ...config,
            plugins: [...config.plugins, forceBundleConfigDeps()],
            optimizeDeps: {
                include: [
                    '@storybook/react',
                    '@storybook/client-api',
                    '@storybook/client-logger',
                ],
                entries: [
                    `${path.relative(
                        config.root,
                        path.resolve(__dirname, '../stories')
                    )}/**/*.stories.@(js|jsx|ts|tsx)`,
                ],
            },
        };
    },
};
