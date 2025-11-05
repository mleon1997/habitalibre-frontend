import {useState} from "react";
import {guardarLead} from "../lib/api";
import {motion,AnimatePresence} from "framer-motion";

export default function SaveLeadDialog({open,onClose,data}){
  const [f,setF]=useState({nombre:"",email:"",telefono:"",ciudad:"",consent:false});
  const [loading,setLoading]=useState(false); const [msg,setMsg]=useState(""); const [err,setErr]=useState("");

  const change=e=>{
    const {name,value,type,checked}=e.target;
    setF(s=>({...s,[name]:type==="checkbox"?checked:value}));
  };

  const submit=async e=>{
    e.preventDefault(); setErr(""); setMsg("");
    if(!f.consent){ setErr("Debes aceptar el consentimiento de datos."); return;}
    setLoading(true);
    try{
      const inputs=JSON.parse(localStorage.getItem("hl:lastSim")||"{}");
      await guardarLead({...inputs, ...f});
      setMsg("¡Solicitud guardada! Te contactaremos pronto.");
      setTimeout(()=>{ onClose(); setMsg(""); setF({nombre:"",email:"",telefono:"",ciudad:"",consent:false});},1200);
    }catch(e2){ setErr(e2?.response?.data?.error||"No pudimos guardar tu solicitud.");}
    finally{ setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div initial={{scale:.96,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.96,opacity:0}} className="card w-full max-w-lg p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-1">Guardar mi solicitud</h4>
            <p className="text-xs text-slate-500 mb-4">Autorizas el uso y envío de tus datos a instituciones aliadas para evaluación crediticia.</p>
            {err && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{err}</div>}
            {msg && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{msg}</div>}
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input" placeholder="Nombre completo" name="nombre" value={f.nombre} onChange={change} required/>
                <input className="input" placeholder="Email" name="email" type="email" value={f.email} onChange={change} required/>
                <input className="input" placeholder="Teléfono" name="telefono" value={f.telefono} onChange={change}/>
                <input className="input" placeholder="Ciudad" name="ciudad" value={f.ciudad} onChange={change}/>
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" name="consent" checked={f.consent} onChange={change} className="mt-1"/>
                <span>Autorizo el tratamiento de mis datos y su envío a instituciones aliadas para evaluación crediticia.</span>
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button className="btn-primary" disabled={loading}>{loading?"Guardando…":"Guardar"}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
