import { useEffect, useState } from "react"
import { supabase } from "./supabase.js"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null) // Untuk melacak data mana yang diedit
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  const initialForm = {
    name: "", birth_date: "", marriage_date: "", purchase_date: "",
    purchase_price: "", sale_date: "", sale_price: "", illness_history: "",
    illness_date: "", treatment_date: "", recovery_date: "", death_date: "", death_note: "",
  }

  const [form, setForm] = useState(initialForm)

  // ================= HELPER =================
  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getAge = (birth) => {
    if (!birth) return "-"
    const diff = Date.now() - new Date(birth).getTime()
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30))} bln`
  }

  const estimateBirth = (date) => {
    if (!date) return null
    const d = new Date(date)
    d.setDate(d.getDate() + 150)
    return d.toISOString().split("T")[0]
  }

  // ================= AUTH & DATA =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) fetchData()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchData()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  const fetchData = async () => {
    const { data } = await supabase.from("kambing").select("*").order("created_at", { ascending: false })
    setList(data || [])
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      name: item.name || "",
      birth_date: item.birth_date || "",
      marriage_date: item.marriage_date || "",
      purchase_date: item.purchase_date || "",
      purchase_price: item.purchase_price || "",
      sale_date: item.sale_date || "",
      sale_price: item.sale_price || "",
      illness_history: item.illness_history || "",
      illness_date: item.illness_date || "",
      treatment_date: item.treatment_date || "",
      recovery_date: item.recovery_date || "",
      death_date: item.death_date || "",
      death_note: item.death_note || "",
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const saveData = async () => {
    if (!form.name) return alert("Nama kambing wajib diisi")
    
    const clean = (val) => (val === "" || val === undefined ? null : val)

    const payload = {
      name: form.name,
      birth_date: clean(form.birth_date),
      marriage_date: clean(form.marriage_date),
      purchase_date: clean(form.purchase_date),
      purchase_price: form.purchase_price ? Math.round(Number(form.purchase_price)) : null,
      sale_date: clean(form.sale_date),
      sale_price: form.sale_price ? Math.round(Number(form.sale_price)) : null,
      illness_history: clean(form.illness_history),
      illness_date: clean(form.illness_date),
      treatment_date: clean(form.treatment_date),
      recovery_date: clean(form.recovery_date),
      death_date: clean(form.death_date),
      death_note: clean(form.death_note),
      estimated_birth_date: estimateBirth(form.marriage_date),
      
    }

    if (editingId) {
      const { error } = await supabase.from("kambing").update(payload).eq("id", editingId)
      if (error) return alert("Update Error: " + error.message)
    } else {
      const { error } = await supabase.from("kambing").insert([payload])
      if (error) return alert("Insert Error: " + error.message)
    }

    handleCloseForm()
    fetchData()
  }

  const deleteKambing = async (id) => {
    if (window.confirm("Hapus data kambing ini?")) {
      const { error } = await supabase.from("kambing").delete().eq("id", id)
      if (!error) fetchData()
    }
  }

  if (loading) return <div className="min-h-screen bg-[#05160d] flex items-center justify-center text-emerald-500 font-mono animate-pulse text-xl tracking-tighter">FARMLOG...</div>

  // ================= LOGIN VIEW =================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05160d] relative overflow-hidden p-6 font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#0b2e1a]/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-10">
              <div className="inline-block p-4 bg-emerald-500/10 rounded-3xl mb-4 border border-emerald-500/20 shadow-inner"><span className="text-4xl">🐐</span></div>
              <h1 className="text-4xl font-black text-white tracking-tighter">FARMLOG</h1>
              <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-[0.3em] mt-1 italic">Livestock Management</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-2xl bg-black/20 border border-white/5 focus:border-emerald-500 focus:bg-black/40 outline-none transition-all text-white placeholder:text-white/20" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" className="w-full px-6 py-4 rounded-2xl bg-black/20 border border-white/5 focus:border-emerald-500 focus:bg-black/40 outline-none transition-all text-white placeholder:text-white/20" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {authError && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] text-center font-bold uppercase tracking-wider">⚠️ {authError}</div>}
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 py-5 rounded-2xl font-black transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] text-[#05160d] active:scale-95 text-sm uppercase tracking-widest">Authorize Access</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ================= DASHBOARD VIEW =================
  return (
    <div className="min-h-screen bg-[#05160d] text-white font-sans selection:bg-emerald-500/30">
      
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-[#0b2e1a]/80 backdrop-blur-xl border-b border-white/5 z-40 px-10 py-5 justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2"><span className="text-2xl">🐐</span><h1 className="text-xl font-black tracking-tighter text-emerald-400">FARMLOG</h1></div>
        <div className="flex gap-6 items-center font-bold">
          <button onClick={() => setShowForm(true)} className="bg-emerald-500 hover:bg-emerald-400 text-[#05160d] px-8 py-2.5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg">+ Add New Data</button>
          <button onClick={() => supabase.auth.signOut()} className="text-white/20 hover:text-red-400 text-xs transition-colors uppercase tracking-widest">Logout</button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-10 md:pt-32 pb-32">
        <div className="md:hidden mb-10 text-center">
            <h1 className="text-3xl font-black tracking-tighter">FARMLOG</h1>
            <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-white/20 uppercase tracking-[0.3em] mt-4 font-bold">Terminate Session</button>
        </div>

        <div className="space-y-5">
          {list.length === 0 && <p className="text-white/10 text-center py-20 font-mono italic tracking-widest">NO_RECORDS_FOUND</p>}
          
          {list.map((k) => (
            <div key={k.id} className="bg-[#0b2e1a] p-6 rounded-[2rem] border border-white/5 shadow-xl space-y-4 relative group hover:border-emerald-500/20 transition-all">
              
              {/* ACTION BUTTONS (Trash & Pencil) */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <button 
                  onClick={() => deleteKambing(k.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-[10px]"
                >
                  🗑️
                </button>
                <button 
                  onClick={() => handleEdit(k)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-[#05160d] transition-all text-[10px]"
                >
                  ✏️
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                <h2 className="font-black text-xl text-white tracking-tight">{k.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                   <p className="text-white/40 uppercase text-[9px] font-bold tracking-widest">Vital Statistics</p>
                   <p className="text-white/80">📅 Lahir: {formatDate(k.birth_date)} <span className="text-emerald-500">({getAge(k.birth_date)})</span></p>
                   {k.marriage_date && <p className="text-emerald-400 font-mono bg-emerald-400/5 p-1 rounded inline-block">🤰 Breed: {formatDate(k.marriage_date)} → {formatDate(k.estimated_birth_date)}</p>}
                </div>
                <div className="space-y-1">
                   <p className="text-white/40 uppercase text-[9px] font-bold tracking-widest">Financials</p>
                   <p className="text-white/80">💰 Beli: {formatDate(k.purchase_date)} · <span className="font-mono">Rp{k.purchase_price?.toLocaleString()}</span></p>
                   {k.sale_date && <p className="text-blue-400 font-bold">🧾 Jual: {formatDate(k.sale_date)} · <span className="font-mono">Rp{k.sale_price?.toLocaleString()}</span></p>}
                </div>
              </div>

              {k.illness_history && (
                <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-2xl text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-500 font-black uppercase text-[9px] tracking-widest">Medical Logs</span>
                    <span className="text-[9px] opacity-40 font-mono italic">{formatDate(k.illness_date)}</span>
                  </div>
                  <p className="text-white/70 italic leading-relaxed">"{k.illness_history}"</p>
                </div>
              )}

              {k.death_date && (
                <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">💀 Deceased: {formatDate(k.death_date)}</p>
                  <p className="text-[11px] text-white/40 mt-1 italic leading-relaxed">{k.death_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <button onClick={() => setShowForm(true)} className="md:hidden fixed bottom-8 right-8 w-16 h-16 rounded-[2rem] bg-emerald-500 text-[#05160d] text-4xl shadow-[0_15px_40px_rgba(16,185,129,0.4)] flex items-center justify-center hover:rotate-90 transition-all z-50 border-4 border-[#05160d]">+</button>

      {/* MODAL FORM (Add & Edit) */}
      {showForm && (
        <div className="fixed inset-0 bg-[#05160d]/90 backdrop-blur-xl flex justify-center items-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0b2e1a] w-full max-w-lg rounded-[3rem] p-8 relative max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl no-scrollbar">
            <button onClick={handleCloseForm} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors font-bold">✕</button>
            <h2 className="text-2xl font-black mb-8 text-emerald-400 tracking-tighter uppercase">{editingId ? "Update Record" : "Register Goat"}</h2>
            
            <div className="space-y-6">
              <section className="space-y-3">
                <input placeholder="Goat Name / ID Tag" className="input-style" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1"><span className="text-[9px] text-emerald-500/40 ml-2 font-bold uppercase tracking-widest">Birth Date</span><input type="date" className="input-style" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
                  <div className="flex flex-col gap-1"><span className="text-[9px] text-emerald-500/40 ml-2 font-bold uppercase tracking-widest">Mating Date</span><input type="date" className="input-style" value={form.marriage_date} onChange={(e) => setForm({ ...form, marriage_date: e.target.value })} /></div>
                </div>
              </section>

              <section className="bg-white/5 p-6 rounded-[2rem] space-y-4">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2">Commerce</p>
                <div className="grid grid-cols-2 gap-3">
                   <input type="date" className="input-style" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                   <input type="number" placeholder="Buy Price" className="input-style" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <input type="date" className="input-style" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} />
                   <input type="number" placeholder="Sell Price" className="input-style" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
                </div>
              </section>

              <section className="bg-yellow-500/5 p-6 rounded-[2rem] space-y-4 text-[10px]">
                <p className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.2em]">Health Record</p>
                <textarea placeholder="Illness Details..." className="input-style text-xs" rows="2" value={form.illness_history} onChange={(e) => setForm({ ...form, illness_history: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <input type="date" className="input-style p-2" value={form.illness_date} onChange={(e) => setForm({ ...form, illness_date: e.target.value })} />
                  <input type="date" className="input-style p-2" value={form.treatment_date} onChange={(e) => setForm({ ...form, treatment_date: e.target.value })} />
                  <input type="date" className="input-style p-2" value={form.recovery_date} onChange={(e) => setForm({ ...form, recovery_date: e.target.value })} />
                </div>
              </section>

              <section className="bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10 space-y-3">
                <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">Mortality</p>
                <input type="date" className="input-style" value={form.death_date} onChange={(e) => setForm({ ...form, death_date: e.target.value })} />
                <textarea placeholder="Cause of death..." className="input-style text-xs font-mono" rows="2" value={form.death_note} onChange={(e) => setForm({ ...form, death_note: e.target.value })} />
              </section>

              <button onClick={saveData} className="w-full bg-emerald-500 text-[#05160d] font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-sm active:scale-95">
                {editingId ? "Update Data" : "Commit Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-style { @apply w-full px-5 py-4 rounded-2xl bg-black/40 text-white border border-white/5 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-white/10 text-sm font-mono; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>   
  )
}

export default App