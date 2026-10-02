import React, { useCallback, useEffect, useState } from "react";
import { siteMedia } from "../api";
import { Btn, Danger, Modal, Page, Table } from "../components/UI";
import MediaPreview from "../components/MediaPreview";
import { canAdmin } from "../utils/adminPermissions";
import "./MediaSettings.css";

const HERO_KEY = "storefront-hero";
const empty = { key: "", label: "", mediaUrl: "", mediaType: "image", altText: "", status: "active" };
const heroDefault = { ...empty, key: HERO_KEY, label: "Video nền trang chủ", mediaType: "video", altText: "Video nền trang chủ" };
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const mediaLocations = {
  "storefront-hero": { page: "Trang chủ · /", area: "Video nền phía sau nội dung hero" },
  "store-logo": { page: "Toàn website · /* · Đăng nhập · /login", area: "Logo ở đầu trang, chân trang và trang đăng nhập" },
  "news-hero": { page: "Tin tức · /news", area: "Ảnh/video minh họa phần đầu trang tin tức" },
};
const locationFor = (key) => mediaLocations[key] || { page: "Chưa xác định", area: "Mã này chưa được nối với vị trí trên website" };

export default function MediaSettings() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setRows(unwrap(await siteMedia.list())); }
    catch (e) { setError(e.response?.data?.message || "Không tải được thư viện media."); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const edit = (row, fallback = empty) => {
    setId(row?._id || "");
    setForm(row ? { ...empty, ...row } : { ...fallback });
    setError("");
    setOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      key: form.key,
      label: form.label,
      mediaUrl: form.mediaUrl.trim(),
      mediaType: form.mediaType,
      altText: form.altText,
      status: form.status,
    };
    try {
      id ? await siteMedia.update(id, payload) : await siteMedia.create(payload);
      setOpen(false);
      await load();
    } catch (e) { setError(e.response?.data?.message || "Không lưu được media."); }
    finally { setSaving(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Xóa media “${row.label}”?`)) return;
    try { await siteMedia.remove(row._id); await load(); }
    catch (e) { setError(e.response?.data?.message || "Không xóa được media."); }
  };

  const hero = rows.find((row) => row.key === HERO_KEY);
  const otherRows = rows.filter((row) => row.key !== HERO_KEY);
  const columns = [
    { key: "preview", label: "Xem trước", render: (row) => <MediaPreview src={row.mediaUrl} alt={row.altText} style={{ width: 76, height: 54, objectFit: "cover", borderRadius: 8 }} /> },
    { key: "key", label: "Vị trí trên website" },
    { key: "page", label: "Trang / đường dẫn", render: (row) => <div className="media-location"><b>{locationFor(row.key).page}</b><small>{locationFor(row.key).area}</small></div> },
    { key: "label", label: "Tên media" },
    { key: "mediaType", label: "Loại", render: (row) => row.mediaType === "video" ? "Video" : "Hình ảnh" },
    { key: "status", label: "Trạng thái", render: (row) => <span className={`media-status ${row.status}`}>{row.status === "active" ? "Đang dùng" : "Đã ẩn"}</span> },
    { key: "actions", label: "", render: (row) => <span className="actions">{canAdmin("siteMedia.update") && <Btn onClick={() => edit(row)}>Sửa</Btn>}{canAdmin("siteMedia.delete") && <Danger onClick={() => remove(row)}>Xóa</Danger>}</span> },
  ];

  return <Page title="Thư viện hình ảnh và video" actions={canAdmin("siteMedia.create") && <Btn className="primary" onClick={() => edit()}>+ Thêm media</Btn>}>
    <p className="media-settings-intro">Quản lý URL media tại đây. Thay đổi được lưu vào database và cập nhật vị trí tương ứng trên website.</p>
    {error && !open && <div className="errorbox">{error}</div>}

    <section className="hero-media-panel">
      <div className="hero-media-panel-heading">
        <div><span className="hero-media-eyebrow">TRANG CHỦ · /</span><h2>Video nền trang chủ</h2><p>Hiển thị phía sau tiêu đề “Trồng tốt, bắt đầu từ đúng lựa chọn”.</p></div>
        {hero && <span className={`media-status ${hero.status}`}>{hero.status === "active" ? "Đang hiển thị" : "Đang ẩn"}</span>}
      </div>
      {hero?.mediaUrl ? <div className="hero-media-preview"><MediaPreview src={hero.mediaUrl} alt={hero.altText} mediaType={hero.mediaType} /></div> : <div className="hero-media-empty">Chưa có media. Thêm URL video để hiển thị nền động trên trang chủ.</div>}
      <div className="hero-media-panel-footer"><code>{HERO_KEY}</code>{canAdmin(hero ? "siteMedia.update" : "siteMedia.create") && <Btn className="primary" onClick={() => edit(hero, heroDefault)}>{hero ? "Sửa video trang chủ" : "Thêm video trang chủ"}</Btn>}</div>
    </section>

    <div className="media-library-heading"><div><h2>Media ở vị trí khác</h2><p>Cột “Trang / đường dẫn” cho biết media xuất hiện ở đâu trên website.</p></div></div>
    <Table rows={otherRows} columns={columns} />

    {open && <Modal title={id ? (form.key === HERO_KEY ? "Cập nhật video trang chủ" : "Sửa media") : (form.key === HERO_KEY ? "Thêm video trang chủ" : "Thêm media")} onClose={() => setOpen(false)}><form className="formgrid" onSubmit={save}>
      {error && <div className="errorbox full">{error}</div>}
      <label>Mã vị trí *<input required disabled={!!id} value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.trim().toLowerCase() })} placeholder="store-logo" /></label>
      {form.key && <div className="full media-location-hint"><b>Hiển thị tại:</b> {locationFor(form.key).page}<small>{locationFor(form.key).area}</small></div>}
      <label>Tên hiển thị *<input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>
      <label className="full">URL hình ảnh hoặc video *<input required type="url" value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="Dán URL trực tiếp hoặc link YouTube/Vimeo" /></label>
      <label>Loại media<select value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}><option value="image">Hình ảnh / tự nhận diện</option><option value="video">Video</option></select></label>
      <label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Đang dùng</option><option value="inactive">Ẩn</option></select></label>
      <label className="full">Mô tả media<input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></label>
      {form.mediaUrl && <div className="full media-form-preview"><span>Xem trước</span><MediaPreview src={form.mediaUrl} alt={form.altText} mediaType={form.mediaType} style={{ width: "100%", maxHeight: 300, aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 12, background: "#17221d" }} /></div>}
      <div className="full"><Btn type="button" onClick={() => setOpen(false)}>Hủy</Btn> <Btn className="primary" type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu vào database"}</Btn></div>
    </form></Modal>}
  </Page>;
}
