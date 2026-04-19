import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export function getStaticPaths() {
  return [
    { params: { lang: 'en' } },
    { params: { lang: 'nl' } },
  ];
}

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as string;
  const docs = await getCollection('docs');

  const isNl = (id: string) => /^nl(\/|$)/.test(id);

  const entries = docs
    .filter(entry =>
      lang === 'en' ? !isNl(entry.id) : isNl(entry.id)
    )
    .map(entry => {
      const slug = entry.id.replace(/^[a-z]{2}(\/|$)/, '') || 'index';
      return {
        slug,
        title: entry.data.title,
        description: entry.data.description ?? null,
        unlisted: entry.data.unlisted ?? false,
        icon: entry.data.icon ?? null,
        url: entry.data.link ?? `${lang === 'nl' ? '/nl' : ''}/${slug}/`,
        lang,
      };
    });

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
