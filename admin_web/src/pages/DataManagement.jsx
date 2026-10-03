import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Btn, Danger, Modal, Page, Table } from "../components/UI";
import {
  addresses,
  banners,
  brands,
  carts,
  categories,
  coupons,
  newsArticles,
  newsCategories,
  notifications,
  orderItems,
  orders,
  payments,
  products,
  promotions,
  reviews,
  siteMedia,
  users,
  variants,
  wishlists,
} from "../api";
import { canAdmin } from "../utils/adminPermissions";

const PAGE_SIZE = 50;
const STOREFRONT_CONTENT_KEYS = new Set([
  "products",
  "categories",
  "brands",
  "coupons",
  "promotions",
  "newsArticles",
  "newsCategories",
  "banners",
  "siteMedia",
]);

// Each entry documents the database fields, their client routes, and the
// dedicated screen used where generic JSON editing would be unsafe.
const resources = [
  {
    key: "products",
    label: "Sản phẩm",
    group: "product",
    api: products,
    columns: [
      ["_id", "ID"],
      ["name", "Tên sản phẩm"],
      ["slug", "Đường dẫn (slug)"],
      ["category", "Danh mục"],
      ["brand", "Thương hiệu"],
      ["featured", "Nổi bật"],
      ["status", "Trạng thái"],
    ],
    refs: ["category", "brand"],
    tablePath: "/ · /products · /products/:productId",
    clientPath: "/ · sản phẩm nổi bật; /products · danh sách; /products/:productId · chi tiết",
    guide:
      "Quản lý tên, mô tả, danh mục, thương hiệu và media sản phẩm. Giá, SKU, thuộc tính và tồn kho nằm ở Phiên bản sản phẩm. Khi tạo sản phẩm, nhập danh mục hợp lệ và trường variant có giá, SKU.",
  },
  {
    key: "variants",
    label: "Phiên bản sản phẩm",
    group: "variant",
    api: variants,
    columns: [
      ["_id", "ID"],
      ["product", "Sản phẩm"],
      ["sku", "SKU"],
      ["price", "Giá bán"],
      ["stock", "Tồn kho"],
      ["active", "Đang bán"],
    ],
    refs: ["product"],
    clientPath: "/ · giá thẻ sản phẩm; /products/:productId · giá và lựa chọn quy cách",
    guide:
      "Mỗi phiên bản là một SKU để bán, lưu giá, tồn kho, thuộc tính và media. Trường product phải là ID của sản phẩm có thật.",
  },
  {
    key: "categories",
    label: "Danh mục",
    group: "category",
    api: categories,
    columns: [
      ["_id", "ID"],
      ["name", "Tên danh mục"],
      ["nameEn", "Tên tiếng Anh"],
      ["slug", "Đường dẫn (slug)"],
      ["parent", "Danh mục cha"],
      ["status", "Trạng thái"],
    ],
    refs: ["parent"],
    tablePath: "/ · /categories · /products?category=:categoryId",
    clientPath: "/ · thẻ danh mục; /categories · danh sách; /products?category=:categoryId · sản phẩm đã lọc",
    guide:
      "Danh mục hỗ trợ phân loại sản phẩm. image dùng ở /categories; homeImage được ưu tiên trên thẻ danh mục trang chủ. Danh mục cha nhập bằng ID danh mục.",
  },
  {
    key: "brands",
    label: "Thương hiệu",
    group: "brand",
    api: brands,
    columns: [
      ["_id", "ID"],
      ["name", "Tên thương hiệu"],
      ["nameEn", "Tên tiếng Anh"],
      ["slug", "Đường dẫn (slug)"],
      ["status", "Trạng thái"],
    ],
    tablePath: "/ · /brands · /products?brand=:brandId",
    clientPath: "/ · thương hiệu nổi bật; /brands · danh sách; /products?brand=:brandId · sản phẩm đã lọc",
    guide: "Thương hiệu có thể có logo/ảnh, mô tả, website và trạng thái hiển thị.",
  },
  {
    key: "users",
    label: "Người dùng",
    group: "user",
    api: users,
    dedicatedRoute: "/admin/users",
    dedicatedAction: "Quản lý tài khoản",
    columns: [
      ["_id", "ID"],
      ["name", "Tên người dùng"],
      ["email", "Email"],
      ["phone", "Điện thoại"],
      ["role", "Vai trò"],
      ["status", "Trạng thái"],
    ],
    clientPath: "/login, /register · đăng nhập; /account · thông tin khách hàng",
    guide:
      "Tài khoản, vai trò và quyền được chỉnh trong Quản lý tài khoản để giữ đúng quy tắc phân quyền. Bảng chung chỉ cung cấp lối tắt đến trang quản lý riêng.",
  },
  {
    key: "coupons",
    label: "Mã giảm giá",
    group: "coupon",
    api: coupons,
    columns: [
      ["_id", "ID"],
      ["code", "Mã"],
      ["name", "Tên chương trình"],
      ["type", "Kiểu giảm"],
      ["value", "Giá trị"],
      ["startDate", "Bắt đầu"],
      ["endDate", "Kết thúc"],
      ["status", "Trạng thái"],
    ],
    refs: ["applicableProducts", "applicableCategories", "excludedProducts"],
    tablePath: "/promotions · /checkout",
    clientPath: "/promotions · mã đang áp dụng; /checkout · nhập và áp dụng mã",
    guide:
      "Mã chỉ xuất hiện trên trang ưu đãi khi đang bật, đúng thời hạn và còn lượt dùng. Nhập ngày theo ISO; danh sách sản phẩm/danh mục áp dụng dùng ID.",
  },
  {
    key: "promotions",
    label: "Chương trình khuyến mãi",
    group: "promotion",
    api: promotions,
    idKey: "id",
    columns: [
      ["_id", "ID"],
      ["id", "Mã chương trình"],
      ["name", "Tên chương trình"],
      ["scope", "Phạm vi"],
      ["type", "Kiểu giảm"],
      ["value", "Giá trị"],
      ["startDate", "Bắt đầu"],
      ["endDate", "Kết thúc"],
      ["status", "Trạng thái"],
    ],
    refs: ["productIds", "categoryIds", "brandIds"],
    tablePath: "/promotions · /products?deal=:promotionId · /checkout",
    clientPath: "/promotions · chương trình hiện hành; /products?deal=:promotionId · sản phẩm trong deal; /checkout · tự áp dụng",
    guide:
      "Khuyến mãi áp dụng theo productIds, categoryIds hoặc brandIds tương ứng scope. Chỉ chương trình active và trong thời hạn mới được public API trả về.",
  },
  {
    key: "addresses",
    label: "Địa chỉ giao hàng",
    group: "address",
    api: addresses,
    columns: [
      ["_id", "ID"],
      ["user", "Khách hàng"],
      ["fullName", "Người nhận"],
      ["phone", "Điện thoại"],
      ["address", "Địa chỉ"],
      ["ward", "Phường/xã"],
      ["district", "Quận/huyện"],
      ["province", "Tỉnh/thành"],
    ],
    refs: ["user"],
    clientPath: "/addresses · sổ địa chỉ; /checkout · chọn địa chỉ giao hàng",
    guide: "Địa chỉ gắn với tài khoản khách. user phải là ID người dùng hợp lệ.",
  },
  {
    key: "carts",
    label: "Giỏ hàng",
    group: "cart",
    api: carts,
    columns: [
      ["_id", "ID"],
      ["user", "Khách hàng"],
      ["items", "Dòng sản phẩm"],
      ["updatedAt", "Cập nhật"],
    ],
    refs: ["user"],
    clientPath: "/cart · giỏ hàng; /checkout · sản phẩm đặt mua",
    guide:
      "Mỗi khách có một giỏ hàng. Mỗi dòng chứa product ID, variant ID, số lượng và giá lúc thêm. Đây là dữ liệu mua hàng đang diễn ra.",
  },
  {
    key: "wishlists",
    label: "Danh sách yêu thích",
    group: "wishlist",
    api: wishlists,
    columns: [
      ["_id", "ID"],
      ["user", "Khách hàng"],
      ["products", "Sản phẩm yêu thích"],
      ["updatedAt", "Cập nhật"],
    ],
    refs: ["user", "products"],
    clientPath: "/wishlist · sản phẩm đã lưu; /products và /products/:productId · nút yêu thích",
    guide: "Mỗi khách có một danh sách yêu thích; products là mảng ID sản phẩm.",
  },
  {
    key: "orders",
    label: "Đơn hàng",
    group: "order",
    api: orders,
    dedicatedRoute: "/admin/orders",
    dedicatedAction: "Mở quản lý đơn",
    columns: [
      ["_id", "ID"],
      ["orderNumber", "Mã đơn"],
      ["user", "Khách hàng"],
      ["orderStatus", "Trạng thái đơn"],
      ["paymentStatus", "Trạng thái thanh toán"],
      ["total", "Tổng tiền"],
      ["createdAt", "Ngày tạo"],
    ],
    refs: ["user", "coupon"],
    clientPath: "/orders · lịch sử đơn; /orders/:id · chi tiết đơn",
    guide:
      "Đơn hàng cần được cập nhật ở màn quản lý đơn để đồng bộ trạng thái, thanh toán và tồn kho. Bảng chung chỉ dẫn đến trang quản lý riêng.",
  },
  {
    key: "notifications",
    label: "Thông báo",
    group: "notification",
    api: notifications,
    columns: [
      ["_id", "ID"],
      ["user", "Người nhận"],
      ["type", "Loại"],
      ["title", "Tiêu đề"],
      ["isRead", "Đã đọc"],
      ["createdAt", "Ngày tạo"],
    ],
    refs: ["user"],
    clientPath: "/notifications · thông báo trong tài khoản khách",
    guide: "Thông báo gắn với người nhận; data có thể chứa thông tin liên kết dạng JSON.",
  },
  {
    key: "payments",
    label: "Thanh toán",
    group: "payment",
    api: payments,
    columns: [
      ["_id", "ID"],
      ["order", "Đơn hàng"],
      ["user", "Khách hàng"],
      ["method", "Phương thức"],
      ["amount", "Số tiền"],
      ["status", "Trạng thái"],
      ["transactionId", "Mã giao dịch"],
    ],
    refs: ["order", "user"],
    clientPath: "Dữ liệu đối soát nội bộ; trạng thái khách xem tại /orders/:id",
    guide:
      "Bản ghi thanh toán phải khớp xác nhận cổng thanh toán và đơn hàng. Sửa/xóa có thể ảnh hưởng đối soát; chỉ quản lý tại màn chuyên dụng.",
  },
  {
    key: "reviews",
    label: "Đánh giá",
    group: "review",
    api: reviews,
    columns: [
      ["_id", "ID"],
      ["product", "Sản phẩm"],
      ["user", "Khách hàng"],
      ["rating", "Số sao"],
      ["title", "Tiêu đề"],
      ["status", "Trạng thái"],
    ],
    refs: ["product", "user", "order"],
    clientPath: "/products/:productId · đánh giá đã duyệt",
    guide:
      "Đánh giá liên kết sản phẩm và khách hàng; status gồm pending, approved, rejected. Chỉ trạng thái được duyệt được công khai.",
  },
  {
    key: "orderItems",
    label: "Dòng sản phẩm đơn hàng",
    group: "orderItem",
    api: orderItems,
    columns: [
      ["_id", "ID"],
      ["order", "Đơn hàng"],
      ["productName", "Tên sản phẩm đã mua"],
      ["sku", "SKU"],
      ["price", "Đơn giá"],
      ["quantity", "Số lượng"],
      ["total", "Thành tiền"],
    ],
    refs: ["order", "product", "variant"],
    clientPath: "/orders/:id · sản phẩm và giá đã chốt lúc mua",
    guide:
      "Đây là ảnh chụp lịch sử lúc mua. Chỉnh sửa không tự tính lại tổng đơn, giao dịch hoặc tồn kho.",
  },
  {
    key: "newsArticles",
    label: "Bài viết",
    group: "newsArticle",
    api: newsArticles,
    columns: [
      ["_id", "ID"],
      ["title", "Tiêu đề"],
      ["titleEn", "Tiêu đề tiếng Anh"],
      ["slug", "Đường dẫn (slug)"],
      ["status", "Trạng thái"],
    ],
    refs: ["category", "author"],
    tablePath: "/ · /news · /news/:slug",
    clientPath: "/news · danh sách; /news/:slug · nội dung bài; / · 3 bài mới nhất",
    guide:
      "Bài chỉ hiện công khai khi đã xuất bản. Nội dung song ngữ, ảnh bìa, danh mục và SEO lưu trong bản ghi.",
  },
  {
    key: "newsCategories",
    label: "Danh mục tin tức",
    group: "newsCategory",
    api: newsCategories,
    columns: [
      ["_id", "ID"],
      ["name", "Tên danh mục"],
      ["nameEn", "Tên tiếng Anh"],
      ["slug", "Đường dẫn (slug)"],
      ["status", "Trạng thái"],
    ],
    tablePath: "/news",
    clientPath: "/news · bộ lọc danh mục và nhãn bài viết",
    guide: "Danh mục phân loại bài viết; slug dùng trong bộ lọc tin tức.",
  },
  {
    key: "banners",
    label: "Banner",
    group: "banner",
    api: banners,
    columns: [
      ["_id", "ID"],
      ["name", "Tên"],
      ["pageKey", "Vị trí trang"],
      ["title", "Tiêu đề"],
      ["imageUrl", "Link media"],
      ["status", "Trạng thái"],
    ],
    tablePath: "Theo pageKey · / không hiển thị",
    clientPath:
      "BannerSlider theo pageKey: /products, /categories, /brands, /news, /news/:slug, /about, /contact, /faq, /privacy, /terms, /cart, /checkout, /orders, /orders/:id, /wishlist, /notifications, /addresses, /account. / (home) hiện không render banner.",
    guide:
      "Banner chỉ hiện khi active và trong thời gian bắt đầu/kết thúc. pageKey phải khớp route; home được lưu trong DB nhưng hiện không hiển thị vì trang chủ dùng hero riêng.",
  },
  {
    key: "siteMedia",
    label: "Thư viện ảnh/video",
    group: "siteMedia",
    api: siteMedia,
    columns: [
      ["_id", "ID"],
      ["key", "Khóa vị trí"],
      ["label", "Tên hiển thị"],
      ["mediaUrl", "Link media"],
      ["mediaType", "Loại media"],
      ["status", "Trạng thái"],
    ],
    tablePath: "Theo key · / · /news · toàn website",
    clientPath:
      "key=storefront-hero → / (hero); key=store-logo → header, footer, /login; key=news-hero → /news",
    guide:
      "Media chỉ nối với giao diện khi key được client sử dụng. Các key chưa có trong danh sách trên chưa được xác nhận đang hiển thị ở route nào.",
  },
];

