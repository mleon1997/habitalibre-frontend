// src/pages/Gracias.jsx
export default function Gracias() {
  const nombre = new URLSearchParams(window.location.search).get("n") || "¡Listo!";
  const monto = new URLSearchParams(window.location.search).get("m") || "";
  const waMsg = encodeURIComponent(`Hola, soy ${nombre}. Me llegó mi precalificación HabitaLibre${monto ? ` (monto aprox: $${monto})` : ""} y quiero avanzar.`);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-lg mx-auto p-8 text-center rounded-2xl border bg-white">
        <h2 className="text-2xl font-bold mb-2">¡Gracias, {nombre.split(" ")[0]}!</h2>
        <p className="text-slate-600">Hemos recibido tus datos. Un asesor te contactará en las próximas horas.</p>
        <div className="mt-5 grid grid-cols-1 gap-3">
          <a className="px-4 py-3 rounded-xl bg-green-600 text-white" href={`https://wa.me/593?text=${waMsg}`}>Continuar por WhatsApp</a>
          <a className="px-4 py-3 rounded-xl border" href="#/simular">Volver al simulador</a>
        </div>
      </div>
    </div>
  );
}
