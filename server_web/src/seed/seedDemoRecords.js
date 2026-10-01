require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Coupon = require("../models/Coupon");
const CouponRedemption = require("../models/CouponRedemption");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Banner = require("../models/Banner");
const Product = require("../models/Product");
const Variant = require("../models/ProductVariant");
const Category = require("../models/Category");

const SAMPLE_PASSWORD = "12345678";
const demoCustomers = Array.from({ length: 9 }, (_, index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    name: `Khách hàng mẫu ${n}`,
    email: `khachhang${n}@example.test`,
    phone: `09000000${n}`,
    role: "customer",
    status: "active",
    permissions: [],
  };
});
const demoBanners = [
  ["home", "Nhà kính công nghệ cao Đà Lạt", "Giải pháp cho nhà vườn", "photo-1585320806297-9794b3e4eeae"],
  ["home", "Vật tư nhà kính", "Chọn đúng vật tư cho mùa vụ", "photo-1530836369250-ef72a3f5cda8"],
  ["home", "Hệ thống tưới", "Tưới hiệu quả, tiết kiệm nước", "photo-1592982537447-7440770cbfc9"],
  ["products", "Sản phẩm nổi bật", "Vật tư thiết thực cho khu vườn", "photo-1416879595882-3373a0480b5b"],
  ["categories", "Danh mục sản phẩm", "Khám phá giải pháp canh tác", "photo-1464226184884-fa280b87c399"],
  ["brands", "Thương hiệu", "Lựa chọn đáng tin cậy", "photo-1466692476868-aef1dfb1e735"],
  ["news", "Góc nhà vườn", "Kiến thức tốt, mùa vụ bền lâu", "photo-1500382017468-9049fed747ef"],
  ["about", "Về chúng tôi", "Đồng hành cùng nhà vườn Đà Lạt", "photo-1499529112087-3cb3b73cec95"],
  ["contact", "Liên hệ tư vấn", "Cùng tìm giải pháp phù hợp", "photo-1437482078695-73f5ca6c96e2"],
  ["general", "Nhà kính Đà Lạt", "Sẵn sàng hỗ trợ công trình của bạn", "photo-1464226184884-fa280b87c399"],
];
const assetBaseUrl = process.env.ASSET_BASE_URL || "https://images.unsplash.com";

async function upsertUser(data) {
  let user = await User.findOne({ email: data.email }).select("+password");
  if (!user) {
    user = new User({ ...data, password: SAMPLE_PASSWORD });
    await user.save();
  } else {
    user.name = data.name;
    user.phone = data.phone;
    user.role = data.role;
    user.status = data.status;
    user.permissions = data.permissions;
    await user.save();
  }
  return user;
}

