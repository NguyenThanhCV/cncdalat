import React, { useEffect, useMemo, useRef, useState } from "react";
import { Carousel } from "antd";
import { Link, useLocation } from "react-router-dom";
import { ArrowRightOutlined, ShoppingOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import * as api from "../../api/shop";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../utils/localized";
import MediaDisplay from "../MediaDisplay";
import "./index.css";

function pageKeyFor(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (/^\/products\/[^/]+/.test(path)) return "product-detail";
  if (path === "/products") return "products";
  if (path === "/categories") return "categories";
  if (path === "/brands") return "brands";
  if (/^\/news\/[^/]+/.test(path)) return "news-detail";
  if (path === "/news") return "news";
  if (/^\/orders\/[^/]+/.test(path)) return "order-detail";
  const routes = { "/about":"about", "/contact":"contact", "/faq":"faq", "/privacy":"privacy", "/terms":"terms", "/cart":"cart", "/checkout":"checkout", "/orders":"orders", "/wishlist":"wishlist", "/notifications":"notifications", "/addresses":"addresses", "/account":"account" };
  return routes[path] || "general";
}

function BannerAction({ banner }) {
  if (!banner.buttonText || !banner.buttonLink) return null;
  const label = <><span className="banner-button-label">{banner.buttonText}</span><ArrowRightOutlined aria-hidden="true" /></>;
  if (/^https?:\/\//i.test(banner.buttonLink)) return <a className="banner-button" href={banner.buttonLink} target="_blank" rel="noreferrer">{label}</a>;
  return <Link className="banner-button" to={banner.buttonLink.startsWith("/") ? banner.buttonLink : `/${banner.buttonLink}`}>{label}</Link>;
}

const BannerSlider = () => {
  const { i18n, t } = useTranslation();
  const { pathname } = useLocation();
  const pageKey = useMemo(() => pageKeyFor(pathname), [pathname]);
  const carouselRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [loadedPage, setLoadedPage] = useState("");
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = (event) => setIsMobile(event.matches);
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    setLoadedPage("");
    api.getBanners({ page: pageKey }).then((response) => {
      const data = response?.data?.data ?? response?.data ?? response;
      if (active) { setBanners(Array.isArray(data) ? data : []); setLoadedPage(pageKey); }
    }).catch(() => { if (active) { setBanners([]); setLoadedPage(pageKey); } });
    return () => { active = false; };
  }, [pageKey]);

  // Trang chủ dùng hero biên tập riêng; banner quản trị vẫn giữ trên các trang còn lại.
  if (pageKey === "home" || loadedPage !== pageKey || !banners.length) return null;
  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();
  const textPosition = (position) => ({
    "--banner-text-align": position === "center" ? "center" : position === "right" ? "right" : "left",
    "--banner-content-left": position === "center" ? "50%" : position === "right" ? "auto" : "9%",
    "--banner-content-right": position === "right" ? "9%" : "auto",
    "--banner-content-transform": position === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
  });
  return <section className="banner-slider" aria-label={t("pageBanner")}>
    <div className="banner-frame">
    <Carousel ref={carouselRef} autoplay={banners.length > 1} autoplaySpeed={5000} dots={banners.length > 1} arrows={false} effect="fade">
      {banners.map((banner) => { const title = localizedField(banner, "title", i18n.resolvedLanguage); const eyebrow = localizedField(banner, "eyebrow", i18n.resolvedLanguage); const description = localizedField(banner, "description", i18n.resolvedLanguage); const buttonText = localizedField(banner, "buttonText", i18n.resolvedLanguage); const altText = localizedField(banner, "altText", i18n.resolvedLanguage); const hasMobileMedia = isMobile && Boolean(banner.mobileImageUrl); const mediaUrl = hasMobileMedia ? banner.mobileImageUrl : banner.imageUrl; const mediaType = hasMobileMedia ? (banner.mobileMediaType || "image") : banner.mediaType; return <div className="banner-slide" key={banner._id} style={{ "--banner-overlay-opacity": banner.overlayOpacity ?? 0.45, ...textPosition(banner.textPosition) }}>
        <div className="banner-picture"><MediaDisplay src={mediaUrl} mediaType={mediaType} alt={altText || title || banner.name} className="banner-image" /></div>
        <div className="banner-overlay" />
        <div className="banner-content">
          {(eyebrow || pageKey === "home") && <div className="banner-label"><ShoppingOutlined /><span>{eyebrow || "NHÀ KÍNH CÔNG NGHỆ CAO ĐÀ LẠT"}</span></div>}
          {title && <h1>{title}</h1>}
          {description && <p>{description}</p>}
          <BannerAction banner={{ ...banner, buttonText: buttonText || banner.buttonText }} />
        </div>
      </div>; })}
    </Carousel>
    {banners.length > 1 && <>
      <button type="button" className="banner-manual-arrow banner-manual-prev" onClick={handlePrev} aria-label="Banner trước"><LeftOutlined /></button>
      <button type="button" className="banner-manual-arrow banner-manual-next" onClick={handleNext} aria-label="Banner tiếp theo"><RightOutlined /></button>
    </>}
    </div>
  </section>;
};

export default BannerSlider;
