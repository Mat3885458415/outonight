import styles from './BottomNav.module.css'

const tabs = [
  { id: 'explore', label: 'Explore', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { id: 'feed', label: 'Feed', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { id: 'notifs', label: 'Notifs', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )},
  { id: 'profile', label: 'Profile', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function BottomNav({ tab, setTab, unreadCount }) {
  return (
    <nav className={styles.nav}>
      {tabs.map(t => (
        <button
          key={t.id}
          className={`${styles.btn} ${tab === t.id ? styles.active : ''}`}
          onClick={() => setTab(t.id)}
        >
          <div className={styles.inner}>
            <span className={styles.icon}>{t.icon}</span>
            <span className={styles.label}>{t.label}</span>
          </div>
          {t.id === 'notifs' && unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </button>
      ))}
    </nav>
  )
}
