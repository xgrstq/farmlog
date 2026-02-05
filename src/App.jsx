import { useEffect, useState } from "react"
import { supabase } from "./supabase.js"

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  const initialForm = {
    name: "",
    birth_date: "",
    marriage_date: "",
    purchase_date: "",
    purchase_price: "",
    sale_date: "",
    sale_price: "",
    illness_history: "",
    illness_date: "",
    treatment_date: "",
    recovery_date: "",
    death_date: "",
    death_note: "",
  }

  const [form, setForm] = useState(initialForm)

  // ================= HELPER =================
  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
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

  // ================= AUTH =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) fetchData()
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) fetchData()
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError("")
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setAuthError(error.message)
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // ================= DATA =================
  const fetchData = async () => {
    const { data } = await supabase
      .from("kambing")
      .select("*")
      .order("created_at", { ascending: false })
    setList(data || [])
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({ ...initialForm, ...item })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const saveData = async () => {
    if (!form.name) return alert("Nama kambing wajib diisi")

    const clean = (v) => (v === "" ? null : v)

    const payload = {
      ...form,
      birth_date: clean(form.birth_date),
      marriage_date: clean(form.marriage_date),
      purchase_date: clean(form.purchase_date),
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      sale_date: clean(form.sale_date),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      illness_date: clean(form.illness_date),
      treatment_date: clean(form.treatment_date),
      recovery_date: clean(form.recovery_date),
      death_date: clean(form.death_date),
      estimated_birth_date: estimateBirth(form.marriage_date),
    }

    if (editingId) {
      await supabase.from("kambing").update(payload).eq("id", editingId)
    } else {
      await supabase.from("kambing").insert([payload])
    }

    handleCloseForm()
    fetchData()
  }

  const deleteKambing = async (id) => {
    if (confirm("Hapus data kambing ini?")) {
      await supabase.from("kambing").delete().eq("id", id)
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e7ebe6] text-emerald-700 font-bold">
        FARMLOG…
      </div>
    )
  }

  // ================= LOGIN =================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dfe5df] p-6">
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-xl space-y-5 border border-gray-200"
        >
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#0f2419]">
              <span className="uppercase">FARM</span>
              <span className="uppercase text-emerald-600">LOG</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              login dulu atuh
            </p>
          </div>

          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {authError && (
            <p className="text-red-500 text-sm text-center font-semibold">
              {authError}
            </p>
          )}

          <button className="w-full bg-emerald-600 hover:bg-emerald-500 transition py-3 rounded-xl font-bold text-white">
            Masuk
          </button>
        </form>
      </div>
    )
  }

  // ================= DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#dfe5df] text-[#0f2419] pb-32">

      {/* DESKTOP NAVBAR (UPDATED) */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 w-[85%] max-w-5xl bg-[#f6f7f5] border border-gray-200 shadow-md rounded-3xl px-8 py-4 z-50 items-center justify-between">
        <div className="leading-tight">
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f2419]">
            FARMLOG
          </h1>
          <p className="text-xs italic text-emerald-900/70">
            livestock management
          </p>
        </div>

        <div className="flex items-center gap-6 font-bold">
          <button
            onClick={() => setShowForm(true)}
            className="text-[#0f2419] hover:text-emerald-700 transition text-sm"
          >
            Add
          </button>

          <button
            onClick={logout}
            className="text-[#0f2419] hover:text-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex flex-col items-center px-4 py-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0f2419]">
          FARMLOG
        </h1>
        <p className="text-sm italic text-emerald-900/70 mt-1">
          Livestock management
        </p>

        <button
          onClick={logout}
          className="text-sm text-red-600 font-bold mt-4"
        >
          Logout
        </button>
      </div>

      <main className="max-w-2xl mx-auto px-4 space-y-6 md:pt-32">
        {list.map((k) => (
          <div
            key={k.id}
            className="relative bg-white p-6 rounded-3xl border border-gray-200 shadow space-y-2 group"
          >
            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex absolute top-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => handleEdit(k)}
                className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm"
              >
                ✏️
              </button>
              <button
                onClick={() => deleteKambing(k.id)}
                className="px-3 py-1 rounded-lg bg-red-100 text-red-600 font-bold text-sm"
              >
                🗑️
              </button>
            </div>

            <h2 className="text-2xl font-extrabold">{k.name}</h2>

            <p>📅 Lahir: {formatDate(k.birth_date)} ({getAge(k.birth_date)})</p>
            {k.marriage_date && (
              <p>
                🤰 Kawin: {formatDate(k.marriage_date)} → {formatDate(k.estimated_birth_date)}
              </p>
            )}
            {k.purchase_date && (
              <p>
                💰 Beli: {formatDate(k.purchase_date)} · Rp{k.purchase_price}
              </p>
            )}
            {k.sale_date && (
              <p className="text-emerald-600 font-bold">
                🧾 Jual: {formatDate(k.sale_date)} · Rp{k.sale_price}
              </p>
            )}
            {k.illness_history && (
              <p className="italic text-yellow-700">
                🤒 {k.illness_history}
              </p>
            )}
            {k.death_date && (
              <p className="text-red-600">
                💀 Meninggal: {formatDate(k.death_date)} — {k.death_note}
              </p>
            )}

            {/* MOBILE ACTIONS (DO NOT TOUCH) */}
            <div className="flex gap-2 pt-3 md:hidden">
              <button
                onClick={() => handleEdit(k)}
                className="flex-1 bg-emerald-100 text-emerald-700 py-2 rounded-xl font-bold"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => deleteKambing(k.id)}
                className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl font-bold"
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* FAB (DO NOT TOUCH) */}
      <button
        onClick={() => setShowForm(true)}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 rounded-full bg-emerald-500 text-white text-3xl shadow-xl"
      >
        +
      </button>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg mx-auto rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseForm} className="absolute top-4 right-4 text-xl">
              ✕
            </button>

            <h2 className="text-2xl font-extrabold mb-4">
              {editingId ? "Edit Data Kambing" : "Tambah Data Kambing"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="label">Nama Kambing</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tanggal Lahir</label>
                <input
                  type="date"
                  className="input"
                  value={form.birth_date}
                  onChange={e => setForm({ ...form, birth_date: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tanggal Perkawinan</label>
                <input
                  type="date"
                  className="input"
                  value={form.marriage_date}
                  onChange={e => setForm({ ...form, marriage_date: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tanggal Pembelian</label>
                <input
                  type="date"
                  className="input"
                  value={form.purchase_date}
                  onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Harga Pembelian</label>
                <input
                  type="number"
                  className="input"
                  value={form.purchase_price}
                  onChange={e => setForm({ ...form, purchase_price: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Riwayat Penyakit</label>
                <textarea
                  className="input"
                  value={form.illness_history}
                  onChange={e => setForm({ ...form, illness_history: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tanggal Meninggal</label>
                <input
                  type="date"
                  className="input"
                  value={form.death_date}
                  onChange={e => setForm({ ...form, death_date: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Keterangan Meninggal</label>
                <textarea
                  className="input"
                  value={form.death_note}
                  onChange={e => setForm({ ...form, death_note: e.target.value })}
                />
              </div>

              <button
                onClick={saveData}
                className="w-full bg-emerald-600 hover:bg-emerald-500 transition text-white py-3 rounded-xl font-bold mt-4"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 1rem;
          border: 1px solid #a7a7a7;
          margin-top: 0.25rem;
          font-weight: 600;
        }
        .label {
          font-weight: 700;
          font-size: 0.9rem;
          color: #5d6776;
        }
      `}</style>
    </div>
  )
}

export default App
