import React, { useEffect, useState } from "react";

import {
  Row,
  Input,
  Select,
  Empty,
  Spin,
  Button,
  Pagination,
  message,
} from "antd";

import {
  SearchOutlined,
} from "@ant-design/icons";

import { connect } from "react-redux";

import { createStructuredSelector } from "reselect";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { localizedField } from "../../utils/localized";

import {
  selectProductLoading,
  selectProducts,
  selectProductPagination,
} from "./stores/selectors";

import { getProductsRequestAction } from "./stores/actions";
import { getVariantsService } from "../../api/apiVariant";
import { getCategoriesService } from "../../api/apiCategory";
import { getBrandsService } from "../../api/apiBrand";
import { getWishlist, addWishlist, removeWishlist, getPromotions, addCartItem } from "../../api/shop";
import ProductCard from "./components/ProductCard";

import "./style.css";

const Products = ({ isLoading, products, pagination, getProducts }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  /*
  =====================================================
  FILTER STATE
  =====================================================
  */

  const [searchText, setSearchText] = useState(
    searchParams.get("search") || "",
  );
  useEffect(() => setSearchText(searchParams.get("search") || ""), [searchParams]);

  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const [stockByProduct, setStockByProduct] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistBusy, setWishlistBusy] = useState("");
  const [stockLoading, setStockLoading] = useState(false);
  const dealCampaignId = searchParams.get("deal");
  const [dealCampaign, setDealCampaign] = useState(null);

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page") || 1),
  );

  const limit = 20;

  /*
  =====================================================
  LOAD PRODUCTS
  =====================================================
  */

  useEffect(() => {
    const search = searchParams.get("search") || "";

    const category = searchParams.get("category") || undefined;

    const brand = searchParams.get("brand") || undefined;

    const featuredParam = searchParams.get("featured");
    const sortParam = searchParams.get("sort") || "newest";

    const featuredValue =
      featuredParam === null ? undefined : featuredParam === "true";

    const page = Number(searchParams.get("page") || 1);

    setCurrentPage(page);

    getProducts({
      page,
      limit,
      search,
      category,
      brand,
      status: "active",
      featured: featuredValue,
      sort: sortParam,
      deal: dealCampaignId || undefined,
    });
    setSort(sortParam);
  }, [searchParams, getProducts, dealCampaignId]);

  useEffect(() => {
    if (!dealCampaignId) { setDealCampaign(null); return; }
    let active = true;
    getPromotions().then((result) => {
      const rows = result?.data?.data ?? result?.data ?? result ?? [];
      const campaign = rows.find((item) => String(item.id || item._id) === dealCampaignId);
      if (active) setDealCampaign(campaign || null);
    }).catch(() => { if (active) setDealCampaign(null); });
    return () => { active = false; };
  }, [dealCampaignId]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getCategoriesService({ page: 1, limit: 100, status: "active" }),
      getBrandsService({ page: 1, limit: 100, status: "active" }),
      localStorage.getItem("token") ? getWishlist() : Promise.resolve(null),
    ]).then(([categoriesResult, brandsResult, wishlistResult]) => {
      if (!active) return;
      const rows = (result) => result?.status === "fulfilled" && Array.isArray(result.value?.data?.data) ? result.value.data.data : [];
      setCategoryOptions(rows(categoriesResult));
      setBrandOptions(rows(brandsResult));
      const wishlist = wishlistResult?.status === "fulfilled" ? wishlistResult.value?.data?.products : [];
      setWishlistIds(Array.isArray(wishlist) ? wishlist.map((item) => String(item?._id || item)) : []);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const loadVariantStock = async () => {
      if (!products?.length) {
        setStockByProduct({});
        setStockLoading(false);
        return;
      }

      setStockLoading(true);
      const entries = await Promise.all(
        products.map(async (product) => {
          try {
            const response = await getVariantsService({ product: product._id, limit: 100 });
            const variants = response?.data?.data || response?.data || [];
            const activeVariants = variants.filter((variant) => variant?.active !== false);
            const prices = activeVariants.map((variant) => Number(variant.price)).filter(Number.isFinite);
            const originalPrices = activeVariants.map((variant) => Number(variant.compareAtPrice)).filter(Number.isFinite);
            const availableStock = activeVariants
              .reduce(
                (total, variant) =>
                  total + Math.max(
                    Number(variant.stock || 0) - Number(variant.reservedStock || 0),
                    0,
                  ),
                0,
              );
            return [product._id, { stock: availableStock, variants: activeVariants, minPrice: prices.length ? Math.min(...prices) : null, maxPrice: prices.length ? Math.max(...prices) : null, minOriginalPrice: originalPrices.length ? Math.min(...originalPrices) : null }];
          } catch (_) {
            return [product._id, { stock: null, variants: [], minPrice: null, maxPrice: null, minOriginalPrice: null }];
          }
        }),
      );

      if (active) {
        setStockByProduct(Object.fromEntries(entries));
        setStockLoading(false);
      }
    };

    loadVariantStock();
    return () => {
      active = false;
    };
  }, [products]);

  /*
  =====================================================
  SEARCH
  =====================================================
  */

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);

    const keyword = searchText.trim();

    if (keyword) {
      params.set("search", keyword);
    } else {
      params.delete("search");
    }

    if (dealCampaignId) params.set("deal", dealCampaignId);
    params.set("page", "1");

    setSearchParams(params);
  };

  /*
  =====================================================
  ENTER SEARCH
  =====================================================
  */

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /*
  =====================================================
  PAGE
  =====================================================
  */

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", page);

    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  =====================================================
  FEATURED
  =====================================================
  */

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (dealCampaignId) params.set("deal", dealCampaignId);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleWishlist = async (product) => {
    if (!localStorage.getItem("token")) {
      message.info(t("loginToSaveFavorite"));
      navigate("/login?next=/wishlist");
      return;
    }
    const id = String(product._id);
    setWishlistBusy(id);
    try {
      if (wishlistIds.includes(id)) {
        await removeWishlist(id);
        setWishlistIds((current) => current.filter((item) => item !== id));
        message.success("Đã bỏ khỏi danh sách yêu thích.");
      } else {
        await addWishlist(id);
        setWishlistIds((current) => [...current, id]);
        message.success("Đã lưu vào danh sách yêu thích.");
      }
    } catch (error) {
      message.error(error.response?.data?.message || t("favoriteUpdateFailed"));
    } finally {
      setWishlistBusy("");
    }
  };

  const changeSort = (value) => {
    setSort(value);
    setFilter("sort", value === "newest" ? "" : value);
  };

  /*
  =====================================================
  PRICE
  =====================================================
  */

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "Liên hệ";
    }

    if (Number(price) === 0) {
      return "Liên hệ";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",

      currency: "VND",
    }).format(Number(price));
  };

  /*
  =====================================================
  PRODUCT IMAGE
  =====================================================
  */

  const getProductImage = (product) => {
    if (product.thumbnail) {
      return product.thumbnail;
    }

    if (product.images && product.images.length) {
      return product.images[0];
    }

    if (product.video) {
      return product.video;
    }

    return process.env.REACT_APP_PRODUCT_PLACEHOLDER_URL || "";
  };

  /*
  =====================================================
  DISCOUNT
  =====================================================
  */

  const getAvailableStock = (product) => {
    const frontendStock = stockByProduct[product?._id]?.stock;
    if (frontendStock !== undefined && frontendStock !== null) {
      return Math.max(Number(frontendStock) || 0, 0);
    }
    if (product?.availableStock !== undefined && product?.availableStock !== null) {
      return Math.max(Number(product.availableStock) || 0, 0);
    }
    return Math.max(Number(product?.stock) || 0, 0);
  };

  const getPriceInfo = (product) => {
    const stats = stockByProduct[product?._id] || {};
    const price = stats.minPrice;
    const maxPrice = stats.maxPrice;
    const originalPrice = stats.minOriginalPrice;
    const discount = originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
    return { price, maxPrice, originalPrice, discount };
  };

  const getDiscount = (product) => {
    const { discount } = getPriceInfo(product);
    if (!discount) {
      return 0;
    }
    return discount;
  };

  /*
  =====================================================
  PRODUCT DETAIL
  =====================================================
  */

  const handleProductClick = (product) => {
    if (!product?._id) {
      return;
    }

    navigate(`/products/${product._id}`);
  };

  /*
  =====================================================
  ADD CART
  =====================================================
  */

  const handleAddCart = (product) => {
    if (!product?._id) {
      return;
    }

    if (!localStorage.getItem("token")) {
      message.warning(t("loginToBuy"));
      navigate(`/login?next=/products/${product._id}`);
      return;
    }

    const availableVariants = (stockByProduct[product._id]?.variants || []).filter((variant) =>
      variant?.active !== false && Number(variant.availableStock ?? (Number(variant.stock || 0) - Number(variant.reservedStock || 0))) > 0,
    );
    if (availableVariants.length !== 1) {
      navigate(`/products/${product._id}`);
      return;
    }

    addCartItem({ product: product._id, variant: availableVariants[0]._id, quantity: 1 })
      .then(() => {
        window.dispatchEvent(new Event("cart-change"));
        message.success(t("addedToCart"));
      })
      .catch((error) => message.error(error.response?.data?.message || t("addToCartFailed")));
  };

  /*
  =====================================================
  PRODUCT COUNT
  =====================================================
  */

  const total = pagination?.total || 0;
  const visibleProducts = products;

  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (
    <div className="products-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="products-header">
        <div className="products-title">
          <h1>{dealCampaignId && dealCampaign ? localizedField(dealCampaign, "name", i18n.resolvedLanguage) : t("productPageTitle")}</h1>

          <p>{dealCampaignId ? t("productDealDescription") : t("productPageDescription")}</p>
        </div>

        <div className="products-search">
          <Input
            size="large"
            allowClear
            value={searchText}
            placeholder={t("productSearchPlaceholder")}
            prefix={<SearchOutlined />}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            onKeyDown={handleSearchKeyDown}
          />

          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}>
            {t("search")}
          </Button>
        </div>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="products-toolbar">
        <div className="products-result">
          {dealCampaignId ? (
            <>{t("dealProducts")} <strong>“{dealCampaign?.name || t("loadingOffer")}”</strong></>
          ) : searchParams.get("search") ? (
            <>
              {t("searchResultsFor")} {" "}
              <strong>"{searchParams.get("search")}"</strong>
            </>
          ) : (
            <>{t("allProducts")}</>
          )}

          {total > 0 && <span> · {total} {t("productCount")}</span>}
        </div>
        {dealCampaignId && <button type="button" className="link-button" onClick={() => navigate("/products", { replace: true })}>{t("clearProductFilters")}</button>}

      <div className="products-filter">
          <Select
            placeholder={t("category")}
            value={searchParams.get("category") || ""}
            onChange={(value) => setFilter("category", value)}
            options={[{ value: "", label: t("allCategories") }, ...categoryOptions.map((category) => ({ value: category._id, label: localizedField(category, "name", i18n.resolvedLanguage) }))]}
            style={{ width: 175 }}
          />
          <Select
            placeholder={t("brand")}
            value={searchParams.get("brand") || ""}
            onChange={(value) => setFilter("brand", value)}
            options={[{ value: "", label: t("allBrands") }, ...brandOptions.map((brand) => ({ value: brand._id, label: localizedField(brand, "name", i18n.resolvedLanguage) }))]}
            style={{ width: 175 }}
          />
          <Select
            value={searchParams.get("featured") || ""}
            onChange={(value) => setFilter("featured", value)}
            options={[
              { value: "", label: t("allProducts") },
              { value: "true", label: t("featuredProducts") },
            ]}
            style={{ width: 190 }}
          />

          <Select
            value={sort}
            style={{
              width: 180,
            }}
            onChange={changeSort}
            options={[
              {
                value: "newest",

                label: t("newest"),
              },

              {
                value: "popular",

                label: t("bestSelling"),
              },

              {
                value: "rating",

                label: t("topRated"),
              },
            ]}
          />
        </div>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading ? (
        <div className="products-loading">
          <Spin size="large" />

          <p>{t("loadingProducts")}</p>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="products-empty">
          <Empty
            description={
              dealCampaignId
                ? t("noDealProducts")
                : searchParams.get("search")
                ? t("noSearchProducts")
                : t("noProducts")
            }
          />
        </div>
      ) : (
        <Row gutter={[20, 24]}>
          {visibleProducts.map((product) => {
            const discount = getDiscount(product);
            const availableStock = getAvailableStock(product);
            const priceInfo = getPriceInfo(product);
            const priceText = priceInfo.price == null
              ? t("noPrice")
              : priceInfo.price === priceInfo.maxPrice
                ? formatPrice(priceInfo.price)
                : `${formatPrice(priceInfo.price)} – ${formatPrice(priceInfo.maxPrice)}`;

            return <ProductCard
              key={product._id}
              product={product}
              priceInfo={priceInfo}
              priceText={priceText}
              discount={discount}
              availableStock={availableStock}
              stockLoading={stockLoading}
              stockLoaded={stockByProduct[product._id] !== undefined}
              wishlist={wishlistIds.includes(String(product._id))}
              wishlistBusy={wishlistBusy === String(product._id)}
              formatPrice={formatPrice}
              image={getProductImage(product)}
              onOpen={handleProductClick}
              onAdd={handleAddCart}
              onWishlist={handleWishlist}
            />;
          })}
        </Row>
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!isLoading && products.length > 0 && (
        <div className="products-pagination">
          <Pagination
            current={pagination?.page || currentPage}
            pageSize={pagination?.limit || limit}
            total={pagination?.total || 0}
            showSizeChanger={false}
            showQuickJumper
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

/*
=======================================================
REDUX STATE
=======================================================
*/

const mapStateToProps = createStructuredSelector({
  isLoading: selectProductLoading,

  products: selectProducts,

  pagination: selectProductPagination,
});

/*
=======================================================
REDUX DISPATCH
=======================================================
*/

const mapDispatchToProps = (dispatch) => ({
  getProducts: (payload) => {
    dispatch(getProductsRequestAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Products);
