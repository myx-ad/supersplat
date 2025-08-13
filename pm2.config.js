module.exports = {
    apps: [
        {
            name: 'supersplat-viewer',
            script: 'npm',
            args: 'run serve',

            watch: false,
            source_map_support: true,
            combine_logs: true,
            time: true,
            instances: 1,
            env: {
                // Everything else is loaded from the .env file
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            },
            env_development: {
                NODE_ENV: 'dev',
            },
        },
    ],
    deploy: {
        production: {
            user: 'platform',
            host: 'maverick',
            ref: 'origin/master',
            repo: 'git@github.com:myx-ad/supersplat.git',
            path: '/home/platform/supersplat/',
            'pre-setup': '',
            'post-setup': '',
            'pre-deploy-local': '',
            'post-deploy':
                'npm install; export NODE_ENV=production; npm run build && pm2 reload pm2.config.js',
        },
        staging: {
            user: 'user',
            host: '10.24.16.73',
            ref: 'origin/integration',
            repo: 'git@github.com:myx-ad/supersplat.git',
            path: '/home/user/supersplat/',
            'pre-setup': '',
            'post-setup': '',
            'pre-deploy-local': '',
            'post-deploy': 'npm install; npm run build && pm2 reload pm2.config.js --env development',
        },
    },
};
