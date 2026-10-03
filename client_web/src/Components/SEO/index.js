import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useSiteMedia from "../../hooks/useSiteMedia";
import { siteConfig } from "../../config/site";

const DEFAULT_TITLE = "Nhà kính công nghệ cao Đà Lạt | Thiết bị tưới & nông nghiệp";
const DEFAULT_DESCRIPTION = "Nhà kính công nghệ cao Đà Lạt cung cấp vật tư nhà kính, thiết bị tưới và giải pháp nông nghiệp. Khám phá sản phẩm, quy cách và đặt hàng trực tuyến.";
const STORE_EMAIL = siteConfig.storeEmail;
const STORE_PHONE = siteConfig.storePhone;
const PRIVATE_PATH = /^\/(login|register|cart|checkout|account|orders|wishlist|notifications|addresses)(\/|$)/;

const PAGE_META = [
  [/^\/$/, { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }],
  [/^\/products$/, { title: "Sản phẩm vật tư nhà kính & thiết bị tưới | Nhà kính công nghệ cao Đà Lạt", description: "Tìm vật tư nhà kính, màng phủ, lưới, ống và thiết bị tưới phù hợp. Lọc theo danh mục, thương hiệu và xem giá theo từng quy cách." }],
  [/^\/categories$/, { title: "Danh mục vật tư nông nghiệp | Nhà kính công nghệ cao Đà Lạt", description: "Khám phá các danh mục vật tư nhà kính, thiết bị tưới và sản phẩm nông nghiệp tại cửa hàng Nhà kính công nghệ cao Đà Lạt." }],
  [/^\/brands$/, { title: "Thương hiệu vật tư nhà kính | Nhà kính công nghệ cao Đà Lạt", description: "Tìm hiểu các thương hiệu vật tư nhà kính và thiết bị tưới đang được phân phối tại Nhà kính công nghệ cao Đà Lạt." }],
  [/^\/news$/, { title: "Tin tức nhà vườn & kiến thức nông nghiệp | Nhà kính công nghệ cao Đà Lạt", description: "Kinh nghiệm chọn vật tư, chăm sóc cây trồng và giải pháp canh tác thiết thực dành cho nhà vườn." }],
  [/^\/about$/, { title: "Về Nhà kính công nghệ cao Đà Lạt", description: "Nhà kính công nghệ cao Đà Lạt đồng hành cùng nhà vườn với vật tư nhà kính, thiết bị tưới và giải pháp phục vụ sản xuất nông nghiệp hiện đại." }],
  [/^\/contact$/, { title: "Liên hệ tư vấn vật tư nhà kính | Nhà kính công nghệ cao Đà Lạt", description: "Liên hệ Nhà kính công nghệ cao Đà Lạt để được tư vấn sản phẩm, quy cách và thông tin giao hàng." }],
  [/^\/faq$/, { title: "Câu hỏi thường gặp | Nhà kính công nghệ cao Đà Lạt", description: "Thông tin về cách chọn sản phẩm, giá theo phiên bản, đặt hàng, giao hàng và quản lý tài khoản Nhà kính công nghệ cao Đà Lạt." }],
  [/^\/privacy$/, { title: "Chính sách quyền riêng tư | Nhà kính công nghệ cao Đà Lạt", description: "Tìm hiểu cách website Nhà kính công nghệ cao Đà Lạt sử dụng và bảo vệ thông tin tài khoản, địa chỉ giao hàng và đơn hàng." }],
  [/^\/terms$/, { title: "Điều khoản sử dụng | Nhà kính công nghệ cao Đà Lạt", description: "Thông tin về sản phẩm, giá, đặt hàng, thanh toán và giao hàng trên website Nhà kính công nghệ cao Đà Lạt." }],
];

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", String(content));
}

function publicBaseUrl() {
  const configured = siteConfig.siteUrl;
  if (configured) {
    try { return new URL(configured).origin; } catch (_) { return ""; }
  }
  const { hostname, origin } = window.location;
  const localHost = hostname === "localhost" || hostname.endsWith(".local") || hostname === "::1" ||
    /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  return localHost ? "" : origin;
}

export function useSeo({ title, description, image, type = "website", noindex = false, schema, schemaSlot = type === "website" ? "organization" : "page" } = {}) {
  useEffect(() => {
    const pageTitle = title || DEFAULT_TITLE;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const baseUrl = publicBaseUrl();
    const canonical = baseUrl ? new URL(window.location.pathname, `${baseUrl}/`).href : "";
    const imageUrl = image ? new URL(image, baseUrl || window.location.origin).href : "";

    document.title = pageTitle;
    upsertMeta("name", "description", pageDescription);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:locale", "vi_VN");
    upsertMeta("property", "og:site_name", "Nhà kính công nghệ cao Đà Lạt");
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDescription);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", image ? pageTitle : "");
    upsertMeta("name", "twitter:card", imageUrl ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDescription);
    upsertMeta("name", "twitter:image", imageUrl);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonical);
    } else {
      canonicalLink?.remove();
    }

    const schemaId = schemaSlot === "organization" ? "storefront-organization-jsonld" : "storefront-page-jsonld";
    let schemaScript = document.getElementById(schemaId);
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.id = schemaId;
        schemaScript.type = "application/ld+json";
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else {
      schemaScript?.remove();
    }
    return () => {
      if (schemaSlot === "page") document.getElementById("storefront-page-jsonld")?.remove();
    };
  }, [title, description, image, type, noindex, schema, schemaSlot]);
}

export default function StorefrontSEO() {
  const storeLogo = useSiteMedia("store-logo");
  const { pathname, search } = useLocation();
  const route = pathname.replace(/\/+$/, "") || "/";
  const page = PAGE_META.find(([pattern]) => pattern.test(route))?.[1];
  const isProduct = /^\/products\/[^/]+/.test(route);
  const isArticle = /^\/news\/[^/]+/.test(route);
  const privatePage = PRIVATE_PATH.test(route);
  const query = new URLSearchParams(search);
  const hasProductFilters = route === "/products" && [...query.keys()].length > 0;
  const siteUrl = publicBaseUrl();
  const organization = {
    "@context": siteConfig.schemaContext,
    "@type": "Organization",
    name: siteConfig.storeName,
    email: STORE_EMAIL,
    telephone: `+84${STORE_PHONE.replace(/\D/g, "").replace(/^0/, "")}`,
    logo: storeLogo?.mediaUrl || undefined,
    url: siteUrl || undefined,
    sameAs: [siteConfig.facebookUrl, siteConfig.tiktokUrl].filter(Boolean),
  };
  useSeo({
    title: page?.title || (isProduct ? "Chi tiết sản phẩm | Nhà kính công nghệ cao Đà Lạt" : isArticle ? "Bài viết nhà vườn | Nhà kính công nghệ cao Đà Lạt" : privatePage ? "Tài khoản mua sắm | Nhà kính công nghệ cao Đà Lạt" : DEFAULT_TITLE),
    description: page?.description || (isProduct ? "Thông tin, quy cách, giá và tình trạng sản phẩm vật tư nông nghiệp tại Nhà kính công nghệ cao Đà Lạt." : isArticle ? "Kiến thức và kinh nghiệm hữu ích dành cho nhà vườn từ Nhà kính công nghệ cao Đà Lạt." : DEFAULT_DESCRIPTION),
    noindex: privatePage || hasProductFilters,
    schema: organization,
    schemaSlot: "organization",
  });
  return null;
}
