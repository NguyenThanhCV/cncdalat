import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import * as api from "../../api/shop";
import { useTranslation } from "react-i18next";
import { attributesOf, cartTotal, imageOf, money, unwrapList } from "../../utils/shop";
import { localizedField } from "../../utils/localized";
import MediaDisplay from "../MediaDisplay";

const errorText = (e, t) => e?.response?.data?.message || t("genericError");
const blankAddress = { fullName: "", phone: "", address: "", province: "", district: "", ward: "", note: "" };
const statusLabel = (status, t) => ({ pending: t("pendingStatus"), confirmed: t("confirmedStatus"), processing: t("processingStatus"), completed: t("completedStatus"), cancelled: t("cancelledStatus"), refunded: t("refundedStatus") })[status] || status;

export function CartPage() {
  const { t, i18n } = useTranslation();
  const [cart, setCart] = useState(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(""); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setCart(await api.getCart()); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const update = async (id, quantity) => { if (quantity < 1) return; setBusy(id); try { await api.updateCartItem(id, quantity); await load(); window.dispatchEvent(new Event("cart-change")); } catch (e) { setError(errorText(e, t)); } finally { setBusy(""); } };
  const remove = async (id) => { setBusy(id); try { await api.removeCartItem(id); await load(); window.dispatchEvent(new Event("cart-change")); } catch (e) { setError(errorText(e, t)); } finally { setBusy(""); } };
  const clear = async () => { if (!window.confirm(t("removeAllConfirm"))) return; try { await api.clearCart(); await load(); window.dispatchEvent(new Event("cart-change")); } catch (e) { setError(errorText(e, t)); } };
  if (loading) return <div className="state">{t("loadingCart")}</div>;
  const items = cart?.items || [];
  if (!items.length) return <div className="empty large"><h1>{t("emptyCart")}</h1><p>{t("emptyCartText")}</p><Link className="primary-button" to="/products">{t("continueShopping")}</Link></div>;
  return <section><div className="section-heading"><div><p className="eyebrow">SHOPPING BAG</p><h1>{t("yourCart")}</h1></div><button className="link-button danger" onClick={clear}>{t("removeAll")}</button></div>{error && <div className="form-error">{error}</div>}<div className="cart-layout"><div className="cart-items">{items.map((item) => { const productName = localizedField(item.product, "name", i18n.resolvedLanguage) || t("productPageTitle"); return <article className="cart-item" key={item._id}><MediaDisplay src={imageOf(item)} alt={productName} /><div className="cart-item-copy"><Link to={`/products/${item.product?._id}`}><h3>{productName}</h3></Link><p>{attributesOf(item.attributes || item.variant?.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p><b>{money(item.price)}</b></div><div className="quantity"><button disabled={!!busy} onClick={() => update(item._id, item.quantity - 1)}>−</button><span>{busy === item._id ? "…" : item.quantity}</span><button disabled={!!busy} onClick={() => update(item._id, item.quantity + 1)}>+</button></div><button className="remove-button" disabled={!!busy} onClick={() => remove(item._id)}>×</button></article>; })}</div><aside className="summary"><h2>{t("orderSummary")}</h2><div><span>{t("subtotal")}</span><b>{money(cartTotal(cart))}</b></div><div><span>{t("shipping")}</span><span>{t("notCalculated")}</span></div><p className="muted">{t("shippingContact")} <Link to="/contact">{t("storeName")}</Link> {t("toConfirmShipping")}</p><hr /><div className="summary-total"><span>{t("orderSubtotal")}</span><b>{money(cartTotal(cart))}</b></div><Link className="primary-button full" to="/checkout">{t("proceedCheckout")}</Link></aside></div></section>;
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;
  const [cart, setCart] = useState(null); const [checkoutLoading, setCheckoutLoading] = useState(true); const [addresses, setAddresses] = useState([]); const [promotions, setPromotions] = useState([]); const [addressId, setAddressId] = useState(""); const [form, setForm] = useState(blankAddress); const [paymentMethod, setPaymentMethod] = useState("cod"); const [couponCode, setCouponCode] = useState(""); const [coupon, setCoupon] = useState(null); const [couponMessage, setCouponMessage] = useState(""); const [note, setNote] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const navigate = useNavigate();
  useEffect(() => {
    api.getPromotions().then((result) => setPromotions(result?.data?.data ?? result?.data ?? result ?? [])).catch(() => setPromotions([]));
    Promise.all([api.getCart(), api.getAddresses()]).then(([nextCart, nextAddresses]) => {
      setCart(nextCart);
      const list = unwrapList(nextAddresses);
      setAddresses(list);
      const defaultAddress = list.find((x) => x.isDefault) || list[0];
      if (defaultAddress) setAddressId(defaultAddress._id);
    }).catch((e) => setError(errorText(e, tRef.current))).finally(() => setCheckoutLoading(false));
  }, []);
  const subtotal = cart ? cartTotal(cart) : 0;
  const activePromo = (product) => {
    const ref = (value) => String(value?._id || value?.id || value || "");
    const priority = { product: 3, category: 2, brand: 1 };
    return promotions.filter((p) => (!p.startDate || new Date(p.startDate) <= Date.now()) && (!p.endDate || new Date(p.endDate) >= Date.now()) && p.status === "active").filter((p) => {
      const ids = p.scope === "product" ? p.productIds : p.scope === "category" ? p.categoryIds : p.brandIds;
      const target = p.scope === "product" ? ref(product) : p.scope === "category" ? ref(product?.category) : ref(product?.brand);
      return (ids || []).some((id) => ref(id) === target);
    }).sort((a, b) => priority[b.scope] - priority[a.scope] || new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0] || null;
  };
  const promoDiscountFor = (item) => { const promo = activePromo(item.product); if (!promo) return 0; const d = promo.type === "percent" ? item.price * Number(promo.value) / 100 : Number(promo.value); return Math.round(Math.max(0, Math.min(d, item.price))) * item.quantity; };
  const promotionDiscount = (cart?.items || []).reduce((sum, item) => sum + promoDiscountFor(item), 0);
  const postPromotionSubtotal = Math.max(0, subtotal - promotionDiscount);
  const couponDiscount = coupon ? Math.min(postPromotionSubtotal, coupon.type === "percentage" ? Math.min(postPromotionSubtotal * coupon.value / 100, coupon.maxDiscount ?? Infinity) : coupon.value) : 0;
  const applyCoupon = async () => { if (!couponCode.trim()) return; try { const response = await api.validateCoupon(couponCode.trim()); const data = response?.data?.data ?? response?.data ?? response; setCoupon(data); setCouponMessage(t("couponValid")); } catch (e) { setCoupon(null); setCouponMessage(errorText(e, t)); } };
  const submit = async (e) => { e.preventDefault(); setSaving(true); setError(""); try { let chosen = addressId; if (!chosen) chosen = (await api.createAddress(form))._id; const response = await api.createOrder({ addressId: chosen, paymentMethod, couponCode: couponCode.trim() || undefined, note: note.trim() || undefined }); const created = response?.data ?? response; const order = created?.order ?? created; if (paymentMethod !== "cod" && order?._id && order?.total != null) await api.createPayment({ order: order._id, amount: order.total }); window.dispatchEvent(new Event("cart-change")); navigate("/orders"); } catch (e) { setError(errorText(e, t)); } finally { setSaving(false); } };
  if (checkoutLoading) return <div className="state">{t("loadingCart")}</div>;
  if (!cart && error) return <div className="state form-error">{error} <Link to="/cart">{t("backToCart")}</Link></div>;
  if (!cart?.items?.length) return <Navigate to="/cart" replace />;
  return <section><div className="section-heading"><div><p className="eyebrow">CHECKOUT</p><h1>{t("checkout")}</h1></div><Link to="/cart">{t("backToCart")}</Link></div><form className="checkout-layout" onSubmit={submit}><div className="checkout-card"><h2>{t("shippingAddress")}</h2>{addresses.length > 0 && <select value={addressId} onChange={(e) => setAddressId(e.target.value)}><option value="">{t("enterNewAddress")}</option>{addresses.map((a) => <option key={a._id} value={a._id}>{a.fullName} · {a.phone} · {a.address}</option>)}</select>}{!addressId && <div className="address-fields">{[["fullName","fullName"],["phone","phone"],["address","specificAddress"],["province","province"],["district","district"],["ward","ward"]].map(([key, label]) => <input key={key} required placeholder={t(label)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}</div>}<label className="field-label">{t("orderNote")}<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("deliveryNotePlaceholder")} /></label><h2>{t("paymentMethod")}</h2>{[["cod","payOnDelivery"],["bank_transfer","bankTransfer"],["vnpay","vnpay"]].map(([value, label]) => <label className="payment-option" key={value}><input type="radio" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /> {label === "vnpay" ? "VNPAY" : t(label)}</label>)}<div className="field-label coupon-entry"><span>{t("couponCode")}</span><div><input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); setCouponMessage(""); }} placeholder={t("couponPlaceholder")} /><button type="button" className="link-button" onClick={applyCoupon}>{t("apply")}</button></div>{couponMessage && <small className={coupon ? "coupon-success" : "form-error"}>{couponMessage}</small>}<Link to="/promotions">{t("viewCoupons")}</Link></div>{error && <div className="form-error">{error}</div>}</div><aside className="summary"><h2>{t("order")}</h2>{cart.items.map((item) => { const saved = promoDiscountFor(item); const lineTotal = item.price * item.quantity - saved; const productName = localizedField(item.product, "name", i18n.resolvedLanguage); return <div key={item._id}><span>{productName} × {item.quantity}{saved > 0 && <small className="coupon-success"> · {t("appliedOffer")}</small>}</span><b>{money(lineTotal)}</b></div>; })}<p className="muted">{t("productOffersDeducted")}</p><hr /><div><span>{t("subtotal")}</span><b>{money(subtotal)}</b></div>{promotionDiscount > 0 && <div className="coupon-success"><span>{t("productOffer")}</span><b>−{money(promotionDiscount)}</b></div>}{coupon && <div className="coupon-success"><span>{t("discountCode")} {coupon.code}</span><b>−{money(couponDiscount)}</b></div>}<div className="summary-total"><span>{t("orderSubtotal")}</span><b>{money(Math.max(0, subtotal - promotionDiscount - couponDiscount))}</b></div><button className="primary-button full" disabled={saving}>{saving ? t("creatingOrder") : t("placeOrder")}</button></aside></form></section>;
}

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setOrders(unwrapList(await api.getOrders({ page: 1, limit: 50 }))); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const cancel = async (id) => { if (!window.confirm(t("cancelOrderConfirm"))) return; try { await api.cancelOrder(id); await load(); } catch (e) { setError(errorText(e, t)); } };
  if (loading) return <div className="state">{t("loadingOrders")}</div>;
  return <section><p className="eyebrow">{t("accountSection")}</p><h1>{t("myOrders")}</h1>{error && <div className="form-error">{error}</div>}{orders.length ? <div className="orders-list">{orders.map((order) => <div className="order-card" key={order._id}><Link to={`/orders/${order._id}`}><b>{order.orderNumber}</b><p>{new Date(order.createdAt).toLocaleDateString(i18n.resolvedLanguage === "en" ? "en-US" : "vi-VN")} · {order.paymentMethod}</p></Link><div><strong>{money(order.total)}</strong><span className="status">{statusLabel(order.orderStatus, t)}</span>{["pending","confirmed"].includes(order.orderStatus) && <button className="link-button danger" onClick={() => cancel(order._id)}>{t("cancelOrder")}</button>}</div></div>)}</div> : <div className="empty"><h3>{t("noOrders")}</h3><Link to="/products">{t("startShopping")}</Link></div>}</section>;
}

