import React, { useState } from "react";

import { Button, Checkbox, Form, Input, notification } from "antd";

import {
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";

import { withTranslation, useTranslation } from "react-i18next";

import { asyncLoginRequestAction } from "./stores/action";

import "./index.css";
import MediaDisplay from "../../Components/MediaDisplay";
import useSiteMedia from "../../hooks/useSiteMedia";
import * as shop from "../../api/shop";

const LoginComponent = (props) => {
  const { loginRequestDispatch } = props;

  const { i18n, t } = useTranslation();
  const storeLogo = useSiteMedia("store-logo");

  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const [loading, setLoading] = useState(false);

  /*
   * =========================================================
   * CHANGE LANGUAGE
   * =========================================================
   */

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isRegister) {
        await shop.register({ name: values.name, email: values.email, phone: values.phone, password: values.password });
        notification.success({ message: t("registerSuccess"), description: t("registerWelcome") });
        navigate("/");
        return;
      }

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
              t(isRegister ? "registerFailed" : "loginUnexpectedError")}
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
        <div className="login-language-switch" role="group" aria-label={t("loginChooseLanguage")}>
          <GlobalOutlined aria-hidden="true" />
          <Button type={activeLanguage === "vi" ? "primary" : "text"} onClick={() => changeLanguage("vi")} aria-pressed={activeLanguage === "vi"}>VI</Button>
          <Button type={activeLanguage === "en" ? "primary" : "text"} onClick={() => changeLanguage("en")} aria-pressed={activeLanguage === "en"}>EN</Button>
        </div>
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
              <div className="brand-name">{t("loginBrandName")}</div>

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
              {t(isRegister ? "registerDescription" : "loginIntroDescription")}
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
              <div className="brand-name">{t("loginBrandName")}</div>
              <div className="brand-subtitle">{t("loginBrandSubtitle")}</div>
            </div>
          </Link>

          {/* LOGIN HEADER */}

          <div className="login-card-header">
            <div className="login-icon">
              <LoginOutlined />
            </div>

            <h2>{t(isRegister ? "registerWelcomeTitle" : "loginWelcome")}</h2>

            <p>{t(isRegister ? "registerDescription" : "loginContinue")}</p>
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
            {isRegister && <Form.Item label={t("registerName")} name="name" rules={[{ required: true, message: t("registerNameRequired") }]}>
              <Input size="large" prefix={<LoginOutlined />} placeholder={t("registerNamePlaceholder")} autoComplete="name" />
            </Form.Item>}
            {isRegister && <Form.Item label={t("registerPhone")} name="phone" rules={[{ pattern: /^[0-9+()\-\s]{8,20}$/, message: t("registerPhoneInvalid") }]}>
              <Input size="large" prefix={<GlobalOutlined />} placeholder={t("registerPhonePlaceholder")} autoComplete="tel" />
            </Form.Item>}
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

            {!isRegister && <div className="login-options">
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
            </div>}

            {/* LOGIN BUTTON */}

            <Form.Item className="login-submit">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<LoginOutlined />}>
                {loading ? t(isRegister ? "registerSubmitting" : "loginSubmitting") : t(isRegister ? "registerSubmit" : "loginSubmit")}
              </Button>
            </Form.Item>
          </Form>

          {/* REGISTER */}

          <div className="register-area">
            <span>{t(isRegister ? "registerHasAccount" : "loginNoAccount")}</span>

            <button
              type="button"
              onClick={() => {
                navigate(isRegister ? "/login" : "/register");
              }}>
              {t(isRegister ? "registerGoLogin" : "loginRegister")}
            </button>
          </div>

          {/* FOOTER */}

          <div className="login-footer">
            <span>{t("loginCopyright")}</span>

            <span>•</span>

            <span>{t("loginBrandSubtitle")}</span>
          </div>
        </div>
      </div>

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
