// src/pages/ResetPassword.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as customerApi from "../lib/customerApi.js";
import {
  Alert,
  Card,
  CenterShell,
  Eyebrow,
  Field,
  GhostButton,
  PrimaryButton,
  SecondaryButton,
  Subtitle,
  TextInput,
  Title,
} from "../ui/kit.jsx";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function niceMsg(err) {
  return (
    err?.data?.error ||
    err?.data?.message ||
    err?.message ||
    "Ocurrió un error. Intenta de nuevo."
  );
}

export default function ResetPassword() {
  const nav = useNavigate();
  const q = useQuery();
  const token = q.get("token") || "";

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Enlace inválido. Solicita uno nuevo.");
      return;
    }

    if (!p1 || p1.length < 6) {
      setError("Tu contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (p1 !== p2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await customerApi.resetPassword({
        token,
        newPassword: p1,
      });

      setOk(true);
    } catch (e2) {
      setError(niceMsg(e2));
    } finally {
      setLoading(false);
    }
  };

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
          Crea tu nueva contraseña
        </Title>

        <Subtitle style={{ marginTop: 12 }}>
          Elige una contraseña segura para retomar tu plan y volver a tu camino
          hacia la vivienda propia.
        </Subtitle>

        {ok ? (
          <div style={{ marginTop: 22 }}>
            <Alert tone="success">Listo. Tu contraseña fue actualizada.</Alert>

            <PrimaryButton
              onClick={() => nav("/login")}
              style={{ marginTop: 18 }}
            >
              Volver a iniciar sesión
            </PrimaryButton>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ marginTop: 22 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Nueva contraseña" hint="Mínimo 6 caracteres.">
                <TextInput
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  type="password"
                  placeholder="Tu nueva contraseña"
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Confirmar contraseña">
                <TextInput
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  type="password"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                />
              </Field>

              {error ? <Alert>{error}</Alert> : null}

              <PrimaryButton type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Actualizar contraseña"}
              </PrimaryButton>

              <SecondaryButton onClick={() => nav("/login")}>
                Volver a login
              </SecondaryButton>

              <GhostButton onClick={() => nav("/forgot-password")}>
                Solicitar un nuevo enlace
              </GhostButton>
            </div>
          </form>
        )}
      </Card>
    </CenterShell>
  );
}