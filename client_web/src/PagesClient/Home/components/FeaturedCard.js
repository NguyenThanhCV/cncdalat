import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../../utils/localized";
import MediaDisplay from "../../../Components/MediaDisplay";

const money = (value) => Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
const imageOf = (product) => product?.thumbnail || product?.images?.[0] || product?.video || "";

export default function FeaturedCard({ product }) {
  const { t, i18n } = useTranslation();
  const image = imageOf(product);
  const name = localizedField(product, "name", i18n.resolvedLanguage);
  const brandName = localizedField(product?.brand, "name", i18n.resolvedLanguage);
  const categoryName = localizedField(product?.category, "name", i18n.resolvedLanguage);
  return (
    <article className="home-product-card">
      <Link className="home-product-image" to={`/products/${product._id}`}>
        {image ? <MediaDisplay src={image} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>{String(name || t("productPageTitle")).slice(0, 2).toUpperCase()}</span>}
        {product.isNew && <b className="home-product-badge">{t("newProduct")}</b>}
        {product.isBestSeller && <b className="home-product-badge bestseller">{t("bestSellerTag")}</b>}
      </Link>
      <div className="home-product-copy">
        <small>{brandName || categoryName || t("storeName")}</small>
        <Link to={`/products/${product._id}`}><h3>{name}</h3></Link>
        <div className="home-product-meta"><span>★ {Number(product.ratingAverage || 0).toFixed(1)}</span><span>{Number(product.ratingCount || 0)} {t("reviews")}</span></div>
        <div className="home-product-price">
          {product.minPrice != null ? <strong>{product.minPrice === product.maxPrice ? money(product.minPrice) : `${money(product.minPrice)} – ${money(product.maxPrice)}`}</strong> : <strong>{t("noPriceShort")}</strong>}
          <Link to={`/products/${product._id}`} aria-label={`${t("viewProduct")} ${name}`}>{t("viewProduct")} →</Link>
        </div>
      </div>
    </article>
  );
}
