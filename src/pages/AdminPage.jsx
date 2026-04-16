import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

const CATEGORIES = ['party', 'sport', 'hobby', 'culture']
const EMOJIS = ['🎵','🍺','🎤','⚽','🏀','🎭','🎨','🍕','🍜','🥩','🎉','🎶']
const COLORS = ['#e8eaf6','#e3f2fd','#ede7f6','#e8f5e9','#fff3e0','#fbe9e7']

const EMPTY_EVENT = {
  name: '', venue: '', description: '', date: '', time: '',
  price: 'Free', category: 'party', badge: '', emoji: '🎵', color: '#e8eaf6',
  bar_id: null, is_special: false
}

export default function AdminPage({ onBack }) {
  const [tab, setTab] = useState('events')
  const [events, setEvents] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [bars, setBars] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const [event, setEvent] = useState(EMPTY_EVENT)

  const [resto, setResto] = useState({
    name: '', cuisine: '', description: '', rating: 4.0,
    distance: '', hours: '', emoji: '🍕', color: '#fff3e0', tags: ''
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [{ data: ev }, { data: re }, { data: br }] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('restaurants').select('*').order('created_at', { ascending: false }),
      supabase.from('bars').select('*').order('name'),
    ])
    if (ev) setEvents(ev)
    if (re) setRestaurants(re)
    if (br) setBars(br)
  }

  const handleBarChange = (barId) => {
    const bar = bars.find(b => b.id === barId)
    setEvent(prev => ({
      ...prev,
      bar_id: barId || null,
      venue: bar ? bar.name : prev.venue,
    }))
  }

  const submitEvent = async () => {
    setLoading(true)
    const { bar_id, ...rest } = event
    const payload = { ...rest, ...(bar_id ? { bar_id } : {}) }
    const { error } = await supabase.from('events').insert([payload])
    if (error) alert(error.message)
    else {
      setSuccess('Event published!')
      fetchData()
      setEvent(EMPTY_EVENT)
    }
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const submitResto = async () => {
    setLoading(true)
    const restoData = { ...resto, tags: resto.tags.split(',').map(t => t.trim()).filter(Boolean) }
    const { error } = await supabase.from('restaurants').insert([restoData])
    if (error) alert(error.message)
    else {
      setSuccess('Restaurant added!')
      fetchData()
      setResto({ name:'',cuisine:'',description:'',rating:4.0,distance:'',hours:'',emoji:'🍕',color:'#fff3e0',tags:'' })
    }
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const deleteEvent = async (id) => {
    await supabase.from('events').delete().eq('id', id)
    fetchData()
  }

  const deleteResto = async (id) => {
    await supabase.from('restaurants').delete().eq('id', id)
    fetchData()
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={onBack}>←</button>
        <span className={styles.title}>Admin Dashboard</span>
        <span className={styles.badge}>ADMIN</span>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab==='events'?styles.on:''}`} onClick={()=>setTab('events')}>Events</button>
        <button className={`${styles.tab} ${tab==='restaurants'?styles.on:''}`} onClick={()=>setTab('restaurants')}>Restaurants</button>
      </div>

      {success && <div className={styles.success}>{success}</div>}

      {tab === 'events' && (
        <div className={styles.content}>
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Add new event</div>

            <select
              className={styles.select}
              value={event.bar_id || ''}
              onChange={e => handleBarChange(e.target.value)}
            >
              <option value="">No specific bar (or fill venue manually)</option>
              {bars.map(b => (
                <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
              ))}
            </select>

            <input className={styles.input} placeholder="Event name *" value={event.name} onChange={e=>setEvent({...event,name:e.target.value})} />
            <input className={styles.input} placeholder="Venue (bar, club...)" value={event.venue} onChange={e=>setEvent({...event,venue:e.target.value})} />
            <textarea className={styles.textarea} placeholder="Description" value={event.description} onChange={e=>setEvent({...event,description:e.target.value})} />
            <div className={styles.row}>
              <input className={styles.input} type="date" value={event.date} onChange={e=>setEvent({...event,date:e.target.value})} />
              <input className={styles.input} placeholder="Time (ex: 10:00pm)" value={event.time} onChange={e=>setEvent({...event,time:e.target.value})} />
            </div>
            <div className={styles.row}>
              <input className={styles.input} placeholder="Price (ex: 150 CZK)" value={event.price} onChange={e=>setEvent({...event,price:e.target.value})} />
              <select className={styles.select} value={event.category} onChange={e=>setEvent({...event,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.row}>
              <select className={styles.select} value={event.badge} onChange={e=>setEvent({...event,badge:e.target.value})}>
                <option value="">No badge</option>
                <option value="hot">🔥 Hot</option>
                <option value="free">✅ Free</option>
                <option value="new">✨ New</option>
              </select>
              <select className={styles.select} value={event.emoji} onChange={e=>setEvent({...event,emoji:e.target.value})}>
                {EMOJIS.map(em=><option key={em} value={em}>{em}</option>)}
              </select>
            </div>
            <div className={styles.colorRow}>
              {COLORS.map(c=>(
                <div key={c} className={`${styles.colorDot} ${event.color===c?styles.colorOn:''}`}
                  style={{background:c}} onClick={()=>setEvent({...event,color:c})}/>
              ))}
            </div>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={event.is_special}
                onChange={e => setEvent({...event, is_special: e.target.checked})}
              />
              <span>✨ Special event (featured on home screen)</span>
            </label>
            <button className={styles.btnSubmit} onClick={submitEvent} disabled={loading||!event.name||!event.date}>
              {loading ? 'Adding...' : '+ Publish event'}
            </button>
          </div>

          <div className={styles.listTitle}>Published events ({events.length})</div>
          {events.map(ev=>(
            <div key={ev.id} className={styles.listItem}>
              <div className={styles.listIco} style={{background:ev.color}}>{ev.emoji}</div>
              <div className={styles.listInfo}>
                <div className={styles.listName}>{ev.name}</div>
                <div className={styles.listMeta}>{ev.venue} · {ev.date} · {ev.price}</div>
              </div>
              <button className={styles.btnDelete} onClick={()=>deleteEvent(ev.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'restaurants' && (
        <div className={styles.content}>
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Add new restaurant</div>
            <input className={styles.input} placeholder="Restaurant name *" value={resto.name} onChange={e=>setResto({...resto,name:e.target.value})} />
            <input className={styles.input} placeholder="Cuisine (ex: Italian · Pizza)" value={resto.cuisine} onChange={e=>setResto({...resto,cuisine:e.target.value})} />
            <textarea className={styles.textarea} placeholder="Description" value={resto.description} onChange={e=>setResto({...resto,description:e.target.value})} />
            <div className={styles.row}>
              <input className={styles.input} placeholder="Distance (ex: 200m from TBU)" value={resto.distance} onChange={e=>setResto({...resto,distance:e.target.value})} />
              <input className={styles.input} placeholder="Hours (ex: 11:00–23:00)" value={resto.hours} onChange={e=>setResto({...resto,hours:e.target.value})} />
            </div>
            <div className={styles.row}>
              <input className={styles.input} type="number" step="0.1" min="1" max="5" placeholder="Rating (ex: 4.2)" value={resto.rating} onChange={e=>setResto({...resto,rating:parseFloat(e.target.value)})} />
              <select className={styles.select} value={resto.emoji} onChange={e=>setResto({...resto,emoji:e.target.value})}>
                {EMOJIS.map(em=><option key={em} value={em}>{em}</option>)}
              </select>
            </div>
            <input className={styles.input} placeholder="Tags separated by comma (ex: Italian, Student deal)" value={resto.tags} onChange={e=>setResto({...resto,tags:e.target.value})} />
            <div className={styles.colorRow}>
              {COLORS.map(c=>(
                <div key={c} className={`${styles.colorDot} ${resto.color===c?styles.colorOn:''}`}
                  style={{background:c}} onClick={()=>setResto({...resto,color:c})}/>
              ))}
            </div>
            <button className={styles.btnSubmit} onClick={submitResto} disabled={loading||!resto.name}>
              {loading ? 'Adding...' : '+ Add restaurant'}
            </button>
          </div>

          <div className={styles.listTitle}>Restaurants ({restaurants.length})</div>
          {restaurants.map(r=>(
            <div key={r.id} className={styles.listItem}>
              <div className={styles.listIco} style={{background:r.color}}>{r.emoji}</div>
              <div className={styles.listInfo}>
                <div className={styles.listName}>{r.name}</div>
                <div className={styles.listMeta}>{r.cuisine} · {r.distance}</div>
              </div>
              <button className={styles.btnDelete} onClick={()=>deleteResto(r.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
