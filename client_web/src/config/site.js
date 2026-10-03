const env = process.env;

export const siteConfig = Object.freeze({
  apiUrl: env.REACT_APP_API_URL || "",
  siteUrl: env.REACT_APP_SITE_URL || "",
  storeName: env.REACT_APP_STORE_NAME || "",
  storePhone: env.REACT_APP_STORE_PHONE || "",
  storeEmail: env.REACT_APP_STORE_EMAIL || "",
  mapUrl: env.REACT_APP_MAP_URL || "",
  facebookUrl: env.REACT_APP_FACEBOOK_URL || "",
  tiktokUrl: env.REACT_APP_TIKTOK_URL || "",
  schemaContext: env.REACT_APP_SCHEMA_CONTEXT || "",
  youtubeEmbedBaseUrl: env.REACT_APP_YOUTUBE_EMBED_BASE_URL || "",
  vimeoEmbedBaseUrl: env.REACT_APP_VIMEO_EMBED_BASE_URL || "",
  sitemapSchemaUrl: env.REACT_APP_SITEMAP_SCHEMA_URL || "",
});
