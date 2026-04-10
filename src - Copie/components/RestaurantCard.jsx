import styles from './RestaurantCard.module.css'

export default function RestaurantCard({ restaurant: r, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.img} style={{ background: r.bg }}>{r.emoji}</div>
      <div className={styles.body}>
        <div className={styles.name}>{r.name}</div>
        <div className={styles.stars}>
          {'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}
          <span className={styles.meta}> {r.rating} · {r.dist}</span>
        </div>
        <div className={styles.tags}>
          {r.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ flexShrink: 0, marginLeft: 'auto' }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  )
}
