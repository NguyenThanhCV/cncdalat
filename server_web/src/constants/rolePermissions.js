const P = require("./permissions");
const all = Object.values(P);
const CRUD = (g) => [`${g}.read`, `${g}.create`, `${g}.update`, `${g}.delete`];
module.exports = {
  customer: [
    ...CRUD("address"),
    ...CRUD("cart"),
    "order.read",
    "order.create",
    "order.cancel",
    "coupon.read",
    ...CRUD("review"),
    ...CRUD("wishlist"),
  ],
  staff: [
    ...CRUD("product"),
    ...CRUD("variant"),
    ...CRUD("category"),
    ...CRUD("brand"),
    ...CRUD("newsArticle"),
    ...CRUD("newsCategory"),
    ...CRUD("banner"),
    "order.read",
    "order.update",
    "order.complete",
    "order.cancel",
    ...CRUD("orderItem"),
    ...CRUD("payment"),
    ...CRUD("review"),
    "review.moderate",
    "inventory.read",
    "inventory.adjust",
    "coupon.read",
    "promotion.read",
    "siteMedia.read",
  ].filter((permission) => !permission.endsWith(".create") && !permission.startsWith("user.")),
  manager: all.filter(
    (permission) =>
      !permission.endsWith(".create") &&
      !["user.delete", "user.role", "user.permissions"].includes(permission),
  ),
  admin: all,
};
