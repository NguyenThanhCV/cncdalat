import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { canAdmin } from "../utils/adminPermissions";

export default function PermissionRoute({ permission }) {
  return canAdmin(permission) ? <Outlet /> : <Navigate to="/admin" replace />;
}
