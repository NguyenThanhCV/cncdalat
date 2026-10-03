import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import request from "../../utils/request";
import { useSeo } from "../../Components/SEO";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../utils/localized";
import useSiteMedia from "../../hooks/useSiteMedia";
import { siteConfig } from "../../config/site";
import MediaDisplay from "../../Components/MediaDisplay";
import "./style.css";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const dateLabel = (date, locale) => date ? new Date(date).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" }) : "";
const imageOf = (article) => article.coverImage || "";

function NewsCard({ article, featured = false }) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || "vi").startsWith("en") ? "en-US" : "vi-VN";
  const title = localizedField(article, "title", i18n.resolvedLanguage);
  const excerpt = localizedField(article, "excerpt", i18n.resolvedLanguage);
  return <article className={`news-card${featured ? " news-card-featured" : ""}`}>
    <Link to={`/news/${article.slug}`} className="news-card-image"><MediaDisplay src={imageOf(article)} alt={title} /><span>{localizedField(article.category, "name", i18n.resolvedLanguage) || t("newsCategoryGrowers")}</span></Link>
    <div className="news-card-body"><p className="news-meta">{dateLabel(article.publishedAt, locale)} <i>·</i> {article.readingMinutes || 3} {t("minutesRead")}</p><h2><Link to={`/news/${article.slug}`}>{title}</Link></h2><p>{excerpt}</p><Link className="news-read-link" to={`/news/${article.slug}`}>{t("readArticle")} <span>→</span></Link></div>
  </article>;
}

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const heroMedia = useSiteMedia("news-hero");
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const [search, setSearch] = useState(params.get("search") || "");
  const [state, setState] = useState({ articles: [], categories: [], loading: true, error: "" });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const query = new URLSearchParams({ limit: "24" });
      if (category) query.set("category", category);
      if (params.get("search")) query.set("search", params.get("search"));
      const [articleResponse, categoryResponse] = await Promise.all([request.get(`/news?${query}`), request.get("/news/categories")]);
      setState({ articles: unwrap(articleResponse) || [], categories: unwrap(categoryResponse) || [], loading: false, error: "" });
    } catch (error) { setState((current) => ({ ...current, loading: false, error: error.response?.data?.message || t("newsLoadFailed") })); }
  }, [category, params, t]);
  useEffect(() => { load(); }, [load]);
  const submit = (event) => { event.preventDefault(); const next = new URLSearchParams(params); search.trim() ? next.set("search", search.trim()) : next.delete("search"); setParams(next); };
  const featured = !category && !params.get("search") ? state.articles[0] : null;
  return <main className="news-page">
    <header className="news-hero"><div className="news-hero-copy"><span className="news-eyebrow">{t("newsHeroEyebrow")}</span><h1>{t("newsHeroTitle")}<br /><em>{t("newsHeroTitleEmphasis")}</em></h1><p>{t("newsHeroDescription")}</p><a href="#news-list" className="news-hero-cta">{t("newsExploreArticles")} <span>↓</span></a></div><div className="news-hero-art">{heroMedia?.mediaUrl && <MediaDisplay src={heroMedia.mediaUrl} mediaType={heroMedia.mediaType} alt={heroMedia.altText || t("newsHeroTitle")} className="news-hero-image" />}<span className="news-art-note">{t("newsSowingNote")}<br />{t("newsHarvestNote")}</span></div></header>
    <section id="news-list" className="news-content"><div className="news-heading"><div><span className="news-eyebrow">{t("newsUpdates")}</span><h2>{t("newsPageTitle")}</h2><p>{t("newsPageDescription")}</p></div><form className="news-search" onSubmit={submit}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("newsSearchPlaceholder")} aria-label={t("newsSearchPlaceholder")} /><button type="submit" aria-label={t("search")}>⌕</button></form></div>
      <nav className="news-categories" aria-label={t("categoryCount")}><Link className={!category ? "active" : ""} to="/news">{t("all")}</Link>{state.categories.map((item) => <Link key={item._id} className={category === item.slug ? "active" : ""} to={`/news?category=${encodeURIComponent(item.slug)}`}>{localizedField(item, "name", i18n.resolvedLanguage)}</Link>)}</nav>
      {state.error ? <div className="news-state"><h3>{t("newsLoadFailed")}</h3><p>{state.error}</p><button onClick={load}>{t("retry")}</button></div> : state.loading ? <div className="news-state">{t("loadingOffers")}</div> : !state.articles.length ? <div className="news-state"><h3>{t("noMatchingArticles")}</h3><p>{t("tryDifferentNewsSearch")}</p><Link to="/news">{t("viewAllArticles")}</Link></div> : <>{featured && <NewsCard article={featured} featured />}<div className="news-grid">{state.articles.filter((article) => article._id !== featured?._id).map((article) => <NewsCard key={article._id} article={article} />)}</div></>}
    </section>
    <section className="news-bottom-cta"><div><span className="news-eyebrow">{t("newsBottomEyebrow")}</span><h2>{t("newsBottomTitle")}<br />{t("newsBottomTitleSecond")}</h2><p>{t("newsBottomText")}</p></div><Link to="/contact">{t("contactForAdvice")} <span>→</span></Link></section>
  </main>;
}