const templates = {
  products: {
    name: "",
    slug: "",
    category: "",
    brand: null,
    status: "draft",
    description: "",
    descriptionEn: "",
    thumbnail: "",
    images: [],
    video: "",
    attributes: {},
    variant: { sku: "", price: 0, stock: 0, attributes: {} },
  },
  variants: { product: "", sku: "", attributes: {}, price: 0, stock: 0, active: true },
  categories: { name: "", nameEn: "", slug: "", description: "", image: "", homeImage: "", parent: null, status: "active", sortOrder: 0 },
  brands: { name: "", nameEn: "", slug: "", logo: "", description: "", website: "", status: "active", sortOrder: 0 },
  coupons: { code: "", name: "", nameEn: "", type: "percentage", value: 0, minOrderValue: 0, maxDiscount: null, usageLimit: null, usageLimitPerUser: 1, startDate: null, endDate: null, applicableProducts: [], applicableCategories: [], excludedProducts: [], status: "active" },
  promotions: { id: "", name: "", nameEn: "", scope: "product", productIds: [], categoryIds: [], brandIds: [], type: "percent", value: 0, startDate: null, endDate: null, status: "inactive" },
  addresses: { user: "", fullName: "", phone: "", province: "", district: "", ward: "", address: "", note: "", latitude: null, longitude: null, isDefault: false },
  carts: { user: "", items: [] },
  wishlists: { user: "", products: [] },
  notifications: { user: "", type: "system", title: "", message: "", data: {}, isRead: false },
  payments: { order: "", user: "", method: "cod", amount: 0, currency: "VND", status: "pending", provider: "", transactionId: "", metadata: {} },
  reviews: { product: "", user: "", order: null, rating: 5, title: "", content: "", images: [], videos: [], verifiedPurchase: false, status: "pending" },
  orderItems: { order: "", product: "", variant: "", productName: "", variantName: "", sku: "", attributes: {}, price: 0, quantity: 1, discount: 0, total: 0 },
  newsArticles: { title: "", titleEn: "", slug: "", excerpt: "", excerptEn: "", content: "", contentEn: "", coverImage: "", category: "", author: null, tags: [], status: "draft", readingMinutes: 3 },
  newsCategories: { name: "", nameEn: "", slug: "", description: "", coverImage: "", sortOrder: 0, status: "active" },
  banners: { name: "", pageKey: "products", imageUrl: "", mediaType: "image", mobileImageUrl: "", mobileMediaType: "image", title: "", titleEn: "", description: "", descriptionEn: "", status: "inactive", sortOrder: 0 },
  siteMedia: { key: "", label: "", mediaUrl: "", mediaType: "image", altText: "", status: "active" },
};

