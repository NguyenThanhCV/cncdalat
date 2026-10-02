import React from "react";
import { Link } from "react-router-dom";
import { ApiOutlined, AppstoreOutlined, BulbOutlined, EnvironmentOutlined, ExperimentOutlined, SafetyCertificateOutlined, ShoppingOutlined, TagsOutlined, ToolOutlined } from "@ant-design/icons";
import request from "../../../utils/request";
import FeaturedCard from "./FeaturedCard";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../../utils/localized";
import MediaDisplay from "../../../Components/MediaDisplay";
import useSiteMedia from "../../../hooks/useSiteMedia";

export function HomeHero() {
  const { t } = useTranslation();
  const heroMedia = useSiteMedia("storefront-hero");
  return <>
    <section className="field-hero">
      {heroMedia?.mediaUrl && <div className="field-hero-media"><MediaDisplay src={heroMedia.mediaUrl} mediaType={heroMedia.mediaType} alt={heroMedia.altText || t("homeHeroEyebrow")} /></div>}
      <div className="field-hero-shade" />
      <div className="field-hero-content">
        <span className="field-eyebrow"><i /> {t("homeHeroEyebrow")}</span>
        <h1>{t("homeHeroTitleA")}<br /><em>{t("homeHeroTitleB")}</em><br />{t("homeHeroTitleC")}</h1>
        <p>{t("homeHeroText")}</p>
        <div className="field-hero-actions"><Link to="/products" className="field-button">{t("homeExplore")} <span>↗</span></Link><a href={process.env.REACT_APP_MAP_URL || "#"} target="_blank" rel="noreferrer" className="field-location"><EnvironmentOutlined /> {t("homeLocation")}</a></div>
      </div>
      <div className="field-hero-index"><b>01</b><span>{t("homeSelected")}</span></div>
      <div className="field-hero-caption">{t("homeHeroCaption")}</div>
    </section>
    <div className="field-manifesto"><span>{t("homeManifestoBrand")}</span><p>{t("homeManifestoTitle")}<br /><b>{t("homeManifestoEmphasis")}</b></p><small>{t("homeManifestoTopics")}</small></div>
  </>;
}

export function HomeBenefits() {
  const { t } = useTranslation();
  return <section className="home-benefits" aria-label={t("homeBenefitsLabel")}>
    <article><span><TagsOutlined /></span><div><b>{t("homeBenefitPrice")}</b><small>{t("homeBenefitPriceText")}</small></div></article>
    <article><span><ShoppingOutlined /></span><div><b>{t("homeBenefitChoose")}</b><small>{t("homeBenefitChooseText")}</small></div></article>
    <article><span><SafetyCertificateOutlined /></span><div><b>{t("homeBenefitOrders")}</b><small>{t("homeBenefitOrdersText")}</small></div></article>
  </section>;
}

