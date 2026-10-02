require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const NewsArticle = require("../models/NewsArticle");
const NewsCategory = require("../models/NewsCategory");
const Promotion = require("../models/Promotion");
const Coupon = require("../models/Coupon");
const Banner = require("../models/Banner");

const categoryEnglish = {
  "Màng nhà kính": ["Greenhouse Film", "Greenhouse covering film that helps retain heat and optimize light for crops."],
  "Máng xối": ["Greenhouse Gutters", "Water collection gutters and installation accessories for greenhouse structures."],
  "Bạt lót hồ HDPE": ["HDPE Pond Liners", "Waterproof liners for reservoirs and agricultural projects."],
  "Lưới nhà kính": ["Greenhouse Nets", "Shade nets, insect screens, and protective netting for crops."],
  "Màng phủ luống": ["Crop Mulch Film", "Mulch film that retains moisture and suppresses weeds in crop beds."],
  "Khung và kết cấu nhà kính": ["Greenhouse Frames and Structures", "Steel pipes and materials for greenhouse and polytunnel frames."],
  "Phụ kiện nhà kính": ["Greenhouse Accessories", "Profiles, springs, clips, and straps for completing greenhouse installations."],
  "Hệ thống tưới": ["Irrigation Systems", "Water-efficient irrigation equipment for gardens and greenhouses."],
  "Vườn ươm và chăm sóc cây": ["Nursery and Plant Care", "Seedling trays, growing media, and supplies for plant care."],
  "Giá thể trồng cây": ["Growing Media", "Growing media and supplies that support healthy root establishment and growth."],
};
const articleCategoryEnglish = {
  "Kỹ thuật nhà kính": "Greenhouse Engineering", "Tưới và chăm sóc cây": "Irrigation and Plant Care",
  "Chọn vật tư": "Choosing Supplies", "Kinh nghiệm nhà vườn": "Grower Tips",
  "Tin tức nhà kính công nghệ cao Đà Lạt": "Da Lat High-Tech Greenhouse News",
  "Màng phủ và vật liệu": "Covering Films and Materials", "Kết cấu nhà kính": "Greenhouse Structures",
  "Vườn ươm": "Nursery", "Quản lý nguồn nước": "Water Management", "Canh tác bền vững": "Sustainable Farming",
};
const productTerms = [
  [/Màng nhà kính/g, "Greenhouse film"], [/Màng phủ luống/g, "Crop mulch film"], [/nông nghiệp/g, "agricultural"],
  [/màu bạc đen/g, "silver-black"], [/chống đọng sương/g, "anti-drip"], [/khuếch tán ánh sáng/g, "light-diffusing"],
  [/chống tia UV/g, "UV-resistant"], [/Lưới cắt nắng/g, "Shade net"], [/Lưới che nắng/g, "Shade net"],
  [/Lưới chắn côn trùng/g, "Insect net"], [/Lưới đỡ cây trồng/g, "Crop support net"], [/Ống thép mạ kẽm/g, "Galvanized steel pipe"],
  [/làm khung vòm/g, "for arched greenhouse frames"], [/chịu lực/g, "heavy-duty"], [/làm cột chính/g, "for main columns"],
  [/Bộ nẹp và lò xo cố định màng/g, "Greenhouse film fixing profile and spring set"], [/Nẹp Z/g, "Z-profile"], [/Lò xo ziczac/g, "Wiggle wire"], [/Kẹp màng nhà kính/g, "Greenhouse film clip"],
  [/Dây chằng khung nhà kính/g, "Greenhouse frame strap"], [/Dây chằng nhà kính/g, "Greenhouse tie-down strap"],
  [/Máng xối thu nước nhà kính/g, "Large greenhouse rain gutter"], [/Máng xối nhà kính/g, "Greenhouse gutter"],
  [/Máng xối liền nẹp thoát nước/g, "Integrated drainage gutter"], [/Bạt HDPE lót hồ/g, "HDPE pond liner"],
  [/Bộ tưới nhỏ giọt/g, "Drip irrigation kit"], [/Dây tưới nhỏ giọt bù áp/g, "Pressure-compensating drip line"],
  [/Dây tưới nhỏ giọt/g, "Drip irrigation line"], [/Ống PE tưới/g, "PE irrigation pipe"], [/Kẹp nối ống tưới/g, "Irrigation pipe connector"],
  [/Béc phun sương/g, "Misting nozzle"], [/Béc tưới phun mưa/g, "360-degree sprinkler"], [/Bộ lọc đĩa/g, "Disc filter"],
  [/Van khóa nhanh/g, "Quick shut-off valve"], [/Van khóa PVC/g, "PVC shut-off valve"], [/Khay ươm cây ươm/g, "Seedling tray"],
  [/Khay ươm cây/g, "Seedling tray"], [/Giá thể xơ dừa/g, "Coco coir growing medium"], [/Giá thể phối trộn/g, "Blended growing medium"],
  [/Xơ dừa trồng cây/g, "Coco coir for planting"], [/đã xử lý mặn/g, "salt-treated"], [/đã xử lý/g, "processed"],
  [/cho hệ thống tưới/g, "for irrigation systems"], [/cho luống rau/g, "for vegetable beds"], [/làm mát nhà kính/g, "for greenhouse cooling"],
  [/làm mát vườn ươm/g, "for nursery cooling"], [/khổ/g, "width"], [/dày/g, "thick"], [/phi /g, "Ø"], [/micron/g, "micron"],
  [/không/g, ""],
];
const articleTitles = {
  "Chọn màng nhà kính theo cây trồng và điều kiện vườn": "Choosing Greenhouse Film for Your Crops and Growing Conditions",
  "Lưới cắt nắng 50%, 70% hay 80%: chọn thế nào?": "50%, 70%, or 80% Shade Net: How to Choose",
  "Bố trí tưới nhỏ giọt để nước đến đúng vùng rễ": "Set Up Drip Irrigation to Deliver Water to the Root Zone",
  "Vì sao nên lắp bộ lọc trước đường ống tưới?": "Why Install a Filter Before Your Irrigation Lines?",
  "Tính khổ lưới và màng phủ để giảm hao hụt khi thi công": "Measure Netting and Film to Reduce Installation Waste",
  "Kiểm tra nhà kính trước mùa mưa gió": "Inspect Your Greenhouse Before the Rainy and Windy Season",
  "Những thông tin nên chuẩn bị khi hỏi mua vật tư nhà kính": "What to Prepare When Asking About Greenhouse Supplies",
  "Bạt HDPE lót hồ: lưu ý khi chuẩn bị mặt bằng": "HDPE Pond Liners: Preparing the Site",
  "Chọn ống và béc tưới cho nhà kính quy mô nhỏ": "Choosing Pipes and Sprinklers for a Small Greenhouse",
  "Bảo trì khung nhà kính trước mùa mưa gió": "Maintain Your Greenhouse Frame Before the Rainy and Windy Season",
};
const bannerEnglish = {
  home: ["MODERN GREENHOUSE SOLUTIONS", "Modern greenhouse supplies and solutions", "From frames and covering films to installation accessories, find the right supplies for a productive growing season.", "Explore products"],
  products: ["GREENHOUSE SUPPLIES", "Find the right supplies for your project", "Filter by product group, brand, and specifications to find what you need.", "Browse categories"],
  "product-detail": ["CHOOSE THE RIGHT SPECIFICATIONS", "Need help choosing supplies for your garden?", "Share your project dimensions and needs to get help choosing the right option.", "Contact our team"],
  categories: ["EASY TO EXPLORE", "Explore all supply categories", "Product groups for greenhouses, irrigation systems, and plant care.", "View products"],
  brands: ["TRUSTED PARTNER BRANDS", "Choose from trusted brands", "Explore brands and products suited to your growing conditions.", "Shop now"],
  news: ["GROWER'S CORNER", "Practical knowledge for every growing season", "Tips on supplies, irrigation, and crop care.", "Read the latest"],
  "news-detail": ["GROWER KNOWLEDGE", "Find the right solution for your garden", "Explore related products and get advice from the Da Lat High-Tech Greenhouse team.", "View products"],
  about: ["DA LAT HIGH-TECH GREENHOUSE", "Supporting modern growers", "Greenhouse supplies and growing solutions selected to suit real-world needs.", "Explore products"],
  contact: ["WE ARE HERE TO HELP", "Talk with our greenhouse supplies team", "Tell us about your project so we can help with suitable supplies and specifications.", "View products"],
  faq: ["SHOPPING SUPPORT", "What to know before placing an order", "Learn about product options, ordering, delivery, and account management.", "Contact support"],
  privacy: ["CUSTOMER INFORMATION", "Shop with confidence and clear information", "Learn how the website uses account and order information.", "View policy"],
  terms: ["TERMS OF USE", "Clear information for every order", "Review the terms for products, payment, and delivery.", "Contact us"],
  cart: ["YOUR SHOPPING CART", "Review your items before ordering", "Check each option, quantity, and stock status before continuing.", "Continue shopping"],
  checkout: ["COMPLETE YOUR ORDER", "Prepare your delivery information", "Check your address and payment method so we can process your order accurately.", "Get help"],
  orders: ["YOUR ORDERS", "Follow your order progress", "Check order status and review details for your purchases.", "Shop more"],
  "order-detail": ["ORDER UPDATE", "Need help with your order?", "Contact Da Lat High-Tech Greenhouse about delivery or product questions.", "Contact support"],
  wishlist: ["YOUR SAVED COLLECTION", "Save products you are interested in", "Come back to review product options and availability whenever you need.", "Explore products"],
  notifications: ["STORE UPDATES", "Stay up to date with your orders", "Follow order notifications and account activity here.", "View orders"],
  addresses: ["EASIER DELIVERY", "Manage your delivery addresses", "Save delivery details to place orders more quickly and accurately.", "View products"],
  account: ["YOUR STORE ACCOUNT", "Manage your shopping experience", "Update your details and addresses, and keep track of your purchases.", "Explore products"],
  general: ["DA LAT HIGH-TECH GREENHOUSE", "Solutions for your garden", "Explore products and get advice from our team.", "View products"],
};

