import React from "react";
import { siteConfig } from "../../config/site";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, ShoppingOutlined, SafetyCertificateOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import "./style.css";

const STORE = {
  name: siteConfig.storeName,
  phone: siteConfig.storePhone,
  email: siteConfig.storeEmail,
  mapUrl: siteConfig.mapUrl,
};

const EN = {
  aboutEyebrow: "ABOUT DA LAT GREENHOUSE", aboutTitle: "Practical supplies for every growing season",
  aboutIntro: "From greenhouse films and shade nets to irrigation equipment and growing supplies, Da Lat High-Tech Greenhouse helps growers find products suited to their needs.",
  faqEyebrow: "SHOPPING SUPPORT", faqTitle: "Frequently asked questions",
  faqIntro: "Quick information about choosing products, placing orders, and managing your account.",
  privacyEyebrow: "CUSTOMER INFORMATION", privacyTitle: "Privacy policy",
  privacyIntro: "The store uses account, address, and order information to provide the shopping features you request.",
  termsEyebrow: "TERMS OF USE", termsTitle: "Clear terms for shopping",
  termsIntro: "The information below explains how orders and accounts work on the current website.",
  contactEyebrow: "CONTACT", contactTitle: "We are ready to help",
  contactIntro: "Contact Da Lat High-Tech Greenhouse for advice on products, suitable options, and ordering information.",
  greenhouseSupplies: "Greenhouse supplies", greenhouseSuppliesText: "Films, nets, frames, and accessories for greenhouse projects.",
  irrigationEquipment: "Irrigation equipment", irrigationText: "Pipes, sprinklers, and accessories for irrigation systems.",
  growingSupplies: "Growing supplies", growingText: "Products that support plant care and everyday work in the garden.",
  storeSupport: "Da Lat High-Tech Greenhouse is ready to help you choose supplies for your garden.",
  aboutNoteTitle: "Da Lat High-Tech Greenhouse", aboutNoteText: "Choose suitable supplies and make garden care easier through every season.",
  contactPhoneAction: "Call us to talk directly", contactEmailAction: "Send a question or request advice",
  contactMapAction: "Da Lat High-Tech Greenhouse", companyAddress: "Company address", viewGoogleMaps: "View on Google Maps",
  lookingForProducts: "Looking for a product?", browseCategories: "Browse categories", contactPage: "Contact page",
  categoryAdvice: "Browse categories or send a product code by phone or email for help choosing the right specifications.",
  call: "Call", hotline: "Hotline", email: "Email", needMoreAdvice: "Need more advice?",
  infoSafety: "Your information and order status are managed in your account.",
  productPriceQuestion: "How can I find a product's price?", productPriceAnswer: "Some products have multiple variants. Open the product page and select all options, such as size or color, to see the price and stock for that variant.",
  orderQuestion: "How do I place an order?", orderAnswer: "Sign in, choose a product and its variant, add it to your cart, select or add a delivery address, and submit your order.",
  trackQuestion: "Where can I track my order?", trackAnswer: "Open Orders in your account to view each order's status and details.",
  cancelQuestion: "When can I cancel an order?", cancelAnswer: "You can request cancellation from the order page while the order is awaiting confirmation or confirmed.",
  couponQuestion: "How are discount codes applied?", couponAnswer: "Enter your code at checkout. The system checks its validity period, minimum order value, and usage limits before applying it.",
  shippingQuestion: "Is shipping included in the order total?", shippingAnswer: "The website does not calculate shipping automatically yet. Contact Da Lat High-Tech Greenhouse to confirm the delivery fee before payment.",
  reviewQuestion: "Can I review a product?", reviewAnswer: "Yes. Sign in and submit a review from the product page. It will appear after moderation.",
  faqMoreTitle: "Need more advice?", faqMoreText: "Call {{phone}} or email {{email}}.",
  privacyUseTitle: "Information we use", privacyUseText: "When you create an account or place an order, the website stores your profile, phone number, delivery address, order details, and submitted reviews.",
  privacyPurposeTitle: "How we use it", privacyPurposeText: "This information supports sign-in, saved carts, order processing, purchase history, and responses to support requests.",
  privacyAccountTitle: "Account security", privacyAccountText: "Passwords are stored in encrypted form. You can change your password in your account; doing so signs out other sessions.",
  privacySupportTitle: "Support requests", privacySupportText: "To update or ask about account information, email {{email}} or call {{phone}}.",
  termsProductTitle: "Product and pricing information", termsProductText: "Products may have multiple variants. The price is based on the selected variant and recalculated by the system when an order is created.",
  termsOrderTitle: "Orders and stock", termsOrderText: "An order can be created only when the product is active and in stock. Order status updates are available in your account.",
  termsPaymentTitle: "Payment and delivery", termsPaymentText: "The website supports the payment methods shown at checkout. Shipping is not calculated automatically; contact Da Lat High-Tech Greenhouse to confirm the fee before payment.",
  termsCancelTitle: "Cancellations and reviews", termsCancelText: "You can cancel an order while it is awaiting confirmation or confirmed. Submitted reviews are moderated before they appear publicly.",
  termsContactTitle: "Contact", termsContactText: "If anything is unclear, contact us at {{phone}} or {{email}} before placing an order.",
  contactNoteText: "Da Lat High-Tech Greenhouse can help you choose products and options suited to your garden.",
  infoFeatureSafety: "Da Lat High-Tech Greenhouse is ready to help you choose supplies for your garden.",
};

