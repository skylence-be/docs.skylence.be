// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
    site: 'https://docs.skylence.be',
    integrations: [
        starlight({
            title: 'Skylence',
            description: 'Claude Code Harness — documentation',
            logo: {
                src: './src/assets/logo.svg',
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/skylence-be/skylence' },
            ],
            sidebar: [
                { label: 'Introduction', slug: 'index' },
                { label: 'Getting Started', slug: 'getting-started' },
                {
                    label: 'Workflow Format',
                    autogenerate: { directory: 'workflow-format' },
                },
                {
                    label: 'CLI Reference',
                    autogenerate: { directory: 'cli' },
                },
                {
                    label: 'Configuration',
                    autogenerate: { directory: 'configuration' },
                },
                {
                    label: 'Architecture',
                    autogenerate: { directory: 'architecture' },
                },
            ],
        }),
    ],
});
