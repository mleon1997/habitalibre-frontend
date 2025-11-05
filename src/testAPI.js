import API from "./lib/api";

export async function testBackend() {
  try {
    const res = await API.get("/api/health");
    console.log("✅ Conectado:", res.data);
  } catch (err) {
    console.error("❌ Error al conectar:", err.message);
  }
}
