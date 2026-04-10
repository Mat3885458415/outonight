import { useState } from 'react'
import styles from './DetailPage.module.css'

const MOCK_EVENTS = {
  1: { name: 'Techno Night #12', venue: 'Club Rubín', date: 'Fri 18 Apr', time: '10:00pm', price: '150 CZK', emoji: '🎵', color: '#e8eaf6', desc: "The best techno night of the month. 4h DJ set, bar open until 4am. Don't miss it.", attendees: [{n:'Mat',c:'#c5cae9',u:'TBU · France',f:'🇫🇷'},{n:'Jana K.',c:'#b2dfdb',u:'TBU · Czech',f:'🇨🇿'},{n:'Andrea L.',c:'#ffccbc',u:'TBU · Spain',f:'🇪🇸'},{n:'Karim B.',c:'#fff9c4',u:'TBU · Morocco',f:'🇲🇦'},{n:'Sofia R.',c:'#fce4ec',u:'TBU · Italy',f:'🇮🇹'},{n:'Lena W.',c:'#dcedc8',u:'TBU · Germany',f:'🇩🇪'}] },
  2: { name: 'Thursday Happy Hour', venue: 'Bar Panorama', date: 'Thu 17 Apr', time: '8:00pm', price: '80 CZK', emoji: '🍺', color: '#e3f2fd', desc: '2-for-1 beers until 10pm. Popular with TBU students. Good music and chill atmosphere.', attendees: [{n:'Lena W.',c:'#dcedc8',u:'TBU · Germany',f:'🇩🇪'},{n:'Pedro M.',c:'#bbdefb',u:'TBU · Portugal',f:'🇵🇹'}] },
  3: { name: 'Erasmus Night', venue: 'Erasmus Zlín', date: 'Sat 19 Apr', time: '9:00pm', price: 'Free', emoji: '🎤', color: '#ede7f6', desc: 'Monthly Erasmus party. Meet students from all over the world. Free entry with TBU student card.', attendees: [{n:'Karim B.',c:'#fff9c4',u:'TBU · Morocco',f:'🇲🇦'},{n:'Sofia R.',c:'#fce4ec',u:'TBU · Italy',f:'🇮🇹'},{n:'Andrea L.',c:'#ffccbc',u:'TBU · Spain',f:'🇪🇸'},{n:'Jana K.',c:'#b2dfdb',u:'TBU · Czech',f:'🇨🇿'}] },
  4: { name: 'TBU Football Match', venue: 'TBU Sports Ground', date: 'Wed 16 Apr', time: '6:00pm', price: 'Free', emoji: '⚽', color: '#e8f5e9', desc: 'Weekly open football game. All levels welcome. Bring water and energy.', attendees: [{n:'Adam P.',c:'#dcedc8',u:'TBU · Czech',f:'🇨🇿'},{n:'Radek M.',c:'#b2dfdb',u:'TBU · Czech',f:'🇨🇿'}] },
  5: { name: 'Open Basketball 3v3', venue: 'TBU Gym', date: 'Sat 19 Apr', time: '2:00pm', price: 'Free', emoji: '🏀', color: '#e3f2fd', desc: 'First 3v3 tournament. Sign up solo or with a team. Prizes for the top 3.', attendees: [{n:'Nikola H.',c:'#bbdefb',u:'TBU · Czech',f:'🇨🇿'}] },
}

export default function EventDetail({ eventId, onBack }) {
  const ev = MOCK_EVENTS[eventId]
  const [joined, setJoined] = useState(false)
  const [showModal, setShowModal] = useState(false)

  if (!ev) return null

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onBack}>←</button>
        <span className={styles.topTitle}>Event details</span>
      </div>
      <div className={styles.hero} style={{background: ev.color}}>{ev.emoji}</div>
      <div className={styles.body}>
        <h2 className={styles.name}>{ev.name}</h2>
        <div className={styles.sub}>{ev.venue}</div>
        <div className={styles.pills}>
          <span className={styles.pill}>📅 {ev.date}</span>
          <span className={styles.pill}>🕙 {ev.time}</span>
          <span className={styles.pill}>🎟 {ev.price}</span>
        </div>
        <p className={styles.desc}>{ev.desc}</p>

        <button className={styles.attendeeBox} onClick={() => setShowModal(true)}>
          <div className={styles.attendeeInfo}>
            <span className={styles.attendeeCount}>{ev.attendees.length} people going</span>
            <div className={styles.avRow}>
              {ev.attendees.slice(0,6).map((a,i) => (
                <div key={i} className={styles.av} style={{background:a.c, marginLeft: i>0?-7:0}}>{a.n[0]}</div>
              ))}
            </div>
          </div>
          <span className={styles.seeWho}>See full list →</span>
        </button>

        <div className={styles.btnRow}>
          <button className={`${styles.btnJoin} ${joined ? styles.joined : ''}`} onClick={() => setJoined(!joined)}>
            {joined ? "You're going ✓" : 'Join this event'}
          </button>
          <button className={styles.btnShare}>Share</button>
        </div>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>{ev.attendees.length} going to {ev.name}</span>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            {ev.attendees.map((a,i) => (
              <div key={i} className={styles.attRow}>
                <div className={styles.attAv} style={{background:a.c}}>{a.n[0]}</div>
                <div><div className={styles.attName}>{a.n}</div><div className={styles.attUni}>{a.u}</div></div>
                <span style={{marginLeft:'auto',fontSize:20}}>{a.f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
