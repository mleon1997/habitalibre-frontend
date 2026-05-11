// src/pages/ChecklistDocumentos.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  FileText,
  FolderOpen,
  Home,
  Briefcase,
  FileSignature,
  Building2,
  KeyRound,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import {
  Card,
  Chip,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
} from "../ui/kit.jsx";
import { getCustomer } from "../lib/customerSession.js";

const LS_DOCS_CHECKLIST = "hl_docs_checklist_v1";

function safeParseLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getStorageOwnerEmail() {
  try {
    const email = String(getCustomer()?.email || "").trim().toLowerCase();
    return email || null;
  } catch {
    return null;
  }
}

function loadOwnedData(key) {
  const ownerEmail = getStorageOwnerEmail();
  const envelope = safeParseLS(key);

  if (!envelope) return null;

  if (envelope?.ownerEmail && "data" in envelope) {
    if (
      ownerEmail &&
      String(envelope.ownerEmail).trim().toLowerCase() === ownerEmail
    ) {
      return envelope.data ?? null;
    }

    if (!ownerEmail) return envelope.data ?? null;
    return null;
  }

  return envelope;
}

function saveOwnedData(key, data) {
  const ownerEmail = getStorageOwnerEmail();
  saveLS(key, { ownerEmail, data });
}

const BASE_SECTIONS = [
  {
    id: "personales",
    title: "Documentos personales",
    icon: <FileText size={14} />,
    items: [
      { id: "cedula", label: "Cédula o documento de identidad" },
      { id: "papeleta", label: "Papeleta de votación, si aplica" },
      { id: "civil", label: "Documento de estado civil, si aplica" },
    ],
  },
  {
    id: "ingresos",
    title: "Ingresos y respaldo financiero",
    icon: <Briefcase size={14} />,
    items: [
      { id: "ingresos", label: "Comprobantes de ingresos" },
      { id: "rol", label: "Rol de pagos o respaldo laboral" },
      { id: "bancos", label: "Estados de cuenta bancarios recientes" },
      { id: "deudas", label: "Información de deudas vigentes, si aplica" },
    ],
  },
  {
    id: "propiedad",
    title: "Propiedad o proyecto",
    icon: <Home size={14} />,
    items: [
      { id: "proforma", label: "Información del proyecto o propiedad elegida" },
      { id: "reserva", label: "Reserva o documento comercial, si existe" },
      { id: "promotor", label: "Datos del promotor o vendedor" },
    ],
  },
];

const NEXT_STAGES = [
  {
    id: "reserva-separacion",
    icon: <Building2 size={15} />,
    title: "Reserva o separación",
    text: "En algunos proyectos, este paso viene después de elegir la propiedad para asegurar disponibilidad o fijar condiciones comerciales.",
  },
  {
    id: "promesa-compraventa",
    icon: <FileSignature size={15} />,
    title: "Promesa de compraventa",
    text: "En proyectos en construcción, esta suele ser una etapa importante antes de la entrega final y antes de la escritura.",
  },
  {
    id: "gestion-entidad",
    icon: <FolderOpen size={15} />,
    title: "Gestión con promotor o entidad",
    text: "Aquí el proceso real continúa con el promotor del proyecto o con la entidad financiera que corresponda.",
  },
  {
    id: "escritura-cierre",
    icon: <KeyRound size={15} />,
    title: "Escritura y cierre",
    text: "Cuando el proceso avance y la operación esté lista, esta suele ser una de las etapas finales de formalización.",
  },
];

