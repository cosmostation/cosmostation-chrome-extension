export async function getSiteIconURL(siteOrigin: string) {
  try {
    const response = await fetch(siteOrigin);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const iconLinkElement = doc.querySelector("link[rel='icon']") ?? doc.querySelector("link[rel='shortcut icon']");

    if (iconLinkElement) {
      const faviconURL = new URL(iconLinkElement.getAttribute('href')!, siteOrigin);
      return faviconURL.toString();
    }

    return `${new URL(siteOrigin).origin}/favicon.ico`;
  } catch {
    return '';
  }
}

export function getSiteTitle(url?: string) {
  const websiteTitle = url?.split('//')?.at(-1)?.split('.')?.at(-2);

  return websiteTitle;
}
