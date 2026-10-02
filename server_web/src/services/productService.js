const Model = require("../models/Product");
const Variant = require("../models/ProductVariant");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");
const variantService = require("./variantService");
const Promotion = require("../models/Promotion");

const crud = require("./crudService").make(Model, {
  populate: [
    {
      path: "category",
    },
    {
      path: "brand",
    },
  ],
});

/**
 * =========================================================
 * LIST PRODUCTS
 * =========================================================
 *
 * GET /api/products
 *
 * Hỗ trợ:
 *
 * ?page=1
 * ?limit=20
 * ?search=iphone
 * ?category=CATEGORY_ID
 * ?brand=BRAND_ID
 * ?status=active
 * ?featured=true
 */
exports.list = async (query = {}) => {
  const filter = {};

  // Sale-deal pages request only products included in a currently valid campaign.
  if (query.deal) {
    const now = new Date();
    const campaign = await Promotion.findOne({ id: String(query.deal), status: "active", $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
    ] }).lean();
    if (!campaign) return { data: [], pagination: { page: Math.max(+query.page || 1, 1), limit: Math.min(Math.max(+query.limit || 20, 1), 100), total: 0, pages: 0 } };
    const includedIds = campaign.scope === "product" ? campaign.productIds : campaign.scope === "category" ? campaign.categoryIds : campaign.brandIds;
    const campaignFilter = campaign.scope === "product"
      ? { _id: { $in: includedIds || [] } }
      : campaign.scope === "category"
        ? { category: { $in: includedIds || [] } }
        : { brand: { $in: includedIds || [] } };
    filter._id = { $in: await Model.find(campaignFilter).distinct("_id") };
  }

  /*
   * CATEGORY
   */
  if (query.category) {
    filter.category = query.category;
  }

  /*
   * BRAND
   */
  if (query.brand) {
    filter.brand = query.brand;
  }

  /*
   * STATUS
   */
  if (query.status) {
    filter.status = query.status;
  }

  /*
   * FEATURED
   */
  if (query.featured !== undefined) {
    filter.featured = query.featured === true || query.featured === "true";
  }

  /*
   * HAS VARIANTS
   */
  if (query.hasVariants !== undefined) {
    const productIds = await Variant.distinct("product");
    if (query.deal) {
      if (query.hasVariants === true || query.hasVariants === "true") {
        filter._id.$in = filter._id.$in.filter((id) => productIds.some((other) => String(other) === String(id)));
      } else {
        filter._id.$nin = productIds;
      }
    } else {
      filter._id = query.hasVariants === true || query.hasVariants === "true"
        ? { $in: productIds }
        : { $nin: productIds };
    }
  }

  /*
   * SEARCH
   */
  if (query.search) {
    const re = { $regex: escapeRegex(query.search), $options: "i" };
    const variantProducts = await Variant.find({ $or: [{ sku: re }, { barcode: re }] }).distinct("product");
    const searchConditions = [
      { name: re },
      { nameEn: re },
      { slug: re },
      { _id: { $in: variantProducts } },
    ];
    if (query.deal) {
      // The generic CRUD helper also adds its own name/code/title $or for search.
      // Combine both clauses so SKU/barcode search stays inside the selected campaign.
      filter.$and = [...(filter.$and || []), { $or: searchConditions }];
    } else {
      filter.$or = searchConditions;
    }
  }

  if (query.deal && query.search) {
    const { search: _search, ...listingQuery } = query;
    return crud.list(filter, listingQuery);
  }
  return crud.list(filter, query);
};

/**
 * =========================================================
 * GET PRODUCT DETAIL
 * =========================================================
 *
 * GET /api/products/:id
 */
exports.get = async (id) => {
  return crud.get(id);
};

/**
 * =========================================================
 * CREATE PRODUCT
 * =========================================================
 *
 * POST /api/products
 */
exports.create = async (data) => {
  const { variant, ...productData } = data || {};
  if (!variant || variant.price === undefined || variant.price === null || Number(variant.price) < 0) {
    throw new AppError("Sản phẩm phải có ít nhất 1 Variant và Variant phải có giá bán.", 400);
  }
  if (!productData.category) throw new AppError("Sản phẩm phải có danh mục.", 400);

  let product;
  try {
    product = await crud.create(productData);
    await variantService.create({ ...variant, product: product._id });
    return product;
  } catch (error) {
    if (product?._id) await Model.findByIdAndDelete(product._id).catch(() => {});
    throw error;
  }
};

/**
 * =========================================================
 * UPDATE PRODUCT
 * =========================================================
 *
 * PATCH /api/products/:id
 */
exports.update = async (id, data) => {
  const { variant, ...productData } = data || {};
  const product = await crud.update(id, productData);

  if (variant) {
    const variantId = variant._id;
    if (variantId) {
      const current = await Variant.findOne({ _id: variantId, product: product._id });
      if (!current) throw new AppError("Variant không thuộc sản phẩm này.", 400);
      const { _id, ...variantData } = variant;
      await variantService.update(variantId, { ...variantData, product: product._id });
    } else {
      await variantService.create({ ...variant, product: product._id });
    }
  }

  const count = await Variant.countDocuments({ product: product._id });
  if (count < 1) throw new AppError("Sản phẩm phải luôn có ít nhất 1 Variant.", 400);
  return product;
};

/**
 * =========================================================
 * DELETE PRODUCT
 * =========================================================
 *
 * DELETE /api/products/:id
 */
exports.remove = async (id) => {
  const product = await crud.remove(id);
  await Variant.deleteMany({ product: product._id });
  return product;
};
