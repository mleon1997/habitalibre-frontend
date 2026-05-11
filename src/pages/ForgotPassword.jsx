// src/pages/ForgotPassword.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent, trackPageView } from "../lib/analytics";
import * as customerApi from "../lib/customerApi.js";
import {
  Alert,
  Card,
  CenterShell,
  Eyebrow,
  Field,
  GhostButton,
  PrimaryButton,
  Subtitle,
  TextInput,
  Title,
} from "../ui/kit.jsx";

function isEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  return s.includes("@") && s.includes(".");
}

function niceMsg(err) {
  const raw =
    err?.data?.error ||
    err?.data?.message ||
    err?.message ||
    "No pudimos enviar el correo. Intenta nuevamente.";

  const msg = String(raw).toLowerCase();

  if (
    msg.includes("failed to fetch") ||
    msg.includes("load failed") ||
    msg.includes("network") ||
    msg.includes("timeout")
  ) {
    return "No pudimos conectarnos en este momento. Intenta de nuevo en unos segundos.";
  }

  return raw;
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    trackPageView("customer_forgot_password");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (busy) return;

    setError("");
    setSent(false);

    const finalEmail = String(email || "").trim().toLowerCase();

    if (!isEmail(finalEmail)) {
      setError("Ingresa un email válido para continuar.");
      return;
    }

    setBusy(true);

    try {
      trackEvent("customer_forgot_password_submit", {});

      await customerApi.forgotPassword({
        email: finalEmail,
      });

      setSent(true);

      trackEvent("customer_forgot_password_success", {});
    } catch (err) {
      trackEvent("customer_forgot_password_error", {
        message: String(err?.message || err),
      });

      setError(niceMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <CenterShell>
      <Card
        style={{
          width: "100%",
          maxWidth: 460,
          padding: 28,
          borderRadius: 32,
        }}
      >
        <img
          src="/LOGOHL.png"
          alt="HabitaLibre"
          style={{
            height: 34,
            width: "auto",
            marginBottom: 22,
            filter: "drop-shadow(0 8px 18px rgba(45,212,191,0.22))",
          }}
        />

        <Eyebrow>Recuperar acceso</Eyebrow>

        <Title style={{ marginTop: 10, fontSize: 30 }}>
          Recupera tu contraseña
        </Title>

        <Subtitle style={{ marginTop: 12 }}>
          Ingresa tu email y te enviaremos un enlace para crear una nueva
          contraseña.
        </Subtitle>

        <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
          <div style={{ display: "grid", gap: 16 }}>
            {sent ? (
              <Alert tone="success">
                Listo. Si existe una cuenta con ese email, recibirás un enlace
                para restablecer tu contraseña.
              </Alert>
            ) : null}

            {error ? <Alert>{error}</Alert> : null}

            <Field label="Email">
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Tu email"
                autoComplete="email"
              />
            </Field>

            <PrimaryButton type="submit" disabled={busy}>
              {busy ? "Enviando..." : "Enviar enlace"}
            </PrimaryButton>

            <GhostButton onClick={() => navigate("/login")}>
              Volver a iniciar sesión
            </GhostButton>
          </div>
        </form>

        <p
          style={{
            marginTop: 20,
            marginBottom: 0,
            textAlign: "center",
            fontSize: 11,
            lineHeight: 1.5,
            color: "rgba(148,163,184,0.72)",
          }}
        >
          Tus datos están protegidos. No compartimos tu información sin tu
          consentimiento.
        </p>
      </Card>
    </CenterShell>
  );
}