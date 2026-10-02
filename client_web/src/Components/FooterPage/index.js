import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  RightOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import "./index.css";
import MediaDisplay from "../MediaDisplay";
import useSiteMedia from "../../hooks/useSiteMedia";

const STORE = {
  phone: process.env.REACT_APP_STORE_PHONE || "0888004044",
  phoneLink: `tel:${(process.env.REACT_APP_STORE_PHONE || "0888004044").replaceAll(" ", "")}`,
  email: process.env.REACT_APP_STORE_EMAIL || "congtynhakinhcongnghecaodalat@gmail.com",
  mapUrl: process.env.REACT_APP_MAP_URL || "",
  facebookUrl: process.env.REACT_APP_FACEBOOK_URL || "",
  tiktokUrl: process.env.REACT_APP_TIKTOK_URL || "",
};

const FooterLink = ({ to, children }) => (
  <li><Link to={to}><RightOutlined />{children}</Link></li>
);

export default function FooterPage() {
  const { t } = useTranslation();
  const storeName = t("storeName");
  const storeLogo = useSiteMedia("store-logo");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer-page">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            <section className="footer-column footer-company" aria-label={t("footerStoreInfo")}>
              <Link to="/" className="footer-logo" aria-label={`${storeName} - ${t("home")}`}>
                {storeLogo?.mediaUrl && <MediaDisplay className="footer-logo-image" src={storeLogo.mediaUrl} mediaType={storeLogo.mediaType} alt={storeLogo.altText || `${t("logoOf")} ${storeName}`} />}
                <span className="footer-logo-text"><strong>NHÀ KÍNH ĐÀ LẠT</strong><span>{t("footerBrandSubtitle")}</span></span>
              </Link>
              <p className="footer-description">{t("footerDescription")}</p>
              <address className="footer-contact-list">
                <a href={STORE.phoneLink}><span className="footer-contact-icon"><PhoneOutlined /></span><span><small>{t("footerHotline")}</small><strong>{STORE.phone}</strong></span></a>
                <a href={`mailto:${STORE.email}`}><span className="footer-contact-icon"><MailOutlined /></span><span><small>Email</small><strong>{STORE.email}</strong></span></a>
                <a href={STORE.mapUrl} target="_blank" rel="noreferrer" className="footer-contact-item"><span className="footer-contact-icon"><EnvironmentOutlined /></span><span><small>{t("footerCompanyAddress")}</small><strong>{t("footerViewLocation")}</strong></span></a>
              </address>
            </section>

            <nav className="footer-column" aria-label={t("footerExploreStore")}>
              <h2>{t("footerExploreStore")}</h2>
              <ul>
                <FooterLink to="/products">{t("footerAllProducts")}</FooterLink>
                <FooterLink to="/products?featured=true">{t("footerFeaturedProducts")}</FooterLink>
                <FooterLink to="/categories">{t("footerProductCategories")}</FooterLink>
                <FooterLink to="/brands">{t("footerBrands")}</FooterLink>
                <FooterLink to="/news">{t("footerGardenNews")}</FooterLink>
                <FooterLink to="/about">{t("footerAbout")}</FooterLink>
              </ul>
            </nav>

            <nav className="footer-column" aria-label={t("footerCustomerSupport")}>
              <h2>{t("footerCustomerSupport")}</h2>
              <ul>
                <FooterLink to="/faq">{t("footerFaq")}</FooterLink>
                <FooterLink to="/contact">{t("footerContactAdvice")}</FooterLink>
                <FooterLink to="/login">{t("footerLoginRegister")}</FooterLink>
                <FooterLink to="/account">{t("footerMyAccount")}</FooterLink>
                <FooterLink to="/orders">{t("footerTrackOrders")}</FooterLink>
              </ul>
            </nav>

            <section className="footer-column footer-advice">
              <h2>{t("footerNeedAdvice")}</h2>
              <p>{t("footerAdviceText")}</p>
              <a className="footer-advice-phone" href={STORE.phoneLink}><PhoneOutlined /> {t("footerCall")} {STORE.phone}</a>
              <a className="footer-advice-email" href={`mailto:${STORE.email}`}>{STORE.email}</a>
              <div className="footer-follow"><span>{t("footerFollow")}</span><div className="footer-social"><a href={STORE.facebookUrl} target="_blank" rel="noreferrer" aria-label={t("footerFacebookLabel")}><FacebookOutlined /></a><a className="footer-tiktok" href={STORE.tiktokUrl} target="_blank" rel="noreferrer" aria-label={t("footerTiktokLabel")}>♪</a></div></div>
              <small>{t("footerShippingNote")}</small>
            </section>
          </div>
        </div>
      </div>

      <div className="footer-service">
        <div className="footer-container footer-service-grid">
          <div className="footer-service-item"><span className="footer-service-number">01</span><div><strong>{t("footerServiceAdvice")}</strong><span>{t("footerServiceAdviceText")}</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">02</span><div><strong>{t("footerServicePrice")}</strong><span>{t("footerServicePriceText")}</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">03</span><div><strong>{t("footerServiceStock")}</strong><span>{t("footerServiceStockText")}</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">04</span><div><strong>{t("footerServiceDelivery")}</strong><span>{t("footerServiceDeliveryText")}</span></div></div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p>© {new Date().getFullYear()} <strong>{storeName}</strong>. {t("footerCopyright")}</p>
          <nav className="footer-bottom-links" aria-label={t("footerCustomerSupport")}><Link to="/privacy">{t("footerPrivacy")}</Link><span aria-hidden="true">·</span><Link to="/terms">{t("footerTerms")}</Link><span aria-hidden="true">·</span><Link to="/contact">{t("footerContact")}</Link></nav>
        </div>
      </div>

      {showBackToTop && <button type="button" className="footer-back-top" onClick={scrollToTop} aria-label={t("footerBackToTop")}><ArrowUpOutlined /></button>}
    </footer>
  );
}
