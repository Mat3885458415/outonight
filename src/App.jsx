import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import ExplorePage from './pages/ExplorePage'
import FeedPage from './pages/FeedPage'
import NotifsPage from './pages/NotifsPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import EventDetail from './pages/EventDetail'
import RestaurantDetail from './pages/RestaurantDetail'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('explore')
  const [eventId, setEventId] = useState(null)
  const [restaurantId, setRestaurantId] = useState(null)
  const [unreadCount, setUnreadCount] = useState(3)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 4, color: 'var(--black)' }}>OUTONIGHT</div>
    </div>
  )

  if (!session) return <LoginPage onLogin={setSession} />

  const openEvent = (id) => { setEventId(id); setRestaurantId(null) }
  const openRestaurant = (id) => { setRestaurantId(id); setEventId(null) }
  const goBack = () => { setEventId(null); setRestaurantId(null) }

  if (eventId) return (
    <div className="app-shell">
      <EventDetail eventId={eventId} onBack={goBack} />
    </div>
  )

  if (restaurantId) return (
    <div className="app-shell">
      <RestaurantDetail restaurantId={restaurantId} onBack={goBack} />
    </div>
  )

  return (
    <div className="app-shell">
      <div className="page-content">
        {tab === 'explore' && <ExplorePage onOpenEvent={openEvent} onOpenRestaurant={openRestaurant} />}
        {tab === 'feed'    && <FeedPage onOpenEvent={openEvent} />}
        {tab === 'notifs'  && <NotifsPage />}
        {tab === 'profile' && <ProfilePage session={session} />}
      </div>
      <BottomNav tab={tab} setTab={(t) => { setTab(t); if(t==='notifs') setUnreadCount(0) }} unreadCount={unreadCount} />
    </div>
  )
}