function ChecklistRow({ checked, label, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 15px",
        borderRadius: 18,
        border: `1px solid ${
          checked ? "rgba(37,211,166,0.25)" : "rgba(255,255,255,0.09)"
        }`,
        background: checked
          ? "rgba(37,211,166,0.09)"
          : "rgba(255,255,255,0.04)",
        color: "white",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: checked
            ? "rgba(37,211,166,0.18)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${
            checked ? "rgba(37,211,166,0.36)" : "rgba(255,255,255,0.18)"
          }`,
          flex: "0 0 auto",
          boxShadow: checked ? "0 0 0 4px rgba(37,211,166,0.08)" : "none",
        }}
      >
        {checked ? <Check size={13} /> : null}
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.35,
          color: checked ? "rgba(226,232,240,0.98)" : "rgba(203,213,225,0.95)",
          fontWeight: checked ? 850 : 650,
        }}
      >
        {label}
      </div>
    </button>
  );
}

function StageCard({ icon, title, text }) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 950,
          color: "rgba(226,232,240,0.98)",
          marginBottom: 8,
        }}
      >
        {icon}
        {title}
      </div>

      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.48,
          color: "rgba(148,163,184,0.95)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function ChecklistDocumentos() {
  const navigate = useNavigate();

  const stored = useMemo(() => loadOwnedData(LS_DOCS_CHECKLIST), []);
  const [checks, setChecks] = useState(stored || {});

  const totalItems = BASE_SECTIONS.reduce(
    (acc, section) => acc + section.items.length,
    0
  );

  const doneItems = Object.values(checks).filter(Boolean).length;
  const progress =
    totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  function toggleItem(id) {
    setChecks((prev) => {
      const next = { ...(prev || {}), [id]: !prev?.[id] };
      saveOwnedData(LS_DOCS_CHECKLIST, next);
      return next;
    });
  }

  return (
    <HabitaShell maxWidth={860}>
      <div style={{ paddingBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/ruta")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "white",
              borderRadius: 999,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: 850,
              flex: "0 0 auto",
            }}
          >
            <ArrowLeft size={15} />
            Volver a Ruta
          </button>

          <Chip tone={progress === 100 ? "good" : "neutral"}>
            {progress}% listo
          </Chip>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 850,
              marginBottom: 8,
            }}
          >
            Preparar documentos
          </div>

          <div
            style={{
              fontSize: 36,
              lineHeight: 1.02,
              fontWeight: 980,
              letterSpacing: -1.2,
              color: "rgba(226,232,240,0.98)",
              maxWidth: 620,
            }}
          >
            Prepara tus documentos
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.45,
              color: "rgba(148,163,184,0.95)",
              maxWidth: 620,
            }}
          >
            Te mostramos qué deberías tener listo para avanzar con el promotor o
            la entidad financiera.
          </div>
        </div>

        <Card style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 850,
                }}
              >
                Tu avance
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 20,
                  fontWeight: 950,
                  color: "rgba(226,232,240,0.98)",
                }}
              >
                {doneItems} de {totalItems} ítems listos
              </div>
            </div>

            <Chip tone={progress === 100 ? "good" : "neutral"}>
              {progress === 100 ? "Checklist completa" : "En preparación"}
            </Chip>
          </div>

          <div style={{ marginTop: 16 }}>
            <ProgressBar value={progress} />
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "rgba(148,163,184,0.92)",
              lineHeight: 1.4,
            }}
          >
            Checklist referencial para avanzar mejor preparado.
          </div>
        </Card>

        <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
          {BASE_SECTIONS.map((section) => (
            <Card key={section.id} style={{ padding: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 14,
                  fontWeight: 950,
                  color: "rgba(226,232,240,0.96)",
                }}
              >
                {section.icon}
                {section.title}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {section.items.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    checked={!!checks?.[item.id]}
                    label={item.label}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card style={{ marginTop: 18, padding: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.05)",
              fontSize: 14,
              fontWeight: 950,
              color: "rgba(226,232,240,0.96)",
            }}
          >
            <FolderOpen size={14} />
            Etapas que podrían venir después
          </div>

          <div
            style={{
              marginBottom: 14,
              fontSize: 13.5,
              lineHeight: 1.45,
              color: "rgba(148,163,184,0.95)",
            }}
          >
            Esto no es parte del checklist documental, sino de los hitos que
            pueden venir después en tu camino real.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {NEXT_STAGES.map((stage) => (
              <StageCard
                key={stage.id}
                icon={stage.icon}
                title={stage.title}
                text={stage.text}
              />
            ))}
          </div>
        </Card>

        <Card style={{ marginTop: 18, padding: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.05)",
              fontSize: 14,
              fontWeight: 950,
              color: "rgba(226,232,240,0.96)",
            }}
          >
            <FolderOpen size={14} />
            Nota importante
          </div>

          <div
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: "rgba(203,213,225,0.95)",
            }}
          >
            HabitaLibre no procesa directamente tu hipoteca. Esta checklist
            existe para ayudarte a llegar mejor preparado al siguiente paso con
            el promotor o la entidad financiera.
          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            <PrimaryButton onClick={() => navigate("/ruta")}>
              Volver a mi ruta
            </PrimaryButton>

            <SecondaryButton onClick={() => navigate("/match")}>
              Ver mi Match otra vez
            </SecondaryButton>
          </div>
        </Card>
      </div>
    </HabitaShell>
  );
}