function unwrapList(response) {
  const body = response?.data ?? response;
  const rows = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body?.data?.data)
        ? body.data.data
        : [];
  return {
    rows,
    total: Number(
      body?.pagination?.total ??
        body?.data?.pagination?.total ??
        body?.total ??
        rows.length,
    ),
  };
}

function relationId(value) {
  return value && typeof value === "object"
    ? value._id || value.id || value
    : value;
}

function rowId(row) {
  return String(row?._id || row?.id || "");
}

function apiId(row, resource) {
  return String(row?.[resource.idKey || "_id"] || row?._id || row?.id || "");
}

function cleanRecord(row, refs = []) {
  const copy = JSON.parse(JSON.stringify(row || {}));
  delete copy._id;
  delete copy.id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  for (const key of refs) {
    if (copy[key] !== undefined) {
      copy[key] = Array.isArray(copy[key])
        ? copy[key].map(relationId)
        : relationId(copy[key]);
    }
  }
  if (Array.isArray(copy.items)) {
    copy.items = copy.items.map((item) => ({
      ...item,
      product: relationId(item.product),
      variant: relationId(item.variant),
    }));
  }
  return copy;
}

function display(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (Array.isArray(value)) {
    return (
      value
        .map((item) =>
          typeof item === "object"
            ? item.name || item._id || JSON.stringify(item)
            : item,
        )
        .join(", ") || "—"
    );
  }
  if (typeof value === "object") {
    return value.name || value.title || value.code || value.orderNumber || value._id || JSON.stringify(value);
  }
  return String(value);
}

