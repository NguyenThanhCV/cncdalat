import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Page, Table, Btn, Danger, Modal } from "../components/UI";
import { users } from "../api";
import { canAdmin, getAdminUser, isAdmin } from "../utils/adminPermissions";

const roles = ["customer", "staff", "manager", "admin"];
const roleLabels = { customer: "Khách hàng", staff: "Nhân viên", manager: "Quản lý", admin: "Admin" };
const statusLabels = { active: "Hoạt động", blocked: "Đã khóa", inactive: "Không hoạt động" };
const emptyUser = { name: "", email: "", phone: "", password: "", role: "staff" };

export default function Users() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const admin = isAdmin();
  const canStatus = canAdmin("user.status");
  const canDelete = canAdmin("user.delete");
  const currentUserId = getAdminUser()?._id;

  const load = async () => {
    setError("");
    try {
      const response = await users.list({ page: 1, limit: 100, ...(query ? { search: query } : {}), ...(role ? { role } : {}), ...(status ? { status } : {}) });
      const data = response.data?.data ?? response.data;
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  };
  const showAll = async () => {
    setQuery("");
    setRole("");
    setStatus("");
    setError("");
    try {
      const response = await users.list({ page: 1, limit: 100 });
      const data = response.data?.data ?? response.data;
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  };
  useEffect(() => { load(); }, [role, status]);

  const toggleStatus = async (user) => {
    try { await users.status(user._id, user.status === "active" ? "blocked" : "active"); await load(); }
    catch (e) { setError(e.response?.data?.message || e.message); }
  };
  const changeRole = async (user, nextRole) => {
    try { await users.role(user._id, nextRole); await load(); }
    catch (e) { setError(e.response?.data?.message || e.message); }
  };
  const createUser = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await users.create(form);
      setOpen(false); setForm(emptyUser); await load();
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };
  const deleteUser = async (user) => {
    if (user._id === currentUserId) { setError("Không thể xóa tài khoản đang đăng nhập."); return; }
    if (!window.confirm(`Xóa tài khoản ${user.name} (${user.email})? Thao tác này không thể hoàn tác.`)) return;
    try { await users.remove(user._id); await load(); } catch (e) { setError(e.response?.data?.message || e.message); }
  };

  return <Page title="Người dùng" actions={<><Btn onClick={load}>↻ Làm mới</Btn>{admin && <Btn className="primary" onClick={() => { setForm(emptyUser); setError(""); setOpen(true); }}>+ Thêm tài khoản</Btn>}</>}>
    <div className="toolbar"><input placeholder="Tìm tên, email, điện thoại…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} /><select value={role} onChange={(e) => setRole(e.target.value)}><option value="">Tất cả vai trò</option>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{Object.keys(statusLabels).map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select><Btn onClick={load}>Tìm</Btn><Btn onClick={showAll}>Tất cả</Btn></div>
    {error && !open && <div className="error">{error}</div>}
    <Table rows={rows} columns={[
      { key: "name", label: "Người dùng", render: (user) => <div><b>{user.name}</b><small>{user.email}</small></div> },
      { key: "phone", label: "Điện thoại", render: (user) => user.phone || "—" },
      { key: "role", label: "Vai trò", render: (user) => admin ? <select value={user.role} onChange={(e) => changeRole(user, e.target.value)}>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select> : roleLabels[user.role] || user.role },
      { key: "status", label: "Trạng thái", render: (user) => <span className={`status-pill ${user.status}`}>{statusLabels[user.status] || user.status}</span> },
      { key: "lastLoginAt", label: "Đăng nhập cuối", render: (user) => user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa có" },
      { key: "actions", label: "Thao tác", render: (user) => <span className="actions"><Link className="btn small" to={`/admin/users/${user._id}`}>Chi tiết / sửa</Link>{canStatus && <Btn onClick={() => toggleStatus(user)}>{user.status === "active" ? "Khóa" : "Mở"}</Btn>}{canDelete && user._id !== currentUserId && <Danger onClick={() => deleteUser(user)}>Xóa</Danger>}</span> },
    ]} />
    {open && <Modal title="Thêm tài khoản" onClose={() => setOpen(false)}><form className="formgrid" onSubmit={createUser}>
      {error && <div className="error full">{error}</div>}
      <label>Họ tên *<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>Email *<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Mật khẩu tạm *<input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <label>Số điện thoại<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label>Vai trò<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></label>
      <div className="full"><Btn type="button" onClick={() => setOpen(false)}>Hủy</Btn> <Btn className="primary" type="submit" disabled={saving}>{saving ? "Đang tạo…" : "Tạo tài khoản"}</Btn></div>
    </form></Modal>}
  </Page>;
}
