import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Page, Table, Btn, Danger, Money } from "../components/UI";
import { orders } from "../api";
import { fmtDate } from "../utils/helpers";
import { canAdmin } from "../utils/adminPermissions";

const orderStatus = ["pending", "confirmed", "processing", "completed", "cancelled", "refunded"];
const paymentStatus = ["pending", "paid", "failed", "cancelled", "refunded"];
const labels = { pending: "Chờ xử lý", confirmed: "Đã xác nhận", processing: "Đang xử lý", completed: "Hoàn tất", cancelled: "Đã hủy", refunded: "Đã hoàn tiền" };
const payLabels = { pending: "Chờ thanh toán", paid: "Đã thanh toán", failed: "Thanh toán lỗi", cancelled: "Đã hủy", refunded: "Đã hoàn tiền" };

export default function OrdersPage() {
  const [rows, setRows] = useState([]), [query, setQuery] = useState(""), [orderFilter, setOrderFilter] = useState(""), [paymentFilter, setPaymentFilter] = useState(""), [loading, setLoading] = useState(false), [error, setError] = useState("");
  const canDelete = canAdmin("order.delete");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await orders.list({ page: 1, limit: 100, ...(orderFilter ? { orderStatus: orderFilter } : {}), ...(paymentFilter ? { paymentStatus: paymentFilter } : {}) });
      const data = response.data?.data ?? response.data;
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [orderFilter, paymentFilter]);
  const remove = async (order) => { if (!window.confirm(`Xóa đơn ${order.orderNumber}? Chỉ đơn đã hủy hoặc hoàn tiền mới được xóa.`)) return; try { await orders.remove(order._id); await load(); } catch (e) { setError(e.response?.data?.message || e.message); } };
  const filtered = useMemo(() => rows.filter(row => !query || [row.orderNumber, row.customer?.fullName, row.customer?.phone, row.user?.name, row.user?.phone, row.user?.email].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())), [rows, query]);
  return <Page title="Đơn hàng" actions={<Btn onClick={load}>↻ Làm mới</Btn>}>
    <div className="info-banner"><b>Quản lý tiến độ và thông tin đơn tại trang chi tiết.</b> Đơn mới được tạo từ checkout để kiểm tra tồn kho và tính đúng khuyến mãi. Đơn chỉ xóa được sau khi đã hủy hoặc hoàn tiền; xóa cũng gỡ dòng sản phẩm của đơn.</div>
    <div className="toolbar order-toolbar"><input placeholder="Tìm mã đơn, tên, SĐT…" value={query} onChange={e => setQuery(e.target.value)} /><select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}><option value="">Tất cả trạng thái đơn</option>{orderStatus.map(status => <option key={status} value={status}>{labels[status]}</option>)}</select><select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}><option value="">Tất cả trạng thái thanh toán</option>{paymentStatus.map(status => <option key={status} value={status}>{payLabels[status]}</option>)}</select></div>
    {error && <div className="error">{error}</div>}
    <div className="order-summary"><div><span>Tổng đơn</span><b>{filtered.length}</b></div><div><span>Chờ xử lý</span><b>{filtered.filter(row => row.orderStatus === "pending").length}</b></div><div><span>Đã thanh toán</span><b>{filtered.filter(row => row.paymentStatus === "paid").length}</b></div><div><span>Doanh thu hiển thị</span><b><Money v={filtered.reduce((sum, row) => sum + Number(row.total || 0), 0)} /></b></div></div>
    <Table rows={filtered} columns={[{key:"orderNumber",label:"Mã đơn",render:row=><Link className="order-code" to={`/admin/orders/${row._id}`}>{row.orderNumber}</Link>},{key:"customer",label:"Khách hàng",render:row=><div><b>{row.customer?.fullName||row.user?.name||"—"}</b><small>{row.customer?.phone||row.user?.phone||row.user?.email||""}</small></div>},{key:"paymentMethod",label:"Thanh toán",render:row=><span className="soft-badge">{row.paymentMethod}</span>},{key:"paymentStatus",label:"TT thanh toán",render:row=><span className={`status-pill ${row.paymentStatus}`}>{payLabels[row.paymentStatus]||row.paymentStatus}</span>},{key:"orderStatus",label:"Đơn hàng",render:row=><span className={`status-pill ${row.orderStatus}`}>{labels[row.orderStatus]||row.orderStatus}</span>},{key:"total",label:"Tổng tiền",render:row=><b><Money v={row.total}/></b>},{key:"createdAt",label:"Ngày",render:row=>fmtDate(row.createdAt)},{key:"actions",label:"Thao tác",render:row=>canDelete&&["cancelled","refunded"].includes(row.orderStatus)?<Danger onClick={()=>remove(row)}>Xóa đơn</Danger>:"—"}]} />
    {loading && <p className="muted">Đang tải…</p>}
  </Page>;
}
