import React, { useEffect, useState } from "react";
import { Empty, Spin } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import { localizedField } from "../../utils/localized";
import MediaDisplay from "../../Components/MediaDisplay";
import "./style.css";

const emptyResults = { products: { data: [], total: 0 }, news: { data: [], total: 0 }, categories: { data: [], total: 0 }, brands: { data: [], total: 0 }, promotions: { data: [], total: 0 }, coupons: { data: [], total: 0 } };
const imageOf = (item) => item?.thumbnail || item?.images?.[0] || item?.video || item?.coverImage || item?.image || item?.logo || "";

function ResultSection({ title, total, children, moreLink, moreLabel }) {
  if (!total) return null;
  return <section className="global-search-section">
    <div className="global-search-section-heading"><h2>{title}</h2><span>{total}</span>{moreLink && <Link to={moreLink}>{moreLabel} ↗</Link>}</div>
    {children}
  </section>;
}

export default function GlobalSearchPage() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const [state, setState] = useState({ results: emptyResults, loading: false, error: "" });

  useEffect(() => {
    let active = true;
    if (!query) {
      setState({ results: emptyResults, loading: false, error: "" });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: "" }));
    request.get("/search", { params: { q: query } })
      .then((response) => {
        const result = response?.data?.data ?? response?.data ?? emptyResults;
        if (active) setState({ results: { ...emptyResults, ...result }, loading: false, error: "" });
      })
      .catch((error) => {
        if (active) setState({ results: emptyResults, loading: false, error: error.response?.data?.message || t("globalSearchError") });
      });
    return () => { active = false; };
  }, [query, t]);

  const { products, news, categories, brands, promotions, coupons } = state.results;
  const total = products.total + news.total + categories.total + brands.total + promotions.total + coupons.total;
  const encodedQuery = encodeURIComponent(query);

  return <main className="global-search-page">
    <header className="global-search-heading">
      <span>{t("headerSearchLabel")}</span>
      <h1>{t("globalSearchTitle")}</h1>
      {query ? <p>{t("globalSearchFor", { query })}</p> : <p>{t("globalSearchStart")}</p>}
    </header>
    {state.loading ? <div className="global-search-loading"><Spin size="large" /></div> : state.error ? <div className="global-search-message" role="alert">{state.error}</div> : !query ? null : !total ? <Empty description={t("globalSearchNoResults")} /> : <>
      <p className="global-search-total">{t("globalSearchTotal", { count: total })}</p>
      <ResultSection title={t("globalSearchProducts")} total={products.total} moreLink={`/products?search=${encodedQuery}`} moreLabel={t("globalSearchViewMore")}>
        <div className="global-search-grid">
          {products.data.map((item) => <Link className="global-search-card" key={item._id} to={`/products/${item._id}`}>
            <MediaDisplay className="global-search-card-media" src={imageOf(item)} alt={localizedField(item, "name", i18n.resolvedLanguage)} />
            <div><h3>{localizedField(item, "name", i18n.resolvedLanguage)}</h3><p>{localizedField(item, "shortDescription", i18n.resolvedLanguage) || localizedField(item.category, "name", i18n.resolvedLanguage)}</p></div>
          </Link>)}
        </div>
      </ResultSection>
      <ResultSection title={t("globalSearchNews")} total={news.total} moreLink={`/news?search=${encodedQuery}`} moreLabel={t("globalSearchViewMore")}>
        <div className="global-search-grid">
          {news.data.map((item) => <Link className="global-search-card" key={item._id} to={`/news/${item.slug}`}>
            <MediaDisplay className="global-search-card-media" src={imageOf(item)} alt={localizedField(item, "title", i18n.resolvedLanguage)} />
            <div><h3>{localizedField(item, "title", i18n.resolvedLanguage)}</h3><p>{localizedField(item, "excerpt", i18n.resolvedLanguage)}</p></div>
          </Link>)}
        </div>
      </ResultSection>
      <ResultSection title={t("globalSearchCategories")} total={categories.total}>
        <div className="global-search-chip-list">{categories.data.map((item) => <Link className="global-search-chip" key={item._id} to={`/products?category=${item._id}`}><MediaDisplay src={imageOf(item)} alt="" /><span>{localizedField(item, "name", i18n.resolvedLanguage)}</span></Link>)}</div>
      </ResultSection>
      <ResultSection title={t("globalSearchBrands")} total={brands.total}>
        <div className="global-search-chip-list">{brands.data.map((item) => <Link className="global-search-chip" key={item._id} to={`/products?brand=${item._id}`}><MediaDisplay src={imageOf(item)} alt="" /><span>{localizedField(item, "name", i18n.resolvedLanguage)}</span></Link>)}</div>
      </ResultSection>
      <ResultSection title={t("globalSearchPromotions")} total={promotions.total} moreLink="/promotions" moreLabel={t("globalSearchViewMore")}>
        <div className="global-search-chip-list">{promotions.data.map((item) => <Link className="global-search-chip" key={item.id} to="/promotions"><span className="global-search-offer-icon">%</span><span>{localizedField(item, "name", i18n.resolvedLanguage)}</span></Link>)}</div>
      </ResultSection>
      <ResultSection title={t("globalSearchCoupons")} total={coupons.total} moreLink="/promotions" moreLabel={t("globalSearchViewMore")}>
        <div className="global-search-chip-list">{coupons.data.map((item) => <Link className="global-search-chip" key={item._id} to="/promotions"><span className="global-search-offer-code">{item.code}</span><span>{localizedField(item, "name", i18n.resolvedLanguage)}</span></Link>)}</div>
      </ResultSection>
    </>}
  </main>;
}
