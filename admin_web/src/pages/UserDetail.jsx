import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Btn } from "../components/UI";
import { users } from "../api";
import { canAdmin, getAdminUser, isAdmin } from "../utils/adminPermissions";

const roleLabels = { customer: "Khách hàng", staff: "Nhân viên", manager: "Quản lý", admin: "Admin" };
const permissionGroups = ["user", "address", "brand", "category", "product", "variant", "cart", "coupon", "notification", "order", "orderItem", "payment", "review", "wishlist", "newsArticle", "newsCategory", "banner", "promotion", "siteMedia"];
const permissionNames = permissionGroups.flatMap(group => ["read", "create", "update", "delete"].map(action => `${group}.${action}`)).concat(["user.role", "user.permissions", "user.status", "order.cancel", "order.complete", "order.refund", "review.moderate", "inventory.read", "inventory.adjust", "report.read"]);
const staffPermissionNames = ["product.read", "product.update", "product.delete", "variant.read", "variant.update", "variant.delete", "category.read", "category.update", "category.delete", "brand.read", "brand.update", "brand.delete", "newsArticle.read", "newsArticle.update", "newsArticle.delete", "newsCategory.read", "newsCategory.update", "newsCategory.delete", "banner.read", "banner.update", "banner.delete", "order.read", "order.update", "order.complete", "order.cancel", "orderItem.read", "orderItem.update", "orderItem.delete", "payment.read", "payment.update", "payment.delete", "review.read", "review.update", "review.delete", "review.moderate", "inventory.read", "inventory.adjust", "coupon.read", "promotion.read", "siteMedia.read"];
const permissionLabels = { read: "Xem", create: "Thêm", update: "Sửa", delete: "Xóa" };
const permissionsForRole = role => role === "manager" ? permissionNames.filter(permission => !permission.endsWith(".create") && !["user.delete", "user.role", "user.permissions"].includes(permission)) : role === "staff" ? staffPermissionNames : [];

export default function UserDetail() {
  const { id } = useParams(), navigate = useNavigate();
  const [user, setUser] = useState(null), [form, setForm] = useState({}), [permissions, setPermissions] = useState([]), [error, setError] = useState(""), [saving, setSaving] = useState(false);
  const admin = isAdmin(), canUpdate = canAdmin("user.update"), canRole = canAdmin("user.role"), canPermissions = canAdmin("user.permissions"), canStatus = canAdmin("user.status");
  const load = async () => { setError(""); try { const response = await users.get(id); const data = response.data?.data ?? response.data; setUser(data); setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" }); setPermissions(data.permissions || []); } catch (e) { setError(e.response?.data?.message || e.message); } };
  useEffect(() => { load(); }, [id]);
  const save = async (action) => {
    setSaving(true); setError("");
    try {
      if (action === "profile") await users.update(id, form);
      if (action === "role") await users.role(id, form.role);
      if (action === "permissions") await users.permissions(id, permissions);
      if (action === "status") await users.status(id, form.status);
      await load();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };
  if (!user) return <Page title="Chi tiết người dùng"><div className="panel">{error || "Đang tải…"}</div></Page>;
  const togglePermission = (permission) => setPermissions(current => current.includes(permission) ? current.filter(item => item !== permission) : [...current, permission]);
  return <Page title={`Tài khoản: ${user.name}`} actions={<Btn onClick={() => navigate("/admin/users")}>← Danh sách người dùng</Btn>}>
    <div className="info-banner"><b>Thông tin và quyền của tài khoản.</b> Khách hàng không có quyền vào admin. Vai trò Admin có toàn quyền; thay đổi vai trò sẽ nạp lại bộ quyền mặc định tương ứng.</div>
    {error && <div className="error">{error}</div>}
    <section className="panel"><h2>Thông tin tài khoản</h2><div className="formgrid"><label>Họ tên<input value={form.name || ""} disabled={!canUpdate} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>Email<input type="email" value={form.email || ""} disabled={!canUpdate} onChange={e => setForm({ ...form, email: e.target.value })}/></label><label>Số điện thoại<input value={form.phone || ""} disabled={!canUpdate} onChange={e => setForm({ ...form, phone: e.target.value })}/></label><label>Trạng thái<select value={form.status || user.status} disabled={!canStatus} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Hoạt động</option><option value="blocked">Đã khóa</option><option value="inactive">Không hoạt động</option></select></label><div className="full actions">{canUpdate && <Btn className="primary" disabled={saving} onClick={() => save("profile")}>Lưu thông tin</Btn>}{canStatus && <Btn disabled={saving || form.status === user.status} onClick={() => save("status")}>Cập nhật trạng thái</Btn>}</div></div></section>
    {admin && <section className="panel"><h2>Vai trò</h2><p className="muted">Admin được toàn quyền. Quản lý và Nhân viên chỉ dùng các quyền được cấp bên dưới; tạo tài khoản mới vẫn dành cho Admin.</p><div className="formgrid"><label>Vai trò<select value={form.role || user.role} disabled={!canRole || user._id === getAdminUser()?._id} onChange={e => setForm({ ...form, role: e.target.value })}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="full"><Btn className="primary" disabled={saving || !canRole || form.role === user.role || user._id === getAdminUser()?._id} onClick={() => save("role")}>Lưu vai trò</Btn></div></div></section>}
    {admin && user.role !== "admin" && <section className="panel"><h2>Phân quyền chi tiết</h2><p className="muted">Chỉ quyền được hỗ trợ cho vai trò này mới xuất hiện. Quản lý không thể thêm mới hoặc quản trị tài khoản; Nhân viên không được quản lý người dùng hay thêm mới. Quyền được server kiểm tra lại.</p>{permissionsForRole(user.role).length===0?<p>Tài khoản Khách hàng không có quyền truy cập khu vực quản trị.</p>:<><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8,margin:"16px 0"}}>{permissionsForRole(user.role).map(permission => { const [group, action] = permission.split("."); return <label key={permission} style={{display:"flex",gap:8,alignItems:"flex-start",padding:8,border:"1px solid #e5e7eb",borderRadius:7}}><input type="checkbox" checked={permissions.includes(permission)} disabled={!canPermissions} onChange={() => togglePermission(permission)}/><span><b>{group}</b> · {permissionLabels[action] || action}<small style={{display:"block",color:"#64748b"}}>{permission}</small></span></label>; })}</div><div className="actions"><Btn className="primary" disabled={saving || !canPermissions} onClick={() => save("permissions")}>Lưu danh sách quyền</Btn><Btn disabled={saving} onClick={() => setPermissions([])}>Bỏ chọn tất cả</Btn></div></>}</section>}
    {admin && user.role === "admin" && <div className="info-banner">Tài khoản này là Admin nên luôn có đầy đủ quyền; danh sách quyền riêng không áp dụng.</div>}
  </Page>;
}
