import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { siteMedia } from "../api";
import MediaPreview from "../components/MediaPreview";
import { canAdmin, getAdminUser } from "../utils/adminPermissions";
import "./AdminLayout.css";

const groups = [
  ["TỔNG QUAN", [["Dashboard", "/admin"]]],
  ["BÁN HÀNG", [
    ["Sản phẩm", "/admin/products", "product.read"], ["Danh mục", "/admin/categories", "category.read"],
    ["Khuyến mãi", "/admin/promotions", "promotion.read"], ["Thương hiệu", "/admin/brands", "brand.read"],
    ["Đơn hàng", "/admin/orders", "order.read"], ["Chi tiết đơn", "/admin/order-items", "orderItem.read"],
    ["Thanh toán", "/admin/payments", "payment.read"], ["Đánh giá", "/admin/reviews", "review.read"],
    ["Mã giảm giá", "/admin/coupons", "coupon.read"],
  ]],
  ["NỘI DUNG", [
    ["Banner", "/admin/banners", "banner.read"], ["Tin tức", "/admin/news", "newsArticle.read"],
    ["Thư viện media", "/admin/media", "siteMedia.read"],
  ]],
  ["KHÁCH HÀNG", [["Người dùng", "/admin/users", "user.read"], ["Địa chỉ giao hàng", "/admin/addresses", "address.read"]]],
  ["DỮ LIỆU", [
    ["Giỏ hàng khách", "/admin/carts", "cart.read"], ["Sản phẩm yêu thích", "/admin/wishlists", "wishlist.read"],
    ["Thông báo hệ thống", "/admin/notifications", "notification.read"],
  ]],
];
const roleNames = { admin: "Quản trị viên", manager: "Quản lý", staff: "Nhân viên" };

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = getAdminUser() || {};
  const [logo, setLogo] = useState("");
  useEffect(() => {
    siteMedia.list().then((response) => {
      const rows = response?.data?.data || [];
      setLogo(rows.find((row) => row.key === "store-logo")?.mediaUrl || "");
    }).catch(() => {});
  }, []);

  return <div className="shell">
    <aside>
      <div className="logo admin-logo">{logo && <MediaPreview src={logo} alt="Logo Nhà kính công nghệ cao Đà Lạt" />}<span><strong>NHÀ KÍNH ĐÀ LẠT</strong><small>QUẢN TRỊ CỬA HÀNG</small></span></div>
      {groups.map(([title, links]) => {
        const visible = links.filter(([, , permission]) => !permission || canAdmin(permission, user));
        return visible.length ? <div className="navgroup" key={title}><small>{title}</small>{visible.map(([label, path]) => <NavLink end={path === "/admin"} className={({ isActive }) => isActive ? "active" : ""} to={path} key={path}>{label}</NavLink>)}</div> : null;
      })}
    </aside>
    <main>
      <header><div><b>Quản trị cửa hàng</b><span className="muted"> / {roleNames[user.role] || ""} · {user.name || user.email || "Admin"}</span></div><button className="ghost" onClick={() => { dispatch({ type: "LOGOUT" }); navigate("/login"); }}>Đăng xuất</button></header>
      <section className="content"><Outlet /></section>
    </main>
  </div>;
}
