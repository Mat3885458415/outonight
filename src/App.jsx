import { useMemo, useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [joinedEvents, setJoinedEvents] = useState([1]);
  const [savedEvents, setSavedEvents] = useState([2]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "Friends", text: "3 friends are going to Techno Night #12", time: "Now", icon: "✨", cta: "View", read: false },
    { id: 2, type: "Event", text: "Open Basketball 3v3 starts tomorrow at 14:00", time: "1 h ago", icon: "🏀", cta: "Join", read: false },
    { id: 3, type: "Offer", text: "20% student discount at Pizzeria Modrá Hvězda", time: "3 h ago", icon: "🍕", cta: "Use", read: true },
  ]);
  const [profile, setProfile] = useState({
    name: "Matéo Dumont",
    bio: "TBU Zlín · Erasmus · Looking for plans tonight",
    mood: "Ready to go out",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [filters, setFilters] = useState(["Tonight"]);

  const events = [
    { id: 1, title: "Techno Night #12", place: "Club Rubín", time: "Tonight · 22:00", date: "Friday", going: 126, price: "150 CZK", tag: "Trending", emoji: "🎵", color: "from-violet-500/30 to-fuchsia-500/20", description: "The biggest student techno event this week.", walk: "8 min walk from TBU", category: "Party" },
    { id: 2, title: "Thursday Happy Hour", place: "Bar Panorama", time: "Tonight · 20:00", date: "Thursday", going: 57, price: "80 CZK", tag: "Student deal", emoji: "🍻", color: "from-sky-500/30 to-cyan-500/20", description: "Relaxed pre-party atmosphere with low prices.", walk: "12 min walk from TBU", category: "Food" },
    { id: 3, title: "Erasmus International Night", place: "Erasmus Zlín", time: "Sat · 21:00", date: "Saturday", going: 201, price: "Free", tag: "Popular", emoji: "🎤", color: "from-pink-500/25 to-rose-500/20", description: "A high energy social night for Erasmus students.", walk: "15 min by bus", category: "Erasmus" },
    { id: 4, title: "Open Basketball 3v3", place: "TBU Sports Hall", time: "Tomorrow · 14:00", date: "Tomorrow", going: 24, price: "Free", tag: "Active", emoji: "🏀", color: "from-orange-500/25 to-amber-500/20", description: "Casual student basketball with open registration.", walk: "6 min walk from campus", category: "Sport" },
  ];

  const places = [
    { title: "Pizzeria Modrá Hvězda", meta: "4.2 · 120m away · Student deal", emoji: "🍕" },
    { title: "Asian Garden", meta: "4.8 · 400m away · Budget friendly", emoji: "🍜" },
    { title: "Steakhouse Zlín", meta: "4.4 · 600m away · Group bookings", emoji: "🥩" },
  ];

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId) || events[0], [selectedEventId]);
  const availableFilters = ["Tonight", "This week", "Party", "Erasmus", "Food", "Sport"];
  const filteredEvents = useMemo(() => {
    if (filters.length === 0) return events;
    return events.filter(e => filters.some(f => {
      if (f === "Tonight") return e.time.toLowerCase().includes("tonight");
      if (f === "This week") return true;
      return e.category === f;
    }));
  }, [filters]);

  function toggleJoin(id) { setJoinedEvents(c => c.includes(id) ? c.filter(i => i !== id) : [...c, id]); }
  function toggleSave(id) { setSavedEvents(c => c.includes(id) ? c.filter(i => i !== id) : [...c, id]); }
  function toggleFilter(f) { setFilters(c => c.includes(f) ? c.filter(i => i !== f) : [...c, f]); }
  function openEvent(id) { setSelectedEventId(id); setActiveTab("Event"); }
  function markNotificationRead(id) { setNotifications(c => c.map(n => n.id === id ? {...n, read: true} : n)); }
  function markAllRead() { setNotifications(c => c.map(n => ({...n, read: true}))); }
  function saveProfile() { setProfile(draftProfile); setEditingProfile(false); }

  const tabs = ["Home", "Explore", "Event", "Profile"];

  return (
    <div style={{minHeight:'100dvh', background:'#05060A', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans', sans-serif"}}>
      <div style={{width:'100%', maxWidth:430}}>
        {/* Phone frame */}
        <div style={{borderRadius:38, border:'1px solid rgba(255,255,255,0.1)', background:'#0B0C11', padding:12, boxShadow:'0 30px 120px rgba(0,0,0,0.45)'}}>
          <div style={{overflow:'hidden', borderRadius:30, border:'1px solid rgba(255,255,255,0.08)', background:'#101118'}}>
            {/* Status bar */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px'}}>
              <div>
                <p style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(255,255,255,0.4)'}}>OUTONIGHT</p>
                <p style={{marginTop:4, fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.9)'}}>{activeTab}</p>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6, fontSize:10, color:'rgba(255,255,255,0.45)'}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:'#34d399', display:'inline-block'}}/>
                Live
              </div>
            </div>

            {/* Screen content */}
            <div style={{height:680, overflowY:'auto', background:'#0B0C11', padding:16}}>
              {activeTab === "Home" && <HomeScreen events={events} places={places} joinedEvents={joinedEvents} openEvent={openEvent} toggleJoin={toggleJoin} />}
              {activeTab === "Explore" && <ExploreScreen events={filteredEvents} filters={filters} availableFilters={availableFilters} toggleFilter={toggleFilter} savedEvents={savedEvents} joinedEvents={joinedEvents} toggleSave={toggleSave} toggleJoin={toggleJoin} openEvent={openEvent} />}
              {activeTab === "Event" && <EventScreen event={selectedEvent} isJoined={joinedEvents.includes(selectedEvent.id)} isSaved={savedEvents.includes(selectedEvent.id)} toggleJoin={toggleJoin} toggleSave={toggleSave} />}
              {activeTab === "Profile" && <ProfileScreen profile={profile} draftProfile={draftProfile} setDraftProfile={setDraftProfile} editingProfile={editingProfile} setEditingProfile={setEditingProfile} saveProfile={saveProfile} notifications={notifications} markNotificationRead={markNotificationRead} markAllRead={markAllRead} joinedCount={joinedEvents.length} />}
            </div>

            {/* Bottom nav */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.3)', padding:'8px 8px'}}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:'4px 0'}}>
                  <div style={{width:36, height:36, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background: activeTab===tab ? '#fff' : 'rgba(255,255,255,0.05)', color: activeTab===tab ? '#000' : 'rgba(255,255,255,0.6)', fontSize:16}}>
                    {tab==="Home" ? "⌂" : tab==="Explore" ? "⌕" : tab==="Event" ? "◔" : "◡"}
                  </div>
                  <span style={{fontSize:10, color: activeTab===tab ? '#fff' : 'rgba(255,255,255,0.5)'}}>{tab}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ events, places, joinedEvents, openEvent, toggleJoin }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      <div style={{borderRadius:30, border:'1px solid rgba(255,255,255,0.1)', background:'radial-gradient(circle at top left, rgba(140,92,255,0.38), rgba(13,14,21,0.96) 55%)', padding:20}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(167,139,250,0.8)'}}>Tonight in Zlín</p>
            <h2 style={{marginTop:8, fontSize:26, fontWeight:600, color:'#fff', lineHeight:1.2}}>What are you doing tonight?</h2>
            <p style={{marginTop:12, fontSize:13, color:'rgba(255,255,255,0.7)'}}>12 events · 340 students active</p>
          </div>
          <div style={{width:48, height:48, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>🌙</div>
        </div>
        <div style={{marginTop:20, borderRadius:26, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.2)', padding:16}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
            <div>
              <div style={{display:'inline-flex', borderRadius:99, background:'rgba(251,113,133,0.15)', padding:'4px 10px', fontSize:11, fontWeight:500, color:'#fecdd3'}}>Best pick tonight</div>
              <h3 style={{marginTop:12, fontSize:22, fontWeight:600, color:'#fff'}}>{events[0].title}</h3>
              <p style={{marginTop:4, fontSize:13, color:'rgba(255,255,255,0.75)'}}>{events[0].place} · 22:00 · {events[0].price}</p>
              <p style={{marginTop:12, fontSize:13, color:'rgba(255,255,255,0.9)'}}>Anna, Pedro and 124 others going</p>
            </div>
            <div style={{width:80, height:80, borderRadius:24, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0}}>{events[0].emoji}</div>
          </div>
          <div style={{marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <button onClick={() => toggleJoin(events[0].id)} style={{borderRadius:16, background:'#fff', padding:'12px 0', fontSize:14, fontWeight:600, color:'#0A0A0F', border:'none', cursor:'pointer'}}>
              {joinedEvents.includes(events[0].id) ? "✓ Joined" : "Join now"}
            </button>
            <button onClick={() => openEvent(events[0].id)} style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', padding:'12px 0', fontSize:14, color:'rgba(255,255,255,0.85)', cursor:'pointer'}}>
              View event
            </button>
          </div>
        </div>
      </div>

      <p style={{fontSize:15, fontWeight:600, color:'#fff'}}>🔥 Trending now</p>
      {events.slice(0,3).map(ev => (
        <button key={ev.id} onClick={() => openEvent(ev.id)} style={{display:'flex', alignItems:'center', gap:12, borderRadius:24, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:12, textAlign:'left', width:'100%', cursor:'pointer', marginBottom:8}}>
          <div style={{width:64, height:64, borderRadius:20, background:'rgba(124,58,237,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0}}>{ev.emoji}</div>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontSize:13, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{ev.title}</p>
            <p style={{marginTop:4, fontSize:12, color:'rgba(255,255,255,0.55)'}}>{ev.time} · {ev.place}</p>
            <p style={{marginTop:4, fontSize:12, color:'#a78bfa'}}>{ev.going} going</p>
          </div>
          <div style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', padding:'8px 12px', fontSize:12, color:'rgba(255,255,255,0.8)', flexShrink:0}}>Open</div>
        </button>
      ))}

      <p style={{fontSize:15, fontWeight:600, color:'#fff'}}>🍽 Food & deals nearby</p>
      {places.map(p => (
        <div key={p.title} style={{display:'flex', alignItems:'center', gap:12, borderRadius:24, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:12, marginBottom:8}}>
          <div style={{width:56, height:56, borderRadius:18, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24}}>{p.emoji}</div>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontSize:13, fontWeight:500, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.title}</p>
            <p style={{fontSize:12, color:'rgba(255,255,255,0.55)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExploreScreen({ events, filters, availableFilters, toggleFilter, savedEvents, joinedEvents, toggleSave, toggleJoin, openEvent }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div>
        <p style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.28em', color:'rgba(167,139,250,0.8)'}}>Discover</p>
        <h2 style={{marginTop:8, fontSize:24, fontWeight:600, color:'#fff'}}>Find your next plan</h2>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:12, borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:'12px 16px', fontSize:13, color:'rgba(255,255,255,0.45)'}}>
        <span>⌕</span><span>Search events, clubs, restaurants...</span>
      </div>
      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>
        {availableFilters.map(f => (
          <button key={f} onClick={() => toggleFilter(f)} style={{whiteSpace:'nowrap', borderRadius:99, padding:'8px 16px', fontSize:13, border: filters.includes(f) ? 'none' : '1px solid rgba(255,255,255,0.1)', background: filters.includes(f) ? '#fff' : 'rgba(255,255,255,0.05)', color: filters.includes(f) ? '#000' : 'rgba(255,255,255,0.8)', cursor:'pointer', flexShrink:0}}>
            {f}
          </button>
        ))}
      </div>
      {events.map(ev => (
        <div key={ev.id} style={{borderRadius:28, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:12, marginBottom:4}}>
          <button onClick={() => openEvent(ev.id)} style={{width:'100%', background:'none', border:'none', cursor:'pointer', padding:0}}>
            <div style={{height:140, borderRadius:22, background:'rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48}}>{ev.emoji}</div>
          </button>
          <div style={{marginTop:12, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
            <div>
              <button onClick={() => openEvent(ev.id)} style={{background:'none', border:'none', cursor:'pointer', padding:0, fontSize:15, fontWeight:600, color:'#fff', textAlign:'left'}}>{ev.title}</button>
              <p style={{marginTop:4, fontSize:13, color:'rgba(255,255,255,0.6)'}}>{ev.time} · {ev.place}</p>
            </div>
            <button onClick={() => toggleSave(ev.id)} style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', padding:'8px 12px', fontSize:12, color:'rgba(255,255,255,0.8)', background:'rgba(255,255,255,0.05)', cursor:'pointer', flexShrink:0}}>
              {savedEvents.includes(ev.id) ? "✓ Saved" : "Save"}
            </button>
          </div>
          <div style={{marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13}}>
            <span style={{color:'rgba(255,255,255,0.75)'}}>{ev.going} going</span>
            <span style={{fontWeight:600, color:'#a78bfa'}}>{ev.price}</span>
          </div>
          <div style={{marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <button onClick={() => toggleJoin(ev.id)} style={{borderRadius:16, background:'#fff', padding:'12px 0', fontSize:13, fontWeight:600, color:'#0A0A0F', border:'none', cursor:'pointer'}}>
              {joinedEvents.includes(ev.id) ? "✓ Joined" : "Join"}
            </button>
            <button onClick={() => openEvent(ev.id)} style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', padding:'12px 0', fontSize:13, color:'rgba(255,255,255,0.85)', cursor:'pointer'}}>
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventScreen({ event, isJoined, isSaved, toggleJoin, toggleSave }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={{position:'relative', height:240, overflow:'hidden', borderRadius:32, border:'1px solid rgba(255,255,255,0.1)', background:'linear-gradient(135deg, rgba(109,40,217,0.85), rgba(49,46,129,0.6), #161720)', padding:20}}>
        <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.2)', padding:'6px 12px', fontSize:12}}>{event.tag}</div>
            <div style={{borderRadius:99, background:'rgba(52,211,153,0.15)', padding:'6px 12px', fontSize:12, color:'#6ee7b7'}}>{event.going} going</div>
          </div>
          <div>
            <p style={{fontSize:13, color:'rgba(255,255,255,0.7)'}}>{event.date} · {event.time} · {event.place}</p>
            <h2 style={{marginTop:8, fontSize:28, fontWeight:600, color:'#fff', lineHeight:1.2}}>{event.title}</h2>
            <p style={{marginTop:12, fontSize:13, color:'rgba(255,255,255,0.78)', lineHeight:1.6, maxWidth:240}}>{event.description}</p>
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
        {[[event.price,'Entry'],[event.walk,'Access'],[event.category,'Type']].map(([v,l]) => (
          <div key={l} style={{borderRadius:22, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:12, textAlign:'center'}}>
            <p style={{fontSize:13, fontWeight:600, color:'#fff'}}>{v}</p>
            <p style={{marginTop:4, fontSize:11, color:'rgba(255,255,255,0.55)'}}>{l}</p>
          </div>
        ))}
      </div>

      <div style={{borderRadius:28, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:16}}>
        <p style={{fontSize:15, fontWeight:600, color:'#fff', marginBottom:16}}>Friends going</p>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{display:'flex'}}>
            {['A','P','L','M'].map((a,i) => (
              <div key={i} style={{width:44, height:44, borderRadius:'50%', border:'2px solid #0B0C11', background:'#c4b5fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, color:'#1d2358', marginLeft:i>0?-12:0}}>{a}</div>
            ))}
          </div>
          <p style={{fontSize:13, color:'rgba(255,255,255,0.7)'}}>Anna, Pedro, Lena and 123 others</p>
        </div>
      </div>

      <div style={{borderRadius:28, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:16}}>
        <p style={{fontSize:15, fontWeight:600, color:'#fff', marginBottom:16}}>Actions</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <button onClick={() => toggleJoin(event.id)} style={{borderRadius:16, background:'#fff', padding:'12px 0', fontSize:13, fontWeight:600, color:'#0A0A0F', border:'none', cursor:'pointer'}}>
            {isJoined ? "✓ Going" : "Join event"}
          </button>
          <button onClick={() => toggleSave(event.id)} style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', padding:'12px 0', fontSize:13, color:'rgba(255,255,255,0.85)', cursor:'pointer'}}>
            {isSaved ? "✓ Saved" : "Save"}
          </button>
        </div>
        <button style={{marginTop:12, width:'100%', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', padding:'12px 0', fontSize:13, color:'rgba(255,255,255,0.8)', cursor:'pointer'}}>
          Share with friends
        </button>
      </div>
    </div>
  );
}

function ProfileScreen({ profile, draftProfile, setDraftProfile, editingProfile, setEditingProfile, saveProfile, notifications, markNotificationRead, markAllRead, joinedCount }) {
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <div style={{display:'flex', flexDirection:'column', gap:16}}>
      <div style={{overflow:'hidden', borderRadius:30, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)'}}>
        <div style={{height:96, background:'radial-gradient(circle at top, rgba(140,92,255,0.75), rgba(23,24,32,0.4) 65%)'}}/>
        <div style={{padding:'0 20px 20px'}}>
          <div style={{marginTop:-40, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:80, height:80, borderRadius:'50%', border:'4px solid #0B0C11', background:'#c4b5fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:600, color:'#23306e', flexShrink:0}}>M</div>
              <div style={{paddingTop:36}}>
                <h2 style={{fontSize:18, fontWeight:600, color:'#fff'}}>{profile.name}</h2>
                <p style={{marginTop:4, fontSize:12, color:'rgba(255,255,255,0.6)'}}>{profile.bio}</p>
              </div>
            </div>
            <button onClick={() => setEditingProfile(v => !v)} style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', padding:'8px 16px', fontSize:12, color:'rgba(255,255,255,0.85)', cursor:'pointer', flexShrink:0, marginBottom:4}}>
              {editingProfile ? "Close" : "Edit"}
            </button>
          </div>
          <div style={{marginTop:16, borderRadius:22, background:'rgba(255,255,255,0.04)', padding:12, fontSize:13, color:'rgba(255,255,255,0.75)'}}>{profile.mood}</div>
        </div>
      </div>

      {editingProfile && (
        <div style={{borderRadius:28, border:'1px solid rgba(167,139,250,0.2)', background:'rgba(255,255,255,0.05)', padding:16}}>
          <p style={{fontSize:15, fontWeight:600, color:'#fff', marginBottom:16}}>Edit profile</p>
          {[['Name', 'name'],['Bio','bio'],['Mood','mood']].map(([label, key]) => (
            <div key={key} style={{marginBottom:12}}>
              <p style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(255,255,255,0.45)', marginBottom:8}}>{label}</p>
              <input value={draftProfile[key]} onChange={e => setDraftProfile({...draftProfile, [key]:e.target.value})}
                style={{width:'100%', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', padding:'12px 16px', fontSize:13, color:'#fff', outline:'none', fontFamily:"'DM Sans', sans-serif", boxSizing:'border-box'}}/>
            </div>
          ))}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:4}}>
            <button onClick={saveProfile} style={{borderRadius:16, background:'#fff', padding:'12px 0', fontSize:13, fontWeight:600, color:'#0A0A0F', border:'none', cursor:'pointer'}}>Save</button>
            <button onClick={() => { setDraftProfile(profile); setEditingProfile(false); }} style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', padding:'12px 0', fontSize:13, color:'rgba(255,255,255,0.85)', cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
        {[[String(joinedCount),'Joined'],[' 34','Friends'],[String(unreadCount),'Unread']].map(([n,l]) => (
          <div key={l} style={{borderRadius:22, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:12, textAlign:'center'}}>
            <p style={{fontSize:22, fontWeight:600, color:'#fff'}}>{n}</p>
            <p style={{marginTop:4, fontSize:11, color:'rgba(255,255,255,0.55)'}}>{l}</p>
          </div>
        ))}
      </div>

      <div style={{borderRadius:28, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', padding:16}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
          <p style={{fontSize:15, fontWeight:600, color:'#fff'}}>Notifications</p>
          <button onClick={markAllRead} style={{fontSize:12, color:'#a78bfa', background:'none', border:'none', cursor:'pointer'}}>Mark all read</button>
        </div>
        {notifications.map(n => (
          <div key={n.id} style={{borderRadius:24, padding:12, marginBottom:8, background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(167,139,250,0.1)', border: n.read ? 'none' : '1px solid rgba(167,139,250,0.15)'}}>
            <div style={{display:'flex', gap:12}}>
              <div style={{width:44, height:44, borderRadius:16, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>{n.icon}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                  <p style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.22em', color:'rgba(167,139,250,0.7)'}}>{n.type}</p>
                  <p style={{fontSize:11, color:'rgba(255,255,255,0.4)', flexShrink:0}}>{n.time}</p>
                </div>
                <p style={{marginTop:4, fontSize:13, color:'rgba(255,255,255,0.88)', lineHeight:1.5}}>{n.text}</p>
                <div style={{marginTop:10, display:'flex', gap:8}}>
                  <button style={{borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', fontSize:11, color:'rgba(255,255,255,0.85)', background:'none', cursor:'pointer'}}>{n.cta}</button>
                  {!n.read && <button onClick={() => markNotificationRead(n.id)} style={{borderRadius:16, border:'1px solid rgba(167,139,250,0.2)', padding:'6px 12px', fontSize:11, color:'#c4b5fd', background:'none', cursor:'pointer'}}>Mark read</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
