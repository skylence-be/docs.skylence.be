// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightClientMermaid from '@pasqal-io/starlight-client-mermaid';

export default defineConfig({
    site: 'https://docs.skylence.be',
    integrations: [
        starlight({
            favicon: '/favicon.svg',
            plugins: [starlightLinksValidator(), starlightClientMermaid()],
            customCss: ['./src/styles/sky-colors.css'],
            head: [
                {
                    tag: 'script',
                    content: `if(!localStorage.getItem('starlight-theme-init')){localStorage.setItem('starlight-theme-init','1');localStorage.setItem('starlight-theme','dark');document.documentElement.dataset.theme='dark';}`,
                },
            ],
            editLink: { baseUrl: 'https://github.com/skylence-be/skylence/edit/main/docs/' },
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
                    label: 'The .sky Codex',
                    autogenerate: { directory: 'codex' },
                },
                {
                    label: 'Getting Started',
                    items: [
                        { slug: 'installation' },
                        { slug: 'getting-started' },
                        { slug: 'faq' },
                    ],
                },
                {
                    label: 'Examples',
                    translations: { nl: 'Voorbeelden' },
                    autogenerate: { directory: 'examples' },
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
                {
                    label: 'Troubleshooting',
                    translations: { nl: 'Probleemoplossing' },
                    autogenerate: { directory: 'troubleshooting' },
                },
                {
                    label: 'Error Codes',
                    translations: { nl: 'Foutcodes' },
                    autogenerate: { directory: 'error-codes' },
                },
            ],
        }),
    ],
});