export function NewsDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [state, setState] = useState({ article: null, loading: true, error: "" });
  useEffect(() => { let active = true; request.get(`/news/${slug}`).then((response) => { if (active) setState({ article: unwrap(response), loading: false, error: "" }); }).catch((error) => { if (active) setState({ article: null, loading: false, error: error.response?.data?.message || t("articleNotFound") }); }); return () => { active = false; }; }, [slug, t]);
  const article = state.article;
  const locale = (i18n.resolvedLanguage || "vi").startsWith("en") ? "en-US" : "vi-VN";
  const articleTitle = localizedField(article, "title", i18n.resolvedLanguage);
  const articleExcerpt = localizedField(article, "excerpt", i18n.resolvedLanguage);
  const articleContent = localizedField(article, "content", i18n.resolvedLanguage);
  const articleCategory = localizedField(article?.category, "name", i18n.resolvedLanguage);
  const articleSchema = article?.title ? {
    "@context": siteConfig.schemaContext,
    "@type": "NewsArticle",
    headline: articleTitle,
    description: articleExcerpt || articleTitle,
    image: [imageOf(article)],
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || article.publishedAt || undefined,
    author: { "@type": "Organization", name: article.author?.name || "Nhà kính công nghệ cao Đà Lạt" },
    publisher: { "@type": "Organization", name: "Nhà kính công nghệ cao Đà Lạt" },
  } : undefined;
  useSeo({
    title: articleTitle ? `${articleTitle} | ${t("news")}` : undefined,
    description: articleExcerpt || undefined,
    image: article ? imageOf(article) : undefined,
    type: "article",
    schema: articleSchema,
  });
  if (state.loading) return <main className="news-detail-state">{t("loadingArticle")}</main>;
  if (state.error || !state.article) return <main className="news-detail-state"><h1>{t("articleNotFound")}</h1><p>{state.error}</p><Link to="/news">{t("backToNews")}</Link></main>;
  return <main className="news-article-page"><div className="news-breadcrumb"><Link to="/">{t("home")}</Link><span>/</span><Link to="/news">{t("news")}</Link><span>/</span><span>{articleCategory}</span></div><header className="news-article-header"><span className="news-eyebrow">{articleCategory || t("growerCorner")}</span><h1>{articleTitle}</h1><p>{articleExcerpt}</p><div className="news-meta">{dateLabel(article.publishedAt, locale)} <i>·</i> {article.author?.name || t("storeName")} <i>·</i> {article.readingMinutes || 3} {t("minutesRead")}</div></header><MediaDisplay className="news-article-cover" src={imageOf(article)} alt={articleTitle} /><article className="news-article-content">{String(articleContent || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{article.tags?.length > 0 && <div className="news-tags">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}</article><div className="news-back-link"><Link to="/news">{t("viewAllArticles")}</Link><Link to="/contact">{t("needAdviceContact")}</Link></div></main>;
}
