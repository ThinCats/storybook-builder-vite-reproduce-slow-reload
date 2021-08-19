const path = require('path');

const forceBundleConfigDeps = () => {
    const virtualFileId = '/virtual:/@storybook/builder-vite/vite-app.js';

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

            // match last node_modules
            // .../node_modules/.../node_modules/yy/zz -> yy/zz
            const transformedCode = code.replace(
                /import \* as (config_.*?) from '.*\/node_modules\/(.*?)'/g,
                (_substr, name, mpath) => {
                    return `import * as ${name} from '${mpath}'`;
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
        '@storybook/addon-a11y', // it works now, without optimizeDeps.include (see issue https://github.com/eirslett/storybook-builder-vite/issues/6)
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
