const AppError = require("../utils/AppError");
const rolePermissions = require("../constants/rolePermissions");
module.exports = (permission) => (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin")
    return next();
  const roleCap = rolePermissions[role] || [];
  const assigned = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
  if (roleCap.includes(permission) && assigned.includes(permission)) return next();
  next(new AppError(`Không có quyền: ${permission}`, 403));
};
