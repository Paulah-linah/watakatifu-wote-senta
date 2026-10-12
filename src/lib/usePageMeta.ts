import { useEffect } from 'react';

const SITE = 'Watakatifu Wote Senta';
const DEFAULT_DESCRIPTION =
  'Watakatifu Wote Senta (All Saints Conference Centre) is a Catholic conference, retreat and hospitality centre on Kahara Road, Ngong, Kenya, under the Catholic Diocese of Ngong.';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Per-route document title, description, canonical URL and robots tag. */
export function usePageMeta({ title, description, noindex }: { title?: string; description?: string; noindex?: boolean }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | All Saints Conference Centre, Ngong, Kenya`;
    const desc = description ?? DEFAULT_DESCRIPTION;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.origin + window.location.pathname);
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
  }, [title, description, noindex]);
}
