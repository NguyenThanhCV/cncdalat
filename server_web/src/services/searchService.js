const Category = require("../models/Category");
const Brand = require("../models/Brand");
const NewsArticle = require("../models/NewsArticle");
const NewsCategory = require("../models/NewsCategory");
const Promotion = require("../models/Promotion");
const Coupon = require("../models/Coupon");
const productService = require("./productService");
const escapeRegex = require("../utils/escapeRegex");

const MAX_RESULTS_PER_SECTION = 8;

exports.search = async (rawQuery = "") => {
  const term = String(rawQuery).trim().slice(0, 80);
  if (!term) {
    return {
      query: "",
      products: { data: [], total: 0 },
      news: { data: [], total: 0 },
      categories: { data: [], total: 0 },
      brands: { data: [], total: 0 },
      promotions: { data: [], total: 0 },
      coupons: { data: [], total: 0 },
    };
  }

  const re = { $regex: escapeRegex(term), $options: "i" };
  const now = new Date();
  const [products, categoryFilter, brandFilter, newsCategoryIds] = await Promise.all([
    productService.list({ search: term, status: "active", page: 1, limit: MAX_RESULTS_PER_SECTION, sort: "popular" }),
    { status: "active", $or: [{ name: re }, { nameEn: re }, { slug: re }, { description: re }, { descriptionEn: re }] },
    { status: "active", $or: [{ name: re }, { nameEn: re }, { slug: re }, { description: re }, { descriptionEn: re }] },
    NewsCategory.find({ status: "active", $or: [{ name: re }, { nameEn: re }, { slug: re }] }).distinct("_id"),
  ]);

  const newsFilter = {
    status: "published",
    publishedAt: { $lte: now },
    $or: [
      { title: re }, { titleEn: re }, { slug: re },
      { excerpt: re }, { excerptEn: re }, { content: re }, { contentEn: re },
      { tags: re }, { category: { $in: newsCategoryIds } },
    ],
  };
  const currentWindow = () => ({ status: "active", $and: [
    { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
    { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
  ] });
  const promotionFilter = { ...currentWindow(), $or: [{ id: re }, { name: re }, { nameEn: re }] };
  const couponFilter = {
    ...currentWindow(),
    $and: [...currentWindow().$and, { $or: [
      { usageLimit: { $exists: false } }, { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ] }],
    $or: [{ code: re }, { name: re }, { nameEn: re }],
  };
  const [categories, categoryTotal, brands, brandTotal, news, newsTotal, promotions, promotionTotal, coupons, couponTotal] = await Promise.all([
    Category.find(categoryFilter).sort({ sortOrder: 1, name: 1 }).limit(MAX_RESULTS_PER_SECTION).lean(),
    Category.countDocuments(categoryFilter),
    Brand.find(brandFilter).sort({ sortOrder: 1, name: 1 }).limit(MAX_RESULTS_PER_SECTION).lean(),
    Brand.countDocuments(brandFilter),
    NewsArticle.find(newsFilter).populate("category", "name nameEn slug")
      .sort({ publishedAt: -1, _id: -1 }).limit(MAX_RESULTS_PER_SECTION).lean(),
    NewsArticle.countDocuments(newsFilter),
    Promotion.find(promotionFilter).sort({ updatedAt: -1 }).limit(MAX_RESULTS_PER_SECTION).lean(),
    Promotion.countDocuments(promotionFilter),
    Coupon.find(couponFilter).select("code name nameEn type value minOrderValue maxDiscount startDate endDate")
      .sort({ createdAt: -1 }).limit(MAX_RESULTS_PER_SECTION).lean(),
    Coupon.countDocuments(couponFilter),
  ]);

  return {
    query: term,
    products: { data: products.data, total: products.pagination.total },
    news: { data: news, total: newsTotal },
    categories: { data: categories, total: categoryTotal },
    brands: { data: brands, total: brandTotal },
    promotions: { data: promotions, total: promotionTotal },
    coupons: { data: coupons, total: couponTotal },
  };
};
