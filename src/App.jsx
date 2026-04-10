import { AnimatePresence, motion } from "framer-motion";
import { Bell, Compass, Home, MapPin, Navigation, Search, Settings, Share2, Sparkles, Star, User, X, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Mock users pool ───────────────────────────────────────────────────────────

const USERS = [
  { id: 1,  init: "M", name: "Matéo D.",   uni: "TBU · France",   flag: "🇫🇷", color: "bg-violet-200 text-violet-900" },
  { id: 2,  init: "J", name: "Jana K.",    uni: "TBU · Czech",    flag: "🇨🇿", color: "bg-teal-200 text-teal-900" },
  { id: 3,  init: "A", name: "Andrea L.",  uni: "TBU · Spain",    flag: "🇪🇸", color: "bg-orange-200 text-orange-900" },
  { id: 4,  init: "K", name: "Karim B.",   uni: "TBU · Morocco",  flag: "🇲🇦", color: "bg-yellow-200 text-yellow-900" },
  { id: 5,  init: "S", name: "Sofia R.",   uni: "TBU · Italy",    flag: "🇮🇹", color: "bg-pink-200 text-pink-900" },
  { id: 6,  init: "L", name: "Lena W.",    uni: "TBU · Germany",  flag: "🇩🇪", color: "bg-green-200 text-green-900" },
  { id: 7,  init: "P", name: "Pedro M.",   uni: "TBU · Portugal", flag: "🇵🇹", color: "bg-blue-200 text-blue-900" },
  { id: 8,  init: "N", name: "Nikola H.",  uni: "TBU · Czech",    flag: "🇨🇿", color: "bg-red-200 text-red-900" },
  { id: 9,  init: "R", name: "Rania S.",   uni: "TBU · Tunisia",  flag: "🇹🇳", color: "bg-amber-200 text-amber-900" },
  { id: 10, init: "T", name: "Tom B.",     uni: "TBU · Belgium",  flag: "🇧🇪", color: "bg-indigo-200 text-indigo-900" },
  { id: 11, init: "E", name: "Elena P.",   uni: "TBU · Greece",   flag: "🇬🇷", color: "bg-cyan-200 text-cyan-900" },
  { id: 12, init: "O", name: "Omar F.",    uni: "TBU · Egypt",    flag: "🇪🇬", color: "bg-lime-200 text-lime-900" },
];

// ─── Bars & their events ───────────────────────────────────────────────────────

const BARS = [
  {
    id: "charlie",
    name: "Charlie",
    emoji: "🎸",
    tag: "Live music",
    description: "Le bar rock de Zlín. Concerts live, bières artisanales et bonne ambiance every night.",
    gradient: "from-rose-500/30 via-red-500/20 to-orange-500/20",
    color: "rose",
    distance: "5 min walk",
    open: true,
    events: [
      {
        id: 101,
        barId: "charlie",
        title: "Rock Night Open Stage",
        time: "Tonight · 21:00",
        date: "Friday",
        price: "Free",
        tag: "Live",
        emoji: "🎸",
        gradient: "from-rose-500/30 via-red-500/20 to-orange-500/20",
        description: "Open stage — n'importe qui peut monter jouer. Ambiance rock garantie.",
        attendeeIds: [1, 3, 5, 6, 10, 11],
      },
      {
        id: 102,
        barId: "charlie",
        title: "Happy Hour Jeudi",
        time: "Tonight · 18:00",
        date: "Thursday",
        price: "80 CZK",
        tag: "Deal",
        emoji: "🍺",
        gradient: "from-amber-500/30 via-orange-500/20 to-yellow-500/20",
        description: "2-for-1 sur toutes les bières pression jusqu'à 21h. Idéal après les cours.",
        attendeeIds: [2, 4, 7, 9],
      },
    ],
  },
  {
    id: "infinity",
    name: "Infinity",
    emoji: "∞",
    tag: "Club · Techno",
    description: "Le club électro de référence à Zlín. DJs locaux et internationaux every weekend.",
    gradient: "from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20",
    color: "violet",
    distance: "8 min walk",
    open: false,
    events: [
      {
        id: 201,
        barId: "infinity",
        title: "Techno Night #12",
        time: "Sat · 23:00",
        date: "Saturday",
        price: "150 CZK",
        tag: "Trending",
        emoji: "🎵",
        gradient: "from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20",
        description: "La plus grande soirée techno du mois. Set de 5h, bar ouvert jusqu'à 4h du matin.",
        attendeeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
      {
        id: 202,
        barId: "infinity",
        title: "Erasmus Night",
        time: "Fri · 22:00",
        date: "Friday",
        price: "Free",
        tag: "Erasmus",
        emoji: "🌍",
        gradient: "from-pink-500/30 via-rose-500/20 to-orange-500/20",
        description: "Soirée dédiée aux étudiants Erasmus. Entrée gratuite avec carte TBU.",
        attendeeIds: [1, 3, 4, 7, 9, 11],
      },
    ],
  },
  {
    id: "flip",
    name: "Flip",
    emoji: "🎱",
    tag: "Bar · Billard",
    description: "Bar décontracté avec billard, ping-pong et terrasse. L'endroit parfait pour débuter la soirée.",
    gradient: "from-sky-500/30 via-cyan-500/20 to-blue-500/20",
    color: "sky",
    distance: "12 min walk",
    open: true,
    events: [
      {
        id: 301,
        barId: "flip",
        title: "Billard Tournament",
        time: "Tomorrow · 19:00",
        date: "Saturday",
        price: "50 CZK",
        tag: "Sport",
        emoji: "🎱",
        gradient: "from-sky-500/30 via-cyan-500/20 to-blue-500/20",
        description: "Tournoi de billard en duo. Inscription sur place. Lots pour le top 3.",
        attendeeIds: [2, 5, 8, 10, 12],
      },
      {
        id: 302,
        barId: "flip",
        title: "Thursday Chill",
        time: "Tonight · 20:00",
        date: "Thursday",
        price: "Free",
        tag: "Chill",
        emoji: "🍸",
        gradient: "from-cyan-500/30 via-teal-500/20 to-green-500/20",
        description: "Soirée tranquille, bonne musique, cocktails à prix étudiant. Viens avec tes potes.",
        attendeeIds: [1, 6, 7, 11],
      },
    ],
  },
];

// Flatten all bar events into a single array for Home/Map screens
const ALL_EVENTS = BARS.flatMap((bar) =>
  bar.events.map((ev) => ({ ...ev, barName: bar.name, barDistance: bar.distance }))
);

// ─── Notifications ─────────────────────────────────────────────────────────────

const NOTIFICATIONS_DATA = [
  { id: 1, type: "Friends", icon: Sparkles, text: "3 friends are going to Techno Night #12 @ Infinity", time: "Now", read: false },
  { id: 2, type: "Event",   icon: Star,     text: "Rock Night Open Stage starts tonight at 21:00 @ Charlie", time: "1 h ago", read: false },
  { id: 3, type: "Offer",   icon: Bell,     text: "Happy Hour Jeudi — 80 CZK beers tonight @ Charlie", time: "3 h ago", read: true },
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
  const [route, setRoute]             = useState({ tab: "home", eventId: 101 });
  const [joined, setJoined]           = useState(() => loadLS("ot_joined", []));
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [editOpen, setEditOpen]       = useState(false);
  const [toast, setToast]             = useState(null);
  const [profile, setProfile]         = useState({ name: "Matéo Dumont", bio: "TBU Zlín · Erasmus student", mood: "Looking for plans tonight" });
  const [draft, setDraft]             = useState(profile);
  const toastRef = useRef(null);

  useEffect(() => { localStorage.setItem("ot_joined", JSON.stringify(joined)); }, [joined]);

  const selectedEvent = useMemo(
    () => ALL_EVENTS.find((e) => e.id === route.eventId) ?? ALL_EVENTS[0],
    [route.eventId]
  );

  // Build attendee list for selected event: mock users + current user if joined
  const selectedAttendees = useMemo(() => {
    const base = selectedEvent.attendeeIds.map((id) => USERS.find((u) => u.id === id)).filter(Boolean);
    if (joined.includes(selectedEvent.id) && !selectedEvent.attendeeIds.includes(1)) {
      return [USERS[0], ...base];
    }
    return base;
  }, [selectedEvent, joined]);

  const showToast = (msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  };

  const navigate  = (tab, eventId = route.eventId) => setRoute({ tab, eventId });
  const openEvent = (id) => setRoute({ tab: "event", eventId: id });

  const toggleJoin = (id) => {
    setJoined((cur) => {
      const has = cur.includes(id);
      const ev  = ALL_EVENTS.find((e) => e.id === id);
      showToast(has ? `Tu as quitté ${ev?.title}` : `Tu rejoins ${ev?.title} ! 🎉`);
      return has ? cur.filter((x) => x !== id) : [...cur, id];
    });
  };

  const markRead    = (id) => setNotifications((cur) => cur.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()   => setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
  const saveProfile = ()   => { setProfile(draft); setEditOpen(false); showToast("Profil sauvegardé ✓"); };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
                <HomeScreen events={ALL_EVENTS} bars={BARS} joined={joined} openEvent={openEvent} toggleJoin={toggleJoin} navigate={navigate} />
              )}
              {route.tab === "explore" && (
                <ExploreScreen bars={BARS} joined={joined} onToggleJoin={toggleJoin} onOpenEvent={openEvent} />
              )}
              {route.tab === "event" && (
                <EventScreen event={selectedEvent} attendees={selectedAttendees} isJoined={joined.includes(selectedEvent.id)} onJoin={() => toggleJoin(selectedEvent.id)} />
              )}
              {route.tab === "map" && <MapScreen events={ALL_EVENTS} openEvent={openEvent} />}
              {route.tab === "profile" && (
                <ProfileScreen profile={profile} draft={draft} setDraft={setDraft} editOpen={editOpen} setEditOpen={setEditOpen} saveProfile={saveProfile} notifications={notifications} markRead={markRead} markAllRead={markAllRead} joinedCount={joined.length} joinedEvents={ALL_EVENTS.filter((e) => joined.includes(e.id))} />
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

function HomeScreen({ events, bars, joined, openEvent, toggleJoin, navigate }) {
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
                <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-white/70">{hero.time}</span>
                <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-300">{hero.price}</span>
              </div>
              <p className="mt-3 text-sm text-violet-200/80">{hero.attendeeIds.length + (joined.includes(hero.id) ? 1 : 0)} students going</p>
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
                <p className="mt-0.5 truncate text-xs text-white/50">{event.time} · {event.barName}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-violet-300">{event.attendeeIds.length} going</span>
                  {event.price === "Free" && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">Free</span>}
                </div>
              </div>
              <span className="shrink-0 text-xs text-white/30">{event.barDistance}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Bars */}
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
              <div className={`flex h-20 items-center justify-center bg-gradient-to-br ${bar.gradient} text-4xl`}>{bar.emoji}</div>
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
    </div>
  );
}

// ─── ExploreScreen — bars ─────────────────────────────────────────────────────

function ExploreScreen({ bars, joined, onToggleJoin, onOpenEvent }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null); // bar id currently expanded

  const filteredBars = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return bars;
    return bars.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.tag.toLowerCase().includes(q) ||
        b.events.some((e) => e.title.toLowerCase().includes(q))
    );
  }, [bars, search]);

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

      {/* Count */}
      <p className="text-xs text-white/35">{filteredBars.length} bar{filteredBars.length > 1 ? "s" : ""} disponible{filteredBars.length > 1 ? "s" : ""}</p>

      {/* Bar cards */}
      <div className="space-y-4">
        {filteredBars.length === 0 ? (
          <EmptyState message="Aucun bar trouvé" />
        ) : (
          filteredBars.map((bar, i) => (
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
          ))
        )}
      </div>
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
      <div className={`relative flex h-32 items-end bg-gradient-to-br ${bar.gradient} p-4`}>
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
                          <p className="mt-0.5 text-xs text-white/50">{event.time}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-xs text-violet-300">{event.attendeeIds.length} going</span>
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

