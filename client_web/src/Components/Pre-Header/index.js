import React from "react";
import { useTranslation } from "react-i18next";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import "./index.css";

const storePhone = process.env.REACT_APP_STORE_PHONE || "0888004044";
const storeEmail = process.env.REACT_APP_STORE_EMAIL || "congtynhakinhcongnghecaodalat@gmail.com";

const PreHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="pre-header">
      <div className="pre-header-container">
        {/* =========================================
            LEFT - CONTACT
        ========================================= */}

        <div className="pre-header-left">
          {/* PHONE */}

          <a href={`tel:${storePhone.replaceAll(" ", "")}`} className="pre-header-contact phone">
            <span className="pre-header-icon">
              <PhoneOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">{t("hotline")}</span>

              <strong>{storePhone}</strong>
            </span>
          </a>

          {/* DIVIDER */}

          <span className="pre-header-divider" />

          {/* EMAIL */}

          <a
            href={`mailto:${storeEmail}`}
            className="pre-header-contact email">
            <span className="pre-header-icon">
              <MailOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">{t("email")}</span>

              <strong>{storeEmail}</strong>
            </span>
          </a>

          {/* DIVIDER */}

          <span className="pre-header-divider" />

          {/* LOCATION */}

          <a className="pre-header-contact location" href={process.env.REACT_APP_MAP_URL || "#"} target="_blank" rel="noreferrer">
            <span className="pre-header-icon">
              <EnvironmentOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">{t("companyAddress")}</span>

              <strong>{t("viewOnGoogleMaps")} ↗</strong>
            </span>
          </a>
        </div>

        {/* =========================================
            RIGHT
        ========================================= */}

        <div className="pre-header-right">
          {/* MESSAGE */}

          <div className="pre-header-message">
            <ClockCircleOutlined />

            <span>{t("preHeaderMessage")}</span>
          </div>

          {/* DIVIDER */}

          <span className="pre-header-divider right-divider" />

          {/* SOCIAL */}

          <div className="pre-header-social">
            <a href={process.env.REACT_APP_FACEBOOK_URL || "#"} target="_blank" rel="noreferrer" aria-label={t("facebookStore")} title={t("facebookStore")}>
              <FacebookOutlined />
            </a>

            <a href={process.env.REACT_APP_TIKTOK_URL || "#"} target="_blank" rel="noreferrer" aria-label={t("tiktokStore")} title={t("tiktokStore")} className="pre-header-tiktok">
              ♪
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreHeader;
