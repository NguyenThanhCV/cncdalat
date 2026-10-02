import React, { useEffect, useState } from "react";

import {
  Menu,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Drawer,
  Input,
  notification,
} from "antd";

import {
  MenuOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  GlobalOutlined,
  DownOutlined,
  LogoutOutlined,
  ProfileOutlined,
  HeartOutlined,
  LoginOutlined,
  UserAddOutlined,
  BellOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { asyncLogoutAction } from "../../PagesClient/Logout/stores/actions";

import "./index.css";
import { getCart } from "../../api/shop";
import MediaDisplay from "../MediaDisplay";
import useSiteMedia from "../../hooks/useSiteMedia";

const HeaderPage = () => {
  const { i18n, t } = useTranslation();
  const storeLogo = useSiteMedia("store-logo");

  const dispatch = useDispatch();

  const location = useLocation();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [cartCount, setCartCount] = useState(0);

  // =====================================================
  // LOAD USER
  // =====================================================

  const loadUser = () => {
    try {
      const token = localStorage.getItem("token");

      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);

        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("HEADER LOAD USER ERROR:", error);

      setUser(null);
    }
  };

  // =====================================================
  // AUTH CHANGE
  // =====================================================

  const loadCartCount = async () => {
    if (!localStorage.getItem("token")) {
      setCartCount(0);
      return;
    }
    try {
      const response = await getCart();
      const cart = response?.data || response;
      setCartCount((cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    } catch (_) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    loadCartCount();
    window.addEventListener("auth-change", loadUser);
    window.addEventListener("auth-change", loadCartCount);
    window.addEventListener("cart-change", loadCartCount);
    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("auth-change", loadCartCount);
      window.removeEventListener("cart-change", loadCartCount);
    };
  }, []);

  // =====================================================
  // CHECK USER KHI ĐỔI TRANG
  // =====================================================

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    const keyword = searchText.trim();

    if (!keyword) {
      navigate("/products");

      setMobileMenuOpen(false);

      return;
    }

    navigate(`/products?search=${encodeURIComponent(keyword)}`);

    setMobileMenuOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // =====================================================
  // USER NAME
  // =====================================================

  const getUserName = () => {
    if (!user) {
      return t("account");
    }

    return user.name || user.email || t("account");
  };

  // =====================================================
  // USER ROLE
  // =====================================================

  const getUserRole = () => {
    if (!user) {
      return "";
    }

    if (user.role === "admin") {
      return t("administrator");
    }

    return t("customer");
  };

  // =====================================================
  // AVATAR TEXT
  // =====================================================

  const getAvatarText = () => {
    const name = getUserName();

    if (!name || name === t("account")) {
      return "";
    }

    return name.charAt(0).toUpperCase();
  };

  // =====================================================
  // CLEAR LOGIN DATA
  // =====================================================

  const clearLoginData = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("refreshToken");

    localStorage.removeItem("user");

    // Xóa cookie nếu có
    document.cookie = "accessToken=; Max-Age=0; path=/;";

    document.cookie = "refreshToken=; Max-Age=0; path=/;";

    setUser(null);

    // Báo cho các component khác
    window.dispatchEvent(new Event("auth-change"));

    setMobileMenuOpen(false);

    notification.success({
      message: t("logoutSuccess"),

      description: t("logoutDescription"),
    });

    navigate("/");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken");

    // Không có refresh token
    if (!refreshToken) {
      clearLoginData();

      return;
    }

    try {
      const result = dispatch(
        asyncLogoutAction({
          refreshToken,
        }),
      );

      // Redux Thunk trả Promise
      if (result && typeof result.then === "function") {
        result
          .then((response) => {
            console.log("LOGOUT RESULT:", response);

            clearLoginData();
          })
          .catch((error) => {
            console.error("LOGOUT ERROR:", error);

            clearLoginData();
          });
      } else {
        // Trường hợp không trả Promise
        clearLoginData();
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      clearLoginData();
    }
  };

  // =====================================================
  // USER MENU CLICK
  // =====================================================

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/account");

        break;

      case "orders":
        navigate("/orders");

        break;

      case "wishlist":
        navigate("/wishlist");

        break;

      case "notifications":
        navigate("/notifications");

        break;

      case "addresses":
        navigate("/addresses");

        break;

      case "login":
        navigate("/login");

        break;

      case "register":
        navigate("/register");

        break;

      case "logout":
        handleLogout();

        break;

      default:
        break;
    }
  };

  // =====================================================
  // USER MENU - ANT DESIGN 4
  // =====================================================

  const userMenu = user ? (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        {t("accountInfo")}
      </Menu.Item>

      <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
        {t("myOrders")}
      </Menu.Item>

      <Menu.Item key="wishlist" icon={<HeartOutlined />}>
        {t("myFavorites")}
      </Menu.Item>

      <Menu.Item key="notifications" icon={<BellOutlined />}>
        {t("notifications")}
      </Menu.Item>
      <Menu.Item key="addresses" icon={<EnvironmentOutlined />}>
        {t("shippingAddresses")}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        {t("logout")}
      </Menu.Item>
    </Menu>
  ) : (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="login" icon={<LoginOutlined />}>
        {t("loginSubmit")}
      </Menu.Item>

      <Menu.Item key="register" icon={<UserAddOutlined />}>
        {t("register")}
      </Menu.Item>
    </Menu>
  );

  // =====================================================
  // LANGUAGE MENU
  // =====================================================

  const activeLanguage = (i18n.resolvedLanguage || i18n.language || "vi").split("-")[0];
  const languageMenu = (
    <Menu
      selectedKeys={[activeLanguage]}
      onClick={({ key }) => {
        if (key === "vi" || key === "en") i18n.changeLanguage(key);
      }}>
      <Menu.Item key="vi">🇻🇳 Tiếng Việt</Menu.Item>
      <Menu.Item key="en">🇬🇧 English</Menu.Item>
    </Menu>
  );

  // =====================================================
  // MAIN MENU
  // =====================================================

  const mainMenuItems = [
    {
      key: "home",

      label: <Link to="/">{t("navHome")}</Link>,
    },

    {
      key: "products",

      label: <Link to="/products">{t("navProducts")}</Link>,

      children: [
        {
          key: "all-products",

          label: <Link to="/products">{t("navAllProducts")}</Link>,
        },

        {
          key: "categories",

          label: <Link to="/categories">{t("navCategories")}</Link>,
        },

        {
          key: "brands",

          label: <Link to="/brands">{t("navBrands")}</Link>,
        },
      ],
    },

    {
      key: "about",

      label: <Link to="/about">{t("navAbout")}</Link>,
    },

    {
      key: "promotions",
      label: <Link to="/promotions">{t("navOffers")}</Link>,
    },

    {
      key: "news",

      label: <Link to="/news">{t("navNews")}</Link>,
    },

    {
      key: "contact",

      label: <Link to="/contact">{t("navContact")}</Link>,
    },
  ];

  // =====================================================
  // SELECTED MENU
  // =====================================================

  let selectedKeys = [];

  if (location.pathname === "/") {
    selectedKeys = ["home"];
  } else if (location.pathname.startsWith("/products")) {
    selectedKeys = ["products"];
  } else if (location.pathname.startsWith("/about")) {
    selectedKeys = ["about"];
  } else if (location.pathname.startsWith("/news")) {
    selectedKeys = ["news"];
  } else if (location.pathname.startsWith("/contact")) {
    selectedKeys = ["contact"];
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="shop-header">
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="header-brand-row">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            {storeLogo?.mediaUrl && <MediaDisplay className="company-logo" src={storeLogo.mediaUrl} mediaType={storeLogo.mediaType} alt={storeLogo.altText || `${t("logoOf")} ${t("storeName")}`} />}

            <div className="logo-text">
              <div className="logo-title">{t("storeName")}</div>

              <div className="logo-subtitle">{t("headerTagline")}</div>
            </div>
          </Link>
        </div>

        {/* =================================================
            HEADER RIGHT
        ================================================= */}

        <div className="header-right">
          {/* =================================================
              SEARCH
          ================================================= */}

          {/* =================================================
              LANGUAGE
          ================================================= */}

          <Dropdown
            overlay={languageMenu}
            placement="bottomRight"
            trigger={["click"]}>
            <span className="dropdown-trigger">
              <Button
                type="text"
                className="header-icon-button language-button"
                icon={<GlobalOutlined />}
                aria-label={t("loginLanguage")}
                title={activeLanguage === "vi" ? "Tiếng Việt" : "English"}>
                <span className="language-code">{activeLanguage === "vi" ? "VI" : "EN"}</span>
                <DownOutlined className="language-chevron" />
              </Button>
            </span>
          </Dropdown>

          {/* =================================================
              CART
          ================================================= */}

          <Link to="/cart" className="dropdown-trigger">
            <Badge count={cartCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                className="header-icon-button"
                icon={<ShoppingCartOutlined />}
              />
            </Badge>
          </Link>

          {/* =================================================
              USER DROPDOWN
          ================================================= */}

          <Dropdown
            overlay={userMenu}
            placement="bottomRight"
            trigger={["click"]}>
            {/* QUAN TRỌNG:
                Dropdown phải có đúng 1 child
            */}

            <span className="dropdown-trigger">
              <div className="header-user">
                <Avatar
                  size={38}
                  src={user?.avatar || undefined}
                  icon={
                    !user?.avatar && !getAvatarText() ? (
                      <UserOutlined />
                    ) : undefined
                  }>
                  {!user?.avatar && getAvatarText()}
                </Avatar>

                <div className="header-user-info">
                  <span className="user-small">
                    {user ? getUserRole() : t("account")}
                  </span>

                  <span className="user-name">{getUserName()}</span>
                </div>

                <DownOutlined className="user-arrow" />
              </div>
            </span>
          </Dropdown>

          {/* =================================================
              MOBILE BUTTON
          ================================================= */}

          <Button
            type="text"
            className="mobile-menu-button"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
        </div>

        <div className="header-search-row">
          <span className="header-search-label">{t("headerSearchLabel")}</span>
          <div className="header-search">
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("headerSearchPlaceholder")}
              suffix={<SearchOutlined onClick={handleSearch} role="button" aria-label="Tìm kiếm" />}
            />
          </div>
          <span className="header-search-hint">{t("headerSearchHint")}</span>
        </div>

        <div className="header-navigation">
          <Menu
            className="main-menu"
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={mainMenuItems}
          />
        </div>
      </header>

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

      <Drawer
        title={t("mobileMenu")}
        placement="left"
        visible={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={300}>
        <div className="mobile-language-picker" aria-label={t("loginChooseLanguage")}>
          <span><GlobalOutlined /> {t("loginLanguage")}</span>
          <div role="group" aria-label={t("loginChooseLanguage")}>
            <Button size="small" type={activeLanguage === "vi" ? "primary" : "default"} onClick={() => i18n.changeLanguage("vi")}>🇻🇳 VI</Button>
            <Button size="small" type={activeLanguage === "en" ? "primary" : "default"} onClick={() => i18n.changeLanguage("en")}>🇬🇧 EN</Button>
          </div>
        </div>
        {/* =================================================
            MOBILE SEARCH
        ================================================= */}

        <div className="mobile-search">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("productSearchPlaceholder")}
            suffix={
              <SearchOutlined
                onClick={handleSearch}
                style={{
                  cursor: "pointer",
                }}
              />
            }
          />
        </div>

        {/* =================================================
            MOBILE ACCOUNT
        ================================================= */}

        <div className="mobile-account">
          <Avatar
            size={45}
            src={user?.avatar || undefined}
            icon={
              !user?.avatar && !getAvatarText() ? <UserOutlined /> : undefined
            }>
            {!user?.avatar && getAvatarText()}
          </Avatar>

          <div className="mobile-account-info">
            <span>{user ? getUserRole() : t("account")}</span>

            <strong>{getUserName()}</strong>
          </div>
        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div className="mobile-navigation">
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={mainMenuItems}
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>

        {/* =================================================
            MOBILE USER
        ================================================= */}

        <div
          style={{
            padding: "15px",
          }}>
          {user ? (
            <>
              <Button
                block
                icon={<ProfileOutlined />}
                style={{
                  marginBottom: 10,
                }}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/account");
                }}>
                {t("accountInfo")}
              </Button>

              <Button
                block
                icon={<ShoppingCartOutlined />}
                style={{
                  marginBottom: 10,
                }}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/orders");
                }}>
                {t("myOrders")}
              </Button>

              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                block
                icon={<LoginOutlined />}
                style={{
                  marginBottom: 10,
                }}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/login");
                }}>
                {t("loginSubmit")}
              </Button>

              <Button
                block
                icon={<UserAddOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/register");
                }}>
                {t("register")}
              </Button>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default HeaderPage;
