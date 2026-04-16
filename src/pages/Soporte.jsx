import React from "react";

export default function Soporte() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0B1020 0%, #11192E 50%, #0B1020 100%)",
        color: "#ffffff",
        padding: "48px 20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(162,247,228,0.12)",
            border: "1px solid rgba(162,247,228,0.25)",
            color: "#A2F7E4",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.02em",
            marginBottom: 18,
          }}
        >
          Soporte HabitaLibre
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 34,
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          ¿Necesitas ayuda con HabitaLibre?
        </h1>

        <p
          style={{
            marginTop: 16,
            marginBottom: 28,
            color: "rgba(255,255,255,0.78)",
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          Si tienes problemas con la app, dudas sobre tu cuenta o necesitas
          ayuda técnica, puedes contactarnos a través de los siguientes medios.
        </p>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#A2F7E4",
                fontWeight: 700,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Correo
            </div>
            <a
              href="mailto:hello@habitalibre.com"
              style={{
                color: "#ffffff",
                fontSize: 17,
                fontWeight: 700,
                textDecoration: "none",
                wordBreak: "break-word",
              }}
            >
              hello@habitalibre.com
            </a>
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Escríbenos desde el correo registrado en tu cuenta para procesar
              tu solicitud más rápido.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#A2F7E4",
                fontWeight: 700,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Sitio web
            </div>
            <a
              href="https://www.habitalibre.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#ffffff",
                fontSize: 17,
                fontWeight: 700,
                textDecoration: "none",
                wordBreak: "break-word",
              }}
            >
              www.habitalibre.com
            </a>
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Puedes visitar nuestra web para conocer más sobre HabitaLibre y
              sus servicios.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            padding: 20,
            borderRadius: 18,
            background: "rgba(162,247,228,0.08)",
            border: "1px solid rgba(162,247,228,0.16)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 10,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            Temas con los que te podemos ayudar
          </h2>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            <li>Problemas para iniciar sesión</li>
            <li>Dudas sobre tu perfil o simulación</li>
            <li>Ayuda con tu cuenta</li>
            <li>Reportes de errores o fallas técnicas</li>
            <li>Solicitudes relacionadas con privacidad o eliminación de cuenta</li>
          </ul>
        </div>
      </div>
    </div>
  );
}