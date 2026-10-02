export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    return null;
  }
};

export const canAdmin = (permission, user = getAdminUser()) => {
  if (user?.role === "admin") return true;
  if (!["manager", "staff"].includes(user?.role)) return false;
  if (permission.endsWith(".create")) return false;
  if (user.role === "staff" && permission.startsWith("user.")) return false;
  if (user.role === "manager" && ["user.delete", "user.role", "user.permissions"].includes(permission)) return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
};

export const isAdmin = () => getAdminUser()?.role === "admin";
