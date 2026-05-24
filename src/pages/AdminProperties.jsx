import React, { useEffect, useMemo, useState } from "react";
import {
  createAdminProperty,
  deleteAdminProperty,
  listAdminProperties,
  updateAdminProperty,
  updateAdminPropertyStatus,
  downloadPropertiesTemplate,
  previewPropertiesExcel,
  confirmPropertiesBulk,
} from "../lib/propertiesAdminApi.js";
import { moneyUSD } from "../lib/money";
import AdminTopNav from "../components/AdminTopNav.jsx";

const EMPTY_FORM = {
  id: "",
  developer: "GLS Constructores",
  proyecto: "",
  titulo: "",
  descripcion: "",

  unidad: "",
  torre: "",
  bloque: "",
  piso: "",
  manzana: "",
  lote: "",

  tipoInmueble: "departamento",
  tipoProyecto: "edificio",
  uso: "vivienda_principal",

  precio: "",
  m2: "",
  m2Construccion: "",
  m2Terreno: "",
  dormitorios: "",
  banos: "",
  parqueaderos: "",
  bodega: false,
  alicuotaEstimada: "",

  ciudad: "Quito",
  zona: "Quito",
  ciudadZona: "Norte de Quito",
  sector: "",
  direccionReferencial: "",
  googleMapsUrl: "",

  proyectoNuevo: true,
  viviendaNueva: true,
  tipoEntrega: "construccion",
  etapaProyecto: "construccion",
  fechaEntregaEstimada: "",
  fechaEscrituraEstimada: "",

  permiteEntradaEnCuotas: true,
  mesesConstruccionRestantes: "",
  porcentajeEntradaRequerida: 0.1,
  reservaMinima: 500,
  montoFirmaPromesa: "",
  numeroCuotasEntrada: "",
  fechaLimiteEntrada: "",

  productIds: "VIP,PRIVATE",
  requiresFirstHome: true,
  requiresNewConstruction: true,
  requiresMiduviQualifiedProject: false,

  aceptaCreditoHipotecario: true,
  aceptaBIESS: true,
  aceptaBancaPrivada: true,
  aceptaCooperativas: false,
  aceptaContado: true,
  bancoAliado: "",
  proyectoCalificadoMiduvi: "pendiente",

  imagen: "",
  galeria: "",
  brochureUrl: "",
  videoUrl: "",

  estadoComercial: "pausado",
  publicado: false,
  orden: 1,
};

const STATUS_OPTIONS = [
  { label: "Disponible", estadoComercial: "disponible", publicado: true },
  { label: "Pausado", estadoComercial: "pausado", publicado: false },
  { label: "Reservado", estadoComercial: "reservado", publicado: false },
  { label: "Vendido", estadoComercial: "vendido", publicado: false },
];

