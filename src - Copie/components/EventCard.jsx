import styles from './EventCard.module.css'

function Badge({ type }) {
  if (!type) return null
  return <span className={`${styles.badge} ${styles['badge_' + type]}`}>{type}</span>
}

function Avatars({ attendees, max = 3 }) {
  return (
    <div className={styles.avRow}>
      <div className={styles.avs}>
        {attendees.slice(0, max).map((a, i) => (
          <div key={i} className={styles.av} style={{ background: a.bg, color: a.tc }}>{a.init}</div>
        ))}
      </div>
      <span className={styles.avLabel}>+{attendees.length} going</span>
    </div>
  )
}

export default function EventCard({ event, joined, onJoin, onClick, compact, onViewAttendees }) {
  if (compact) {
    return (
      <div className={styles.compact} onClick={onClick}>
        <div className={styles.compactImg} style={{ background: event.bg }}>{event.emoji}</div>
        <div className={styles.compactBody}>
          <div className={styles.compactName}>{event.name} <Badge type={event.badge} /></div>
          <div className={styles.compactMeta}>{event.date} · {event.time} · {event.price}</div>
          <Avatars attendees={event.attendees} />
        </div>
      </div>
    )
  }

  // Full feed card
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headAv} style={{ background: event.bg, color: '#3949ab' }}>
          {event.venue.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles.venue}>{event.venue}</div>
          <div className={styles.time}>{event.date} · {event.time}</div>
        </div>
        <Badge type={event.badge} />
      </div>

      <div className={styles.img} style={{ background: event.bg }}>{event.emoji}</div>

      <div className={styles.body}>
        <div className={styles.title}>{event.name}</div>
        <div className={styles.desc}>{event.desc}</div>

        <div className={styles.going} onClick={onViewAttendees}>
          <div className={styles.avs}>
            {event.attendees.slice(0, 4).map((a, i) => (
              <div key={i} className={styles.avSmall} style={{ background: a.bg, color: a.tc }}>{a.init}</div>
            ))}
          </div>
          <span className={styles.goingNames}>
            {event.attendees.slice(0, 2).map(a => a.name.split(' ')[0]).join(', ')}
            {event.attendees.length > 2 ? ` + ${event.attendees.length - 2} others` : ''} going →
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btnJoin} ${joined ? styles.btnJoined : ''}`}
          onClick={() => onJoin(event.id)}
        >
          {joined ? "You're going ✓" : 'Join'}
        </button>
        <button className={styles.btnShare}>Share</button>
      </div>
    </div>
  )
}
