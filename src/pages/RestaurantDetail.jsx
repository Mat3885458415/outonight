import { useState } from 'react'
import styles from './DetailPage.module.css'

const MOCK_RESTAURANTS = {
  1: { name: 'Pizzeria Modrá Hvězda', emoji: '🍕', color: '#fff3e0', cuisine: 'Italian · Pizza', rating: 4.2, dist: '120m from UTB', hours: '11:00–23:00', desc: 'Best pizza in Zlín. Show your UTB card for 20% off. Great for group dinners.', tags: ['Italian','Student deal','Open now'], slots: ['12:00','13:00','19:00','20:00','21:00'] },
  2: { name: 'Asian Garden', emoji: '🍜', color: '#e8f5e9', cuisine: 'Asian · Noodles', rating: 4.8, dist: '400m from UTB', hours: '11:30–22:00', desc: 'Authentic Asian cuisine. Ramen, dumplings, baos. Best value in town.', tags: ['Asian','Budget friendly'], slots: ['12:00','13:00','18:30','19:30','20:30'] },
  3: { name: 'Steakhouse Zlín', emoji: '🥩', color: '#fbe9e7', cuisine: 'Grill · Steakhouse', rating: 4.4, dist: '600m from UTB', hours: '12:00–23:00', desc: 'Premium steaks and grill. Perfect for group events and special occasions.', tags: ['Grill','Group bookings'], slots: ['19:00','20:00','21:00'] },
}

export default function RestaurantDetail({ restaurantId, onBack }) {
  const r = MOCK_RESTAURANTS[restaurantId]
  const [slot, setSlot] = useState(null)
  const [booked, setBooked] = useState(false)

  if (!r) return null

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onBack}>←</button>
        <span className={styles.topTitle}>Restaurant</span>
      </div>
      <div className={styles.hero} style={{background: r.color}}>{r.emoji}</div>
      <div className={styles.body}>
        <h2 className={styles.name}>{r.name}</h2>
        <div className={styles.sub}>{r.cuisine}</div>
        <div className={styles.stars}>{'★'.repeat(Math.floor(r.rating))}{'☆'.repeat(5-Math.floor(r.rating))} <span style={{color:'#aaa',fontWeight:400,fontSize:12}}>{r.rating} · {r.dist}</span></div>
        <div className={styles.tagRow}>{r.tags.map(t=><span key={t} className={styles.tag}>{t}</span>)}</div>
        <p className={styles.desc}>{r.desc}</p>
        <div className={styles.sub} style={{marginTop:4}}>🕙 {r.hours}</div>

        <div className={styles.bookSection}>
          <div className={styles.bookTitle}>Book a table</div>
          <div className={styles.bookSub}>Available slots today</div>
          <div className={styles.slots}>
            {r.slots.map((s,i) => (
              <button
                key={s}
                className={`${styles.slot} ${i===2 ? styles.slotFull : ''} ${slot===s ? styles.slotOn : ''}`}
                disabled={i===2}
                onClick={() => setSlot(s)}
              >{s}</button>
            ))}
          </div>
          <div className={styles.bookRow}>
            <select className={styles.select}>
              <option>1 person</option><option>2 people</option><option selected>3 people</option><option>4 people</option><option>5+</option>
            </select>
            <button className={styles.reserveBtn} onClick={() => setBooked(true)}>Reserve</button>
          </div>
        </div>

        {booked && (
          <div className={styles.confirmation}>
            <div style={{fontSize:32,marginBottom:8}}>✅</div>
            <div style={{fontWeight:500,fontSize:15}}>Table reserved!</div>
            <div style={{color:'#666',fontSize:13,marginTop:4}}>{r.name} · Today at {slot||r.slots[0]} · 3 people</div>
            <div style={{marginTop:12,fontSize:12,color:'#888',lineHeight:1.6}}>Confirmation sent to your email. Show your UTB card for the student discount.</div>
          </div>
        )}
      </div>
    </div>
  )
}