const viOrEn = (vi, english, isEnglish) => isEnglish ? english : vi;

function InfoShell({ eyebrow, title, intro, children, variant = "", isEnglish }) {
  return <main className={`info-page ${variant}`}><div className="info-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p><div className="info-hero-icon"><ShoppingOutlined /></div></div><div className="info-body">{children}<div className="info-safe-note"><SafetyCertificateOutlined /><span>{variant === "info-feature-page" ? (isEnglish ? EN.infoFeatureSafety : "Nhà kính công nghệ cao Đà Lạt sẵn sàng hỗ trợ bạn chọn vật tư phù hợp cho khu vườn.") : (isEnglish ? EN.infoSafety : "Thông tin và trạng thái đơn hàng được quản lý trong tài khoản của bạn.")}</span></div></div></main>;
}

function ContactPage({ isEnglish }) {
  const copy = (vi, en) => viOrEn(vi, en, isEnglish);
  return <InfoShell variant="info-feature-page" isEnglish={isEnglish} eyebrow={copy("LIÊN HỆ", EN.contactEyebrow)} title={copy("Chúng tôi sẵn sàng hỗ trợ", EN.contactTitle)} intro={copy("Liên hệ Nhà kính công nghệ cao Đà Lạt để được tư vấn về sản phẩm, phiên bản phù hợp và thông tin đặt hàng.", EN.contactIntro)}>
    <div className="info-contact-grid">
      <a href={`tel:${STORE.phone.replaceAll(" ", "")}`}><PhoneOutlined /><span><small>{copy("Hotline", EN.hotline)}</small><b>{STORE.phone}</b><em>{copy("Gọi để trao đổi trực tiếp", EN.contactPhoneAction)}</em></span></a>
      <a href={`mailto:${STORE.email}`}><MailOutlined /><span><small>{copy("Email", EN.email)}</small><b>{STORE.email}</b><em>{copy("Gửi câu hỏi hoặc yêu cầu tư vấn", EN.contactEmailAction)}</em></span></a>
      <a href={STORE.mapUrl} target="_blank" rel="noreferrer"><EnvironmentOutlined /><span><small>{copy("Địa chỉ công ty", EN.companyAddress)}</small><b>{copy("Xem vị trí trên Google Maps", EN.viewGoogleMaps)} ↗</b><em>{copy(STORE.name, EN.contactMapAction)}</em></span></a>
    </div>
    <div className="info-note"><b>{copy("Đang tìm sản phẩm?", EN.lookingForProducts)}</b><p>{copy("Xem danh mục hoặc gửi mã sản phẩm qua hotline/email để được hỗ trợ chọn đúng quy cách.", EN.categoryAdvice)}</p><Link to="/categories">{copy("Khám phá danh mục", EN.browseCategories)} →</Link></div>
  </InfoShell>;
}

