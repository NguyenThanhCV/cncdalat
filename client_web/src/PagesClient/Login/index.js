import React, { useState } from "react";

import { Button, Checkbox, Form, Input, Modal, notification } from "antd";

import {
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";

import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";

import { withTranslation, useTranslation } from "react-i18next";

import { asyncLoginRequestAction } from "./stores/action";

import "./index.css";
import MediaDisplay from "../../Components/MediaDisplay";
import useSiteMedia from "../../hooks/useSiteMedia";

const LoginComponent = (props) => {
  const { loginRequestDispatch } = props;

  const { i18n, t } = useTranslation();
  const storeLogo = useSiteMedia("store-logo");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  /*
   * =========================================================
   * CHANGE LANGUAGE
   * =========================================================
   */

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);

    setIsLanguageOpen(false);
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const onFinish = async (values) => {
    try {
      setLoading(true);

      /*
       * values:
       *
       * {
       *   email: "...",
       *   password: "...",
       *   remember: true
       * }
       */

      const result = await loginRequestDispatch(values);


      /*
       * =====================================================
       * LOGIN FAILED
       * =====================================================
       */

      if (!result || result.success === false) {
        notification.error({
          message: (
            <div className="login-notification-title">{t("loginFailed")}</div>
          ),

          description: (
            <div className="login-notification-description">
              {result?.message ||
                t("loginInvalidCredentials")}
            </div>
          ),

          icon: (
            <div className="login-notification-icon login-notification-error">
              <ExclamationCircleFilled />
            </div>
          ),

          placement: "topRight",

          duration: 4,

          className: "login-notification",
        });

        return;
      }

      /*
       * =====================================================
       * GET USER
       * =====================================================
       */

      const user = result?.data?.user;

      /*
       * =====================================================
       * LOGIN SUCCESS
       * =====================================================
       */

      notification.success({
        message: (
          <div className="login-notification-title">{t("loginSuccess")}</div>
        ),

        description: (
          <div className="login-notification-description">
            {t("loginHello")} <strong>{user?.name || user?.email || ""}</strong>! {t("loginWelcomeBack")}
          </div>
        ),

        icon: (
          <div className="login-notification-icon login-notification-success">
            <CheckCircleFilled />
          </div>
        ),

        placement: "topRight",

        duration: 3,

        className: "login-notification",
      });

      /*
       * =====================================================
       * REDIRECT
       * =====================================================
       */

      if (user?.role === "admin") {
        navigate("/administrator/users");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      /*
       * =====================================================
       * API / SERVER ERROR
       * =====================================================
       */

      notification.error({
        message: (
          <div className="login-notification-title">{t("loginUnavailable")}</div>
        ),

        description: (
          <div className="login-notification-description">
            {error?.response?.data?.message ||
              t("loginUnexpectedError")}
          </div>
        ),

        icon: (
          <div className="login-notification-icon login-notification-error">
            <CloseOutlined />
          </div>
        ),

        placement: "topRight",

        duration: 4,

        className: "login-notification",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * LANGUAGE NAME
   * =========================================================
   */

  const activeLanguage = (i18n.resolvedLanguage || i18n.language || "vi").split("-")[0];
  const currentLanguage = activeLanguage === "vi" ? "Tiếng Việt" : "English";

  return (
    <div className="login-page">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="login-bg-circle login-bg-circle-1"></div>

      <div className="login-bg-circle login-bg-circle-2"></div>

      {/* =====================================================
          LANGUAGE
      ===================================================== */}

      <div className="login-language">
        <Button
          type="text"
          icon={<GlobalOutlined />}
          onClick={() => setIsLanguageOpen(true)}>
          {currentLanguage}
        </Button>
      </div>

      {/* =====================================================
          LOGIN WRAPPER
      ===================================================== */}

      <div className="login-wrapper">
        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="login-introduction">
          {/* BRAND */}

          <Link to="/" className="brand login-brand-link">
            {storeLogo?.mediaUrl && <MediaDisplay className="brand-logo" src={storeLogo.mediaUrl} mediaType={storeLogo.mediaType} alt={storeLogo.altText || t("storeName")} />}

            <div className="brand-info">
              <div className="brand-name">NHÀ KÍNH ĐÀ LẠT</div>

          <div className="brand-subtitle">{t("loginBrandSubtitle")}</div>
            </div>
          </Link>

          {/* INTRO */}

          <div className="intro-content">
            <div className="intro-badge">
              <span></span>
              {t("loginIntroBadge")}
            </div>

            <h1>
              {t("loginIntroTitle")}
              <br />
              <strong>{t("loginIntroTitleEmphasis")}</strong>
            </h1>

            <p>
              {t("loginIntroDescription")}
            </p>

            {/* FEATURES */}

            <div className="intro-features">
              <div className="intro-feature">
                <div className="feature-icon">✓</div>

                <span>{t("loginFeatureQuality")}</span>
              </div>

              <div className="intro-feature">
                <div className="feature-icon">✓</div>

                <span>{t("loginFeaturePrice")}</span>
              </div>

              <div className="intro-feature">
                <div className="feature-icon">✓</div>

                <span>{t("loginFeatureSupport")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT LOGIN
        =================================================== */}

        <div className="login-card">
          <Link to="/" className="brand login-card-brand">
            {storeLogo?.mediaUrl && <MediaDisplay className="brand-logo" src={storeLogo.mediaUrl} mediaType={storeLogo.mediaType} alt={storeLogo.altText || t("storeName")} />}
            <div className="brand-info">
              <div className="brand-name">NHÀ KÍNH ĐÀ LẠT</div>
              <div className="brand-subtitle">{t("loginBrandSubtitle")}</div>
            </div>
          </Link>

          {/* LOGIN HEADER */}

          <div className="login-card-header">
            <div className="login-icon">
              <LoginOutlined />
            </div>

            <h2>{t("loginWelcome")}</h2>

            <p>{t("loginContinue")}</p>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <Form
            name="login"
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            className="login-form">
            {/* EMAIL */}

            <Form.Item
              label={t("loginEmail")}
              name="email"
              rules={[
                {
                  required: true,
                  message: t("loginEmailRequired"),
                },

                {
                  type: "email",
                  message: t("loginEmailInvalid"),
                },
              ]}>
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder={t("loginEmailPlaceholder")}
                autoComplete="email"
              />
            </Form.Item>

            {/* PASSWORD */}

            <Form.Item
              label={t("loginPassword")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("loginPasswordRequired"),
                },

                {
                  min: 6,
                  message: t("loginPasswordMin"),
                },
              ]}>
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder={t("loginPasswordPlaceholder")}
                autoComplete="current-password"
              />
            </Form.Item>

            {/* OPTIONS */}

            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t("loginRemember")}</Checkbox>
              </Form.Item>

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  notification.info({
                    message: t("loginForgotTitle"),

                    description:
                      t("loginForgotNotice"),
                  });
                }}>
                {t("loginForgot")}
              </button>
            </div>

            {/* LOGIN BUTTON */}

            <Form.Item className="login-submit">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<LoginOutlined />}>
                {loading ? t("loginSubmitting") : t("loginSubmit")}
              </Button>
            </Form.Item>
          </Form>

          {/* REGISTER */}

          <div className="register-area">
            <span>{t("loginNoAccount")}</span>

            <button
              type="button"
              onClick={() => {
                navigate("/register");
              }}>
              {t("loginRegister")}
            </button>
          </div>

          {/* FOOTER */}

          <div className="login-footer">
            <span>© 2026 Nhà kính công nghệ cao Đà Lạt</span>

            <span>•</span>

            <span>{t("loginBrandSubtitle")}</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          LANGUAGE MODAL
      ===================================================== */}

      <Modal
        open={isLanguageOpen}
        footer={null}
        closable={false}
        onCancel={() => {
          setIsLanguageOpen(false);
        }}
        width={280}
        centered
        className="language-modal">
        <div className="language-modal-content">
          <div className="language-title">
            <GlobalOutlined />

            <span>{t("loginChooseLanguage")}</span>
          </div>

          <Button
            block
            onClick={() => {
              changeLanguage("vi");
            }}
            className={activeLanguage === "vi" ? "language-active" : ""}>
            🇻🇳 Tiếng Việt
          </Button>

          <Button
            block
            onClick={() => {
              changeLanguage("en");
            }}
            className={activeLanguage === "en" ? "language-active" : ""}>
            🇬🇧 English
          </Button>
        </div>
      </Modal>
    </div>
  );
};

/*
 * ===========================================================
 * REDUX
 * ===========================================================
 */

const mapStateToProps = createStructuredSelector({});

const mapDispatchToProps = (dispatch) => ({
  loginRequestDispatch: (payload) => asyncLoginRequestAction(dispatch)(payload),
});

const Login = withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(LoginComponent),
);

export default Login;