export function CategorySection({ categories, loading }) {
  const { t, i18n } = useTranslation();
  return <section className="home-section home-categories-section"><div className="home-section-heading category-editorial-heading"><div className="category-editorial-copy"><span className="home-kicker"><i>01</i> {t("homeCategoryEyebrow")}</span><h2>{t("homeCategoryTitle")}<br /><em>{t("homeCategoryTitleEmphasis")}</em></h2><p>{t("homeCategoryText")}</p></div><Link to="/categories">{t("homeExploreCategories")} <span>↗</span></Link></div>
    {categories.length ? <div className="home-category-grid">{categories.slice(0, 6).map((category, index) => { const image = category.homeImage || category.image; const name = localizedField(category, "name", i18n.resolvedLanguage); const description = localizedField(category, "description", i18n.resolvedLanguage); return <Link className={`home-category-tile category-tone-${index % 6}`} key={category._id} to={`/products?category=${category._id}`}><span className="home-category-icon"><span className="home-category-icon-fallback"><CategoryIcon name={name} /></span>{image && <MediaDisplay src={image} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span><span className="home-category-content"><b>{name}</b><small>{description || t("homeCategoryFallback")}</small><span className="home-category-action">{t("homeViewProducts")} <span>↗</span></span></span></Link>; })}</div> : <div className="home-inline-state">{loading ? t("homeLoadingCategories") : t("homeCategoriesEmpty")}</div>}
  </section>;
}

function CategoryIcon({ name }) {
  const label = String(name || "").toLocaleLowerCase("vi");
  if (/tưới|ống|béc|phun|nước/.test(label)) return <ApiOutlined />;
  if (/dinh dưỡng|phân|thuốc|hạt|giống|giá thể/.test(label)) return <ExperimentOutlined />;
  if (/đèn|chiếu sáng|nhiệt/.test(label)) return <BulbOutlined />;
  if (/dụng cụ|thiết bị|máy|phụ kiện/.test(label)) return <ToolOutlined />;
  return <AppstoreOutlined />;
}

export function FeaturedSection({ products, loading, error }) {
  const { t } = useTranslation();
  return <section className="home-section home-featured-section"><div className="home-section-heading"><div><span className="home-kicker">{t("homeFeaturedEyebrow")}</span><h2>{t("homeFeaturedTitle")}<br />{t("homeFeaturedTitleEmphasis")}</h2></div><Link to="/products">{t("homeViewStore")} <span>↗</span></Link></div>
    {error && <div className="home-inline-state home-error">{error}</div>}
    {loading ? <div className="home-product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="home-product-skeleton" key={index}><div /><span /><span /></div>)}</div> : products.length ? <div className="home-product-grid">{products.slice(0, 4).map((product) => <FeaturedCard key={product._id} product={product} />)}</div> : !error && <div className="home-inline-state">{t("homeFeaturedEmpty")}</div>}
  </section>;
}

export function BrandSection({ brands }) {
  const { t, i18n } = useTranslation();
  return <section className="home-brand-section"><div className="home-brand-heading"><span className="home-kicker">{t("homeBrandEyebrow")}</span><h2>{t("homeBrandTitle")}</h2><p>{t("homeBrandText")}</p></div>{brands.length ? <div className="home-brand-list">{brands.slice(0, 6).map((brand) => { const image = brand.logo || brand.image || brand.homeImage; const name = localizedField(brand, "name", i18n.resolvedLanguage); return <Link to={`/products?brand=${brand._id}`} key={brand._id}><span className="home-brand-initial" aria-hidden="true">{String(name || "N").slice(0, 1).toUpperCase()}</span>{image && <MediaDisplay src={image} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} />}<b>{name}</b><span className="home-brand-arrow" aria-hidden="true">↗</span></Link>; })}</div> : <Link className="home-brand-empty" to="/brands">{t("homeViewBrands")} →</Link>}</section>;
}

export function AccountCallout() {
  const { t } = useTranslation();
  return <section className="home-bottom-cta"><div><span className="home-kicker">{t("homeBottomEyebrow")}</span><h2>{t("homeBottomTitle")}</h2><p>{t("homeBottomText")}</p></div><Link to="/news">{t("homeReadStories")} <span>↗</span></Link></section>;
}

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
export function HomeNews() {
  const { t, i18n } = useTranslation();
  const [state, setState] = React.useState({ articles: [], loading: true });
  React.useEffect(() => {
    let active = true;
    request.get("/news?limit=3").then((response) => {
      if (active) setState({ articles: (unwrap(response) || []).slice(0, 3), loading: false });
    }).catch(() => { if (active) setState({ articles: [], loading: false }); });
    return () => { active = false; };
  }, []);
  if (!state.loading && !state.articles.length) return null;
  const locale = (i18n.resolvedLanguage || "vi").startsWith("en") ? "en-US" : "vi-VN";
  return <section className="home-section home-news-section">
    <div className="home-section-heading"><div><span className="home-kicker">{t("homeNewsEyebrow")}</span><h2>{t("homeNewsTitle")}</h2><p>{t("homeNewsText")}</p></div><Link to="/news">{t("homeAllNews")} <span>→</span></Link></div>
    {state.loading ? <div className="home-news-grid" aria-label={t("loadingOffers")}><div /><div /><div /></div> : <div className="home-news-grid">{state.articles.map((article) => <article className="home-news-card" key={article._id}><Link className="home-news-image" to={`/news/${article.slug}`}>{article.coverImage ? <MediaDisplay src={article.coverImage} alt="" /> : <span><EnvironmentOutlined /></span>}</Link><div className="home-news-copy"><small>{localizedField(article.category, "name", i18n.resolvedLanguage) || t("homeGardenCorner")} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale) : t("latestNews")}</small><h3><Link to={`/news/${article.slug}`}>{localizedField(article, "title", i18n.resolvedLanguage)}</Link></h3><p>{localizedField(article, "excerpt", i18n.resolvedLanguage)}</p><Link className="home-news-link" to={`/news/${article.slug}`}>{t("homeReadArticle")} <span>→</span></Link></div></article>)}</div>}
  </section>;
}

