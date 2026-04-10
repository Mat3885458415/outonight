import { AnimatePresence, motion } from "framer-motion";
import { Bell, Compass, Home, MapPin, Search, Settings, Sparkles, Star, User } from "lucide-react";
import { useMemo, useState } from "react";

const EVENTS = [
  {
    id: 1,
    title: "Techno Night #12",
    venue: "Club Rubín",
    time: "Tonight · 22:00",
    date: "Friday",
    attendees: 126,
    price: "150 CZK",
    tag: "Trending",
    category: "Party",
    emoji: "🎵",
    distance: "8 min walk",
    description: "The biggest student techno event this week with a strong crowd, fast entry, and a very social atmosphere.",
    gradient: "from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20",
  },
  {
    id: 2,
    title: "Thursday Happy Hour",
    venue: "Bar Panorama",
    time: "Tonight · 20:00",
    date: "Thursday",
    attendees: 57,
    price: "80 CZK",
    tag: "Student deal",
    category: "Food",
    emoji: "🍻",
    distance: "12 min walk",
    description: "Relaxed pre-party atmosphere, cheap drinks, and an easy meetup format for small groups.",
    gradient: "from-sky-500/30 via-cyan-500/20 to-blue-500/20",
  },
  {
    id: 3,
    title: "Erasmus International Night",
    venue: "Erasmus Zlín Hub",
    time: "Sat · 21:00",
    date: "Saturday",
    attendees: 201,
    price: "Free",
    tag: "Popular",
    category: "Erasmus",
    emoji: "🎤",
    distance: "15 min by bus",
    description: "A high energy social night designed for Erasmus students and international meetups.",
    gradient: "from-pink-500/30 via-rose-500/20 to-orange-500/20",
  },
  {
    id: 4,
    title: "Open Basketball 3v3",
    venue: "TBU Sports Hall",
    time: "Tomorrow · 14:00",
    date: "Tomorrow",
    attendees: 24,
    price: "Free",
    tag: "Active",
    category: "Sport",
    emoji: "🏀",
    distance: "6 min walk",
    description: "Casual student basketball with open registration and a friendly level.",
    gradient: "from-amber-500/30 via-orange-500/20 to-yellow-500/20",
  },
];

const NOTIFICATIONS_DATA = [
  { id: 1, type: "Friends", icon: Sparkles, text: "3 friends are going to Techno Night #12", time: "Now", read: false },
  { id: 2, type: "Event", icon: Star, text: "Open Basketball 3v3 starts tomorrow at 14:00", time: "1 h ago", read: false },
  { id: 3, type: "Offer", icon: Bell, text: "20% student discount at Pizzeria Modrá Hvězda", time: "3 h ago", read: true },
];

const FILTERS = ["Tonight", "This week", "Party", "Erasmus", "Food", "Sport"];
const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "map", label: "Map", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
];

