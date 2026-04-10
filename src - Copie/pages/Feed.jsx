import { EVENTS } from '../lib/mockData'
import EventCard from '../components/EventCard'
import styles from './Feed.module.css'

export default function Feed({ joined, onJoin, onOpenEvent, onViewAttendees }) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.title}>Student feed</span>
        <span className={styles.filter}>All events</span>
      </div>
      <div className={styles.list}>
        {EVENTS.map(ev => (
          <EventCard
            key={ev.id}
            event={ev}
            joined={joined[ev.id]}
            onJoin={onJoin}
            onClick={() => onOpenEvent(ev.id)}
            onViewAttendees={() => onViewAttendees(ev.id)}
          />
        ))}
      </div>
    </div>
  )
}
