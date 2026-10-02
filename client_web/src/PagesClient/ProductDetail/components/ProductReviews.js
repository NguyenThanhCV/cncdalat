import React from "react";
import { useTranslation } from "react-i18next";
import MediaDisplay from "../../../Components/MediaDisplay";

export default function ProductReviews({
  reviews, total, loading, error, form, saving, onSubmit, onChange,
}) {
  const { t, i18n } = useTranslation();
  return (
    <section className="product-detail-section product-review-section">
      <div className="product-review-heading"><div><span className="product-section-kicker">{t("shareExperience")}</span><h2>{t("customerReviews")}</h2></div><span>{total} {t("reviews")}</span></div>
      <form className="product-review-form" onSubmit={onSubmit}>
        <label>{t("yourReview")}</label>
        <div className="product-review-stars" role="radiogroup" aria-label={t("rating")}>
          {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} sao`} aria-pressed={form.rating === rating} className={rating <= form.rating ? "active" : ""} onClick={() => onChange({ ...form, rating })}>★</button>)}
        </div>
        <input maxLength={120} value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} placeholder={t("shortTitleOptional")} />
        <textarea required minLength={5} maxLength={2000} value={form.content} onChange={(event) => onChange({ ...form, content: event.target.value })} placeholder={t("reviewPlaceholder")} />
        {error && <p className="product-review-error">{error}</p>}
        <button type="submit" disabled={saving}>{saving ? t("sendingReview") : t("submitReview")}</button>
      </form>
      <div className="product-review-list">
        {loading ? <p>{t("loadingReviews")}</p> : reviews.length ? reviews.map((review) => <article className="product-review-card" key={review._id}><div className="product-review-card-head"><strong>{review.user?.name || t("customer")}</strong><span>{"★".repeat(Number(review.rating || 0))}{"☆".repeat(5 - Number(review.rating || 0))}</span><time>{review.createdAt ? new Date(review.createdAt).toLocaleDateString(i18n.resolvedLanguage === "en" ? "en-US" : "vi-VN") : ""}</time></div>{review.title && <h3>{review.title}</h3>}<p>{review.content}</p>{[...(review.images||[]),...(review.videos||[])].length>0&&<div className="product-review-media">{[...(review.images||[]),...(review.videos||[])].map((src,index)=><MediaDisplay key={`${review._id}-${index}`} src={src} alt={review.title||t("customerReviews")} className="product-review-media-item"/>)}</div>}{review.verifiedPurchase && <small>✓ {t("verifiedPurchase")}</small>}</article>) : <div className="product-review-empty">{error || t("firstReviewPrompt")}</div>}
      </div>
    </section>
  );
}
