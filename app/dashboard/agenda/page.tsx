'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AgendaPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [artisan, setArtisan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<any[]>([])
  const [moisActuel, setMoisActuel] = useState(new Date())
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [heureDebut, setHeureDebut] = useState('08:00')
  const [heureFin, setHeureFin] = useState('10:00')
  const [statut, setStatut] = useState<'disponible' | 'indisponible' | 'reserve'>('disponible')
  const [note, setNote] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: artisanData } = await supabase
        .from('artisans').select('*').eq('user_id', user.id).single() as { data: any }
      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)

      await chargerSlots(artisanData.id)
      setLoading(false)
    }
    load()
  }, [])

  async function chargerSlots(artisanId: string) {
    const debut = new Date(moisActuel.getFullYear(), moisActuel.getMonth(), 1)
    const fin = new Date(moisActuel.getFullYear(), moisActuel.getMonth() + 1, 0)

    const { data } = await supabase
      .from('agenda_artisan')
      .select('*')
      .eq('artisan_id', artisanId)
      .gte('date', debut.toISOString().split('T')[0])
      .lte('date', fin.toISOString().split('T')[0])
      .order('date', { ascending: true }) as { data: any[] | null }

    setSlots(data ?? [])
  }

  async function ajouterSlot() {
    if (!jourSelectionne || !artisan) return
    setSaving(true)

    await supabase.from('agenda_artisan').insert({
      artisan_id: artisan.id,
      date: jourSelectionne,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      statut,
      note: note || null,
    })

    await chargerSlots(artisan.id)
    setShowForm(false)
    setNote('')
    setSaving(false)
  }

  async function supprimerSlot(id: string) {
    await supabase.from('agenda_artisan').delete().eq('id', id)
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  function getSlotsPourJour(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    return slots.filter(s => s.date === dateStr)
  }

  function couleurStatut(statut: string) {
    switch (statut) {
      case 'disponible': return 'bg-green-100 text-green-700'
      case 'indisponible': return 'bg-red-100 text-red-700'
      case 'reserve': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const days = getDaysInMonth(moisActuel)
  const slotsJourSelectionne = jourSelectionne
    ? slots.filter(s => s.date === jourSelectionne)
    : []

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">BricoMaroc</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
          Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mon agenda</h1>
          <div className="flex gap-2 text-sm">
            {[
              { s: 'disponible', label: 'Dispo', color: 'bg-green-100 text-green-700' },
              { s: 'reserve', label: 'Reserve', color: 'bg-blue-100 text-blue-700' },
              { s: 'indisponible', label: 'Indispo', color: 'bg-red-100 text-red-700' },
            ].map(item => (
              <span key={item.s} className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* CALENDRIER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => {
              const d = new Date(moisActuel)
              d.setMonth(d.getMonth() - 1)
              setMoisActuel(d)
              if (artisan) chargerSlots(artisan.id)
            }}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              ←
            </button>
            <h2 className="font-bold text-gray-900 capitalize">
              {moisActuel.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => {
              const d = new Date(moisActuel)
              d.setMonth(d.getMonth() + 1)
              setMoisActuel(d)
              if (artisan) chargerSlots(artisan.id)
            }}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              →
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(j => (
              <div key={j} className="text-center text-xs font-semibold text-gray-400 py-1">
                {j}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr = day.toISOString().split('T')[0]
              const slotsJour = getSlotsPourJour(day)
              const isSelected = jourSelectionne === dateStr
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              const isPast = day < new Date(new Date().setHours(0,0,0,0))

              return (
                <button key={i} onClick={() => {
                  setJourSelectionne(dateStr)
                  setShowForm(false)
                }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center
                    text-sm font-medium transition-all relative ${
                    isSelected ? 'bg-[#1B7A56] text-white' :
                    isToday ? 'bg-green-50 text-[#1B7A56] font-bold' :
                    isPast ? 'text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                  }`}>
                  {day.getDate()}
                  {slotsJour.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {slotsJour.slice(0, 3).map(s => (
                        <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${
                          s.statut === 'disponible' ? 'bg-green-400' :
                          s.statut === 'reserve' ? 'bg-blue-400' : 'bg-red-400'
                        } ${isSelected ? 'bg-white' : ''}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* DETAIL JOUR SELECTIONNE */}
        {jourSelectionne && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">
                {new Date(jourSelectionne).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </h2>
              <button onClick={() => setShowForm(!showForm)}
                className="bg-[#1B7A56] text-white font-semibold px-4 py-2 rounded-xl
                  hover:bg-[#155f42] transition-colors text-sm">
                + Ajouter
              </button>
            </div>

            {/* FORMULAIRE AJOUT */}
            {showForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Heure debut
                    </label>
                    <input type="time" value={heureDebut}
                      onChange={e => setHeureDebut(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Heure fin
                    </label>
                    <input type="time" value={heureFin}
                      onChange={e => setHeureFin(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'disponible', label: 'Disponible', color: 'border-green-400 bg-green-50 text-green-700' },
                      { value: 'reserve', label: 'Reserve', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                      { value: 'indisponible', label: 'Indisponible', color: 'border-red-400 bg-red-50 text-red-700' },
                    ].map(s => (
                      <button key={s.value} onClick={() => setStatut(s.value as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                          statut === s.value ? s.color : 'border-gray-200 text-gray-500'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Note (optionnel)
                  </label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Ex: Intervention chez client, Conge..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold
                      py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Annuler
                  </button>
                  <button onClick={ajouterSlot} disabled={saving}
                    className="flex-1 bg-[#1B7A56] text-white font-semibold py-2 rounded-lg
                      hover:bg-[#155f42] transition-colors text-sm disabled:opacity-50">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}

            {/* LISTE SLOTS */}
            {slotsJourSelectionne.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Aucun creneau ce jour. Cliquez sur "+ Ajouter" pour en creer un.
              </p>
            ) : (
              <div className="space-y-2">
                {slotsJourSelectionne.map(slot => (
                  <div key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${couleurStatut(slot.statut)}`}>
                        {slot.statut}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {slot.heure_debut.substring(0, 5)} — {slot.heure_fin.substring(0, 5)}
                      </span>
                      {slot.note && (
                        <span className="text-xs text-gray-400">{slot.note}</span>
                      )}
                    </div>
                    <button onClick={() => supprimerSlot(slot.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors">
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Creneaux disponibles', value: slots.filter(s => s.statut === 'disponible').length, color: 'bg-green-50 border-green-200' },
            { label: 'Creneaux reserves', value: slots.filter(s => s.statut === 'reserve').length, color: 'bg-blue-50 border-blue-200' },
            { label: 'Creneaux indisponibles', value: slots.filter(s => s.statut === 'indisponible').length, color: 'bg-red-50 border-red-200' },
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}