module.exports = {
    apps: [
        {
            name: 'supersplat-viewer',
            script: 'npm',
            args: 'run serve',
            interpreter: 'none', // important when using npm as "script"
            watch: false,
            source_map_support: true,
            combine_logs: true,
            time: true,
            instances: 1,
            env: { NODE_ENV: 'production' },
            env_staging: { NODE_ENV: 'staging' },
            env_development: { NODE_ENV: 'dev' },
        },
    ],
    deploy: {
        production: {
            user: 'platform',
            host: 'maverick',
            ref: 'origin/main',
            repo: 'git@github.com:myx-ad/supersplat.git',
            path: '/home/platform/supersplat', // drop trailing slash
            ssh_options: 'ForwardAgent=yes',
            'post-deploy':
                'npm ci && npm run build && pm2 reload pm2.config.js --env production --update-env',
        },
        staging: {
            user: 'user',
            host: '10.24.16.73',
            ref: 'origin/integration',
            repo: 'git@github.com:myx-ad/supersplat.git',
            path: '/home/user/supersplat',
            ssh_options: 'ForwardAgent=yes',
            'post-deploy':
                'npm ci && npm run build && pm2 reload pm2.config.js --env development --update-env',
        },
    },
};
