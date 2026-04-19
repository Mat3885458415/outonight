import { useState } from 'react'
import styles from './FeedPage.module.css'

const MOCK_FEED = [
  { id: 1, venue: 'Club Rubín', date: 'Fri 18 Apr', time: '10:00pm', badge: 'hot', emoji: '🎵', color: '#e8eaf6', name: 'Techno Night #12', desc: "The best techno night of the month. 4h DJ set, bar open until 4am. Don't miss it.", attendees: [{n:'Mat',c:'#c5cae9'},{n:'Jana',c:'#b2dfdb'},{n:'Andrea',c:'#ffccbc'},{n:'Karim',c:'#fff9c4'},{n:'Sofia',c:'#fce4ec'}] },
  { id: 2, venue: 'Bar Panorama', date: 'Thu 17 Apr', time: '8:00pm', badge: '', emoji: '🍺', color: '#e3f2fd', name: 'Thursday Happy Hour', desc: '2-for-1 beers until 10pm. Popular with UTB students.', attendees: [{n:'Lena',c:'#dcedc8'},{n:'Pedro',c:'#bbdefb'}] },
  { id: 3, venue: 'Erasmus Zlín', date: 'Sat 19 Apr', time: '9:00pm', badge: 'free', emoji: '🎤', color: '#ede7f6', name: 'Erasmus International Night', desc: 'Monthly Erasmus party. Meet students from all over the world. Free entry with UTB card.', attendees: [{n:'Karim',c:'#fff9c4'},{n:'Sofia',c:'#fce4ec'},{n:'Andrea',c:'#ffccbc'},{n:'Jana',c:'#b2dfdb'}] },
  { id: 4, venue: 'UTB Sports', date: 'Wed 16 Apr', time: '6:00pm', badge: 'free', emoji: '⚽', color: '#e8f5e9', name: 'UTB Football Match', desc: 'Weekly open football game. All levels welcome.', attendees: [{n:'Adam',c:'#dcedc8'},{n:'Radek',c:'#b2dfdb'}] },
]

export default function FeedPage({ onOpenEvent }) {
  const [joined, setJoined] = useState({})
  const [modal, setModal] = useState(null)

  const toggleJoin = (id) => setJoined(j => ({ ...j, [id]: !j[id] }))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.title}>Student feed</span>
        <span className={styles.filter}>All events</span>
      </div>

      {MOCK_FEED.map(ev => (
        <div key={ev.id} className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.avatar} style={{ background: ev.color }}>{ev.venue.slice(0,2).toUpperCase()}</div>
            <div>
              <div className={styles.venue}>{ev.venue}</div>
              <div className={styles.time}>{ev.date} · {ev.time}</div>
            </div>
            {ev.badge && <span className={styles[`badge_${ev.badge}`]} style={{marginLeft:'auto'}}>{ev.badge}</span>}
          </div>
          <div className={styles.img} style={{ background: ev.color }}>{ev.emoji}</div>
          <div className={styles.body}>
            <div className={styles.name}>{ev.name}</div>
            <div className={styles.desc}>{ev.desc}</div>
            <button className={styles.goingRow} onClick={() => setModal(ev)}>
              <div className={styles.avs}>
                {ev.attendees.slice(0,4).map((a,i) => (
                  <div key={i} className={styles.av} style={{ background: a.c, marginLeft: i > 0 ? -6 : 0 }}>{a.n[0]}</div>
                ))}
              </div>
              <span className={styles.goingNames}>
                {ev.attendees.slice(0,2).map(a=>a.n).join(', ')}{ev.attendees.length > 2 ? ` + ${ev.attendees.length-2} others` : ''} going →
              </span>
            </button>
          </div>
          <div className={styles.actions}>
            <button
              className={`${styles.btnJoin} ${joined[ev.id] ? styles.joined : ''}`}
              onClick={() => toggleJoin(ev.id)}
            >
              {joined[ev.id] ? "You're going ✓" : 'Join'}
            </button>
            <button className={styles.btnShare}>Share</button>
          </div>
        </div>
      ))}

      {/* Attendee modal */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span className={styles.modalTitle}>{modal.attendees.length} going to {modal.name}</span>
              <button className={styles.modalClose} onClick={() => setModal(null)}>✕</button>
            </div>
            {modal.attendees.map((a, i) => (
              <div key={i} className={styles.attendeeRow}>
                <div className={styles.attAv} style={{ background: a.c }}>{a.n[0]}</div>
                <div>
                  <div className={styles.attName}>{a.n}</div>
                  <div className={styles.attUni}>UTB · Erasmus</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
