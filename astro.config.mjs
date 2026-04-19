// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
    site: 'https://docs.skylence.be',
    integrations: [
        starlight({
            favicon: '/favicon.svg',
            plugins: [starlightLinksValidator()],
            title: 'Skylence',
            description: 'Claude Code Harness — documentation',
            logo: {
                src: './src/assets/logo.svg',
            },
            defaultLocale: 'root',
            locales: {
                root: { label: 'English', lang: 'en' },
                nl: { label: 'Nederlands' },
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/skylence-be/skylence' },
            ],
            sidebar: [
                {
                    label: 'Introduction',
                    translations: { nl: 'Introductie' },
                    slug: 'index',
                },
                {
                    label: 'Download',
                    translations: { nl: 'Download' },
                    slug: 'download',
                },
                {
                    label: 'Getting Started',
                    translations: { nl: 'Aan de slag' },
                    slug: 'getting-started',
                },
                {
                    label: 'FAQ',
                    translations: { nl: 'Veelgestelde vragen' },
                    slug: 'faq',
                },
                {
                    label: 'Workflow Format',
                    translations: { nl: 'Workflow-formaat' },
                    autogenerate: { directory: 'workflow-format' },
                },
                {
                    label: 'CLI Reference',
                    translations: { nl: 'CLI-referentie' },
                    autogenerate: { directory: 'cli' },
                },
                {
                    label: 'Configuration',
                    translations: { nl: 'Configuratie' },
                    autogenerate: { directory: 'configuration' },
                },
                {
                    label: 'Architecture',
                    translations: { nl: 'Architectuur' },
                    autogenerate: { directory: 'architecture' },
                },
            ],
        }),
    ],
});