export default function OutonightApp() {
  const [route, setRoute] = useState({ tab: "home", eventId: 1 });
  const [filters, setFilters] = useState(["Tonight"]);
  const [joined, setJoined] = useState([1]);
  const [saved, setSaved] = useState([2]);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "Matéo Dumont",
    bio: "TBU Zlín · Erasmus student",
    mood: "Looking for plans tonight",
  });
  const [draft, setDraft] = useState(profile);

  const selectedEvent = useMemo(
    () => EVENTS.find((event) => event.id === route.eventId) ?? EVENTS[0],
    [route.eventId]
  );

  const filteredEvents = useMemo(() => {
    if (filters.length === 0) return EVENTS;
    return EVENTS.filter((event) =>
      filters.some((filter) => {
        if (filter === "Tonight") return event.time.toLowerCase().includes("tonight");
        if (filter === "This week") return true;
        return event.category === filter;
      })
    );
  }, [filters]);

  function navigate(tab, eventId = route.eventId) {
    setRoute({ tab, eventId });
  }

  function openEvent(eventId) {
    setRoute({ tab: "event", eventId });
  }

  function toggleFilter(filter) {
    setFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]
    );
  }

  function toggleJoin(eventId) {
    setJoined((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  }

  function toggleSave(eventId) {
    setSaved((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  }

  function markRead(id) {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }

  function saveProfile() {
    setProfile(draft);
    setEditOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#07080C] text-white">
      <div className="mx-auto min-h-screen max-w-md bg-[radial-gradient(circle_at_top,_rgba(111,76,255,0.18),_transparent_28%),linear-gradient(180deg,#0B0C11_0%,#08090D_100%)]">
        <div className="sticky top-0 z-30 border-b border-white/6 bg-[#0B0C11]/80 px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur-xl">
          <TopBar route={route} onBack={() => navigate("explore", route.eventId)} unreadCount={notifications.filter((n) => !n.read).length} />
        </div>

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
                  events={EVENTS}
                  joined={joined}
                  openEvent={openEvent}
                  toggleJoin={toggleJoin}
                />
              )}
              {route.tab === "explore" && (
                <ExploreScreen
                  events={filteredEvents}
                  filters={filters}
                  joined={joined}
                  saved={saved}
                  onToggleFilter={toggleFilter}
                  onToggleJoin={toggleJoin}
                  onToggleSave={toggleSave}
                  onOpenEvent={openEvent}
                />
              )}
              {route.tab === "event" && (
                <EventScreen
                  event={selectedEvent}
                  isJoined={joined.includes(selectedEvent.id)}
                  isSaved={saved.includes(selectedEvent.id)}
                  onJoin={() => toggleJoin(selectedEvent.id)}
                  onSave={() => toggleSave(selectedEvent.id)}
                />
              )}
              {route.tab === "map" && <MapScreen events={EVENTS} openEvent={openEvent} />}
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
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-white/8 bg-[#0B0C11]/90 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-2xl">
          <nav className="grid grid-cols-4 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = route.tab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${active ? "bg-white text-[#0B0C11]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                >
                  <Icon size={18} />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

function TopBar({ route, onBack, unreadCount }) {
  const titleMap = {
    home: "Tonight in Zlín",
    explore: "Explore",
    event: "Event details",
    map: "Map",
    profile: "Profile",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {route.tab === "event" ? (
          <button onClick={onBack} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            Back
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base">
            🌙
          </div>
        )}
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300/75">Outonight</p>
          <h1 className="text-base font-semibold">{titleMap[route.tab]}</h1>
        </div>
      </div>
      <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-violet-400" />}
      </button>
    </div>
  );
}

function HomeScreen({ events, joined, openEvent, toggleJoin }) {
  return (
    <div className="space-y-6">
      <motion.section layout className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(126,87,255,0.38),_rgba(13,14,21,0.96)_55%)] p-5 shadow-[0_20px_80px_rgba(63,32,160,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-violet-200/75">Best pick tonight</p>
            <h2 className="mt-2 text-[30px] font-semibold leading-none">{events[0].title}</h2>
            <p className="mt-3 text-sm text-white/72">{events[0].venue} · {events[0].time}</p>
            <p className="mt-1 text-sm text-white/90">{events[0].attendees} students going</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/10 text-4xl">{events[0].emoji}</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => toggleJoin(events[0].id)} className="rounded-2xl bg-white py-3 text-sm font-semibold text-[#0B0C11] transition active:scale-[0.98]">
            {joined.includes(events[0].id) ? "Going" : "Join now"}
          </button>
          <button onClick={() => openEvent(events[0].id)} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/85 transition active:scale-[0.98]">
            View event
          </button>
        </div>
      </motion.section>

      <section>
        <SectionHeader title="Trending now" action="Open" />
        <div className="mt-3 space-y-3">
          {events.slice(0, 3).map((event, index) => (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => openEvent(event.id)}
              className="flex w-full items-center gap-3 rounded-[24px] border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/[0.07] active:scale-[0.99]"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br ${event.gradient} text-3xl`}>
                {event.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{event.title}</p>
                <p className="mt-1 truncate text-xs text-white/55">{event.time} · {event.venue}</p>
                <p className="mt-1 text-xs text-violet-200">{event.attendees} going</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExploreScreen({ events, filters, joined, saved, onToggleFilter, onToggleJoin, onToggleSave, onOpenEvent }) {
  return (
    <div className="space-y-5">
      <SearchInput />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((filter) => {
          const active = filters.includes(filter);
          return (
            <button
              key={filter}
              onClick={() => onToggleFilter(filter)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${active ? "bg-white text-[#0B0C11]" : "border border-white/10 bg-white/5 text-white/80"}`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="overflow-hidden rounded-[28px] border border-white/8 bg-white/5"
          >
            <button onClick={() => onOpenEvent(event.id)} className="block w-full text-left">
              <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${event.gradient} text-5xl`}>
                {event.emoji}
              </div>
            </button>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button onClick={() => onOpenEvent(event.id)} className="text-left text-lg font-semibold hover:text-violet-200">
                    {event.title}
                  </button>
                  <p className="mt-1 text-sm text-white/60">{event.time}</p>
                  <p className="text-sm text-white/60">{event.venue}</p>
                </div>
                <button onClick={() => onToggleSave(event.id)} className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-white/85">
                  {saved.includes(event.id) ? "Saved" : "Save"}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/75">{event.attendees} going</span>
                <span className="font-medium text-violet-300">{event.price}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => onToggleJoin(event.id)} className="rounded-2xl bg-white py-3 text-sm font-semibold text-[#0B0C11] transition active:scale-[0.98]">
                  {joined.includes(event.id) ? "Going" : "Join"}
                </button>
                <button onClick={() => onOpenEvent(event.id)} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/85 transition active:scale-[0.98]">
                  View
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EventScreen({ event, isJoined, isSaved, onJoin, onSave }) {
  return (
    <div className="space-y-5">
      <motion.section layout className="overflow-hidden rounded-[30px] border border-white/10 bg-[#11131B]">
        <div className={`relative flex h-64 items-end bg-gradient-to-br ${event.gradient} p-5`}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.55))]" />
          <div className="relative">
            <div className="mb-3 inline-flex rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-white/85">{event.tag}</div>
            <h2 className="text-3xl font-semibold">{event.title}</h2>
            <p className="mt-2 text-sm text-white/85">{event.date} · {event.time}</p>
            <p className="text-sm text-white/75">{event.venue}</p>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={event.price} label="Entry" />
        <StatCard value={event.distance} label="Access" />
        <StatCard value={String(event.attendees)} label="Going" />
      </div>

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="About this event" />
        <p className="mt-3 text-sm leading-6 text-white/72">{event.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onJoin} className="rounded-2xl bg-white py-3 text-sm font-semibold text-[#0B0C11] transition active:scale-[0.98]">
            {isJoined ? "Marked as going" : "Join event"}
          </button>
          <button onClick={onSave} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/85 transition active:scale-[0.98]">
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
        <button className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-white/80 transition active:scale-[0.98]">
          Share with friends
        </button>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="Who is going" action="Invite" />
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex -space-x-3">
            {['A', 'P', 'L', 'M'].map((letter) => (
              <div key={letter} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0B0C11] bg-violet-200 text-sm font-semibold text-[#1D2358]">
                {letter}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/70">Anna, Pedro, Lena and more</p>
        </div>
      </section>
    </div>
  );
}

function MapScreen({ events, openEvent }) {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[#10131B] p-4">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="relative h-[420px] rounded-[24px] bg-[radial-gradient(circle_at_center,_rgba(122,92,255,0.16),_transparent_55%)]">
          {events.map((event, index) => {
            const positions = ["left-[14%] top-[25%]", "left-[55%] top-[35%]", "left-[34%] top-[62%]", "left-[72%] top-[18%]"];
            return (
              <button
                key={event.id}
                onClick={() => openEvent(event.id)}
                className={`absolute ${positions[index]} flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-lg shadow-violet-900/30">{event.emoji}</div>
                <div className="rounded-full border border-white/10 bg-[#0B0C11]/80 px-3 py-1 text-xs text-white/90 backdrop-blur">{event.title}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        {events.slice(0, 3).map((event) => (
          <button key={event.id} onClick={() => openEvent(event.id)} className="flex w-full items-center justify-between rounded-[22px] border border-white/8 bg-white/5 p-4 text-left">
            <div>
              <p className="text-sm font-semibold">{event.title}</p>
              <p className="mt-1 text-xs text-white/55">{event.venue} · {event.distance}</p>
            </div>
            <span className="text-lg">{event.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ profile, draft, setDraft, editOpen, setEditOpen, saveProfile, notifications, markRead, markAllRead, joinedCount }) {
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-white/5">
        <div className="h-28 bg-[radial-gradient(circle_at_top,_rgba(126,87,255,0.7),_rgba(20,21,30,0.35)_65%)]" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#0B0C11] bg-violet-200 text-3xl font-semibold text-[#23306E]">M</div>
              <div>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="mt-1 text-sm text-white/62">{profile.bio}</p>
              </div>
            </div>
            <button onClick={() => setEditOpen((value) => !value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/85">
              {editOpen ? "Close" : "Edit"}
            </button>
          </div>
          <div className="mt-4 rounded-[22px] bg-white/[0.04] p-3 text-sm text-white/75">{profile.mood}</div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={String(joinedCount)} label="Joined" />
        <StatCard value="34" label="Friends" />
        <StatCard value={String(unread)} label="Unread" />
      </div>

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
                <Input label="Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
                <Input label="Bio" value={draft.bio} onChange={(value) => setDraft({ ...draft, bio: value })} />
                <Input label="Mood" value={draft.mood} onChange={(value) => setDraft({ ...draft, mood: value })} />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={saveProfile} className="rounded-2xl bg-white py-3 text-sm font-semibold text-[#0B0C11]">Save</button>
                  <button onClick={() => setEditOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/85">Cancel</button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Notifications" icon={Bell} />
          <button onClick={markAllRead} className="text-sm text-violet-300">Mark all read</button>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} className={`rounded-[24px] p-3 ${notification.read ? "bg-white/[0.04]" : "border border-violet-300/15 bg-violet-400/10"}`}>
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white/85">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-violet-300/75">{notification.type}</p>
                      <p className="text-[11px] text-white/40">{notification.time}</p>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-white/88">{notification.text}</p>
                    {!notification.read && (
                      <button onClick={() => markRead(notification.id)} className="mt-3 rounded-2xl border border-violet-300/20 px-3 py-2 text-xs text-violet-200">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SearchInput() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/50">
      <Search size={16} />
      <span>Search events, clubs, restaurants...</span>
    </div>
  );
}

function SectionHeader({ title, action, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={16} className="text-violet-300" /> : null}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {action ? <span className="text-sm text-violet-300">{action}</span> : null}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/5 p-3 text-center">
      <p className="text-base font-semibold">{value}</p>
      <p className="mt-1 text-[11px] text-white/55">{label}</p>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
      />
    </label>
  );
}
