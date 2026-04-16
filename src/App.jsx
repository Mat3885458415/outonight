import { AnimatePresence, motion } from "framer-motion";
import { Bell, Compass, Home, MapPin, Navigation, Search, Settings, Share2, Sparkles, Star, User, X, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

// ─── Gradient map by category ─────────────────────────────────────────────────

const CATEGORY_GRADIENT = {
  party:   "from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20",
  sport:   "from-sky-500/30 via-cyan-500/20 to-blue-500/20",
  hobby:   "from-rose-500/30 via-red-500/20 to-orange-500/20",
  culture: "from-amber-500/30 via-orange-500/20 to-yellow-500/20",
};

function normalizeEvent(ev, barsMap, rsvpCountMap = {}) {
  const bar = barsMap[ev.bar_id] || null;
  return {
    ...ev,
    title:       ev.name,
    barName:     bar ? bar.name : (ev.venue || ""),
    barDistance: bar ? bar.distance : "",
    gradient:    CATEGORY_GRADIENT[ev.category] || CATEGORY_GRADIENT.party,
    attendeeIds: [],
    goingCount:  rsvpCountMap[ev.id] ?? ev.going_count ?? 0,
  };
}

// ─── Notifications (static for now) ──────────────────────────────────────────

const NOTIFICATIONS_DATA = [
  { id: 1, type: "Friends", icon: Sparkles, text: "3 friends are going to an event tonight", time: "Now", read: false },
  { id: 2, type: "Event",   icon: Star,     text: "Check out tonight's events in Zlín", time: "1 h ago", read: false },
  { id: 3, type: "Offer",   icon: Bell,     text: "Happy Hour — special deals tonight", time: "3 h ago", read: true },
];

const TABS = [
  { id: "home",    label: "Home",    icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "map",     label: "Map",     icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function OutonightApp() {
  const [bars, setBars]               = useState([]);
  const [events, setEvents]           = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin]         = useState(false);

  const [route, setRoute]             = useState({ tab: "home", eventId: null });
  const [joined, setJoined]           = useState([]);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [editOpen, setEditOpen]       = useState(false);
  const [toast, setToast]             = useState(null);
  const [profile, setProfile]         = useState({ name: "Matéo Dumont", bio: "TBU Zlín · Erasmus student", mood: "Looking for plans tonight" });
  const [draft, setDraft]             = useState(profile);
  const toastRef = useRef(null);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) checkAdmin(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId) => {
    const { data } = await supabase.from("admins").select("id").eq("user_id", userId).single();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  // ── Fetch bars + events from Supabase ────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      const [{ data: barsData }, { data: eventsData }, { data: rsvpData }] = await Promise.all([
        supabase.from("bars").select("*").order("name"),
        supabase.from("events").select("*").order("date", { ascending: true }),
        supabase.from("rsvp").select("event_id, user_id"),
      ]);

      const rsvpCountMap = {};
      if (rsvpData) {
        rsvpData.forEach(r => { rsvpCountMap[r.event_id] = (rsvpCountMap[r.event_id] || 0) + 1; });
        const cu = (await supabase.auth.getUser()).data.user;
        if (cu) setJoined(rsvpData.filter(r => r.user_id === cu.id).map(r => r.event_id));
      }

      const barsMap = {};
      if (barsData) {
        barsData.forEach(b => { barsMap[b.id] = b; });
        setBars(barsData);
      }

      if (eventsData) {
        const normalized = eventsData.map(ev => normalizeEvent(ev, barsMap, rsvpCountMap));
        setEvents(normalized);
        // Set initial eventId to first event
        if (normalized.length > 0 && route.eventId === null) {
          setRoute(r => ({ ...r, eventId: normalized[0].id }));
        }
      }

      setDataLoading(false);
    }
    fetchData();
  }, []);

  // ── Build barsWithEvents for ExploreScreen ────────────────────────────────
  const barsWithEvents = useMemo(() => {
    return bars.map(bar => ({
      ...bar,
      events: events.filter(ev => ev.bar_id === bar.id),
    }));
  }, [bars, events]);

  // Events not assigned to any bar
  const unboundEvents = useMemo(
    () => events.filter(ev => !ev.bar_id),
    [events]
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === route.eventId) ?? events[0] ?? null,
    [route.eventId, events]
  );

  const showToast = (msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  };

  const navigate  = (tab, eventId = route.eventId) => setRoute({ tab, eventId });
  const openEvent = (id) => setRoute({ tab: "event", eventId: id });

  const toggleJoin = async (id) => {
    if (!user) return;
    const has = joined.includes(id);
    const ev  = events.find((e) => e.id === id);
    setJoined(cur => has ? cur.filter(x => x !== id) : [...cur, id]);
    setEvents(cur => cur.map(e => e.id === id ? { ...e, goingCount: Math.max(0, e.goingCount + (has ? -1 : 1)) } : e));
    showToast(has ? `Tu as quitté ${ev?.title}` : `Tu rejoins ${ev?.title} ! 🎉`);
    if (has) {
      await supabase.from("rsvp").delete().eq("event_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("rsvp").insert({ event_id: id, user_id: user.id });
    }
  };

  const markRead    = (id) => setNotifications((cur) => cur.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()   => setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
  const saveProfile = ()   => { setProfile(draft); setEditOpen(false); showToast("Profil sauvegardé ✓"); };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07080C] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={(session) => setUser(session.user)} />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#07080C] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <p className="text-white/60 text-sm">Loading tonight's events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080C] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[radial-gradient(circle_at_top,_rgba(111,76,255,0.18),_transparent_28%),linear-gradient(180deg,#0B0C11_0%,#08090D_100%)]">

        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-white/6 bg-[#0B0C11]/80 px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur-xl">
          <TopBar route={route} onBack={() => navigate("explore")} onBellClick={() => navigate("profile")} unreadCount={unreadCount} />
        </div>

        {/* Content */}
        <main className="px-4 pb-28 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${route.tab}-${route.eventId}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {route.tab === "home" && (
                <HomeScreen
                  events={events}
                  bars={bars}
                  unboundEvents={unboundEvents}
                  joined={joined}
                  openEvent={openEvent}
                  toggleJoin={toggleJoin}
                  navigate={navigate}
                />
              )}
              {route.tab === "explore" && (
                <ExploreScreen
                  barsWithEvents={barsWithEvents}
                  unboundEvents={unboundEvents}
                  joined={joined}
                  onToggleJoin={toggleJoin}
                  onOpenEvent={openEvent}
                />
              )}
              {route.tab === "event" && selectedEvent && (
                <EventScreen
                  event={selectedEvent}
                  isJoined={joined.includes(selectedEvent.id)}
                  onJoin={() => toggleJoin(selectedEvent.id)}
                  user={user}
                />
              )}
              {route.tab === "map" && <MapScreen events={events} openEvent={openEvent} />}
              {route.tab === "admin" && (
                <AdminPage onBack={() => navigate("profile")} />
              )}
              {route.tab === "profile" && (
                <ProfileScreen
                  profile={profile}
                  draft={draft}
                  setDraft={setDraft}
                  editOpen={editOpen}
                  setEditOpen={setEditOpen}
                  saveProfile={saveProfile}
                  notifications={notifications}
                  markRead={markRead}
                  markAllRead={markAllRead}
                  joinedCount={joined.length}
                  joinedEvents={events.filter((e) => joined.includes(e.id))}
                  onAdmin={() => navigate("admin")}
                  user={user}
                  isAdmin={isAdmin}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-white/8 bg-[#0B0C11]/90 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-2xl">
          <nav className="grid grid-cols-4 gap-2">
            {TABS.map((tab) => {
              const Icon  = tab.icon;
              const active = route.tab === tab.id || (tab.id === "home" && route.tab === "event");
              const badge  = tab.id === "profile" && unreadCount > 0;
              return (
                <button key={tab.id} onClick={() => navigate(tab.id)} className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${active ? "bg-white text-[#0B0C11]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                  <Icon size={18} />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                  {badge && <span className="absolute right-2.5 top-1.5 h-2 w-2 rounded-full bg-violet-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-[#1A1B26]/95 px-5 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-xl"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ route, onBack, onBellClick, unreadCount }) {
  const titles = { home: "Tonight in Zlín", explore: "Bars & Events", event: "Event details", map: "Map", profile: "Profile" };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {route.tab === "event" ? (
          <button onClick={onBack} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">← Back</button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base">🌙</div>
        )}
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300/75">Outonight</p>
          <h1 className="text-base font-semibold">{titles[route.tab]}</h1>
        </div>
      </div>
      <button onClick={onBellClick} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function HomeScreen({ events, bars, unboundEvents, joined, openEvent, toggleJoin, navigate }) {
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/8 bg-white/5 py-16 text-center">
          <p className="text-4xl">🌙</p>
          <p className="mt-4 text-sm text-white/50">No events tonight yet.</p>
          <p className="mt-1 text-xs text-white/30">Check back soon!</p>
        </div>
      </div>
    );
  }

  const hero = events[0];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.section layout className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(126,87,255,0.38),_rgba(13,14,21,0.96)_55%)] shadow-[0_20px_80px_rgba(63,32,160,0.28)]">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-violet-200/75">Best pick tonight</p>
              <h2 className="mt-2 text-[28px] font-semibold leading-tight">{hero.title}</h2>
              <p className="mt-2 text-sm text-white/65">{hero.barName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-white/70">{hero.date} · {hero.time}</span>
                <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-300">{hero.price}</span>
              </div>
              <p className="mt-3 text-sm text-violet-200/80">
                {hero.goingCount + (joined.includes(hero.id) ? 1 : 0)} students going
              </p>
            </div>
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br ${hero.gradient} text-4xl`}>{hero.emoji}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => toggleJoin(hero.id)} className={`rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] ${joined.includes(hero.id) ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}>
              {joined.includes(hero.id) ? "✓ Going" : "Join now"}
            </button>
            <button onClick={() => openEvent(hero.id)} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/85 transition active:scale-[0.98]">
              View event
            </button>
          </div>
        </div>
      </motion.section>

      {/* Tonight's events */}
      {events.length > 1 && (
        <section>
          <SectionHeader title="Tonight" action="Voir tout" onAction={() => navigate("explore")} />
          <div className="mt-3 space-y-2">
            {events.slice(1, 5).map((event, i) => (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openEvent(event.id)}
                className="flex w-full items-center gap-3 rounded-[22px] border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/[0.07] active:scale-[0.99]"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${event.gradient} text-2xl`}>{event.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{event.title}</p>
                  <p className="mt-0.5 truncate text-xs text-white/50">{event.date} · {event.time} · {event.barName}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-violet-300">{event.goingCount} going</span>
                    {event.price === "Free" && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">Free</span>}
                  </div>
                </div>
                {event.barDistance && <span className="shrink-0 text-xs text-white/30">{event.barDistance}</span>}
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Bars */}
      {bars.length > 0 && (
        <section>
          <SectionHeader title="Les bars" action="Voir tout" onAction={() => navigate("explore")} />
          <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-2" style={{ scrollbarWidth: "none" }}>
            {bars.map((bar, i) => (
              <motion.div
                key={bar.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="w-40 shrink-0 overflow-hidden rounded-[22px] border border-white/8 bg-white/5"
              >
                <div className={`flex h-20 items-center justify-center bg-gradient-to-br ${bar.gradient || "from-violet-500/20 to-indigo-500/20"} text-4xl`}>{bar.emoji}</div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{bar.name}</p>
                  <p className="mt-0.5 text-xs text-white/45">{bar.tag}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-white/35">{bar.distance}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${bar.open ? "bg-emerald-500/15 text-emerald-400" : "bg-white/8 text-white/35"}`}>
                      {bar.open ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── ExploreScreen ────────────────────────────────────────────────────────────

function ExploreScreen({ barsWithEvents, unboundEvents, joined, onToggleJoin, onOpenEvent }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filteredBars = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return barsWithEvents;
    return barsWithEvents.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.tag || "").toLowerCase().includes(q) ||
        b.events.some((e) => e.title.toLowerCase().includes(q))
    );
  }, [barsWithEvents, search]);

  const filteredUnbound = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return unboundEvents;
    return unboundEvents.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.venue || "").toLowerCase().includes(q)
    );
  }, [unboundEvents, search]);

  const hasResults = filteredBars.length > 0 || filteredUnbound.length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-violet-400/30 transition">
        <Search size={16} className="shrink-0 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chercher un bar ou un event..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-white/40 hover:text-white/70 transition"><X size={14} /></button>
        )}
      </div>

      {!hasResults ? (
        <EmptyState message="Aucun résultat" />
      ) : (
        <>
          {/* Bar cards */}
          <div className="space-y-4">
            {filteredBars.map((bar, i) => (
              <BarCard
                key={bar.id}
                bar={bar}
                joined={joined}
                onToggleJoin={onToggleJoin}
                onOpenEvent={onOpenEvent}
                isExpanded={expanded === bar.id}
                onToggleExpand={() => setExpanded(expanded === bar.id ? null : bar.id)}
                index={i}
              />
            ))}
          </div>

          {/* Unbound events (no bar) */}
          {filteredUnbound.length > 0 && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-white/35">Other events</p>
              <div className="space-y-3">
                {filteredUnbound.map((event) => {
                  const isJoined = joined.includes(event.id);
                  return (
                    <div key={event.id} className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${event.gradient} text-2xl`}>
                          {event.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button onClick={() => onOpenEvent(event.id)} className="text-left text-sm font-semibold hover:text-violet-200 transition">
                            {event.title}
                          </button>
                          <p className="mt-0.5 text-xs text-white/50">{event.date} · {event.time}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-xs text-violet-300">{event.goingCount} going</span>
                            <span className={`text-xs font-medium ${event.price === "Free" ? "text-emerald-400" : "text-white/60"}`}>{event.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => onToggleJoin(event.id)}
                          className={`rounded-xl py-2 text-sm font-semibold transition active:scale-[0.97] ${isJoined ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}
                        >
                          {isJoined ? "✓ Going" : "Join"}
                        </button>
                        <button
                          onClick={() => onOpenEvent(event.id)}
                          className="rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-white/75 transition active:scale-[0.97]"
                        >
                          Détails
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BarCard({ bar, joined, onToggleJoin, onOpenEvent, isExpanded, onToggleExpand, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-[28px] border border-white/8 bg-white/5"
    >
      {/* Bar header */}
      <div className={`relative flex h-32 items-end bg-gradient-to-br ${bar.gradient || "from-violet-500/20 to-indigo-500/20"} p-4`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative flex w-full items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl leading-none">{bar.emoji}</span>
              <div>
                <h3 className="text-xl font-bold leading-none">{bar.name}</h3>
                <p className="mt-1 text-xs text-white/70">{bar.tag}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">{bar.distance}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${bar.open ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"}`}>
              {bar.open ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Bar description + toggle */}
      <div className="p-4">
        <p className="text-sm text-white/60 leading-5">{bar.description}</p>

        {bar.events.length > 0 ? (
          <button
            onClick={onToggleExpand}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.07]"
          >
            <span className="font-medium">
              {bar.events.length} event{bar.events.length > 1 ? "s" : ""} à venir
            </span>
            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={16} className="text-white/40" />
            </motion.span>
          </button>
        ) : (
          <div className="mt-3 rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-center text-xs text-white/30">
            No upcoming events
          </div>
        )}

        {/* Events list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                {bar.events.map((event) => {
                  const isJoined = joined.includes(event.id);
                  return (
                    <div key={event.id} className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${event.gradient} text-2xl`}>
                          {event.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button onClick={() => onOpenEvent(event.id)} className="text-left text-sm font-semibold hover:text-violet-200 transition">
                            {event.title}
                          </button>
                          <p className="mt-0.5 text-xs text-white/50">{event.date} · {event.time}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-xs text-violet-300">{event.goingCount} going</span>
                            <span className={`text-xs font-medium ${event.price === "Free" ? "text-emerald-400" : "text-white/60"}`}>{event.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => onToggleJoin(event.id)}
                          className={`rounded-xl py-2 text-sm font-semibold transition active:scale-[0.97] ${isJoined ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}
                        >
                          {isJoined ? "✓ Going" : "Join"}
                        </button>
                        <button
                          onClick={() => onOpenEvent(event.id)}
                          className="rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-white/75 transition active:scale-[0.97]"
                        >
                          Détails
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── EventScreen ──────────────────────────────────────────────────────────────

function EventScreen({ event, isJoined, onJoin, user }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    supabase
      .from("rsvp")
      .select("user_id, profiles(full_name)")
      .eq("event_id", event.id)
      .then(({ data }) => { if (data) setAttendees(data); });
  }, [event.id, isJoined]);

  const totalGoing = attendees.length || event.goingCount;

  return (
    <div className="space-y-4">
      <motion.section layout className="overflow-hidden rounded-[30px] border border-white/10 bg-[#11131B]">
        <div className={`relative flex h-60 items-end bg-gradient-to-br ${event.gradient} p-5`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="relative w-full">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-3xl">{event.emoji}</span>
              {event.badge && <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/85 backdrop-blur">{event.badge}</span>}
            </div>
            <h2 className="text-2xl font-semibold leading-tight">{event.title}</h2>
            <p className="mt-1.5 text-sm text-white/80">{event.date} · {event.time}</p>
            <p className="text-sm text-white/60">{event.barName}</p>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard value={event.price} label="Entry" icon="💳" />
        <StatCard value={event.barDistance || "—"} label="Access" icon="📍" />
        <StatCard value={String(totalGoing)} label="Going" icon="👥" />
      </div>

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="À propos" />
        <p className="mt-3 text-sm leading-6 text-white/70">{event.description || "No description."}</p>
        <div className="mt-4">
          <button onClick={onJoin} className={`w-full rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] ${isJoined ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}>
            {isJoined ? "✓ Tu y vas" : "Rejoindre l'event"}
          </button>
        </div>
        <button className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-white/65 transition active:scale-[0.98]">
          <Share2 size={14} />
          Partager avec des amis
        </button>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="Qui y va" />
        {attendees.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">Be the first to join!</p>
        ) : (
          <div className="mt-3 space-y-2">
            {attendees.map((a, i) => {
              const name = a.profiles?.full_name || "Student";
              const isMe = user && a.user_id === user.id;
              const colors = ["bg-violet-400/20 text-violet-300","bg-sky-400/20 text-sky-300","bg-emerald-400/20 text-emerald-300","bg-amber-400/20 text-amber-300","bg-pink-400/20 text-pink-300"];
              return (
                <div key={a.user_id} className="flex items-center gap-3 rounded-[18px] border border-white/6 bg-white/[0.04] px-3 py-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colors[i % colors.length]}`}>
                    {name[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80">{name}{isMe ? " (toi)" : ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}


// ─── MapScreen ────────────────────────────────────────────────────────────────

function MapScreen({ events, openEvent }) {
  const [selected, setSelected] = useState(null);
  const positions = [
    "left-[14%] top-[28%]", "left-[58%] top-[38%]", "left-[36%] top-[64%]",
    "left-[74%] top-[20%]", "left-[48%] top-[56%]", "left-[22%] top-[52%]",
  ];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[#10131B]">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_45%,rgba(122,92,255,0.12),transparent_55%)]" />
        <div className="relative h-[400px] p-4">
          {events.map((event, i) => (
            <button
              key={event.id}
              onClick={() => setSelected(event.id === selected ? null : event.id)}
              className={`absolute ${positions[i % positions.length]} flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5`}
            >
              <motion.div whileTap={{ scale: 0.88 }} className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-lg transition ${selected === event.id ? "bg-violet-500 shadow-violet-900/60 ring-2 ring-violet-400/50" : "bg-white shadow-black/30"}`}>
                {event.emoji}
              </motion.div>
              <AnimatePresence>
                {selected === event.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 4 }}
                    className="rounded-xl border border-white/10 bg-[#0B0C11]/90 px-3 py-1.5 text-center text-xs backdrop-blur shadow-xl"
                  >
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-white/50">{event.barName}{event.barDistance ? ` · ${event.barDistance}` : ""}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
          <div className="absolute bottom-4 right-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-400">
              <Navigation size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {events.map((event) => (
          <button key={event.id} onClick={() => openEvent(event.id)} className={`flex w-full items-center justify-between rounded-[22px] border p-4 text-left transition ${selected === event.id ? "border-violet-400/30 bg-violet-400/10" : "border-white/8 bg-white/5 hover:bg-white/[0.07]"}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${event.gradient} text-xl`}>{event.emoji}</div>
              <div>
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="mt-0.5 text-xs text-white/45">{event.barName}{event.barDistance ? ` · ${event.barDistance}` : ""}</p>
              </div>
            </div>
            <span className={`text-xs font-medium ${event.price === "Free" ? "text-emerald-400" : "text-violet-300"}`}>{event.price}</span>
          </button>
        ))}
        {events.length === 0 && <EmptyState message="No events on map yet" />}
      </div>
    </div>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

function ProfileScreen({ profile, draft, setDraft, editOpen, setEditOpen, saveProfile, notifications, markRead, markAllRead, joinedCount, joinedEvents, onAdmin, user, isAdmin, onLogout }) {

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-white/5">
        <div className="h-24 bg-[radial-gradient(circle_at_top,_rgba(126,87,255,0.7),_rgba(20,21,30,0.35)_65%)]" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#0B0C11] bg-gradient-to-br from-violet-400 to-purple-600 text-3xl font-semibold text-white">M</div>
              <div>
                <h2 className="text-lg font-semibold">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || profile.name}</h2>
                <p className="mt-0.5 text-sm text-white/50">{user?.email || profile.bio}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && <button onClick={onAdmin} className="rounded-2xl border border-violet-400/25 bg-violet-400/10 px-3 py-2 text-xs text-violet-300">+ Event</button>}
              <button onClick={() => setEditOpen((v) => !v)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">{editOpen ? "Close" : "Edit"}</button>
              <button onClick={onLogout} className="rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-400">Out</button>
            </div>
          </div>
          <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.04] p-3 text-sm text-white/60">{profile.mood}</div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard value={String(joinedCount)} label="Joined" icon="🎟️" />
        <StatCard value="—" label="Friends" icon="👥" />
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {editOpen && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-[28px] border border-violet-400/20 bg-white/5"
          >
            <div className="p-4">
              <SectionHeader title="Edit profile" icon={Settings} />
              <div className="mt-4 space-y-3">
                <Input label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <Input label="Bio" value={draft.bio} onChange={(v) => setDraft({ ...draft, bio: v })} />
                <Input label="Status" value={draft.mood} onChange={(v) => setDraft({ ...draft, mood: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={saveProfile} className="rounded-2xl bg-white py-3 text-sm font-semibold text-[#0B0C11]">Save</button>
                  <button onClick={() => setEditOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/80">Cancel</button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Joined events */}
      {joinedEvents.length > 0 && (
        <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
          <SectionHeader title="Tes events" />
          <div className="mt-3 space-y-2">
            {joinedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-[18px] border border-white/6 bg-white/[0.04] p-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${event.gradient} text-xl`}>{event.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="mt-0.5 text-xs text-white/40">{event.barName} · {event.date}</p>
                </div>
                <span className={`text-xs font-medium ${event.price === "Free" ? "text-emerald-400" : "text-violet-300"}`}>{event.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionHeader({ title, action, onAction, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} className="text-violet-300" />}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {action && <button onClick={onAction} className="text-sm text-violet-300 hover:text-violet-200 transition">{action}</button>}
    </div>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/5 p-3 text-center">
      {icon && <div className="mb-1 text-base leading-none">{icon}</div>}
      <p className="text-sm font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/45">{label}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] py-12 text-center">
      <p className="text-2xl">🔍</p>
      <p className="mt-3 text-sm text-white/45">{message}</p>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-white/38">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/40 focus:bg-violet-400/5"
      />
    </label>
  );
}
