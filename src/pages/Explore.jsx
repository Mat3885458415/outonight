import { useState } from 'react'
import { EVENTS, RESTAURANTS } from '../lib/mockData'
import EventCard from '../components/EventCard'
import RestaurantCard from '../components/RestaurantCard'
import styles from './Explore.module.css'

const CATS = ['All', 'Parties', 'Sport', 'Restaurants', 'Hobbies', 'Free']

export default function Explore({ joined, onJoin, onOpenEvent, onOpenRestaurant, onEnterContest, contestEntered }) {
  const [cat, setCat] = useState('All')

  const partyEvents = EVENTS.filter(e => e.category === 'party')
  const sportEvents = EVENTS.filter(e => e.category === 'sport')

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>OUTONIGHT</div>
          <h1 className={styles.heroTitle}>Zlín tonight</h1>
          <p className={styles.heroSub}>12 events · 340 students active</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Search events, restaurants, clubs...
        </div>

        {/* Category chips */}
        <div className={`${styles.cats} no-scrollbar`}>
          {CATS.map(c => (
            <button
              key={c}
              className={`${styles.chip} ${cat === c ? styles.chipActive : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>

        {/* Parties */}
        {(cat === 'All' || cat === 'Parties') && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>Parties & clubs</span>
              <span className={styles.seeAll}>See all →</span>
            </div>
            <div className={`${styles.hScroll} no-scrollbar`}>
              {partyEvents.map(ev => (
                <EventCard key={ev.id} event={ev} joined={joined[ev.id]} onJoin={onJoin} onClick={() => onOpenEvent(ev.id)} compact />
              ))}
            </div>
          </section>
        )}

        {/* Sport */}
        {(cat === 'All' || cat === 'Sport') && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>Sport & activities</span>
              <span className={styles.seeAll}>See all →</span>
            </div>
            <div className={`${styles.hScroll} no-scrollbar`}>
              {sportEvents.map(ev => (
                <EventCard key={ev.id} event={ev} joined={joined[ev.id]} onJoin={onJoin} onClick={() => onOpenEvent(ev.id)} compact />
              ))}
            </div>
          </section>
        )}

        {/* Restaurants */}
        {(cat === 'All' || cat === 'Restaurants') && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>Restaurants & food</span>
              <span className={styles.seeAll}>See all →</span>
            </div>
            {RESTAURANTS.map(r => (
              <RestaurantCard key={r.id} restaurant={r} onClick={() => onOpenRestaurant(r.id)} />
            ))}
          </section>
        )}

        {/* Giveaway */}
        {(cat === 'All') && (
          <div className={styles.contest}>
            <div className={styles.contestTitle}>🎁 Giveaway this week</div>
            <p className={styles.contestDesc}>Tag a friend on Club Rubín to win 2 free entries + 2 shots on the house!</p>
            <button
              className={`${styles.contestBtn} ${contestEntered ? styles.contestBtnEntered : ''}`}
              onClick={onEnterContest}
            >
              {contestEntered ? 'Entered! Good luck 🎉' : 'Enter the giveaway'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