function toNumberOrNull(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNumberOrDefault(value, fallback) {
  const n = toNumberOrNull(value);
  return n == null ? fallback : n;
}

function toBoolean(value) {
  return value === true || value === "true";
}

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function cleanLines(value) {
  return String(value || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function cleanCSV(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);
}

function buildPayload(form) {
  const precio = toNumberOrDefault(form.precio, 0);
  const m2Construccion = toNumberOrDefault(
    form.m2Construccion || form.m2,
    0
  );
  const m2 = toNumberOrDefault(form.m2 || form.m2Construccion, 0);

  const downPaymentPct = toNumberOrDefault(
    form.porcentajeEntradaRequerida,
    0.1
  );

  const monthsConstruction = toNumberOrDefault(
    form.mesesConstruccionRestantes,
    0
  );

  const reserveMin = toNumberOrDefault(form.reservaMinima, 0);
  const promesaAmount = toNumberOrDefault(form.montoFirmaPromesa, 0);
  const entryInstallmentsCount = toNumberOrDefault(
    form.numeroCuotasEntrada,
    0
  );

  return {
    id: String(form.id || "").trim(),
    developer: String(form.developer || "").trim(),
    proyecto: String(form.proyecto || "").trim(),
    titulo: String(form.titulo || "").trim(),
    descripcion: String(form.descripcion || "").trim(),

    unidad: String(form.unidad || "").trim(),
    torre: String(form.torre || "").trim(),
    bloque: String(form.bloque || "").trim(),
    piso: toNumberOrNull(form.piso),
    manzana: String(form.manzana || "").trim(),
    lote: String(form.lote || "").trim(),

    tipoInmueble: String(form.tipoInmueble || "departamento").trim(),
    tipoProyecto: String(form.tipoProyecto || "edificio").trim(),
    uso: String(form.uso || "vivienda_principal").trim(),

    precio,
    m2,
    m2Construccion,
    m2Terreno: toNumberOrDefault(form.m2Terreno, 0),
    dormitorios: toNumberOrDefault(form.dormitorios, 0),
    banos: toNumberOrDefault(form.banos, 0),
    parqueaderos: toNumberOrDefault(form.parqueaderos, 0),
    bodega: toBoolean(form.bodega),
    alicuotaEstimada: toNumberOrDefault(form.alicuotaEstimada, 0),

    ciudad: String(form.ciudad || "Quito").trim(),
    zona: String(form.zona || "Quito").trim(),
    ciudadZona: String(form.ciudadZona || "").trim(),
    sector: String(form.sector || "").trim(),
    direccionReferencial: String(form.direccionReferencial || "").trim(),
    googleMapsUrl: String(form.googleMapsUrl || "").trim(),

    proyectoNuevo: toBoolean(form.proyectoNuevo),
    viviendaNueva: toBoolean(form.viviendaNueva),
    tipoEntrega: String(form.tipoEntrega || "construccion").trim(),
    etapaProyecto: String(form.etapaProyecto || "construccion").trim(),
    fechaEntregaEstimada: form.fechaEntregaEstimada || null,
    fechaEscrituraEstimada: form.fechaEscrituraEstimada || null,

    permiteEntradaEnCuotas: toBoolean(form.permiteEntradaEnCuotas),
    mesesConstruccionRestantes: monthsConstruction,
    porcentajeEntradaRequerida: downPaymentPct,
    reservaMinima: reserveMin,
    montoFirmaPromesa: promesaAmount,
    numeroCuotasEntrada: entryInstallmentsCount,
    fechaLimiteEntrada: form.fechaLimiteEntrada || null,

    financing: {
      downPaymentPct,
      mortgagePct: Math.max(0, 1 - downPaymentPct),
      allowInstallments: toBoolean(form.permiteEntradaEnCuotas),
      reserveMin,
      monthsConstruction,
      promesaAmount,
      entryInstallmentsCount,
      entryDeadlineDate: form.fechaLimiteEntrada || null,
    },

    productIds: cleanCSV(form.productIds),

    requiresFirstHome: toBoolean(form.requiresFirstHome),
    requiresNewConstruction: toBoolean(form.requiresNewConstruction),
    requiresMiduviQualifiedProject: toBoolean(
      form.requiresMiduviQualifiedProject
    ),

    aceptaCreditoHipotecario: toBoolean(form.aceptaCreditoHipotecario),
    aceptaBIESS: toBoolean(form.aceptaBIESS),
    aceptaBancaPrivada: toBoolean(form.aceptaBancaPrivada),
    aceptaCooperativas: toBoolean(form.aceptaCooperativas),
    aceptaContado: toBoolean(form.aceptaContado),
    bancoAliado: String(form.bancoAliado || "").trim(),
    proyectoCalificadoMiduvi: String(
      form.proyectoCalificadoMiduvi || "no_aplica"
    ).trim(),

    mortgageProfile: {
      productIds: cleanCSV(form.productIds),
      requiresFirstHome: toBoolean(form.requiresFirstHome),
      requiresNewConstruction: toBoolean(form.requiresNewConstruction),
      requiresMiduviQualifiedProject: toBoolean(
        form.requiresMiduviQualifiedProject
      ),
      acceptsMortgageCredit: toBoolean(form.aceptaCreditoHipotecario),
      acceptsBIESS: toBoolean(form.aceptaBIESS),
      acceptsPrivateBank: toBoolean(form.aceptaBancaPrivada),
      acceptsCooperatives: toBoolean(form.aceptaCooperativas),
      acceptsCash: toBoolean(form.aceptaContado),
      alliedBank: String(form.bancoAliado || "").trim(),
      miduviQualificationStatus: String(
        form.proyectoCalificadoMiduvi || "no_aplica"
      ).trim(),
    },

    imagen: String(form.imagen || "").trim(),
    galeria: cleanLines(form.galeria),
    brochureUrl: String(form.brochureUrl || "").trim(),
    videoUrl: String(form.videoUrl || "").trim(),

    estadoComercial: String(form.estadoComercial || "disponible").trim(),
    publicado: toBoolean(form.publicado),
    orden: toNumberOrDefault(form.orden, 1),
    fuenteCarga: "manual",
  };
}

function formFromProperty(property) {
  const profile = property?.mortgageProfile || {};
  const financing = property?.financing || {};

  return {
    ...EMPTY_FORM,

    id: property?.id || "",
    developer: property?.developer || "GLS Constructores",
    proyecto: property?.proyecto || "",
    titulo: property?.titulo || "",
    descripcion: property?.descripcion || "",

    unidad: property?.unidad || "",
    torre: property?.torre || "",
    bloque: property?.bloque || "",
    piso: property?.piso ?? "",
    manzana: property?.manzana || "",
    lote: property?.lote || "",

    tipoInmueble: property?.tipoInmueble || "departamento",
    tipoProyecto: property?.tipoProyecto || "edificio",
    uso: property?.uso || "vivienda_principal",

    precio: property?.precio ?? "",
    m2: property?.m2 ?? property?.m2Construccion ?? "",
    m2Construccion: property?.m2Construccion ?? property?.m2 ?? "",
    m2Terreno: property?.m2Terreno ?? "",
    dormitorios: property?.dormitorios ?? "",
    banos: property?.banos ?? "",
    parqueaderos: property?.parqueaderos ?? "",
    bodega: property?.bodega === true,
    alicuotaEstimada: property?.alicuotaEstimada ?? "",

    ciudad: property?.ciudad || "Quito",
    zona: property?.zona || "Quito",
    ciudadZona: property?.ciudadZona || "",
    sector: property?.sector || "",
    direccionReferencial: property?.direccionReferencial || "",
    googleMapsUrl: property?.googleMapsUrl || "",

    proyectoNuevo: property?.proyectoNuevo !== false,
    viviendaNueva: property?.viviendaNueva !== false,
    tipoEntrega: property?.tipoEntrega || "construccion",
    etapaProyecto: property?.etapaProyecto || "construccion",
    fechaEntregaEstimada: toDateInput(property?.fechaEntregaEstimada),
    fechaEscrituraEstimada: toDateInput(property?.fechaEscrituraEstimada),

    permiteEntradaEnCuotas: property?.permiteEntradaEnCuotas !== false,
    mesesConstruccionRestantes:
      property?.mesesConstruccionRestantes ??
      financing?.monthsConstruction ??
      "",
    porcentajeEntradaRequerida:
      property?.porcentajeEntradaRequerida ??
      financing?.downPaymentPct ??
      0.1,
    reservaMinima:
      property?.reservaMinima ?? financing?.reserveMin ?? 500,
    montoFirmaPromesa:
      property?.montoFirmaPromesa ?? financing?.promesaAmount ?? "",
    numeroCuotasEntrada:
      property?.numeroCuotasEntrada ?? financing?.entryInstallmentsCount ?? "",
    fechaLimiteEntrada: toDateInput(
      property?.fechaLimiteEntrada || financing?.entryDeadlineDate
    ),

    productIds: Array.isArray(profile?.productIds)
      ? profile.productIds.join(",")
      : "VIP,PRIVATE",

    requiresFirstHome: profile?.requiresFirstHome === true,
    requiresNewConstruction: profile?.requiresNewConstruction !== false,
    requiresMiduviQualifiedProject:
      profile?.requiresMiduviQualifiedProject === true,

    aceptaCreditoHipotecario: profile?.acceptsMortgageCredit !== false,
    aceptaBIESS: profile?.acceptsBIESS !== false,
    aceptaBancaPrivada: profile?.acceptsPrivateBank !== false,
    aceptaCooperativas: profile?.acceptsCooperatives === true,
    aceptaContado: profile?.acceptsCash !== false,
    bancoAliado: profile?.alliedBank || "",
    proyectoCalificadoMiduvi:
      profile?.miduviQualificationStatus || "no_aplica",

    imagen: property?.imagen || "",
    galeria: Array.isArray(property?.galeria)
      ? property.galeria.join("\n")
      : "",
    brochureUrl: property?.brochureUrl || "",
    videoUrl: property?.videoUrl || "",

    estadoComercial: property?.estadoComercial || "disponible",
    publicado: property?.publicado === true,
    orden: property?.orden ?? 1,
  };
}

function inputStyle() {
  return {
    width: "100%",
    padding: "12px 13px",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(15,23,42,0.92)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 14,
  };
}

function labelStyle() {
  return {
    display: "grid",
    gap: 7,
    fontSize: 12,
    color: "rgba(203,213,225,0.9)",
    fontWeight: 800,
  };
}

function sectionStyle() {
  return {
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
  };
}

function grid2Style() {
  return {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  };
}

function Button({ children, onClick, disabled, tone = "primary" }) {
  const bg =
    tone === "danger"
      ? "rgba(239,68,68,0.92)"
      : tone === "secondary"
      ? "rgba(255,255,255,0.08)"
      : "#25d3a6";

  const color = tone === "primary" ? "#052019" : "white";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border:
          tone === "secondary" ? "1px solid rgba(255,255,255,0.16)" : "none",
        background: bg,
        color,
        padding: "11px 13px",
        borderRadius: 14,
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, hint, children }) {
  return (
    <div style={sectionStyle()}>
      <div>
        <div style={{ fontWeight: 950, fontSize: 15 }}>{title}</div>
        {hint ? (
          <div
            style={{
              marginTop: 3,
              color: "rgba(148,163,184,0.88)",
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}) {
  return (
    <label style={labelStyle()}>
      {label}
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        style={inputStyle()}
        autoComplete="off"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <label style={labelStyle()}>
      {label}
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle(), minHeight: 82, resize: "vertical" }}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label style={labelStyle()}>
      {label}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle()}
      >
        {children}
      </select>
    </label>
  );
}

function CheckboxField({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        gap: 9,
        alignItems: "center",
        fontSize: 13,
        color: "rgba(226,232,240,0.95)",
        fontWeight: 800,
      }}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function miniBulkCardStyle() {
  return {
    padding: 12,
    borderRadius: 14,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.10)",
    display: "grid",
    gap: 4,
    color: "rgba(226,232,240,0.92)",
    fontSize: 12,
  };
}

function PropertyImage({ src, title }) {
  const imageUrl = String(src || "").trim();

  if (!imageUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: 150,
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(37,211,166,0.10), rgba(59,130,246,0.08))",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          placeItems: "center",
          color: "rgba(203,213,225,0.72)",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        Sin imagen cargada
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title || "Imagen de propiedad"}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      style={{
        width: "100%",
        height: 150,
        objectFit: "cover",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(15,23,42,0.9)",
      }}
    />
  );
}



