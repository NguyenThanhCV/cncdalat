import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Page, Table, Btn, Danger, Modal } from "../components/UI";
import { reviews, users, products, orders } from "../api";
import { fmtDate } from "../utils/helpers";
import { canAdmin } from "../utils/adminPermissions";

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};
const blankReview = { product: "", user: "", order: "", rating: 5, title: "", content: "", status: "pending", verifiedPurchase: false, imagesText: "", videosText: "" };
const getRows = (response) => { const data = response.data?.data ?? response.data; return Array.isArray(data) ? data : data?.data || []; };

export default function ReviewsPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false), [editing, setEditing] = useState(null), [form, setForm] = useState(blankReview), [saving, setSaving] = useState(false);
  const [customerRows, setCustomerRows] = useState([]), [productRows, setProductRows] = useState([]), [orderRows, setOrderRows] = useState([]);
  const canCreate = canAdmin("review.create"), canUpdate = canAdmin("review.update"), canDelete = canAdmin("review.delete"), canModerate = canAdmin("review.moderate");

  const load = useCallback(async () => {
    try {
      const [reviewResponse, userResponse, productResponse, orderResponse] = await Promise.allSettled([reviews.list({ page: 1, limit: 100 }), users.list({ page: 1, limit: 100, role: "customer" }), products.list({ page: 1, limit: 100 }), orders.list({ page: 1, limit: 100 })]);
      if (reviewResponse.status === "fulfilled") setRows(getRows(reviewResponse.value)); else throw reviewResponse.reason;
      if (userResponse.status === "fulfilled") setCustomerRows(getRows(userResponse.value));
      if (productResponse.status === "fulfilled") setProductRows(getRows(productResponse.value));
      if (orderResponse.status === "fulfilled") setOrderRows(getRows(orderResponse.value));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      rows.filter((review) => {
        const matchesStatus = !status || review.status === status;
        const searchText = [review.title, review.content, review.user?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesStatus && (!query || searchText.includes(query.toLowerCase()));
      }),
    [rows, query, status],
  );

  const moderate = async (id, nextStatus) => {
    try {
      await reviews.moderate(id, { status: nextStatus });
      await load();
      setSelected(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  };

  const remove = async (review) => {
    if (!window.confirm(`Xóa đánh giá “${review.title || "Không tiêu đề"}”?`)) return;
    try { await reviews.remove(review._id); setSelected(null); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message); }
  };

  const showForm = (review) => {
    setEditing(review || null);
    setForm(review ? { product: review.product?._id || review.product || "", user: review.user?._id || review.user || "", order: review.order?._id || review.order || "", rating: review.rating || 5, title: review.title || "", content: review.content || "", status: review.status || "pending", verifiedPurchase: Boolean(review.verifiedPurchase), imagesText: (review.images || []).join("\n"), videosText: (review.videos || []).join("\n") } : { ...blankReview });
    setError(""); setFormOpen(true);
  };
  const saveReview = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, rating: Number(form.rating), images: form.imagesText.split("\n").map(value => value.trim()).filter(Boolean), videos: form.videosText.split("\n").map(value => value.trim()).filter(Boolean) };
      delete payload.imagesText; delete payload.videosText; if (!payload.order) payload.order = null;
      if (editing) await reviews.update(editing._id, payload); else await reviews.create(payload);
      setFormOpen(false); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: "rating",
      label: "Đánh giá",
      render: (review) => (
        <b className="rating">
          {"★".repeat(Number(review.rating || 0))}
          {"☆".repeat(5 - Number(review.rating || 0))}
        </b>
      ),
    },
    { key: "product", label: "Sản phẩm", render: (review) => review.product?.name || "—" },
    { key: "user", label: "Khách", render: (review) => review.user?.name || "—" },
    {
      key: "title",
      label: "Tiêu đề",
      render: (review) => (
        <div>
          <b>{review.title || "Không tiêu đề"}</b>
          <small>{String(review.content || "").slice(0, 90)}</small>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (review) => (
        <span className={`status-pill ${review.status}`}>
          {statusLabels[review.status] || review.status}
        </span>
      ),
    },
    { key: "createdAt", label: "Ngày", render: (review) => fmtDate(review.createdAt) },
    {
      key: "actions",
      label: "Thao tác",
      render: (review) => <span className="actions"><Btn onClick={() => setSelected(review)}>Xem</Btn>{canUpdate&&<Btn onClick={()=>showForm(review)}>Sửa</Btn>}{canDelete&&<Danger onClick={()=>remove(review)}>Xóa</Danger>}</span>,
    },
  ];

  return (
    <Page title="Đánh giá sản phẩm" actions={<><Btn onClick={load}>↻ Làm mới</Btn>{canCreate&&<Btn className="primary" onClick={()=>showForm(null)}>+ Thêm đánh giá</Btn>}</>}>
      <div className="info-banner"><b>Quản lý nội dung đánh giá.</b> Duyệt hoặc từ chối sẽ cập nhật trạng thái hiển thị; thêm/sửa/xóa sẽ thay đổi dữ liệu đánh giá gắn với sản phẩm và tài khoản khách hàng.</div>
      <div className="toolbar">
        <input
          placeholder="Tìm nội dung, khách hàng…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="error">{error}</div>}
      <Table rows={filtered} columns={columns} />
      {selected && (
        <Modal title="Chi tiết đánh giá" onClose={() => setSelected(null)}>
          <div className="review-detail">
            <div className="review-stars">
              {"★".repeat(Number(selected.rating || 0))}
              {"☆".repeat(5 - Number(selected.rating || 0))}
            </div>
            <h2>{selected.title || "Không tiêu đề"}</h2>
            <p>{selected.content || "Không có nội dung."}</p>
            <div className="panel">
              <b>Sản phẩm:</b> {selected.product?.name || "—"}
              <br />
              <b>Khách:</b> {selected.user?.name || "—"}
              <br />
              <b>Ngày:</b> {fmtDate(selected.createdAt)}
            </div>
            <div className="detail-actions">
              {canModerate&&<Btn onClick={() => moderate(selected._id, "approved")}>✓ Duyệt</Btn>}
              {canModerate&&<Btn onClick={() => moderate(selected._id, "rejected")}>Từ chối</Btn>}
            </div>
          </div>
        </Modal>
      )}
      {formOpen&&<Modal title={editing?"Sửa đánh giá":"Thêm đánh giá"} onClose={()=>setFormOpen(false)}><form className="formgrid" onSubmit={saveReview}>{error&&<div className="error full">{error}</div>}<label>Sản phẩm<select required value={form.product} onChange={e=>setForm({...form,product:e.target.value})}><option value="">Chọn sản phẩm</option>{productRows.map(row=><option key={row._id} value={row._id}>{row.name}</option>)}{editing?.product?._id&&!productRows.some(row=>row._id===form.product)&&<option value={form.product}>{editing.product.name||form.product}</option>}</select></label><label>Khách hàng<select required value={form.user} onChange={e=>setForm({...form,user:e.target.value})}><option value="">Chọn khách hàng</option>{customerRows.map(row=><option key={row._id} value={row._id}>{row.name} · {row.email}</option>)}{editing?.user?._id&&!customerRows.some(row=>row._id===form.user)&&<option value={form.user}>{editing.user.name||form.user}</option>}</select></label><label>Đơn hàng liên quan (không bắt buộc)<select value={form.order} onChange={e=>setForm({...form,order:e.target.value})}><option value="">Không gắn đơn</option>{orderRows.map(row=><option key={row._id} value={row._id}>{row.orderNumber}</option>)}{editing?.order?._id&&!orderRows.some(row=>row._id===form.order)&&<option value={form.order}>{editing.order.orderNumber||form.order}</option>}</select></label><label>Số sao<select value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}>{[1,2,3,4,5].map(value=><option key={value} value={value}>{value} sao</option>)}</select></label><label>Trạng thái<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Tiêu đề<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label className="full">Nội dung<textarea rows="4" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></label><label className="full">Link ảnh (mỗi dòng một link)<textarea rows="3" value={form.imagesText} onChange={e=>setForm({...form,imagesText:e.target.value})}/></label><label className="full">Link video (mỗi dòng một link)<textarea rows="3" value={form.videosText} onChange={e=>setForm({...form,videosText:e.target.value})}/></label><label className="full"><span><input type="checkbox" checked={form.verifiedPurchase} onChange={e=>setForm({...form,verifiedPurchase:e.target.checked})}/> Đã xác minh mua hàng</span></label><div className="full"><Btn type="button" onClick={()=>setFormOpen(false)}>Hủy</Btn> <Btn className="primary" disabled={saving}>{saving?"Đang lưu…":"Lưu đánh giá"}</Btn></div></form></Modal>}
    </Page>
  );
}