function FaqPage({ isEnglish }) {
  const copy = (vi, en) => viOrEn(vi, en, isEnglish);
  const questions = [
    ["Làm sao để biết giá của sản phẩm?", "Một số sản phẩm có nhiều phiên bản. Mở trang chi tiết, chọn đầy đủ thuộc tính như kích thước hoặc màu sắc để xem giá và tồn kho của phiên bản đó.", EN.productPriceQuestion, EN.productPriceAnswer],
    ["Làm sao để đặt hàng?", "Đăng nhập, chọn sản phẩm và phiên bản, thêm vào giỏ, chọn hoặc tạo địa chỉ giao hàng rồi gửi đơn hàng.", EN.orderQuestion, EN.orderAnswer],
    ["Tôi có thể theo dõi đơn hàng ở đâu?", "Mở mục Đơn hàng trong tài khoản để xem trạng thái và chi tiết từng đơn.", EN.trackQuestion, EN.trackAnswer],
    ["Khi nào tôi có thể hủy đơn?", "Đơn ở trạng thái chờ xác nhận hoặc đã xác nhận có thể gửi yêu cầu hủy ngay trong trang đơn hàng.", EN.cancelQuestion, EN.cancelAnswer],
    ["Mã giảm giá được áp dụng thế nào?", "Nhập mã ở bước thanh toán. Hệ thống kiểm tra hạn dùng, giá trị tối thiểu và giới hạn sử dụng trước khi tạo đơn.", EN.couponQuestion, EN.couponAnswer],
    ["Phí giao hàng đã nằm trong tổng đơn chưa?", "Website hiện chưa tính phí giao hàng tự động. Vui lòng liên hệ Nhà kính công nghệ cao Đà Lạt để xác nhận phí giao hàng trước khi thanh toán.", EN.shippingQuestion, EN.shippingAnswer],
    ["Tôi có thể gửi đánh giá sản phẩm không?", "Có. Đăng nhập và gửi đánh giá từ trang chi tiết sản phẩm. Đánh giá sẽ hiển thị sau khi được duyệt.", EN.reviewQuestion, EN.reviewAnswer],
  ];
  return <InfoShell isEnglish={isEnglish} eyebrow={copy("HỖ TRỢ MUA SẮM", "SHOPPING SUPPORT")} title={copy("Câu hỏi thường gặp", "Frequently asked questions")} intro={copy("Nếu bạn chưa tìm thấy câu trả lời, đội ngũ Nhà kính công nghệ cao Đà Lạt có thể hỗ trợ trực tiếp.", "If you cannot find the answer you need, the Da Lat High-Tech Greenhouse team can help.")}>
    <div className="info-faq-list">{questions.map(([question, answer, questionEn, answerEn]) => <details key={question}><summary><QuestionCircleOutlined />{copy(question, questionEn)}<span>+</span></summary><p>{copy(answer, answerEn)}</p></details>)}</div>
    <div className="info-note"><b>{copy("Cần tư vấn thêm?", EN.faqMoreTitle)}</b><p>{isEnglish ? EN.faqMoreText.replace("{{phone}}", STORE.phone).replace("{{email}}", STORE.email) : `Gọi ${STORE.phone} hoặc gửi email đến ${STORE.email}.`}</p><Link to="/contact">{copy("Trang liên hệ", EN.contactPage)} →</Link></div>
  </InfoShell>;
}

function PrivacyPage({ isEnglish }) {
  const copy = (vi, en) => viOrEn(vi, en, isEnglish);
  return <InfoShell isEnglish={isEnglish} eyebrow={copy("THÔNG TIN KHÁCH HÀNG", EN.privacyEyebrow)} title={copy("Quyền riêng tư", EN.privacyTitle)} intro={copy("Trang mua sắm sử dụng thông tin tài khoản, địa chỉ và đơn hàng để vận hành các tính năng mua hàng bạn yêu cầu.", EN.privacyIntro)}>
    <div className="info-article"><section><h2>{copy("Thông tin được sử dụng", EN.privacyUseTitle)}</h2><p>{copy("Khi bạn tạo tài khoản hoặc đặt hàng, website lưu thông tin hồ sơ, số điện thoại, địa chỉ giao hàng, nội dung đơn hàng và đánh giá bạn gửi.", EN.privacyUseText)}</p></section><section><h2>{copy("Mục đích sử dụng", EN.privacyPurposeTitle)}</h2><p>{copy("Thông tin được dùng để đăng nhập, lưu giỏ hàng, xử lý đơn hàng, hiển thị lịch sử mua sắm và phản hồi yêu cầu hỗ trợ.", EN.privacyPurposeText)}</p></section><section><h2>{copy("Bảo vệ tài khoản", EN.privacyAccountTitle)}</h2><p>{copy("Mật khẩu được lưu dưới dạng mã hóa. Bạn có thể đổi mật khẩu trong tài khoản; thao tác này sẽ đăng xuất các phiên đăng nhập khác.", EN.privacyAccountText)}</p></section><section><h2>{copy("Yêu cầu hỗ trợ", EN.privacySupportTitle)}</h2><p>{isEnglish ? EN.privacySupportText.replace("{{email}}", STORE.email).replace("{{phone}}", STORE.phone) : <>Để cập nhật hoặc hỏi về thông tin tài khoản, liên hệ <a href={`mailto:${STORE.email}`}>{STORE.email}</a> hoặc gọi {STORE.phone}.</>}</p></section></div>
  </InfoShell>;
}