function EventScreen({ event, attendees, isJoined, onJoin }) {
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const preview = attendees.slice(0, 5);
  const rest    = attendees.length - 5;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <motion.section layout className="overflow-hidden rounded-[30px] border border-white/10 bg-[#11131B]">
        <div className={`relative flex h-60 items-end bg-gradient-to-br ${event.gradient} p-5`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="relative w-full">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-3xl">{event.emoji}</span>
              <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/85 backdrop-blur">{event.tag}</span>
            </div>
            <h2 className="text-2xl font-semibold leading-tight">{event.title}</h2>
            <p className="mt-1.5 text-sm text-white/80">{event.date} · {event.time}</p>
            <p className="text-sm text-white/60">{event.barName}</p>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard value={event.price} label="Entry" icon="💳" />
        <StatCard value={event.barDistance ?? "—"} label="Access" icon="📍" />
        <StatCard value={String(attendees.length)} label="Going" icon="👥" />
      </div>

      {/* About */}
      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="À propos" />
        <p className="mt-3 text-sm leading-6 text-white/70">{event.description}</p>
        <div className="mt-4">
          <button
            onClick={onJoin}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] ${isJoined ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}
          >
            {isJoined ? "✓ Tu y vas" : "Rejoindre l'event"}
          </button>
        </div>
        <button className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-white/65 transition active:scale-[0.98]">
          <Share2 size={14} />
          Partager avec des amis
        </button>
      </section>

      {/* Attendees */}
      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Qui y va" />
          {attendees.length > 5 && (
            <button
              onClick={() => setShowAllAttendees((v) => !v)}
              className="flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200 transition"
            >
              {showAllAttendees ? "Réduire" : `Voir tout (${attendees.length})`}
              <ChevronRight size={14} className={`transition-transform ${showAllAttendees ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>

        {/* Avatar row */}
        <div className="mt-4 flex -space-x-3">
          {preview.map((user, i) => (
            <div
              key={user.id}
              title={`${user.name} ${user.flag}`}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0B0C11] text-sm font-semibold ${user.color}`}
              style={{ zIndex: 10 - i }}
            >
              {user.init}
            </div>
          ))}
          {rest > 0 && !showAllAttendees && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0B0C11] bg-white/10 text-xs text-white/55" style={{ zIndex: 4 }}>
              +{rest}
            </div>
          )}
        </div>

        {/* Expanded list */}
        <AnimatePresence>
          {showAllAttendees && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {attendees.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-[18px] border border-white/6 bg-white/[0.04] p-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${user.color}`}>
                      {user.init}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-white/45">{user.uni}</p>
                    </div>
                    <span className="text-base">{user.flag}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showAllAttendees && (
          <p className="mt-3 text-sm text-white/50">
            {attendees.slice(0, 3).map((u) => u.name.split(" ")[0]).join(", ")}
            {attendees.length > 3 ? ` et ${attendees.length - 3} autres` : ""}
          </p>
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
                    <p className="text-white/50">{event.barName} · {event.barDistance}</p>
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
                <p className="mt-0.5 text-xs text-white/45">{event.barName} · {event.barDistance}</p>
              </div>
            </div>
            <span className={`text-xs font-medium ${event.price === "Free" ? "text-emerald-400" : "text-violet-300"}`}>{event.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

function ProfileScreen({ profile, draft, setDraft, editOpen, setEditOpen, saveProfile, notifications, markRead, markAllRead, joinedCount, joinedEvents }) {
  const [notifTab, setNotifTab] = useState("all");
  const unread = notifications.filter((n) => !n.read);
  const visibleNotifs = notifTab === "unread" ? unread : notifications;

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
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                <p className="mt-0.5 text-sm text-white/50">{profile.bio}</p>
              </div>
            </div>
            <button onClick={() => setEditOpen((v) => !v)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
              {editOpen ? "Close" : "Edit"}
            </button>
          </div>
          <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.04] p-3 text-sm text-white/60">{profile.mood}</div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard value={String(joinedCount)} label="Joined" icon="🎟️" />
        <StatCard value="34" label="Friends" icon="👥" />
        <StatCard value={String(unread.length)} label="Unread" icon="🔔" />
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
                  <p className="mt-0.5 text-xs text-white/40">{event.barName} · {event.time}</p>
                </div>
                <span className={`text-xs font-medium ${event.price === "Free" ? "text-emerald-400" : "text-violet-300"}`}>{event.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notifications */}
      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Notifications" icon={Bell} />
          {unread.length > 0 && <button onClick={markAllRead} className="text-xs text-violet-300">Tout lire</button>}
        </div>
        <div className="mt-3 flex gap-2">
          {["all", "unread"].map((t) => (
            <button key={t} onClick={() => setNotifTab(t)} className={`rounded-full px-3 py-1.5 text-xs capitalize transition ${notifTab === t ? "bg-white/10 text-white" : "text-white/40"}`}>
              {t === "all" ? `Tout (${notifications.length})` : `Non lus (${unread.length})`}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2.5">
          {visibleNotifs.length === 0 ? (
            <p className="py-4 text-center text-sm text-white/35">Aucune notification non lue</p>
          ) : (
            visibleNotifs.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className={`rounded-[22px] p-3 transition ${n.read ? "bg-white/[0.03]" : "border border-violet-300/15 bg-violet-400/10"}`}>
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/75"><Icon size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300/70">{n.type}</p>
                        <p className="shrink-0 text-[10px] text-white/35">{n.time}</p>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-white/85">{n.text}</p>
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="mt-2 rounded-xl border border-violet-300/20 px-3 py-1.5 text-xs text-violet-300">
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
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
