const r = require("express").Router();
const c = require("../controllers/promotionController");
const { protect } = require("../middlewares/authMiddleware");
const perm = require("../middlewares/permissionMiddleware");
const P = require("../constants/permissions");

r.get("/", c.publicList);
r.use("/manage", protect);
r.get("/manage", perm(P.PROMOTION_READ), c.list);
r.post("/manage", perm(P.PROMOTION_CREATE), c.create);
r.patch("/manage/:id", perm(P.PROMOTION_UPDATE), c.update);
r.delete("/manage/:id", perm(P.PROMOTION_DELETE), c.remove);
module.exports = r;