export function OrderDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams(); const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => { api.getOrder(id).then((data) => setState({ loading: false, data, error: "" })).catch((e) => setState({ loading: false, data: null, error: errorText(e, t) })); }, [id, t]);
  if (state.loading) return <div className="state">{t("loadingOrderDetails")}</div>; if (state.error) return <div className="state error">{state.error}</div>; const { order, items } = state.data;
  return <section><Link to="/orders">← {t("myOrders")}</Link><div className="detail-order"><p className="eyebrow">{order.orderNumber}</p><h1>{t("orderDetails")}</h1><p>{t("orderStatus")} <span className="status">{statusLabel(order.orderStatus, t)}</span></p><div className="order-address"><b>{t("deliverTo")}</b><p>{order.customer?.fullName} · {order.customer?.phone}</p><p>{order.address?.address}, {order.address?.ward}, {order.address?.district}, {order.address?.province}</p></div>{items.map((item) => { const productName = localizedField(item.product, "name", i18n.resolvedLanguage) || item.productName; return <div className="order-line" key={item._id}><MediaDisplay src={imageOf(item)} alt={productName} /><span>{productName}<small>{item.variantName} · {t("quantityShort")} {item.quantity}</small></span><b>{money(item.total)}</b></div>; })}<div className="summary-total"><span>{t("total")}</span><b>{money(order.total)}</b></div></div></section>;
}