async function run() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Refusing to seed demo records into production.");
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI must point to the demo database.");
  await connectDB();
  if (mongoose.connection.name !== "webdl2")
    throw new Error(`Expected database webdl2, received ${mongoose.connection.name}.`);

  const admin = await User.findOne({ role: "admin", status: "active" });
  if (!admin) throw new Error("The demo admin was not seeded.");
  const customers = [];
  for (const data of demoCustomers) customers.push(await upsertUser(data));
  const users = [admin, ...customers];
  const products = await Product.find({ slug: /^mau-\d{2}-/ }).sort({ slug: 1 }).limit(50);
  const variants = await Variant.find({ sku: /^HS-MAU-/ }).sort({ sku: 1 }).limit(50);
  const categories = await Category.find({ status: "active" }).sort({ sortOrder: 1 }).limit(10);
  if (products.length !== 50 || variants.length !== 50 || categories.length < 10)
    throw new Error(`Expected 50 sample products/variants and 10 categories; found ${products.length}/${variants.length}/${categories.length}.`);

  const now = new Date();
  const coupons = [];
  for (let i = 0; i < 10; i += 1) {
    const code = `DALAT${String(i + 1).padStart(2, "0")}`;
    coupons.push(await Coupon.findOneAndUpdate(
      { code },
      { $set: { code, name: `Ưu đãi mẫu ${i + 1}`, type: i % 2 ? "fixed" : "percentage", value: i % 2 ? 20000 + i * 1000 : 5 + i, minOrderValue: 100000, maxDiscount: 150000, usageLimit: 100, usageLimitPerUser: 1, usedCount: 1, startDate: now, endDate: new Date(now.getTime() + 365 * 86400000), applicableProducts: [products[i]._id], applicableCategories: [categories[i % categories.length]._id], status: "active" } },
      { new: true, upsert: true, runValidators: true },
    ));
  }

  const paymentMethods = ["cod", "bank_transfer", "vnpay", "momo", "other"];
  const orderStatuses = ["completed", "completed", "processing", "confirmed", "pending", "completed", "processing", "completed", "confirmed", "completed"];
  const orders = [];
  for (let i = 0; i < 10; i += 1) {
    const user = users[i];
    const product = products[i];
    const variant = variants[i];
    const price = Number(variant.price);
    const coupon = coupons[i];
    const discount = coupon.type === "percentage" ? Math.min(price * coupon.value / 100, coupon.maxDiscount) : Math.min(coupon.value, price);
    const addressData = {
      user: user._id,
      fullName: user.name,
      phone: user.phone || `09000000${String(i + 1).padStart(2, "0")}`,
      province: "Lâm Đồng",
      district: "Đà Lạt",
      ward: ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5"][i % 5],
      address: `${i + 1} Đường Mẫu, Đà Lạt`,
      note: "Địa chỉ mẫu phục vụ kiểm tra website",
      isDefault: true,
    };
    const address = await Address.findOneAndUpdate(
      { user: user._id }, { $set: addressData }, { new: true, upsert: true, runValidators: true },
    );
    await Cart.findOneAndUpdate(
      { user: user._id },
      { $set: { user: user._id, items: [{ product: product._id, variant: variant._id, quantity: 1, price, attributes: { "Quy cách": variant.attributes.get("Quy cách") || "Mẫu" } }] } },
      { new: true, upsert: true, runValidators: true },
    );
    await Wishlist.findOneAndUpdate(
      { user: user._id }, { $set: { user: user._id, products: [product._id] } },
      { new: true, upsert: true, runValidators: true },
    );
    const orderNumber = `DEMO-${String(i + 1).padStart(4, "0")}`;
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { $set: { orderNumber, user: user._id, customer: { fullName: user.name, phone: address.phone, email: user.email }, address: address.toObject(), subtotal: price, discount, total: price - discount, coupon: coupon._id, paymentMethod: paymentMethods[i % paymentMethods.length], paymentStatus: orderStatuses[i] === "completed" ? "paid" : "pending", orderStatus: orderStatuses[i], note: "Đơn hàng mẫu phục vụ kiểm tra website", completedAt: orderStatuses[i] === "completed" ? now : undefined } },
      { new: true, upsert: true, runValidators: true },
    );
    orders.push(order);
    await OrderItem.findOneAndUpdate(
      { order: order._id },
      { $set: { order: order._id, product: product._id, variant: variant._id, productName: product.name, variantName: variant.sku, sku: variant.sku, attributes: { "Quy cách": variant.attributes.get("Quy cách") || "Mẫu" }, image: product.thumbnail, price, quantity: 1, discount, total: price - discount } },
      { new: true, upsert: true, runValidators: true },
    );
    await Payment.findOneAndUpdate(
      { order: order._id },
      { $set: { order: order._id, user: user._id, method: order.paymentMethod, amount: order.total, currency: "VND", status: order.paymentStatus, provider: order.paymentMethod === "cod" ? "COD" : "Demo", transactionId: `DEMO-TXN-${String(i + 1).padStart(4, "0")}`, paidAt: order.paymentStatus === "paid" ? now : undefined, metadata: { demo: true } } },
      { new: true, upsert: true, runValidators: true },
    );
    await CouponRedemption.findOneAndUpdate(
      { coupon: coupon._id, user: user._id }, { $set: { coupon: coupon._id, user: user._id, count: 1 } },
      { new: true, upsert: true, runValidators: true },
    );
    await Review.findOneAndUpdate(
      { product: product._id, user: user._id },
      { $set: { product: product._id, user: user._id, order: orderStatuses[i] === "completed" ? order._id : null, rating: 4 + (i % 2), title: `Đánh giá mẫu ${i + 1}`, content: `Sản phẩm ${product.name} được thêm để kiểm tra giao diện đánh giá.`, verifiedPurchase: orderStatuses[i] === "completed", status: "approved" } },
      { new: true, upsert: true, runValidators: true },
    );
    await Notification.findOneAndUpdate(
      { user: user._id, title: `Thông báo mẫu ${String(i + 1).padStart(2, "0")}` },
      { $set: { user: user._id, type: i % 2 ? "promotion" : "order", title: `Thông báo mẫu ${String(i + 1).padStart(2, "0")}`, message: "Đây là thông báo mẫu phục vụ kiểm tra trang tài khoản.", data: { orderId: order._id }, isRead: i % 3 === 0, readAt: i % 3 === 0 ? now : undefined } },
      { new: true, upsert: true, runValidators: true },
    );
  }

  for (let i = 0; i < demoBanners.length; i += 1) {
    const [pageKey, title, eyebrow, photo] = demoBanners[i];
    const seedKey = `demo-dalat-${String(i + 1).padStart(2, "0")}`;
    await Banner.findOneAndUpdate(
      { seedKey },
      { $set: { seedKey, pageKey, name: `Banner mẫu ${i + 1}`, title, eyebrow, description: "Dữ liệu minh họa cho giao diện website.", imageUrl: `${assetBaseUrl}/${photo}?auto=format&fit=crop&w=1600&q=80`, altText: title, buttonText: "Khám phá", buttonLink: "/products", status: "active", sortOrder: i + 1, textPosition: "left", overlayOpacity: 0.42 } },
      { new: true, upsert: true, runValidators: true },
    );
  }

  const count = async (Model, filter = {}) => Model.countDocuments(filter);
  console.log(JSON.stringify({
    database: mongoose.connection.name,
    demoCounts: {
      users: await count(User, { $or: [{ email: "admin@gmail.com" }, { email: /^khachhang\d{2}@example\.test$/ }] }),
      categories: await count(Category, { slug: { $in: ["mang-nha-kinh", "mang-xoi", "bat-lot-ho-hdpe", "luoi-nha-kinh", "mang-phu-luong", "khung-va-ket-cau-nha-kinh", "phu-kien-nha-kinh", "he-thong-tuoi", "vuon-uom-va-cham-soc-cay", "gia-the-trong-cay"] } }),
      brands: await count(require("../models/Brand"), { slug: { $in: ["nha-kinh-cong-nghe-cao-da-lat", "dalat-greenhouse", "agrifarm-viet", "greentech", "nong-nghiep-xanh", "irritech", "vuon-viet", "agropro", "mang-viet", "tuoi-thong-minh"] } }),
      products: await count(Product, { slug: /^mau-\d{2}-/ }),
      variants: await count(Variant, { sku: /^HS-MAU-/ }),
      addresses: await count(Address), carts: await count(Cart), wishlists: await count(Wishlist),
      coupons: await count(Coupon, { code: /^DALAT\d{2}$/ }), couponRedemptions: await count(CouponRedemption),
      orders: await count(Order, { orderNumber: /^DEMO-/ }), orderItems: await count(OrderItem), payments: await count(Payment),
      reviews: await count(Review), notifications: await count(Notification),
      banners: await count(Banner, { seedKey: /^demo-dalat-/ }),
    },
  }, null, 2));
}

run().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error(`${error.name}: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
