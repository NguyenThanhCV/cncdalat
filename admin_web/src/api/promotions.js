import request from "./request";

const dataOf = (response) => response?.data?.data ?? response?.data ?? response;
const normalize = (row) => ({ ...row, id: String(row.id || row._id), productIds: (row.productIds || []).map(String), categoryIds: (row.categoryIds || []).map(String), brandIds: (row.brandIds || []).map(String) });
export const listPromotions = async () => (dataOf(await request.get("/promotions/manage")) || []).map(normalize);
export const createPromotion = async (payload) => normalize(dataOf(await request.post("/promotions/manage", payload)));
export const updatePromotion = async (id, payload) => normalize(dataOf(await request.patch(`/promotions/manage/${encodeURIComponent(id)}`, payload)));
export const deletePromotion = (id) => request.delete(`/promotions/manage/${encodeURIComponent(id)}`);
