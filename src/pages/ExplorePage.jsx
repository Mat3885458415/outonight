import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ExplorePage.module.css'

const MOCK_EVENTS = [
  { id: 1, name: 'Techno Night #12', venue: 'Club Rubín', date: 'Fri 18 Apr', time: '10:00pm', price: '150 CZK', category: 'party', badge: 'hot', emoji: '🎵', color: '#e8eaf6', going: 50 },
  { id: 2, name: 'Thursday Happy Hour', venue: 'Bar Panorama', date: 'Thu 17 Apr', time: '8:00pm', price: '80 CZK', category: 'party', badge: '', emoji: '🍺', color: '#e3f2fd', going: 25 },
  { id: 3, name: 'Erasmus Night', venue: 'Erasmus Zlín', date: 'Sat 19 Apr', time: '9:00pm', price: 'Free', category: 'party', badge: 'free', emoji: '🎤', color: '#ede7f6', going: 92 },
  { id: 4, name: 'UTB Football Match', venue: 'UTB Sports Ground', date: 'Wed 16 Apr', time: '6:00pm', price: 'Free', category: 'sport', badge: 'free', emoji: '⚽', color: '#e8f5e9', going: 18 },
  { id: 5, name: 'Open Basketball 3v3', venue: 'UTB Gym', date: 'Sat 19 Apr', time: '2:00pm', price: 'Free', category: 'sport', badge: 'new', emoji: '🏀', color: '#e3f2fd', going: 10 },
]

const MOCK_RESTAURANTS = [
  { id: 1, name: 'Pizzeria Modrá Hvězda', emoji: '🍕', color: '#fff3e0', cuisine: 'Italian · Pizza', rating: 4.2, dist: '120m from UTB', tags: ['Student deal', 'Open now'] },
  { id: 2, name: 'Asian Garden', emoji: '🍜', color: '#e8f5e9', cuisine: 'Asian · Noodles', rating: 4.8, dist: '400m from UTB', tags: ['Budget friendly'] },
  { id: 3, name: 'Steakhouse Zlín', emoji: '🥩', color: '#fbe9e7', cuisine: 'Grill · Steakhouse', rating: 4.4, dist: '600m from UTB', tags: ['Group bookings'] },
]

const CATS = ['All', 'Parties', 'Sport', 'Restaurants', 'Hobbies', 'Free']

export default function ExplorePage({ onOpenEvent, onOpenRestaurant }) {
  const [cat, setCat] = useState('All')

  const filteredEvents = MOCK_EVENTS.filter(e => {
    if (cat === 'All') return true
    if (cat === 'Parties') return e.category === 'party'
    if (cat === 'Sport') return e.category === 'sport'
    if (cat === 'Free') return e.price === 'Free'
    return true
  })

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroText}>
          <span className={styles.heroLabel}>OUTONIGHT</span>
          <h1 className={styles.heroTitle}>Zlín tonight</h1>
          <p className={styles.heroSub}>12 events · 340 students active</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.search}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search events, restaurants, clubs...</span>
        </div>
      </div>

      {/* Category chips */}
      <div className={`${styles.cats} scroll-hide`}>
        {CATS.map(c => (
          <button key={c} className={`${styles.chip} ${cat === c ? styles.chipOn : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* Events section */}
      {(cat === 'All' || cat === 'Parties' || cat === 'Sport' || cat === 'Free' || cat === 'Hobbies') && (
        <div className={styles.section}>
          <div className={styles.secHead}>
            <span className={styles.secTitle}>{cat === 'Sport' ? 'Sport & activities' : cat === 'Parties' ? 'Parties & clubs' : 'Events'}</span>
            <span className={styles.seeAll}>See all →</span>
          </div>
          <div className={`${styles.hscroll} scroll-hide`}>
            {filteredEvents.map(ev => (
              <div key={ev.id} className={styles.ecard} onClick={() => onOpenEvent(ev.id)}>
                <div className={styles.ecardImg} style={{ background: ev.color }}>{ev.emoji}</div>
                <div className={styles.ecardBody}>
                  <div className={styles.ecardName}>
                    {ev.name}
                    {ev.badge && <span className={styles[`badge_${ev.badge}`]}>{ev.badge}</span>}
                  </div>
                  <div className={styles.ecardMeta}>{ev.date} · {ev.time} · {ev.price}</div>
                  <div className={styles.ecardGoing}>
                    <div className={styles.dots}>{[0,1,2].map(i=><div key={i} className={styles.dot} style={{background:'#c5cae9',marginLeft: i>0?-5:0}}/>)}</div>
                    <span>+{ev.going} going</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restaurants section */}
      {(cat === 'All' || cat === 'Restaurants') && (
        <div className={styles.section}>
          <div className={styles.secHead}>
            <span className={styles.secTitle}>Restaurants & food</span>
            <span className={styles.seeAll}>See all →</span>
          </div>
          {MOCK_RESTAURANTS.map(r => (
            <div key={r.id} className={styles.rcard} onClick={() => onOpenRestaurant(r.id)}>
              <div className={styles.rcardImg} style={{ background: r.color }}>{r.emoji}</div>
              <div className={styles.rcardInfo}>
                <div className={styles.rcardName}>{r.name}</div>
                <div className={styles.stars}>{'★'.repeat(Math.floor(r.rating))}{'☆'.repeat(5-Math.floor(r.rating))} <span style={{color:'#aaa',fontWeight:400}}>{r.rating} · {r.dist}</span></div>
                <div className={styles.tagRow}>{r.tags.map(t=><span key={t} className={styles.tag}>{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Giveaway */}
      <div className={styles.giveaway}>
        <div className={styles.giveawayTitle}>🎁 Giveaway this week</div>
        <p className={styles.giveawayDesc}>Tag a friend on Club Rubín to win 2 free entries + 2 shots on the house!</p>
        <button className={styles.giveawayBtn} onClick={e => { e.target.textContent = 'Entered! Good luck 🎉'; e.target.style.background = 'var(--green)' }}>
          Enter the giveaway
        </button>
      </div>
    </div>
  )
}
