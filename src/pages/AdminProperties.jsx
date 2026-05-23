import React, { useEffect, useMemo, useState } from "react";
import {
  clearPropertyAdminKey,
  createAdminProperty,
  deleteAdminProperty,
  getPropertyAdminKey,
  listAdminProperties,
  savePropertyAdminKey,
  updateAdminProperty,
  updateAdminPropertyStatus,
} from "../lib/propertiesAdminApi.js";
import { moneyUSD } from "../lib/money";

const EMPTY_FORM = {
  id: "",
  developer: "GLS Constructores",
  proyecto: "",
  titulo: "",
  descripcion: "",
  precio: "",
  m2: "",
  dormitorios: "",
  banos: "",
  parqueaderos: "",
  zona: "Quito",
  ciudadZona: "Norte de Quito",
  sector: "",
  proyectoNuevo: true,
  tipoEntrega: "construccion",
  permiteEntradaEnCuotas: true,
  mesesConstruccionRestantes: "",
  porcentajeEntradaRequerida: 0.1,
  reservaMinima: 500,
  imagen: "",
  galeria: "",
  productIds: "VIP,PRIVATE",
  requiresFirstHome: true,
  requiresNewConstruction: true,
  requiresMiduviQualifiedProject: false,
  estadoComercial: "disponible",
  publicado: true,
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

function buildPayload(form) {
  const productIds = String(form.productIds || "")
    .split(",")
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);

  const galeria = String(form.galeria || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const precio = toNumberOrDefault(form.precio, 0);
  const downPaymentPct = toNumberOrDefault(form.porcentajeEntradaRequerida, 0.1);
  const monthsConstruction = toNumberOrDefault(
    form.mesesConstruccionRestantes,
    0
  );
  const reserveMin = toNumberOrDefault(form.reservaMinima, 0);

  return {
    id: String(form.id || "").trim(),
    developer: String(form.developer || "").trim(),
    proyecto: String(form.proyecto || "").trim(),
    titulo: String(form.titulo || "").trim(),
    descripcion: String(form.descripcion || "").trim(),

    precio,
    m2: toNumberOrNull(form.m2),
    dormitorios: toNumberOrNull(form.dormitorios),
    banos: toNumberOrNull(form.banos),
    parqueaderos: toNumberOrNull(form.parqueaderos),

    zona: String(form.zona || "").trim(),
    ciudadZona: String(form.ciudadZona || "").trim(),
    sector: String(form.sector || "").trim(),

    proyectoNuevo: toBoolean(form.proyectoNuevo),
    tipoEntrega: String(form.tipoEntrega || "construccion").trim(),
    permiteEntradaEnCuotas: toBoolean(form.permiteEntradaEnCuotas),

    mesesConstruccionRestantes: monthsConstruction,
    porcentajeEntradaRequerida: downPaymentPct,
    reservaMinima: reserveMin,

    financing: {
      downPaymentPct,
      mortgagePct: Math.max(0, 1 - downPaymentPct),
      allowInstallments: toBoolean(form.permiteEntradaEnCuotas),
      reserveMin,
      monthsConstruction,
    },

    mortgageProfile: {
      productIds,
      requiresFirstHome: toBoolean(form.requiresFirstHome),
      requiresNewConstruction: toBoolean(form.requiresNewConstruction),
      requiresMiduviQualifiedProject: toBoolean(
        form.requiresMiduviQualifiedProject
      ),
    },

    imagen: String(form.imagen || "").trim(),
    galeria,

    estadoComercial: String(form.estadoComercial || "disponible").trim(),
    publicado: toBoolean(form.publicado),
    orden: toNumberOrDefault(form.orden, 1),
  };
}

function formFromProperty(property) {
  return {
    ...EMPTY_FORM,
    id: property?.id || "",
    developer: property?.developer || "GLS Constructores",
    proyecto: property?.proyecto || "",
    titulo: property?.titulo || "",
    descripcion: property?.descripcion || "",

    precio: property?.precio ?? "",
    m2: property?.m2 ?? "",
    dormitorios: property?.dormitorios ?? "",
    banos: property?.banos ?? "",
    parqueaderos: property?.parqueaderos ?? "",

    zona: property?.zona || "Quito",
    ciudadZona: property?.ciudadZona || "",
    sector: property?.sector || "",

    proyectoNuevo: property?.proyectoNuevo !== false,
    tipoEntrega: property?.tipoEntrega || "construccion",
    permiteEntradaEnCuotas: property?.permiteEntradaEnCuotas !== false,

    mesesConstruccionRestantes: property?.mesesConstruccionRestantes ?? "",
    porcentajeEntradaRequerida:
      property?.porcentajeEntradaRequerida ??
      property?.financing?.downPaymentPct ??
      0.1,
    reservaMinima:
      property?.reservaMinima ?? property?.financing?.reserveMin ?? 500,

    imagen: property?.imagen || "",
    galeria: Array.isArray(property?.galeria)
      ? property.galeria.join("\n")
      : "",

    productIds: Array.isArray(property?.mortgageProfile?.productIds)
      ? property.mortgageProfile.productIds.join(",")
      : "VIP,PRIVATE",

    requiresFirstHome: property?.mortgageProfile?.requiresFirstHome === true,
    requiresNewConstruction:
      property?.mortgageProfile?.requiresNewConstruction !== false,
    requiresMiduviQualifiedProject:
      property?.mortgageProfile?.requiresMiduviQualifiedProject === true,

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

export default function AdminProperties() {
  const [adminKey, setAdminKey] = useState(() => getPropertyAdminKey());
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeCount = useMemo(
    () => properties.filter((p) => p?.publicado === true).length,
    [properties]
  );

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

  function handleSaveKey() {
    savePropertyAdminKey(adminKey);
    setMessage("Clave admin guardada en este navegador.");
    setError("");
  }

  function handleClearKey() {
    clearPropertyAdminKey();
    setAdminKey("");
    setMessage("Clave admin eliminada de este navegador.");
    setError("");
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

  async function handleSubmit() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      savePropertyAdminKey(adminKey);

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

      savePropertyAdminKey(adminKey);

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

      savePropertyAdminKey(adminKey);

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
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 18 }}>
        <div>
          <div style={{ color: "rgba(148,163,184,0.95)", fontWeight: 900 }}>
            HabitaLibre Admin
          </div>

          <h1 style={{ margin: "8px 0 0", fontSize: 34, lineHeight: 1 }}>
            Propiedades
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(203,213,225,0.88)",
              lineHeight: 1.45,
            }}
          >
            Crea, edita, publica, pausa, reserva o marca como vendidas las
            propiedades sin tocar código ni volver a subir la app móvil.
          </p>
        </div>

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
          <label style={labelStyle()}>
            PROPERTY_ADMIN_KEY
            <input
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Pega tu clave admin"
              type="password"
              style={inputStyle()}
            />
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={handleSaveKey}>Guardar clave</Button>

            <Button tone="secondary" onClick={handleClearKey}>
              Borrar clave
            </Button>

            <Button tone="secondary" onClick={loadProperties}>
              Recargar inventario
            </Button>

            <Button tone="secondary" onClick={startCreate}>
              Nueva propiedad
            </Button>
          </div>

          <div style={{ color: "rgba(148,163,184,0.95)", fontSize: 13 }}>
            Activas publicadas: <strong>{activeCount}</strong> · Total cargadas:{" "}
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
            gridTemplateColumns: "minmax(0, 1fr) minmax(380px, 0.78fr)",
            gap: 18,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 24,
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Inventario</h2>

            {loading ? (
              <div style={{ color: "rgba(203,213,225,0.85)" }}>
                Cargando propiedades...
              </div>
            ) : properties.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {properties.map((p) => {
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
                            {moneyUSD(p?.precio || 0)} · {p?.m2 || "—"} m² ·{" "}
                            {p?.dormitorios || "—"} dorm.
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
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingId ? "Editar propiedad" : "Nueva propiedad"}
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              <label style={labelStyle()}>
                ID comercial
                <input
                  value={form.id}
                  onChange={(e) => updateForm("id", e.target.value)}
                  disabled={!!editingId}
                  style={inputStyle()}
                  placeholder="gls_hp6_a1201"
                />
              </label>

              <label style={labelStyle()}>
                Proyecto
                <input
                  value={form.proyecto}
                  onChange={(e) => updateForm("proyecto", e.target.value)}
                  style={inputStyle()}
                  placeholder="High Point 6"
                />
              </label>

              <label style={labelStyle()}>
                Título
                <input
                  value={form.titulo}
                  onChange={(e) => updateForm("titulo", e.target.value)}
                  style={inputStyle()}
                  placeholder="Departamento A1201 - High Point 6"
                />
              </label>

              <label style={labelStyle()}>
                Descripción
                <textarea
                  value={form.descripcion}
                  onChange={(e) => updateForm("descripcion", e.target.value)}
                  style={{ ...inputStyle(), minHeight: 82, resize: "vertical" }}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={labelStyle()}>
                  Precio
                  <input
                    value={form.precio}
                    onChange={(e) => updateForm("precio", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  M²
                  <input
                    value={form.m2}
                    onChange={(e) => updateForm("m2", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  Dormitorios
                  <input
                    value={form.dormitorios}
                    onChange={(e) => updateForm("dormitorios", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  Baños
                  <input
                    value={form.banos}
                    onChange={(e) => updateForm("banos", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  Parqueaderos
                  <input
                    value={form.parqueaderos}
                    onChange={(e) => updateForm("parqueaderos", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  Orden
                  <input
                    value={form.orden}
                    onChange={(e) => updateForm("orden", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={labelStyle()}>
                  Zona
                  <input
                    value={form.zona}
                    onChange={(e) => updateForm("zona", e.target.value)}
                    style={inputStyle()}
                  />
                </label>

                <label style={labelStyle()}>
                  Ciudad/Zona
                  <input
                    value={form.ciudadZona}
                    onChange={(e) => updateForm("ciudadZona", e.target.value)}
                    style={inputStyle()}
                  />
                </label>

                <label style={labelStyle()}>
                  Sector
                  <input
                    value={form.sector}
                    onChange={(e) => updateForm("sector", e.target.value)}
                    style={inputStyle()}
                  />
                </label>

                <label style={labelStyle()}>
                  Tipo entrega
                  <select
                    value={form.tipoEntrega}
                    onChange={(e) => updateForm("tipoEntrega", e.target.value)}
                    style={inputStyle()}
                  >
                    <option value="construccion">Construcción</option>
                    <option value="inmediata">Entrega inmediata</option>
                    <option value="planos">Planos</option>
                  </select>
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={labelStyle()}>
                  Meses construcción
                  <input
                    value={form.mesesConstruccionRestantes}
                    onChange={(e) =>
                      updateForm("mesesConstruccionRestantes", e.target.value)
                    }
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  Entrada requerida
                  <input
                    value={form.porcentajeEntradaRequerida}
                    onChange={(e) =>
                      updateForm("porcentajeEntradaRequerida", e.target.value)
                    }
                    style={inputStyle()}
                    type="number"
                    step="0.01"
                  />
                </label>

                <label style={labelStyle()}>
                  Reserva mínima
                  <input
                    value={form.reservaMinima}
                    onChange={(e) => updateForm("reservaMinima", e.target.value)}
                    style={inputStyle()}
                    type="number"
                  />
                </label>

                <label style={labelStyle()}>
                  Productos hipotecarios
                  <input
                    value={form.productIds}
                    onChange={(e) => updateForm("productIds", e.target.value)}
                    style={inputStyle()}
                    placeholder="VIP,PRIVATE"
                  />
                </label>
              </div>

              <label style={labelStyle()}>
                Imagen principal URL
                <input
                  value={form.imagen}
                  onChange={(e) => updateForm("imagen", e.target.value)}
                  style={inputStyle()}
                  placeholder="https://..."
                />
              </label>

              <label style={labelStyle()}>
                Galería URLs, una por línea
                <textarea
                  value={form.galeria}
                  onChange={(e) => updateForm("galeria", e.target.value)}
                  style={{ ...inputStyle(), minHeight: 82, resize: "vertical" }}
                />
              </label>

              <div style={{ display: "grid", gap: 8 }}>
                {[
                  ["proyectoNuevo", "Proyecto nuevo"],
                  ["permiteEntradaEnCuotas", "Permite entrada en cuotas"],
                  ["requiresFirstHome", "Requiere primera vivienda"],
                  ["requiresNewConstruction", "Requiere vivienda nueva"],
                  [
                    "requiresMiduviQualifiedProject",
                    "Requiere proyecto calificado MIDUVI",
                  ],
                  ["publicado", "Publicado"],
                ].map(([key, label]) => (
                  <label
                    key={key}
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
                      checked={!!form[key]}
                      onChange={(e) => updateForm(key, e.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <label style={labelStyle()}>
                Estado comercial
                <select
                  value={form.estadoComercial}
                  onChange={(e) => updateForm("estadoComercial", e.target.value)}
                  style={inputStyle()}
                >
                  <option value="disponible">Disponible</option>
                  <option value="pausado">Pausado</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </label>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}