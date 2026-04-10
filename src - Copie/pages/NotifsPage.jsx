import { useState } from 'react'
import styles from './NotifsPage.module.css'

const TABS = ['All', 'Events', 'Restaurants', 'Contests']
const NOTIFS = [
  { id: 1, ico: '🎉', bg: '#e8eaf6', text: 'Jana K. and 3 others just joined', bold: 'Techno Night #12', time: '2 min ago', unread: true, tab: 'Events' },
  { id: 2, ico: '🎁', bg: '#e8f5e9', text: 'New giveaway — win', bold: '2 free entries to Club Rubín tonight', time: '15 min ago', unread: true, tab: 'Contests' },
  { id: 3, ico: '🍕', bg: '#fff3e0', text: 'Pizzeria Modrá Hvězda —', bold: '20% student discount this week', time: '1h ago', unread: true, tab: 'Restaurants' },
  { id: 4, ico: '⚽', bg: '#e8f5e9', text: 'New event in Sport —', bold: 'TBU Football Match Wednesday', time: '3h ago', unread: false, tab: 'Events' },
  { id: 5, ico: '🎵', bg: '#e8eaf6', text: 'Karim B. also joined', bold: 'Erasmus Night', time: '5h ago', unread: false, tab: 'Events' },
  { id: 6, ico: '🏀', bg: '#fff8e1', text: 'Reminder:', bold: 'Open Basketball 3v3 is tomorrow at 2pm', time: 'Yesterday', unread: false, tab: 'Events' },
]

export default function NotifsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [read, setRead] = useState({})

  const filtered = NOTIFS.filter(n => activeTab === 'All' || n.tab === activeTab)
  const markAll = () => setRead(NOTIFS.reduce((acc,n) => ({...acc,[n.id]:true}),{}))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.title}>Notifications</span>
        <button className={styles.markAll} onClick={markAll}>Mark all read</button>
      </div>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${activeTab===t ? styles.tabOn : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>
      <div>
        {filtered.map(n => (
          <div key={n.id} className={`${styles.item} ${(n.unread && !read[n.id]) ? styles.unread : ''}`} onClick={() => setRead(r => ({...r,[n.id]:true}))}>
            <div className={styles.ico} style={{background: n.bg}}>{n.ico}</div>
            <div className={styles.content}>
              <div className={styles.text}>{n.text} <strong>{n.bold}</strong></div>
              <div className={styles.time}>{n.time}</div>
            </div>
            {n.unread && !read[n.id] && <div className={styles.dot}/>}
          </div>
        ))}
      </div>
    </div>
  )
}
