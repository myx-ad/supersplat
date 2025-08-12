module.exports = {
	apps: [
		{
			name: 'supersplat',
			script: 'npm',
			args: 'run develop',
			cwd: '/home/kiril/MYX/Repos/supersplat',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'development',
				BUILD_TYPE: 'release',
			},
			env_production: {
				NODE_ENV: 'production',
				BUILD_TYPE: 'release',
			},
		},
		{
			name: 'supersplat-prod',
			script: 'npx',
			args: 'serve dist -l 4000',
			cwd: '/home/kiril/MYX/Repos/supersplat',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				BUILD_TYPE: 'release',
			},
			env_production: {
				NODE_ENV: 'production',
				BUILD_TYPE: 'release',
			},
		},
	],
};