export default function DataManagement() {
  const available = resources.filter(
    (resource) =>
      STOREFRONT_CONTENT_KEYS.has(resource.key) &&
      canAdmin(`${resource.group}.read`),
  );
  const [resourceKey, setResourceKey] = useState(available[0]?.key || "products");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [json, setJson] = useState("{}");
  const [saving, setSaving] = useState(false);

  const resource = resources.find((item) => item.key === resourceKey) || available[0];
  const canCreate = resource && !resource.dedicatedRoute && canAdmin(`${resource.group}.create`);
  const canUpdate = resource && !resource.dedicatedRoute && canAdmin(`${resource.group}.update`);
  const canDelete = resource && !resource.dedicatedRoute && canAdmin(`${resource.group}.delete`);

  const load = async (targetPage = page, targetResource = resource) => {
    if (!targetResource) return;
    setLoading(true);
    setError("");
    try {
      const response =
        targetResource.key === "siteMedia"
          ? await targetResource.api.list()
          : await targetResource.api.list({ page: targetPage, limit: PAGE_SIZE, sort: "newest" });
      const result = unwrapList(response);
      setRows(
        targetResource.key === "siteMedia"
          ? result.rows.slice((targetPage - 1) * PAGE_SIZE, targetPage * PAGE_SIZE)
          : result.rows,
      );
      setTotal(result.total);
      setPage(targetPage);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resource) load(1, resource);
    // Resource changes are the only trigger; load reads the selected resource.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey]);

  const filtered = useMemo(
    () => rows.filter((row) => !query || JSON.stringify(row).toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  );
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openForm = (row) => {
    setEditing(row || null);
    setJson(JSON.stringify(row ? cleanRecord(row, resource.refs) : templates[resource.key] || {}, null, 2));
    setError("");
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = JSON.parse(json);
      if (!data || Array.isArray(data) || typeof data !== "object") {
        throw new Error("Mỗi bản ghi phải là một đối tượng JSON.");
      }
      if (editing) await resource.api.update(apiId(editing, resource), data);
      else await resource.api.create(data);
      setOpen(false);
      await load(editing ? page : 1, resource);
    } catch (saveError) {
      setError(
        saveError instanceof SyntaxError
          ? "JSON chưa hợp lệ. Kiểm tra dấu ngoặc kép, dấu phẩy và kiểu dữ liệu."
          : saveError.response?.data?.message || saveError.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const name = row.name || row.title || row.code || rowId(row);
    if (!window.confirm(`Xóa bản ghi “${name}” trong nhóm “${resource.label}”? Thao tác không thể hoàn tác.`)) return;

    if (resource.key === "products") {
      try {
        const result = unwrapList(await variants.list({ product: rowId(row), page: 1, limit: 100 }));
        if (
          result.total &&
          !window.confirm(`Sản phẩm đang có ${result.total} phiên bản. Xóa sản phẩm sẽ xóa cả phiên bản này. Bạn có muốn tiếp tục?`)
        ) return;
      } catch (loadError) {
        setError(loadError.response?.data?.message || loadError.message);
        return;
      }
    }

    try {
      await resource.api.remove(apiId(row, resource));
      await load(rows.length === 1 && page > 1 ? page - 1 : page, resource);
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || deleteError.message);
    }
  };

  const columns = resource
    ? [
        {
          key: "_id",
          label: "ID",
          render: (row) => (
            <button
              className="ghost"
              title={rowId(row)}
              onClick={() => navigator.clipboard?.writeText(rowId(row))}>
              {rowId(row).slice(0, 10) || "—"}
            </button>
          ),
        },
        {
          key: "frontendPath",
          label: "Đường dẫn frontend",
          render: () => (
            <div className="frontend-path-cell" title={resource.clientPath}>
              <code>{resource.tablePath || resource.clientPath}</code>
            </div>
          ),
        },
        ...resource.columns
          .filter(([key]) => key !== "_id")
          .map(([key, label]) => ({ key, label, render: (row) => display(row[key]) })),
        {
          key: "actions",
          label: "Thao tác",
          render: (row) => (
            <span className="actions">
              {resource.dedicatedRoute && (
                <Link className="btn small" to={`${resource.dedicatedRoute}/${rowId(row)}`}>
                  {resource.dedicatedAction}
                </Link>
              )}
              {canUpdate && <Btn onClick={() => openForm(row)}>Sửa</Btn>}
              {canDelete && <Danger onClick={() => remove(row)}>Xóa</Danger>}
            </span>
          ),
        },
      ]
    : [];

  if (!available.length) {
    return (
      <Page title="Nội dung website">
        <div className="info-banner">Tài khoản hiện tại chưa có quyền xem nội dung website trong màn hình này.</div>
      </Page>
    );
  }

  return (
    <Page
      title={`Nội dung website · ${resource.label}`}
      actions={
        <>
          <Btn onClick={() => load(page, resource)}>↻ Làm mới</Btn>
          {canCreate && <Btn className="primary" onClick={() => openForm(null)}>+ Thêm mới</Btn>}
        </>
      }>
      <p className="muted storefront-content-intro">
        Chỉ gồm dữ liệu nội dung và hình ảnh/video được dùng trên website khách hàng. Tài khoản, đơn hàng, thanh toán, giỏ hàng và dữ liệu vận hành được quản lý ở các mục riêng trong menu.
      </p>
      <div className="data-manager-controls">
        <label>
          Nội dung hiển thị
          <select
            value={resource.key}
            onChange={(event) => {
              setResourceKey(event.target.value);
              setQuery("");
              setPage(1);
            }}>
            {available.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Tìm trong trang hiện tại
          <input
            placeholder="Nhập từ khóa tìm kiếm…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="muted">Trang {page}/{pages} · {filtered.length} dòng đang khớp / {total} tổng</span>
      </div>

      <div className="info-banner data-management-guide">
        <p><b>Nơi hiển thị trên website:</b> <code>{resource.clientPath}</code></p>
        <p><b>Cách quản lý:</b> {resource.guide}</p>
        <p>Quan hệ giữa dữ liệu được nhập bằng ID; có thể sao chép ID ở cột đầu. Biểu mẫu lưu JSON theo cấu trúc database. Tìm kiếm chỉ xét tối đa {PAGE_SIZE} dòng của trang đang mở.</p>
      </div>

      {error && !open && <div className="error">{error}</div>}
      {loading ? <div className="panel">Đang tải dữ liệu…</div> : <Table rows={filtered} columns={columns} />}
      <div className="product-pagination">
        <span className="muted">Trang {page}/{pages}</span>
        <div>
          <Btn disabled={page <= 1 || loading} onClick={() => load(page - 1, resource)}>← Trang trước</Btn>
          <Btn disabled={page >= pages || loading} onClick={() => load(page + 1, resource)}>Trang sau →</Btn>
        </div>
      </div>

      {open && (
        <Modal
          title={editing ? `Sửa ${resource.label.toLowerCase()}` : `Thêm ${resource.label.toLowerCase()}`}
          onClose={() => setOpen(false)}>
          <form className="formgrid" onSubmit={save}>
            {error && <div className="error full">{error}</div>}
            <label className="full">
              Dữ liệu bản ghi (JSON)
              <textarea required rows="20" spellCheck="false" value={json} onChange={(event) => setJson(event.target.value)} />
              <small>Tạo mới: nhập các trường bắt buộc của nhóm dữ liệu. Khi sửa, ID và thời gian tạo/cập nhật do hệ thống quản lý.</small>
            </label>
            <div className="full">
              <Btn type="button" onClick={() => setOpen(false)}>Hủy</Btn>{" "}
              <Btn className="primary" disabled={saving}>{saving ? "Đang lưu…" : "Lưu dữ liệu"}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