const blank = (field) => ({ $or: [{ [field]: { $exists: false } }, { [field]: null }, { [field]: "" }] });
async function fill(Model, selector, fields) {
  const result = await Model.updateMany({ ...selector, $and: Object.entries(fields).map(([field]) => blank(field)) }, { $set: fields });
  return result.modifiedCount || 0;
}
async function run() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to modify production data.");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await connectDB();
  if (mongoose.connection.name !== "webdl2") throw new Error(`Expected demo database webdl2; received ${mongoose.connection.name}.`);
  const counts = {};
  for (const [name, [nameEn, descriptionEn]] of Object.entries(categoryEnglish)) {
    counts.categories = (counts.categories || 0) + await fill(Category, { name }, { nameEn, descriptionEn });
  }
  const brandNames = new Map([
    ["Nhà kính công nghệ cao Đà Lạt", "Da Lat High-Tech Greenhouse"], ["Dalat Greenhouse", "Dalat Greenhouse"],
    ["GreenTech", "GreenTech"], ["Irritech", "Irritech"], ["AgroPro", "AgroPro"], ["AgriFarm Việt", "AgriFarm Vietnam"],
    ["Nông Nghiệp Xanh", "Green Agriculture"], ["Vườn Việt", "Vietnam Garden"], ["Màng Việt", "Vietnam Film"], ["Tưới Thông Minh", "Smart Irrigation"],
  ]);
  for (const [name, nameEn] of brandNames) counts.brands = (counts.brands || 0) + await fill(Brand, { name }, { nameEn, descriptionEn: "Agricultural supplies for greenhouse and modern farming projects." });
  const products = await Product.find({ nameEn: { $in: [null, ""] } }).select("_id name shortDescription").lean();
  for (const product of products) {
    let nameEn = product.name;
    for (const [pattern, replacement] of productTerms) nameEn = nameEn.replace(pattern, replacement);
    if (nameEn === product.name) continue;
    await Product.updateOne({ _id: product._id, ...blank("nameEn") }, { $set: {
      nameEn,
      shortDescriptionEn: "Greenhouse and growing supplies. Confirm specifications, price, and availability before ordering.",
      descriptionEn: `${nameEn}. Product specifications and stock are subject to confirmation. Contact Da Lat High-Tech Greenhouse for advice on selecting the right size and application.`,
    } });
    counts.products = (counts.products || 0) + 1;
  }
  const articleCategories = await NewsCategory.find({ nameEn: { $in: [null, ""] } }).select("_id name").lean();
  for (const item of articleCategories) if (articleCategoryEnglish[item.name]) counts.newsCategories = (counts.newsCategories || 0) + await fill(NewsCategory, { _id: item._id }, { nameEn: articleCategoryEnglish[item.name], descriptionEn: "Practical information and guidance for greenhouse growers." });
  const articles = await NewsArticle.find({ titleEn: { $in: [null, ""] } }).select("_id title").lean();
  for (const item of articles) if (articleTitles[item.title]) counts.newsArticles = (counts.newsArticles || 0) + await fill(NewsArticle, { _id: item._id }, {
    titleEn: articleTitles[item.title],
    excerptEn: "Practical guidance to help growers choose supplies and plan greenhouse work with confidence.",
    contentEn: "Start by reviewing your crop, site conditions, and project measurements. Check the required material specifications and installation method before purchasing. For help choosing a suitable option, share your project details with Da Lat High-Tech Greenhouse.",
  });
  const campaigns = { "Ưu đãi vật tư nhà kính": "Greenhouse Supplies Offer", "Chăm vườn tiết kiệm": "Save on Garden Care", "Ưu đãi thương hiệu tháng này": "This Month's Brand Offer", "Ưu đãi mẫu đã kết thúc": "Sample Offer (Ended)", "Sale tháng 10": "October Sale", "sale tháng 10": "October Sale" };
  for (const [name, nameEn] of Object.entries(campaigns)) counts.promotions = (counts.promotions || 0) + await fill(Promotion, { name }, { nameEn });
  counts.coupons = await fill(Coupon, { code: /^DALAT\d{2}$/ }, { nameEn: "Sample checkout discount" });
  for (const [pageKey, [eyebrowEn, titleEn, descriptionEn, buttonTextEn]] of Object.entries(bannerEnglish)) {
    const rows = await Banner.find({ pageKey }).select("eyebrowEn titleEn descriptionEn buttonTextEn altTextEn").lean();
    const fields = { eyebrowEn, titleEn, descriptionEn, buttonTextEn, altTextEn: titleEn };
    for (const row of rows) {
      const missing = Object.fromEntries(Object.entries(fields).filter(([key]) => !row[key]));
      if (!Object.keys(missing).length) continue;
      const result = await Banner.updateOne({ _id: row._id }, { $set: missing });
      counts.banners = (counts.banners || 0) + (result.modifiedCount || 0);
    }
  }
  console.log(JSON.stringify({ database: mongoose.connection.name, modified: counts }, null, 2));
}
run().then(() => mongoose.disconnect()).catch(async (error) => { console.error(`${error.name}: ${error.message}`); await mongoose.disconnect(); process.exitCode = 1; });
