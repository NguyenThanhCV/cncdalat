import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../utils/localized";
import * as api from "../../api/shop";
import "./style.css";

const payload = (result) => result?.data?.data ?? result?.data ?? result ?? [];
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
const dates = (start, end, t, locale) =>
  `${start ? new Date(start).toLocaleDateString(locale) : t("offerActive")} – ${end ? new Date(end).toLocaleDateString(locale) : t("offersWithoutEnd")}`;
const discountText = (item) =>
  item.type === "percent" || item.type === "percentage"
    ? `Giảm ${item.value}%${item.maxDiscount ? `, tối đa ${money(item.maxDiscount)}` : ""}`
    : `Giảm ${money(item.value)}`;
export default function PromotionsPage() {
  const { t, i18n } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    Promise.allSettled([api.getPromotions(), api.getAvailableCoupons()])
      .then(([campaignResult, couponResult]) => {
        const failed = [];
        if (campaignResult.status === "fulfilled")
          setCampaigns(payload(campaignResult.value));
        else failed.push(campaignResult.reason);
        if (couponResult.status === "fulfilled")
          setCoupons(payload(couponResult.value));
        else failed.push(couponResult.reason);
        if (failed.length) {
          const staleRoute = failed.some((error) =>
            [401, 404].includes(error?.response?.status),
          );
          setLoadError(
            staleRoute
              ? "Backend chưa nhận API ưu đãi mới. Hãy khởi động lại server_web rồi tải lại trang."
              : failed[0]?.response?.data?.message ||
                  "Chưa kết nối được tới dịch vụ ưu đãi. Vui lòng thử tải lại trang.",
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };
  const locale = (i18n.resolvedLanguage || "vi").startsWith("en")
    ? "en-US"
    : "vi-VN";
  return (
    <main className="offers-page">
      <header className="offers-hero">
        <span>{t("promotionsHero")}</span>
        <h1>{t("promotionsTitle")}</h1>
        <p>{t("promotionsIntro")}</p>
      </header>
      {loadError && (
        <div className="offers-error" role="status">
          {loadError}
        </div>
      )}
      <section className="offers-section">
        <div className="offers-heading">
          <div>
            <span>DEALS</span>
            <h2>{t("currentOffers")}</h2>
          </div>
          <Link to="/products">{t("exploreProductsLink")}</Link>
        </div>
        {loading ? (
          <p className="offers-empty">{t("loadingOffers")}</p>
        ) : campaigns.length ? (
          <div className="offers-campaigns">
            {campaigns.map((item) => (
              <article className="offer-campaign" key={item.id || item._id}>
                <div className="offer-percent">
                  {item.type === "percent"
                    ? `${item.value}%`
                    : money(item.value)}
                  <small>{t("discount")}</small>
                </div>
                <div>
                  <h3>{localizedField(item, "name", i18n.resolvedLanguage)}</h3>
                  <p>
                    {t("offerDiscountDirect")}{" "}
                    {item.scope === "product"
                      ? t("offerSelectedProducts")
                      : item.scope === "category"
                        ? t("offerSelectedCategories")
                        : t("offerSelectedBrands")}
                    ; {t("offerAutomaticallyApplied")}
                  </p>
                  <small>
                    {dates(item.startDate, item.endDate, t, locale)}
                  </small>
                </div>
                <Link
                  to={`/products?deal=${encodeURIComponent(item.id || item._id)}`}>
                  {t("viewSaleProducts")}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="offers-empty">{t("noCurrentOffers")}</p>
        )}
      </section>
      <section className="offers-section">
        <div className="offers-heading">
          <div>
            <span>COUPON</span>
            <h2>{t("coupons")}</h2>
          </div>
          <p>{t("useCodeAtCheckout")}</p>
        </div>
        {loading ? (
          <p className="offers-empty">{t("loadingCoupons")}</p>
        ) : coupons.length ? (
          <div className="coupon-grid">
            {coupons.map((item) => (
              <article className="coupon-card" key={item._id || item.code}>
                <div className="coupon-ticket">
                  <b>{item.code}</b>
                  <span>{discountText(item)}</span>
                </div>
                <div className="coupon-info">
                  <h3>{localizedField(item, "name", i18n.resolvedLanguage)}</h3>
                  <p>
                    {t("minimumOrder")} {money(item.minOrderValue)}
                    {item.endDate
                      ? ` · ${t("couponExpiry")} ${new Date(item.endDate).toLocaleDateString(locale)}`
                      : ""}
                  </p>
                  <button onClick={() => copy(item.code)}>
                    {copied === item.code ? t("copiedCode") : t("copyCode")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="offers-empty">{t("noCoupons")}</p>
        )}
      </section>
      <div className="offers-footer">
        <b>{t("offerRecheckedAtCheckout")}</b>
        <Link className="primary-button" to="/products">
          {t("continueShopping")}
        </Link>
      </div>
    </main>
  );
}