export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
const [filterSearch, setFilterSearch] = useState("");
const [filterProyecto, setFilterProyecto] = useState("");
const [filterEstado, setFilterEstado] = useState("all");
const [filterTipo, setFilterTipo] = useState("all");
const [filterPublicado, setFilterPublicado] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
const [bulkPreview, setBulkPreview] = useState(null);
const [bulkLoading, setBulkLoading] = useState(false);
const [bulkConfirming, setBulkConfirming] = useState(false);
const [bulkStatusSaving, setBulkStatusSaving] = useState(false);

  const activeCount = useMemo(
    () => properties.filter((p) => p?.publicado === true).length,
    [properties]
  );

const proyectoOptions = useMemo(() => {
  return Array.from(
    new Set(properties.map((p) => p?.proyecto).filter(Boolean))
  ).sort();
}, [properties]);

const filteredProperties = useMemo(() => {
  const q = filterSearch.trim().toLowerCase();

  return properties.filter((p) => {
    const searchable = [
      p?.id,
      p?.titulo,
      p?.unidad,
      p?.proyecto,
      p?.sector,
      p?.tipoInmueble,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (q && !searchable.includes(q)) return false;

    if (filterProyecto && p?.proyecto !== filterProyecto) return false;

    if (filterEstado !== "all" && p?.estadoComercial !== filterEstado) {
      return false;
    }

    if (filterTipo !== "all" && p?.tipoInmueble !== filterTipo) {
      return false;
    }

    if (filterPublicado === "publicado" && p?.publicado !== true) {
      return false;
    }

    if (filterPublicado === "oculto" && p?.publicado === true) {
      return false;
    }

    return true;
  });
}, [
  properties,
  filterSearch,
  filterProyecto,
  filterEstado,
  filterTipo,
  filterPublicado,
]);

const hasActiveBulkFilter = useMemo(() => {
  return Boolean(
    filterSearch.trim() ||
      filterProyecto ||
      filterEstado !== "all" ||
      filterTipo !== "all" ||
      filterPublicado !== "all"
  );
}, [
  filterSearch,
  filterProyecto,
  filterEstado,
  filterTipo,
  filterPublicado,
]);

  async function loadProperties() {
    try {
      setLoading(true);
      setError("");

      const data = await listAdminProperties();
      setProperties(Array.isArray(data?.properties) ? data.properties : []);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar propiedades.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(property) {
    setEditingId(property?.id || property?._id || null);
    setForm(formFromProperty(property));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicateProperty(property) {
    const base = formFromProperty(property);
    const suggestedId = `${base.id || "propiedad"}_copy`;

    setEditingId(null);
    setForm({
      ...base,
      id: suggestedId,
      titulo: `${base.titulo || "Propiedad"} copia`,
      publicado: false,
      estadoComercial: "pausado",
    });

    setMessage("Propiedad duplicada en formulario. Ajusta ID/título y guarda.");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDownloadTemplate() {
  try {
    setError("");
    setMessage("");

    await downloadPropertiesTemplate();

    setMessage("Plantilla Excel descargada correctamente.");
  } catch (err) {
    setError(err?.message || "No se pudo descargar la plantilla.");
  }
}

async function handlePreviewBulk() {
  try {
    setBulkLoading(true);
    setError("");
    setMessage("");
    setBulkPreview(null);

    if (!bulkFile) {
      throw new Error("Selecciona un archivo Excel primero.");
    }

    const data = await previewPropertiesExcel(bulkFile);

    setBulkPreview(data);
    setMessage("Archivo leído correctamente. Revisa el preview antes de confirmar.");
  } catch (err) {
    setError(err?.message || "No se pudo previsualizar el archivo.");
  } finally {
    setBulkLoading(false);
  }
}

async function handleConfirmBulk() {
  try {
    setBulkConfirming(true);
    setError("");
    setMessage("");

    const rows = Array.isArray(bulkPreview?.validRows)
      ? bulkPreview.validRows
      : [];

    if (!rows.length) {
      throw new Error("No hay filas válidas para confirmar.");
    }

    const result = await confirmPropertiesBulk(rows);

    setMessage(
      `Carga confirmada: ${result.created || 0} creadas, ${
        result.updated || 0
      } actualizadas, ${result.totalErrors || 0} errores.`
    );

    setBulkFile(null);
    setBulkPreview(null);

    await loadProperties();
  } catch (err) {
    setError(err?.message || "No se pudo confirmar la carga masiva.");
  } finally {
    setBulkConfirming(false);
  }
}

function handleClearBulk() {
  setBulkFile(null);
  setBulkPreview(null);
  setError("");
  setMessage("");
}

  async function handleSubmit() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = buildPayload(form);

      if (!payload.id || !payload.proyecto || !payload.titulo || !payload.precio) {
        throw new Error("Completa id, proyecto, título y precio.");
      }

      if (editingId) {
        await updateAdminProperty(editingId, payload);
        setMessage("Propiedad actualizada correctamente.");
      } else {
        await createAdminProperty(payload);
        setMessage("Propiedad creada correctamente.");
        setForm(EMPTY_FORM);
      }

      await loadProperties();
    } catch (err) {
      setError(err?.message || "No se pudo guardar la propiedad.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(property, status) {
    const id = property?.id || property?._id;
    if (!id) return;

    try {
      setError("");
      setMessage("");

      await updateAdminPropertyStatus(id, {
        estadoComercial: status.estadoComercial,
        publicado: status.publicado,
      });

      setMessage(`Estado actualizado: ${status.label}`);
      await loadProperties();
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el estado.");
    }
  }

async function handleBulkStatus(status) {
  try {
    setError("");
    setMessage("");

    const targetProperties = Array.isArray(filteredProperties)
      ? filteredProperties
      : [];

if (!hasActiveBulkFilter) {
  throw new Error(
    "Por seguridad, aplica al menos un filtro antes de ejecutar una acción masiva."
  );
}

    if (!targetProperties.length) {
      throw new Error("No hay propiedades filtradas para actualizar.");
    }

    const actionLabel = `${status.label} (${status.publicado ? "publicado" : "oculto"})`;

    const ok = window.confirm(
      `Vas a actualizar ${targetProperties.length} propiedades filtradas a "${actionLabel}".\n\n¿Seguro que quieres continuar?`
    );

    if (!ok) return;

    // Segundo candado si estás aplicando algo muy amplio
    if (!filterProyecto && targetProperties.length > 25) {
      const okGlobal = window.confirm(
        `Ojo: no tienes un proyecto filtrado y vas a afectar ${targetProperties.length} propiedades.\n\n¿Confirmas nuevamente?`
      );

      if (!okGlobal) return;
    }

    setBulkStatusSaving(true);

    let updated = 0;
    let failed = 0;

    for (const property of targetProperties) {
      const id = property?.id || property?._id;

      if (!id) {
        failed += 1;
        continue;
      }

      try {
        await updateAdminPropertyStatus(id, {
          estadoComercial: status.estadoComercial,
          publicado: status.publicado,
        });

        updated += 1;
      } catch (err) {
        console.warn("Error actualizando propiedad", id, err);
        failed += 1;
      }
    }

    setMessage(
      `Acción masiva completada: ${updated} actualizadas, ${failed} con error.`
    );

    await loadProperties();
  } catch (err) {
    setError(err?.message || "No se pudo ejecutar la acción masiva.");
  } finally {
    setBulkStatusSaving(false);
  }
}

  async function handleDelete(property) {
    const id = property?.id || property?._id;
    if (!id) return;

    const ok = window.confirm(
      `¿Seguro que quieres eliminar ${
        property?.titulo || id
      }? Mejor usa vendido/pausado si quieres mantener histórico.`
    );

    if (!ok) return;

    try {
      setError("");
      setMessage("");

      await deleteAdminProperty(id);
      setMessage("Propiedad eliminada.");
      await loadProperties();
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la propiedad.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(900px 600px at 20% 10%, rgba(37,211,166,0.10), transparent 55%), linear-gradient(180deg, #020617, #0f172a)",
        color: "white",
        fontFamily: "system-ui",
        padding: "24px 18px 120px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1260, margin: "0 auto", display: "grid", gap: 18 }}>
        
<AdminTopNav
  title="Propiedades"
  subtitle="Carga datos objetivos de cada propiedad. HabitaLibre calcula la ruta hipotecaria con base en precio, entrega, entrada y perfil del usuario."
/>
        <div
          style={{
            padding: 16,
            borderRadius: 22,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            display: "grid",
            gap: 12,
          }}
        >
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
  <Button tone="secondary" onClick={loadProperties}>
    Recargar inventario
  </Button>

  <Button tone="secondary" onClick={startCreate}>
    Nueva propiedad
  </Button>
</div>

<div
  style={{
    marginTop: 8,
    padding: 14,
    borderRadius: 18,
    background: "rgba(37,211,166,0.055)",
    border: "1px solid rgba(37,211,166,0.14)",
    display: "grid",
    gap: 12,
  }}
>
  <div>
    <div style={{ fontWeight: 950, fontSize: 15 }}>
      Carga masiva Excel
    </div>

    <div
      style={{
        marginTop: 4,
        color: "rgba(203,213,225,0.78)",
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      Descarga la plantilla, carga propiedades en Excel, previsualiza errores y
      confirma solo cuando todo esté correcto.
    </div>
  </div>

  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    <Button tone="secondary" onClick={handleDownloadTemplate}>
      Descargar plantilla
    </Button>

    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 13px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      Seleccionar Excel
      <input
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setBulkFile(file);
          setBulkPreview(null);
          setMessage(file ? `Archivo seleccionado: ${file.name}` : "");
          setError("");
        }}
      />
    </label>

    <Button tone="secondary" onClick={handlePreviewBulk} disabled={bulkLoading || !bulkFile}>
      {bulkLoading ? "Leyendo..." : "Previsualizar"}
    </Button>

    <Button
      onClick={handleConfirmBulk}
      disabled={
        bulkConfirming ||
        !bulkPreview ||
        !Array.isArray(bulkPreview?.validRows) ||
        bulkPreview.validRows.length === 0
      }
    >
      {bulkConfirming ? "Confirmando..." : "Confirmar carga"}
    </Button>

    <Button tone="secondary" onClick={handleClearBulk}>
      Limpiar carga
    </Button>
  </div>

  {bulkFile ? (
    <div style={{ color: "rgba(226,232,240,0.88)", fontSize: 13 }}>
      Archivo: <strong>{bulkFile.name}</strong>
    </div>
  ) : null}

  {bulkPreview?.summary ? (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 10,
      }}
    >
      <div style={miniBulkCardStyle()}>
        <strong>{bulkPreview.summary.totalRows}</strong>
        <span>Filas leídas</span>
      </div>

      <div style={miniBulkCardStyle()}>
        <strong>{bulkPreview.summary.validRows}</strong>
        <span>Válidas</span>
      </div>

      <div style={miniBulkCardStyle()}>
        <strong>{bulkPreview.summary.toCreate}</strong>
        <span>Nuevas</span>
      </div>

      <div style={miniBulkCardStyle()}>
        <strong>{bulkPreview.summary.toUpdate}</strong>
        <span>Actualizaciones</span>
      </div>

      <div style={miniBulkCardStyle()}>
        <strong>{bulkPreview.summary.errorRows}</strong>
        <span>Con errores</span>
      </div>
    </div>
  ) : null}

  {Array.isArray(bulkPreview?.errorRows) && bulkPreview.errorRows.length > 0 ? (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "rgba(248,113,113,0.10)",
        border: "1px solid rgba(248,113,113,0.20)",
        color: "#fecaca",
        display: "grid",
        gap: 8,
      }}
    >
      <strong>Errores detectados</strong>

      {bulkPreview.errorRows.slice(0, 6).map((row) => (
        <div key={`error-${row.rowNumber}`} style={{ fontSize: 13 }}>
          Fila {row.rowNumber}:{" "}
          {Array.isArray(row.errors) ? row.errors.join(" · ") : "Error"}
        </div>
      ))}

      {bulkPreview.errorRows.length > 6 ? (
        <div style={{ fontSize: 12, color: "rgba(254,202,202,0.78)" }}>
          Hay más errores. Corrige el Excel y vuelve a previsualizar.
        </div>
      ) : null}
    </div>
  ) : null}

  {Array.isArray(bulkPreview?.validRows) && bulkPreview.validRows.length > 0 ? (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.09)",
        display: "grid",
        gap: 8,
      }}
    >
      <strong>Preview de filas válidas</strong>

      <div style={{ display: "grid", gap: 7 }}>
        {bulkPreview.validRows.slice(0, 8).map((row) => (
          <div
            key={`valid-${row.rowNumber}-${row.payload?.id}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              color: "rgba(226,232,240,0.88)",
              fontSize: 13,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              paddingBottom: 6,
            }}
          >
            <span>
              Fila {row.rowNumber} · {row.payload?.id} · {row.payload?.titulo}
            </span>

            <strong style={{ color: row.action === "create" ? "#7fffd4" : "#facc15" }}>
              {row.action === "create" ? "Crear" : "Actualizar"}
            </strong>
          </div>
        ))}

        {bulkPreview.validRows.length > 8 ? (
          <div style={{ color: "rgba(148,163,184,0.85)", fontSize: 12 }}>
            Mostrando 8 de {bulkPreview.validRows.length} filas válidas.
          </div>
        ) : null}
      </div>
    </div>
  ) : null}
</div>


          <div style={{ color: "rgba(148,163,184,0.95)", fontSize: 13 }}>
            Sesión admin activa · Activas publicadas:{" "}
            <strong>{activeCount}</strong> · Total cargadas:{" "}
            <strong>{properties.length}</strong>
          </div>

          {message ? (
            <div style={{ color: "#25d3a6", fontWeight: 800 }}>{message}</div>
          ) : null}

          {error ? (
            <div style={{ color: "#f87171", fontWeight: 800 }}>{error}</div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.95fr) minmax(440px, 0.85fr)",
            gap: 18,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 24,
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.10)",
              alignSelf: "start",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Inventario</h2>
            <div
  style={{
    display: "grid",
    gap: 10,
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <TextField
    label="Buscar"
    value={filterSearch}
    onChange={setFilterSearch}
    placeholder="ID, unidad, título, proyecto..."
  />

  <div style={grid2Style()}>
    <SelectField
      label="Proyecto"
      value={filterProyecto}
      onChange={setFilterProyecto}
    >
      <option value="">Todos</option>
      {proyectoOptions.map((proyecto) => (
        <option key={proyecto} value={proyecto}>
          {proyecto}
        </option>
      ))}
    </SelectField>

    <SelectField
      label="Estado"
      value={filterEstado}
      onChange={setFilterEstado}
    >
      <option value="all">Todos</option>
      <option value="disponible">Disponible</option>
      <option value="pausado">Pausado</option>
      <option value="reservado">Reservado</option>
      <option value="vendido">Vendido</option>
      <option value="oculto">Oculto</option>
    </SelectField>

    <SelectField
      label="Tipo inmueble"
      value={filterTipo}
      onChange={setFilterTipo}
    >
      <option value="all">Todos</option>
      <option value="departamento">Departamento</option>
      <option value="suite">Suite</option>
      <option value="estudio">Estudio</option>
      <option value="casa">Casa</option>
      <option value="terreno">Terreno</option>
    </SelectField>

    <SelectField
      label="Publicación"
      value={filterPublicado}
      onChange={setFilterPublicado}
    >
      <option value="all">Todos</option>
      <option value="publicado">Publicado</option>
      <option value="oculto">Oculto</option>
    </SelectField>
  </div>

  <div style={{ color: "rgba(203,213,225,0.78)", fontSize: 13 }}>
    Mostrando <strong>{filteredProperties.length}</strong> de{" "}
    <strong>{properties.length}</strong> propiedades.
  </div>
</div>

<div
  style={{
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    background: "rgba(37,211,166,0.055)",
    border: "1px solid rgba(37,211,166,0.14)",
    display: "grid",
    gap: 10,
  }}
>
  <div>
    <div style={{ fontWeight: 950, fontSize: 14 }}>
      Acciones masivas sobre filtro actual
    </div>

    <div
      style={{
        marginTop: 4,
        color: "rgba(203,213,225,0.78)",
        fontSize: 12,
        lineHeight: 1.35,
      }}
    >
      Aplica el cambio solo a las propiedades que estás viendo con los filtros
      actuales. Antes de publicar, filtra bien por proyecto, estado, tipo o unidad.
    </div>
  </div>

  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {STATUS_OPTIONS.map((status) => (
      <Button
        key={`bulk-${status.estadoComercial}`}
        tone={status.estadoComercial === "vendido" ? "danger" : "secondary"}
disabled={
  bulkStatusSaving ||
  filteredProperties.length === 0 ||
  !hasActiveBulkFilter
}
        onClick={() => handleBulkStatus(status)}
      >
        {bulkStatusSaving ? "Actualizando..." : `Marcar ${status.label}`}
      </Button>
    ))}
  </div>

  <div style={{ color: "rgba(148,163,184,0.9)", fontSize: 12 }}>
   {hasActiveBulkFilter ? (
  <>
    Propiedades afectadas si ejecutas una acción:{" "}
    <strong>{filteredProperties.length}</strong>
  </>
) : (
  <>
    Aplica al menos un filtro antes de ejecutar una acción masiva.
  </>
)}
  </div>
</div>


            {loading ? (
              <div style={{ color: "rgba(203,213,225,0.85)" }}>
                Cargando propiedades...
              </div>
) : filteredProperties.length ? (
<div style={{ display: "grid", gap: 12 }}>
{filteredProperties.map((p) => {
                  const id = p?.id || p?._id;
                  const status = p?.estadoComercial || "—";
                  const isPublished = p?.publicado === true;

                  return (
  <div
    key={id}
    style={{
      padding: 14,
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.10)",
      background: isPublished
        ? "rgba(37,211,166,0.08)"
        : "rgba(255,255,255,0.04)",
      display: "grid",
      gap: 10,
    }}
  >
    <PropertyImage src={p?.imagen} title={p?.titulo} />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
                        <div>
                          <div style={{ fontWeight: 950, fontSize: 16 }}>
                            {p?.titulo || "Sin título"}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              color: "rgba(203,213,225,0.82)",
                              fontSize: 13,
                            }}
                          >
                            {id} · {p?.proyecto || "Sin proyecto"} ·{" "}
                            {p?.sector || p?.zona || "Sin zona"}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              color: "rgba(203,213,225,0.82)",
                              fontSize: 13,
                            }}
                          >
                            {moneyUSD(p?.precio || 0)} ·{" "}
                            {p?.m2Construccion || p?.m2 || "—"} m² const. ·{" "}
                            {p?.tipoInmueble || "—"} · {p?.dormitorios || "—"} dorm.
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              color: "rgba(203,213,225,0.72)",
                              fontSize: 12,
                            }}
                          >
                            Entrega:{" "}
                            {p?.fechaEntregaEstimada
                              ? toDateInput(p.fechaEntregaEstimada)
                              : p?.tipoEntrega || "—"}{" "}
                            · BIESS:{" "}
                            {p?.mortgageProfile?.acceptsBIESS === false
                              ? "No"
                              : "Sí"}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "7px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 900,
                            background: isPublished
                              ? "rgba(37,211,166,0.16)"
                              : "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status} · {isPublished ? "publicado" : "oculto"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Button tone="secondary" onClick={() => startEdit(p)}>
                          Editar
                        </Button>

                        <Button tone="secondary" onClick={() => duplicateProperty(p)}>
                          Duplicar
                        </Button>

                        {STATUS_OPTIONS.map((s) => (
                          <Button
                            key={`${id}-${s.estadoComercial}`}
                            tone="secondary"
                            onClick={() => handleStatus(p, s)}
                          >
                            {s.label}
                          </Button>
                        ))}

                        <Button tone="danger" onClick={() => handleDelete(p)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "rgba(203,213,225,0.85)" }}>
                No hay propiedades cargadas.
              </div>
            )}
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 24,
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.10)",
              alignSelf: "start",
              position: "sticky",
              top: 16,
              maxHeight: "calc(100vh - 32px)",
              overflow: "auto",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingId ? "Editar propiedad" : "Nueva propiedad"}
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              <Section title="1. Identificación">
                <TextField
                  label="ID comercial"
                  value={form.id}
                  onChange={(v) => updateForm("id", v)}
                  disabled={!!editingId}
                  placeholder="gls_hp6_a1201"
                />

                <div style={grid2Style()}>
                  <TextField
                    label="Promotor / desarrollador"
                    value={form.developer}
                    onChange={(v) => updateForm("developer", v)}
                  />

                  <TextField
                    label="Proyecto"
                    value={form.proyecto}
                    onChange={(v) => updateForm("proyecto", v)}
                    placeholder="High Point 6"
                  />
                </div>

                <TextField
                  label="Título comercial"
                  value={form.titulo}
                  onChange={(v) => updateForm("titulo", v)}
                  placeholder="Departamento A1201 - High Point 6"
                />

                <TextAreaField
                  label="Descripción"
                  value={form.descripcion}
                  onChange={(v) => updateForm("descripcion", v)}
                />

                <div style={grid2Style()}>
                  <TextField
                    label="Unidad"
                    value={form.unidad}
                    onChange={(v) => updateForm("unidad", v)}
                    placeholder="A1201"
                  />

                  <TextField
                    label="Torre"
                    value={form.torre}
                    onChange={(v) => updateForm("torre", v)}
                    placeholder="Torre A"
                  />

                  <TextField
                    label="Bloque"
                    value={form.bloque}
                    onChange={(v) => updateForm("bloque", v)}
                  />

                  <TextField
                    label="Piso"
                    value={form.piso}
                    onChange={(v) => updateForm("piso", v)}
                    type="number"
                  />

                  <TextField
                    label="Manzana"
                    value={form.manzana}
                    onChange={(v) => updateForm("manzana", v)}
                  />

                  <TextField
                    label="Lote"
                    value={form.lote}
                    onChange={(v) => updateForm("lote", v)}
                  />
                </div>
              </Section>

              <Section title="2. Tipo de inmueble">
                <div style={grid2Style()}>
<SelectField
  label="Tipo inmueble"
  value={form.tipoInmueble}
  onChange={(v) => updateForm("tipoInmueble", v)}
>
  <option value="departamento">Departamento</option>
  <option value="suite">Suite</option>
  <option value="estudio">Estudio</option>
  <option value="casa">Casa</option>
  <option value="terreno">Terreno</option>
</SelectField>

                  <SelectField
                    label="Tipo proyecto"
                    value={form.tipoProyecto}
                    onChange={(v) => updateForm("tipoProyecto", v)}
                  >
                    <option value="edificio">Edificio</option>
                    <option value="conjunto">Conjunto</option>
                    <option value="urbanizacion">Urbanización</option>
                    <option value="independiente">Independiente</option>
                    <option value="otro">Otro</option>
                  </SelectField>

                  <SelectField
                    label="Uso"
                    value={form.uso}
                    onChange={(v) => updateForm("uso", v)}
                  >
                    <option value="vivienda_principal">Vivienda principal</option>
                    <option value="inversion">Inversión</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Comercial</option>
                    <option value="otro">Otro</option>
                  </SelectField>
                </div>
              </Section>

              <Section title="3. Precio y características">
                <div style={grid2Style()}>
                  <TextField
                    label="Precio de venta"
                    value={form.precio}
                    onChange={(v) => updateForm("precio", v)}
                    type="number"
                  />

                  <TextField
                    label="M² construcción"
                    value={form.m2Construccion}
                    onChange={(v) => {
                      updateForm("m2Construccion", v);
                      updateForm("m2", v);
                    }}
                    type="number"
                  />

                  <TextField
                    label="M² terreno"
                    value={form.m2Terreno}
                    onChange={(v) => updateForm("m2Terreno", v)}
                    type="number"
                  />

                  <TextField
                    label="Dormitorios"
                    value={form.dormitorios}
                    onChange={(v) => updateForm("dormitorios", v)}
                    type="number"
                  />

                  <TextField
                    label="Baños"
                    value={form.banos}
                    onChange={(v) => updateForm("banos", v)}
                    type="number"
                  />

                  <TextField
                    label="Parqueaderos"
                    value={form.parqueaderos}
                    onChange={(v) => updateForm("parqueaderos", v)}
                    type="number"
                  />

                  <TextField
                    label="Alícuota estimada"
                    value={form.alicuotaEstimada}
                    onChange={(v) => updateForm("alicuotaEstimada", v)}
                    type="number"
                  />

                  <TextField
                    label="Orden"
                    value={form.orden}
                    onChange={(v) => updateForm("orden", v)}
                    type="number"
                  />
                </div>

                <CheckboxField
                  label="Tiene bodega"
                  checked={form.bodega}
                  onChange={(v) => updateForm("bodega", v)}
                />
              </Section>

              <Section title="4. Ubicación">
                <div style={grid2Style()}>
                  <TextField
                    label="Ciudad"
                    value={form.ciudad}
                    onChange={(v) => updateForm("ciudad", v)}
                  />

                  <TextField
                    label="Zona"
                    value={form.zona}
                    onChange={(v) => updateForm("zona", v)}
                  />

                  <TextField
                    label="Ciudad/Zona"
                    value={form.ciudadZona}
                    onChange={(v) => updateForm("ciudadZona", v)}
                  />

                  <TextField
                    label="Sector"
                    value={form.sector}
                    onChange={(v) => updateForm("sector", v)}
                  />
                </div>

                <TextField
                  label="Dirección referencial"
                  value={form.direccionReferencial}
                  onChange={(v) => updateForm("direccionReferencial", v)}
                />

                <TextField
                  label="Google Maps URL"
                  value={form.googleMapsUrl}
                  onChange={(v) => updateForm("googleMapsUrl", v)}
                  placeholder="https://maps.google.com/..."
                />
              </Section>

              <Section
                title="5. Entrega del proyecto"
                hint="No pedimos avance de obra exacto. La fecha estimada de entrega es suficiente para calcular meses disponibles."
              >
                <div style={grid2Style()}>
                  <SelectField
                    label="Tipo entrega"
                    value={form.tipoEntrega}
                    onChange={(v) => updateForm("tipoEntrega", v)}
                  >
                    <option value="construccion">Construcción</option>
                    <option value="inmediata">Entrega inmediata</option>
                    <option value="planos">Planos</option>
                  </SelectField>

                  <SelectField
                    label="Etapa proyecto"
                    value={form.etapaProyecto}
                    onChange={(v) => updateForm("etapaProyecto", v)}
                  >
                    <option value="planos">Planos</option>
                    <option value="construccion">Construcción</option>
                    <option value="entrega_proxima">Entrega próxima</option>
                    <option value="entrega_inmediata">Entrega inmediata</option>
                    <option value="terminado">Terminado</option>
                  </SelectField>

                  <TextField
                    label="Fecha estimada de entrega"
                    value={form.fechaEntregaEstimada}
                    onChange={(v) => updateForm("fechaEntregaEstimada", v)}
                    type="date"
                  />

                  <TextField
                    label="Fecha estimada de escritura"
                    value={form.fechaEscrituraEstimada}
                    onChange={(v) => updateForm("fechaEscrituraEstimada", v)}
                    type="date"
                  />

                  <TextField
                    label="Meses construcción restantes"
                    value={form.mesesConstruccionRestantes}
                    onChange={(v) => updateForm("mesesConstruccionRestantes", v)}
                    type="number"
                  />
                </div>

                <CheckboxField
                  label="Vivienda nueva"
                  checked={form.viviendaNueva}
                  onChange={(v) => {
                    updateForm("viviendaNueva", v);
                    updateForm("proyectoNuevo", v);
                  }}
                />
              </Section>

              <Section title="6. Plan comercial de entrada">
                <div style={grid2Style()}>
                  <TextField
                    label="Reserva mínima"
                    value={form.reservaMinima}
                    onChange={(v) => updateForm("reservaMinima", v)}
                    type="number"
                  />

                  <TextField
                    label="Monto firma promesa"
                    value={form.montoFirmaPromesa}
                    onChange={(v) => updateForm("montoFirmaPromesa", v)}
                    type="number"
                  />

                  <TextField
                    label="Entrada requerida"
                    value={form.porcentajeEntradaRequerida}
                    onChange={(v) => updateForm("porcentajeEntradaRequerida", v)}
                    type="number"
                  />

                  <TextField
                    label="Número cuotas entrada"
                    value={form.numeroCuotasEntrada}
                    onChange={(v) => updateForm("numeroCuotasEntrada", v)}
                    type="number"
                  />

                  <TextField
                    label="Fecha límite entrada"
                    value={form.fechaLimiteEntrada}
                    onChange={(v) => updateForm("fechaLimiteEntrada", v)}
                    type="date"
                  />
                </div>

                <CheckboxField
                  label="Permite entrada en cuotas"
                  checked={form.permiteEntradaEnCuotas}
                  onChange={(v) => updateForm("permiteEntradaEnCuotas", v)}
                />
              </Section>

              <Section
                title="7. Financiamiento aceptado"
                hint="No cargamos avalúo ni tier BIESS. HabitaLibre calcula rangos estimados con base en precio y reglas internas."
              >
                <TextField
                  label="Productos hipotecarios legacy"
                  value={form.productIds}
                  onChange={(v) => updateForm("productIds", v)}
                  placeholder="VIP,PRIVATE"
                />

                <div style={{ display: "grid", gap: 8 }}>
                  <CheckboxField
                    label="Acepta crédito hipotecario"
                    checked={form.aceptaCreditoHipotecario}
                    onChange={(v) => updateForm("aceptaCreditoHipotecario", v)}
                  />

                  <CheckboxField
                    label="Acepta BIESS"
                    checked={form.aceptaBIESS}
                    onChange={(v) => updateForm("aceptaBIESS", v)}
                  />

                  <CheckboxField
                    label="Acepta banca privada"
                    checked={form.aceptaBancaPrivada}
                    onChange={(v) => updateForm("aceptaBancaPrivada", v)}
                  />

                  <CheckboxField
                    label="Acepta cooperativas"
                    checked={form.aceptaCooperativas}
                    onChange={(v) => updateForm("aceptaCooperativas", v)}
                  />

                  <CheckboxField
                    label="Acepta contado"
                    checked={form.aceptaContado}
                    onChange={(v) => updateForm("aceptaContado", v)}
                  />

                  <CheckboxField
                    label="Requiere primera vivienda"
                    checked={form.requiresFirstHome}
                    onChange={(v) => updateForm("requiresFirstHome", v)}
                  />

                  <CheckboxField
                    label="Requiere vivienda nueva"
                    checked={form.requiresNewConstruction}
                    onChange={(v) => updateForm("requiresNewConstruction", v)}
                  />

                  <CheckboxField
                    label="Requiere proyecto calificado MIDUVI"
                    checked={form.requiresMiduviQualifiedProject}
                    onChange={(v) =>
                      updateForm("requiresMiduviQualifiedProject", v)
                    }
                  />
                </div>

                <div style={grid2Style()}>
                  <TextField
                    label="Banco aliado"
                    value={form.bancoAliado}
                    onChange={(v) => updateForm("bancoAliado", v)}
                  />

                  <SelectField
                    label="Proyecto calificado MIDUVI"
                    value={form.proyectoCalificadoMiduvi}
                    onChange={(v) => updateForm("proyectoCalificadoMiduvi", v)}
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="no_aplica">No aplica</option>
                  </SelectField>
                </div>
              </Section>

              <Section title="8. Multimedia">
                <TextField
                  label="Imagen principal URL"
                  value={form.imagen}
                  onChange={(v) => updateForm("imagen", v)}
                  placeholder="https://..."
                />

                <PropertyImage src={form.imagen} title={form.titulo} />

                <TextAreaField
                  label="Galería URLs, una por línea"
                  value={form.galeria}
                  onChange={(v) => updateForm("galeria", v)}
                />

                <TextField
                  label="Brochure URL"
                  value={form.brochureUrl}
                  onChange={(v) => updateForm("brochureUrl", v)}
                />

                <TextField
                  label="Video URL"
                  value={form.videoUrl}
                  onChange={(v) => updateForm("videoUrl", v)}
                />
              </Section>

              <Section title="9. Estado comercial">
                <SelectField
                  label="Estado comercial"
                  value={form.estadoComercial}
                  onChange={(v) => updateForm("estadoComercial", v)}
                >
                  <option value="disponible">Disponible</option>
                  <option value="pausado">Pausado</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                  <option value="oculto">Oculto</option>
                </SelectField>

                <CheckboxField
                  label="Publicado"
                  checked={form.publicado}
                  onChange={(v) => updateForm("publicado", v)}
                />

                <div style={{ display: "grid", gap: 10 }}>
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving
                      ? "Guardando..."
                      : editingId
                      ? "Guardar cambios"
                      : "Crear propiedad"}
                  </Button>

                  <Button tone="secondary" onClick={startCreate}>
                    Limpiar / nueva propiedad
                  </Button>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}