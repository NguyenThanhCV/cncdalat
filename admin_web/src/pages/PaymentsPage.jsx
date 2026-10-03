import React, { useEffect, useMemo, useState } from "react";
import { Page, Table, Money, Btn, Danger, Modal } from "../components/UI";
import { payments, orders, users } from "../api";
import { fmtDate } from "../utils/helpers";
import { canAdmin } from "../utils/adminPermissions";

const labels = { pending: "Chờ", paid: "Đã thanh toán", failed: "Lỗi", cancelled: "Đã hủy", refunded: "Hoàn tiền" };
const blank = { order: "", user: "", method: "cod", amount: "", currency: "VND", status: "pending", provider: "", transactionId: "", paidAt: "", failedAt: "", metadata: "{}" };
const getRows = (response) => { const data = response.data?.data ?? response.data; return Array.isArray(data) ? data : data?.data || []; };

export default function PaymentsPage() {
  const [rows, setRows] = useState([]), [ordersList, setOrdersList] = useState([]), [usersList, setUsersList] = useState([]);
  const [query, setQuery] = useState(""), [statusFilter, setStatusFilter] = useState(""), [error, setError] = useState("");
  const [open, setOpen] = useState(false), [editing, setEditing] = useState(null), [form, setForm] = useState(blank), [saving, setSaving] = useState(false);
  const canCreate = canAdmin("payment.create"), canUpdate = canAdmin("payment.update"), canDelete = canAdmin("payment.delete");
  const load = async () => {
    setError("");
    const [p, o, u] = await Promise.allSettled([payments.list({ page: 1, limit: 100 }), orders.list({ page: 1, limit: 100 }), users.list({ page: 1, limit: 100 })]);
    if (p.status === "fulfilled") setRows(getRows(p.value)); else setError(p.reason.response?.data?.message || p.reason.message);
    if (o.status === "fulfilled") setOrdersList(getRows(o.value));
    if (u.status === "fulfilled") setUsersList(getRows(u.value));
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => rows.filter(row => (!statusFilter || row.status === statusFilter) && (!query || `${row.transactionId || ""} ${row.order?.orderNumber || ""} ${row.user?.name || ""}`.toLowerCase().includes(query.toLowerCase()))), [rows, query, statusFilter]);
  const showForm = (row) => {
    setEditing(row || null);
    const toInputDate = value => value ? new Date(value).toISOString().slice(0,16) : "";
    setForm(row ? { order: row.order?._id || row.order || "", user: row.user?._id || row.user || "", method: row.method || "cod", amount: row.amount ?? "", currency: row.currency || "VND", status: row.status || "pending", provider: row.provider || "", transactionId: row.transactionId || "", paidAt: toInputDate(row.paidAt), failedAt: toInputDate(row.failedAt), metadata: JSON.stringify(row.metadata || {}, null, 2) } : { ...blank });
    setError(""); setOpen(true);
  };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, amount: Number(form.amount), paidAt: form.paidAt || null, failedAt: form.failedAt || null, metadata: JSON.parse(form.metadata || "{}") };
      if (editing) await payments.update(editing._id, payload); else await payments.create(payload);
      setOpen(false); await load();
    } catch (e) { setError(e instanceof SyntaxError ? "Metadata phải là JSON hợp lệ." : e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };
  const remove = async (row) => { if (!window.confirm(`Xóa giao dịch của đơn ${row.order?.orderNumber || row.order}? Hãy chỉ dùng để sửa bản ghi sai; thao tác không thể hoàn tác.`)) return; try { await payments.remove(row._id); await load(); } catch (e) { setError(e.response?.data?.message || e.message); } };
  return <Page title="Giao dịch thanh toán" actions={<><Btn onClick={load}>↻ Làm mới</Btn>{canCreate && <Btn className="primary" onClick={() => showForm(null)}>+ Thêm giao dịch</Btn>}</>}>
    <div className="info-banner"><b>Quản lý bản ghi thanh toán liên kết với đơn hàng.</b> Chỉ nhập giao dịch đã được xác nhận từ cổng hoặc đối soát. Sửa/xóa thủ công có thể làm lệch trạng thái đơn; các nút sẽ hiện theo quyền tài khoản.</div>
    <div className="toolbar"><input placeholder="Tìm mã giao dịch, đơn hàng, khách…" value={query} onChange={e => setQuery(e.target.value)} /><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {error && !open && <div className="error">{error}</div>}
    <div className="order-summary"><div><span>Giao dịch</span><b>{filtered.length}</b></div><div><span>Đã thanh toán</span><b>{filtered.filter(row => row.status === "paid").length}</b></div><div><span>Đang chờ</span><b>{filtered.filter(row => row.status === "pending").length}</b></div><div><span>Tổng tiền</span><b><Money v={filtered.reduce((sum, row) => sum + Number(row.amount || 0), 0)} /></b></div></div>
    <Table rows={filtered} columns={[{key:"order",label:"Đơn hàng",render:row=><b>{row.order?.orderNumber||row.order?._id||"—"}</b>},{key:"user",label:"Khách hàng",render:row=>row.user?.name||row.user?.email||"—"},{key:"method",label:"Phương thức",render:row=><span className="soft-badge">{row.method}</span>},{key:"amount",label:"Số tiền",render:row=><b><Money v={row.amount}/></b>},{key:"status",label:"Trạng thái",render:row=><span className={`status-pill ${row.status}`}>{labels[row.status]||row.status}</span>},{key:"provider",label:"Cổng",render:row=>row.provider||"—"},{key:"transactionId",label:"Mã giao dịch",render:row=>row.transactionId||"—"},{key:"createdAt",label:"Ngày",render:row=>fmtDate(row.createdAt)},{key:"actions",label:"Thao tác",render:row=><span className="actions">{canUpdate&&<Btn onClick={()=>showForm(row)}>Sửa</Btn>}{canDelete&&<Danger onClick={()=>remove(row)}>Xóa</Danger>}</span>}]}/>
    {open && <Modal title={editing ? "Sửa giao dịch" : "Thêm giao dịch"} onClose={() => setOpen(false)}><form className="formgrid" onSubmit={save}>{error&&<div className="error full">{error}</div>}<label>Đơn hàng<select required value={form.order} onChange={e=>setForm({...form,order:e.target.value})}><option value="">Chọn đơn hàng</option>{ordersList.map(row=><option key={row._id} value={row._id}>{row.orderNumber} · {row.customer?.fullName||row.user?.name||""}</option>)}{editing?.order?._id&&!ordersList.some(row=>row._id===form.order)&&<option value={form.order}>{editing.order.orderNumber||form.order}</option>}</select><small>Mỗi đơn hàng chỉ có một bản ghi thanh toán.</small></label><label>Khách hàng<select required value={form.user} onChange={e=>setForm({...form,user:e.target.value})}><option value="">Chọn khách hàng</option>{usersList.map(row=><option key={row._id} value={row._id}>{row.name} · {row.email}</option>)}{editing?.user?._id&&!usersList.some(row=>row._id===form.user)&&<option value={form.user}>{editing.user.name||form.user}</option>}</select></label><label>Phương thức<select value={form.method} onChange={e=>setForm({...form,method:e.target.value})}>{["cod","bank_transfer","vnpay","momo","other"].map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Số tiền (VND)<input type="number" min="0" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Trạng thái<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Đơn vị tiền<input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}/></label><label>Cổng thanh toán<input value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})}/></label><label>Mã giao dịch<input value={form.transactionId} onChange={e=>setForm({...form,transactionId:e.target.value})}/></label><label>Ngày thanh toán<input type="datetime-local" value={form.paidAt} onChange={e=>setForm({...form,paidAt:e.target.value})}/></label><label>Ngày thanh toán lỗi<input type="datetime-local" value={form.failedAt} onChange={e=>setForm({...form,failedAt:e.target.value})}/></label><label className="full">Metadata (JSON)<textarea rows="4" value={form.metadata} onChange={e=>setForm({...form,metadata:e.target.value})}/></label><div className="full"><Btn type="button" onClick={()=>setOpen(false)}>Hủy</Btn> <Btn className="primary" disabled={saving}>{saving?"Đang lưu…":"Lưu giao dịch"}</Btn></div></form></Modal>}
  </Page>;
}