function TermsPage({ isEnglish }) {
  const copy = (vi, en) => viOrEn(vi, en, isEnglish);
  return <InfoShell isEnglish={isEnglish} eyebrow={copy("ĐIỀU KHOẢN SỬ DỤNG", EN.termsEyebrow)} title={copy("Mua sắm minh bạch", EN.termsTitle)} intro={copy("Các thông tin dưới đây mô tả cách đơn hàng và tài khoản hoạt động trên website hiện tại.", EN.termsIntro)}>
    <div className="info-article"><section><h2>{copy("Thông tin sản phẩm và giá", EN.termsProductTitle)}</h2><p>{copy("Sản phẩm có thể có nhiều phiên bản. Giá được xác định theo phiên bản đã chọn và được hệ thống tính lại khi tạo đơn.", EN.termsProductText)}</p></section><section><h2>{copy("Đặt hàng và tồn kho", EN.termsOrderTitle)}</h2><p>{copy("Đơn hàng chỉ được tạo khi sản phẩm còn hoạt động và đủ tồn kho. Trạng thái đơn hàng được cập nhật trong tài khoản của bạn.", EN.termsOrderText)}</p></section><section><h2>{copy("Thanh toán và giao hàng", EN.termsPaymentTitle)}</h2><p>{copy("Website hiện hỗ trợ các phương thức hiển thị tại bước thanh toán. Phí giao hàng chưa được tính tự động; vui lòng liên hệ Nhà kính công nghệ cao Đà Lạt để xác nhận trước khi thanh toán.", EN.termsPaymentText)}</p></section><section><h2>{copy("Hủy đơn và đánh giá", EN.termsCancelTitle)}</h2><p>{copy("Bạn có thể hủy đơn khi trạng thái còn chờ xác nhận hoặc đã xác nhận. Đánh giá gửi lên sẽ được kiểm duyệt trước khi hiển thị công khai.", EN.termsCancelText)}</p></section><section><h2>{copy("Liên hệ", EN.termsContactTitle)}</h2><p>{isEnglish ? EN.termsContactText.replace("{{phone}}", STORE.phone).replace("{{email}}", STORE.email) : <>Nếu có thông tin chưa rõ, liên hệ {STORE.phone} hoặc <a href={`mailto:${STORE.email}`}>{STORE.email}</a> trước khi đặt hàng.</>}</p></section></div>
  </InfoShell>;
}

export default function InfoPages() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const isEnglish = (i18n.resolvedLanguage || i18n.language || "vi").toLowerCase().startsWith("en");
  const copy = (vi, en) => viOrEn(vi, en, isEnglish);
  if (pathname === "/contact") return <ContactPage isEnglish={isEnglish} />;
  if (pathname === "/faq") return <FaqPage isEnglish={isEnglish} />;
  if (pathname === "/privacy") return <PrivacyPage isEnglish={isEnglish} />;
  if (pathname === "/terms") return <TermsPage isEnglish={isEnglish} />;
  return <InfoShell isEnglish={isEnglish} variant="info-feature-page" eyebrow={copy("VỀ NHÀ KÍNH ĐÀ LẠT", EN.aboutEyebrow)} title={copy("Vật tư thiết thực cho mỗi mùa vụ", EN.aboutTitle)} intro={copy("Từ màng nhà kính, lưới che đến thiết bị tưới và vật tư trồng trọt — Nhà kính công nghệ cao Đà Lạt giúp nhà vườn dễ tìm sản phẩm phù hợp.", EN.aboutIntro)}><div className="info-about-grid"><article><span>01</span><h2>{copy("Vật tư nhà kính", EN.greenhouseSupplies)}</h2><p>{copy("Màng, lưới, khung và phụ kiện phục vụ nhà kính.", EN.greenhouseSuppliesText)}</p></article><article><span>02</span><h2>{copy("Thiết bị tưới", EN.irrigationEquipment)}</h2><p>{copy("Ống, béc tưới và phụ kiện cho hệ thống tưới.", EN.irrigationText)}</p></article><article><span>03</span><h2>{copy("Vật tư trồng trọt", EN.growingSupplies)}</h2><p>{copy("Sản phẩm hỗ trợ chăm sóc cây và công việc tại vườn.", EN.growingText)}</p></article></div><div className="info-note"><b>{copy(STORE.name, EN.aboutNoteTitle)}</b><p>{copy("Chọn vật tư phù hợp, chăm vườn thuận tiện hơn qua từng mùa vụ.", EN.aboutNoteText)}</p><Link to="/contact">{copy("Liên hệ với chúng tôi", "Contact us")} →</Link></div></InfoShell>;
}
