import React from "react";
import { Button, Card, Col, Tag } from "antd";
import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import MediaDisplay from "../../../Components/MediaDisplay";
import { localizedField } from "../../../utils/localized";

export default function ProductCard({
  product, priceInfo, priceText, discount, availableStock, stockLoading,
  stockLoaded, wishlist, wishlistBusy, formatPrice, image, onOpen, onAdd, onWishlist,
}) {
  const { t, i18n } = useTranslation();
  const name = localizedField(product, "name", i18n.resolvedLanguage);
  return (
    <Col xs={12} sm={12} md={8} lg={6} xl={6}>
      <Card className="product-card" hoverable bodyStyle={{ padding: "14px" }} cover={
        <div className="product-image-wrapper" onClick={() => onOpen(product)}>
          <MediaDisplay src={image} alt={name} className="product-image" />
          {product.isNew && <Tag color="green" className="product-tag product-new">{t("newProduct")}</Tag>}
          {product.isBestSeller && <Tag color="gold" className="product-tag product-best">{t("bestSellerTag")}</Tag>}
          {product.isOnSale && discount > 0 && <Tag color="red" className="product-discount">-{discount}%</Tag>}
        </div>
      }>
        <div className="product-name" onClick={() => onOpen(product)}>{name}</div>
        <div className="product-price"><span>{priceText}</span>{priceInfo.originalPrice && priceInfo.originalPrice > priceInfo.price && <del>{formatPrice(priceInfo.originalPrice)}</del>}</div>
        <div className="product-stock">{stockLoading && !stockLoaded ? <span className="stock-checking">{t("stockChecking")}</span> : availableStock > 0 ? <span className="stock-available">{t("stockAvailable", { count: availableStock })}</span> : <span className="stock-out">{t("outOfStock")}</span>}</div>
        <div className="product-meta"><span>⭐ {Number(product.ratingAverage || 0).toFixed(1)}</span><span>({product.ratingCount || 0})</span><span>{t("soldCount", { count: product.soldCount || 0 })}</span></div>
        <div className="product-actions">
          <Button icon={<EyeOutlined />} onClick={() => onOpen(product)} className="product-view-button">{t("viewProduct")}</Button>
          <Button type="primary" icon={<ShoppingCartOutlined />} disabled={!availableStock} onClick={() => onAdd(product)}>{t("addToCart")}</Button>
          <Button type="text" icon={wishlist ? <HeartFilled /> : <HeartOutlined />} className="product-wishlist-button" loading={wishlistBusy} aria-label={wishlist ? t("removeFavorite") : t("addFavorite")} onClick={() => onWishlist(product)} />
        </div>
      </Card>
    </Col>
  );
}
