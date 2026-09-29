export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://www.dashijay.dev/sitemap.xml',
  };
}
