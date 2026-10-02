import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import BrandsPage from "./pages/BrandsPage";
import PromotionsPage from "./pages/PromotionsPage";
import CouponsPage from "./pages/CouponsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailAdmin from "./pages/OrderDetailAdmin";
import PaymentsPage from "./pages/PaymentsPage";
import ReviewsPage from "./pages/ReviewsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AddressesPage from "./pages/AddressesPage";
import CartsPage from "./pages/CartsPage";
import WishlistsPage from "./pages/WishlistsPage";
import OrderItemsPage from "./pages/OrderItemsPage";
import NewsManagement from "./pages/NewsManagement";
import BannerManagement from "./pages/BannerManagement";
import MediaSettings from "./pages/MediaSettings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route element={<PermissionRoute permission="product.read" />}><Route path="products" element={<Products />} /></Route>
          <Route element={<PermissionRoute permission="product.create" />}><Route path="products/new" element={<ProductForm />} /></Route>
          <Route element={<PermissionRoute permission="product.read" />}><Route path="products/:id" element={<ProductDetail />} /></Route>
          <Route element={<PermissionRoute permission="product.update" />}><Route path="products/:id/edit" element={<ProductForm />} /></Route>
          <Route element={<PermissionRoute permission="user.read" />}><Route path="users" element={<Users />} /></Route>
          <Route element={<PermissionRoute permission="user.update" />}><Route path="users/:id" element={<UserDetail />} /></Route>
          <Route element={<PermissionRoute permission="order.read" />}><Route path="orders" element={<OrdersPage />} /></Route>
          <Route element={<PermissionRoute permission="order.read" />}><Route path="orders/:id" element={<OrderDetailAdmin />} /></Route>
          <Route element={<PermissionRoute permission="payment.read" />}><Route path="payments" element={<PaymentsPage />} /></Route>
          <Route element={<PermissionRoute permission="review.read" />}><Route path="reviews" element={<ReviewsPage />} /></Route>
          <Route element={<PermissionRoute permission="notification.read" />}><Route path="notifications" element={<NotificationsPage />} /></Route>
          <Route element={<PermissionRoute permission="address.read" />}><Route path="addresses" element={<AddressesPage />} /></Route>
          <Route element={<PermissionRoute permission="cart.read" />}><Route path="carts" element={<CartsPage />} /></Route>
          <Route element={<PermissionRoute permission="wishlist.read" />}><Route path="wishlists" element={<WishlistsPage />} /></Route>
          <Route element={<PermissionRoute permission="category.read" />}><Route path="categories" element={<CategoryPage />} /></Route>
          <Route element={<PermissionRoute permission="newsArticle.read" />}><Route path="news" element={<NewsManagement />} /></Route>
          <Route element={<PermissionRoute permission="banner.read" />}><Route path="banners" element={<BannerManagement />} /></Route>
          <Route element={<PermissionRoute permission="siteMedia.read" />}><Route path="media" element={<MediaSettings />} /></Route>
          <Route element={<PermissionRoute permission="promotion.read" />}><Route path="promotions" element={<PromotionsPage />} /></Route>
          <Route element={<PermissionRoute permission="brand.read" />}><Route path="brands" element={<BrandsPage />} /></Route>
          <Route element={<PermissionRoute permission="orderItem.read" />}><Route path="order-items" element={<OrderItemsPage />} /></Route>
          <Route element={<PermissionRoute permission="coupon.read" />}><Route path="coupons" element={<CouponsPage />} /></Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
