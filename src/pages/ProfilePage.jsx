import styles from './ProfilePage.module.css'

const INTERESTS = ['Parties', 'Music', 'Football', 'Entrepreneurship', 'Fitness', 'Travel']
const MY_EVENTS = [
  { id: 1, name: 'Techno Night #12', date: 'Fri 18 Apr', venue: 'Club Rubín', emoji: '🎵', color: '#e8eaf6' },
  { id: 2, name: 'Erasmus Night', date: 'Sat 19 Apr', venue: 'Erasmus Zlín', emoji: '🎤', color: '#ede7f6' },
]

export default function ProfilePage({ session, isAdmin, onOpenAdmin }) {
  const name = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Student'
  const initials = name.slice(0,1).toUpperCase()

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.name}>{name}</div>
        <div className={styles.uni}>UTB Zlín · Erasmus</div>
        <button className={styles.editBtn}>Edit profile</button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}><div className={styles.statN}>{MY_EVENTS.length}</div><div className={styles.statL}>Events</div></div>
        <div className={styles.stat}><div className={styles.statN}>34</div><div className={styles.statL}>Friends</div></div>
        <div className={styles.stat}><div className={styles.statN}>1</div><div className={styles.statL}>Contests</div></div>
      </div>

      <div className={styles.section}>
        <div className={styles.secLabel}>Interests</div>
        <div className={styles.tagRow}>
          {INTERESTS.map(i => <span key={i} className={styles.tag}>{i}</span>)}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.secLabel}>My upcoming events</div>
        {MY_EVENTS.map(ev => (
          <div key={ev.id} className={styles.eventRow}>
            <div className={styles.eventIco} style={{background: ev.color}}>{ev.emoji}</div>
            <div>
              <div className={styles.eventName}>{ev.name}</div>
              <div className={styles.eventMeta}>{ev.date} · {ev.venue}</div>
            </div>
            <div className={styles.eventDot}/>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div style={{padding: '0 14px 24px'}}>
          <button onClick={onOpenAdmin} style={{width:'100%', padding:'13px', borderRadius:'12px', background:'#111', color:'#fff', border:'2px solid #111', fontSize:'14px', fontWeight:'500', cursor:'pointer', fontFamily:'var(--font-body)'}}>
            ⚙️ Admin Dashboard
          </button>
        </div>
      )}
    </div>
  )
}