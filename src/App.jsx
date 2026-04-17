import { AnimatePresence, motion } from "framer-motion";
import { Compass, Home, MapPin, Navigation, Search, Settings, Share2, User, X, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import AdminPage from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";

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
    barAddress:  bar ? (bar.address || "") : "",
    gradient:    CATEGORY_GRADIENT[ev.category] || CATEGORY_GRADIENT.party,
    attendeeIds: [],
    goingCount:  rsvpCountMap[ev.id] ?? ev.going_count ?? 0,
  };
}


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
  const [myPlans, setMyPlans]         = useState([]); // [{ bar_id, plan_date }]
  const [barPlans, setBarPlans]       = useState({}); // { "date": { barId: count } }
  const [barPlanUsers, setBarPlanUsers] = useState({}); // { "date": { barId: [{ user_id, full_name }] } }
  const [restaurants, setRestaurants] = useState([]);
  const [myRestoPlans, setMyRestoPlans] = useState([]); // [{ restaurant_id, plan_date }]
  const [restoPlans, setRestoPlans]   = useState({}); // { "date": { restoId: count } }
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
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: barsData }, { data: eventsData }, { data: rsvpData }, { data: plansData }, { data: restosData }, { data: restoPlansData }] = await Promise.all([
        supabase.from("bars").select("*").order("name"),
        supabase.from("events").select("*").gte("date", today).order("date", { ascending: true }),
        supabase.from("rsvp").select("event_id, user_id"),
        supabase.from("bar_plans").select("bar_id, user_id, plan_date"),
        supabase.from("restaurants").select("*").order("name"),
        supabase.from("resto_plans").select("restaurant_id, user_id, plan_date"),
      ]);

      const cu = (await supabase.auth.getUser()).data.user;

      const rsvpCountMap = {};
      if (rsvpData) {
        rsvpData.forEach(r => { rsvpCountMap[r.event_id] = (rsvpCountMap[r.event_id] || 0) + 1; });
        if (cu) setJoined(rsvpData.filter(r => r.user_id === cu.id).map(r => r.event_id));
      }

      if (plansData) {
        // Fetch profiles separately (no direct FK from bar_plans.user_id to profiles.id)
        const profilesMap = {};
        const uniqueUserIds = [...new Set(plansData.map(p => p.user_id))];
        if (uniqueUserIds.length > 0) {
          const { data: profilesData } = await supabase.from("profiles").select("id, full_name, university").in("id", uniqueUserIds);
          if (profilesData) profilesData.forEach(p => { profilesMap[p.id] = p; });
        }

        const countMap = {};
        const usersMap = {};
        plansData.forEach(p => {
          if (p.plan_date < today) return; // ignore past plans
          if (!countMap[p.plan_date]) countMap[p.plan_date] = {};
          countMap[p.plan_date][p.bar_id] = (countMap[p.plan_date][p.bar_id] || 0) + 1;

          if (!usersMap[p.plan_date]) usersMap[p.plan_date] = {};
          if (!usersMap[p.plan_date][p.bar_id]) usersMap[p.plan_date][p.bar_id] = [];
          const profile = profilesMap[p.user_id];
          usersMap[p.plan_date][p.bar_id].push({
            user_id:    p.user_id,
            full_name:  profile?.full_name || null,
            university: profile?.university || null,
          });
        });
        setBarPlans(countMap);
        setBarPlanUsers(usersMap);
        if (cu) setMyPlans(plansData.filter(p => p.user_id === cu.id && p.plan_date >= today).map(p => ({ bar_id: p.bar_id, plan_date: p.plan_date })));
      }

      if (restosData) setRestaurants(restosData);

      if (restoPlansData) {
        const map = {};
        restoPlansData.forEach(p => {
          if (!map[p.plan_date]) map[p.plan_date] = {};
          map[p.plan_date][p.restaurant_id] = (map[p.plan_date][p.restaurant_id] || 0) + 1;
        });
        setRestoPlans(map);
        if (cu) setMyRestoPlans(restoPlansData.filter(p => p.user_id === cu.id).map(p => ({ restaurant_id: p.restaurant_id, plan_date: p.plan_date })));
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
    showToast(has ? `You left ${ev?.title}` : `You're going to ${ev?.title}! 🎉`);
    if (has) {
      await supabase.from("rsvp").delete().eq("event_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("rsvp").insert({ event_id: id, user_id: user.id });
    }
  };

  const toggleRestoPlan = async (restoId, date) => {
    if (!user) return;
    const has = myRestoPlans.some(p => p.restaurant_id === restoId && p.plan_date === date);
    const resto = restaurants.find(r => r.id === restoId);
    setMyRestoPlans(cur => has
      ? cur.filter(p => !(p.restaurant_id === restoId && p.plan_date === date))
      : [...cur, { restaurant_id: restoId, plan_date: date }]
    );
    setRestoPlans(cur => {
      const day = { ...(cur[date] || {}) };
      day[restoId] = Math.max(0, (day[restoId] || 0) + (has ? -1 : 1));
      return { ...cur, [date]: day };
    });
    showToast(has ? `Removed from plans` : `Added ${resto?.name} to your plans! 🍽️`);
    if (has) {
      await supabase.from("resto_plans").delete().eq("user_id", user.id).eq("restaurant_id", restoId).eq("plan_date", date);
    } else {
      await supabase.from("resto_plans").insert({ user_id: user.id, restaurant_id: restoId, plan_date: date });
    }
  };

  const toggleBarPlan = async (barId, date) => {
    if (!user) return;
    const has = myPlans.some(p => p.bar_id === barId && p.plan_date === date);
    const bar = bars.find(b => b.id === barId);
    const myName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null;
    setMyPlans(cur => has
      ? cur.filter(p => !(p.bar_id === barId && p.plan_date === date))
      : [...cur, { bar_id: barId, plan_date: date }]
    );
    setBarPlans(cur => {
      const day = { ...(cur[date] || {}) };
      day[barId] = Math.max(0, (day[barId] || 0) + (has ? -1 : 1));
      return { ...cur, [date]: day };
    });
    setBarPlanUsers(cur => {
      const existing = cur[date]?.[barId] || [];
      const updated = has
        ? existing.filter(u => u.user_id !== user.id)
        : [...existing, { user_id: user.id, full_name: myName }];
      return { ...cur, [date]: { ...(cur[date] || {}), [barId]: updated } };
    });
    showToast(has ? `Removed from plans` : `Added ${bar?.name} to your plans! 🗓️`);
    if (has) {
      await supabase.from("bar_plans").delete().eq("user_id", user.id).eq("bar_id", barId).eq("plan_date", date);
    } else {
      await supabase.from("bar_plans").insert({ user_id: user.id, bar_id: barId, plan_date: date });
    }
  };

  const saveProfile = () => { setProfile(draft); setEditOpen(false); showToast("Profile saved ✓"); };

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
    return <LandingPage onLogin={(session) => setUser(session.user)} />;
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
          <TopBar route={route} onBack={() => navigate("explore")} />
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
                  restaurants={restaurants}
                  joined={joined}
                  openEvent={openEvent}
                  toggleJoin={toggleJoin}
                  navigate={navigate}
                  myPlans={myPlans}
                  barPlans={barPlans}
                  barPlanUsers={barPlanUsers}
                  toggleBarPlan={toggleBarPlan}
                  myRestoPlans={myRestoPlans}
                  restoPlans={restoPlans}
                  toggleRestoPlan={toggleRestoPlan}
                  currentUserId={user?.id}
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
              const badge  = false;
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

function TopBar({ route, onBack }) {
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
      {route.tab === "home" && (
        <p className="text-right text-[11px] leading-tight text-white/40">
          New encounters<br />& parties tonight ✨
        </p>
      )}
    </div>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function buildWeekDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const num   = d.toLocaleDateString("en-US", { day: "numeric" });
    days.push({ iso, label, num });
  }
  return days;
}


function HomeScreen({ events, bars, restaurants, joined, openEvent, toggleJoin, navigate, myPlans, barPlans, barPlanUsers, toggleBarPlan, myRestoPlans, restoPlans, toggleRestoPlan, currentUserId }) {
  const specialEvents = events.filter(e => e.is_special);
  const regularEvents = events.filter(e => !e.is_special);
  const hero = regularEvents[0] ?? null;

  return (
    <div className="space-y-6">

      {/* ── Special Events ── */}
      {specialEvents.length > 0 && (
        <section>
          <SectionHeader title="✨ Special Events" />
          <div className="mt-3 space-y-3">
            {specialEvents.map((ev) => (
              <motion.button
                key={ev.id}
                onClick={() => openEvent(ev.id)}
                className="relative w-full overflow-hidden rounded-[26px] border border-amber-400/25 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent p-4 text-left transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${ev.gradient} text-2xl`}>{ev.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">Special</span>
                    <p className="truncate text-sm font-bold">{ev.title}</p>
                    <p className="mt-0.5 text-xs text-white/55">{ev.barName} · {ev.date} · {ev.time}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${ev.price === "Free" ? "text-emerald-400" : "text-violet-300"}`}>{ev.price}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* ── Hero event ── */}
      {hero ? (
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
                <p className="mt-3 text-sm text-violet-200/80">{hero.goingCount} students going</p>
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
      ) : (
        <div className="rounded-[28px] border border-white/8 bg-white/5 py-12 text-center">
          <p className="text-4xl">🌙</p>
          <p className="mt-4 text-sm text-white/50">No events tonight yet.</p>
          <p className="mt-1 text-xs text-white/30">Check back soon!</p>
        </div>
      )}

      {/* ── Tonight's events ── */}
      {regularEvents.length > 1 && (
        <section>
          <SectionHeader title="Tonight" action="See all" onAction={() => navigate("explore")} />
          <div className="mt-3 space-y-2">
            {regularEvents.slice(1, 5).map((event, i) => (
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
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* ── Bars — collapsible ── */}
      {bars.length > 0 && (
        <section>
          <SectionHeader title="Bars" action="See all" onAction={() => navigate("explore")} />
          <div className="mt-3 space-y-2">
            {bars.map(bar => (
              <CollapsibleBarCard key={bar.id} bar={bar} barPlans={barPlans} barPlanUsers={barPlanUsers} myPlans={myPlans} toggleBarPlan={toggleBarPlan} currentUserId={currentUserId} />
            ))}
          </div>
        </section>
      )}

      {/* ── Restaurants — collapsible ── */}
      {restaurants.length > 0 && (
        <section>
          <SectionHeader title="Restaurants" />
          <div className="mt-3 space-y-2">
            {restaurants.map(resto => (
              <CollapsibleRestoCard key={resto.id} resto={resto} restoPlans={restoPlans} myRestoPlans={myRestoPlans} toggleRestoPlan={toggleRestoPlan} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── CollapsibleBarCard ───────────────────────────────────────────────────────

function CollapsibleBarCard({ bar, barPlans, barPlanUsers, myPlans, toggleBarPlan, currentUserId }) {
  const weekDays  = useMemo(() => buildWeekDays(), []);
  const [open, setOpen] = useState(false);
  const [planDay, setPlanDay] = useState(weekDays[0].iso);

  const totalWeek = weekDays.reduce((s, d) => s + (barPlans[d.iso]?.[bar.id] || 0), 0);
  const dayCount  = barPlans[planDay]?.[bar.id] || 0;
  const isMe      = myPlans.some(p => p.bar_id === bar.id && p.plan_date === planDay);
  const dayUsers  = barPlanUsers?.[planDay]?.[bar.id] || [];

  return (
    <div className={`overflow-hidden rounded-[22px] border transition ${open ? "border-violet-400/25 bg-white/[0.06]" : "border-white/8 bg-white/5"}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${bar.gradient || "from-violet-500/20 to-indigo-500/20"} text-xl`}>
          {bar.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{bar.name}</p>
          <p className="mt-0.5 text-xs text-white/45">
            {totalWeek > 0 ? `${totalWeek} going this week` : "Be the first to plan!"}
          </p>
        </div>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }} className="shrink-0 text-white/30">
          <ChevronRight size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-3 pb-3 pt-3">
              {/* Day picker */}
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {weekDays.map(day => {
                  const cnt    = barPlans[day.iso]?.[bar.id] || 0;
                  const active = planDay === day.iso;
                  return (
                    <button
                      key={day.iso}
                      onClick={() => setPlanDay(day.iso)}
                      className={`flex shrink-0 flex-col items-center rounded-[14px] px-3 py-2 transition ${active ? "bg-violet-500 text-white" : "border border-white/8 bg-white/[0.04] text-white/55"}`}
                    >
                      <span className="text-[10px] font-medium">{day.label}</span>
                      <span className="text-sm font-bold leading-tight">{day.num}</span>
                      {cnt > 0 && (
                        <span className={`mt-0.5 rounded-full px-1 text-[9px] font-semibold ${active ? "bg-white/25" : "bg-violet-400/20 text-violet-300"}`}>{cnt}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status + button */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-white/50">
                  {dayCount > 0 ? `${dayCount} going` : "No one yet"}
                  {bar.address && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(bar.address)}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-violet-300/70">· {bar.address.split(',')[0]}</a>
                  )}
                </p>
                <button
                  onClick={() => toggleBarPlan(bar.id, planDay)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-[0.96] ${isMe ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}
                >
                  {isMe ? "✓ I'm in" : "I'm in"}
                </button>
              </div>

              {/* Who's going this day */}
              {dayUsers.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30">Who's going</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dayUsers.slice(0, 6).map((u, i) => {
                      const name = u.full_name || "?";
                      const isCurrentUser = u.user_id === currentUserId;
                      const colors = [
                        "bg-violet-400/20 text-violet-300",
                        "bg-sky-400/20 text-sky-300",
                        "bg-emerald-400/20 text-emerald-300",
                        "bg-amber-400/20 text-amber-300",
                        "bg-pink-400/20 text-pink-300",
                        "bg-cyan-400/20 text-cyan-300",
                      ];
                      return (
                        <div
                          key={u.user_id}
                          className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.06] px-2.5 py-1"
                          title={name}
                        >
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${colors[i % colors.length]}`}>
                            {name[0].toUpperCase()}
                          </div>
                          <span className="text-[11px] text-white/65">
                            {isCurrentUser ? "You" : name.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                    {dayUsers.length > 6 && (
                      <div className="flex items-center rounded-full border border-white/8 bg-white/[0.06] px-2.5 py-1">
                        <span className="text-[11px] text-white/40">+{dayUsers.length - 6} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CollapsibleRestoCard ─────────────────────────────────────────────────────

function CollapsibleRestoCard({ resto, restoPlans, myRestoPlans, toggleRestoPlan }) {
  const weekDays  = useMemo(() => buildWeekDays(), []);
  const [open, setOpen] = useState(false);
  const [planDay, setPlanDay] = useState(weekDays[0].iso);

  const totalWeek = weekDays.reduce((s, d) => s + (restoPlans[d.iso]?.[resto.id] || 0), 0);
  const dayCount  = restoPlans[planDay]?.[resto.id] || 0;
  const isMe      = myRestoPlans.some(p => p.restaurant_id === resto.id && p.plan_date === planDay);

  return (
    <div className={`overflow-hidden rounded-[22px] border transition ${open ? "border-amber-400/20 bg-white/[0.06]" : "border-white/8 bg-white/5"}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-400/15 text-xl">
          {resto.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{resto.name}</p>
          <p className="mt-0.5 text-xs text-white/45">
            {resto.cuisine}{totalWeek > 0 ? ` · ${totalWeek} going this week` : ""}
          </p>
        </div>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }} className="shrink-0 text-white/30">
          <ChevronRight size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-3 pb-3 pt-3">
              {resto.description && <p className="mb-3 text-xs text-white/55 leading-5">{resto.description}</p>}
              {/* Day picker */}
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {weekDays.map(day => {
                  const cnt    = restoPlans[day.iso]?.[resto.id] || 0;
                  const active = planDay === day.iso;
                  return (
                    <button
                      key={day.iso}
                      onClick={() => setPlanDay(day.iso)}
                      className={`flex shrink-0 flex-col items-center rounded-[14px] px-3 py-2 transition ${active ? "bg-amber-500 text-white" : "border border-white/8 bg-white/[0.04] text-white/55"}`}
                    >
                      <span className="text-[10px] font-medium">{day.label}</span>
                      <span className="text-sm font-bold leading-tight">{day.num}</span>
                      {cnt > 0 && (
                        <span className={`mt-0.5 rounded-full px-1 text-[9px] font-semibold ${active ? "bg-white/25" : "bg-amber-400/20 text-amber-300"}`}>{cnt}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status + button */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-white/50">
                    {dayCount > 0 ? `${dayCount} people going` : "No one yet"}
                  </p>
                  {resto.hours && <p className="mt-0.5 text-[11px] text-white/35">🕐 {resto.hours}</p>}
                </div>
                <button
                  onClick={() => toggleRestoPlan(resto.id, planDay)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-[0.96] ${isMe ? "bg-amber-500 text-white" : "bg-white text-[#0B0C11]"}`}
                >
                  {isMe ? "✓ I'm going" : "I'm going"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          placeholder="Search a bar or event..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-white/40 hover:text-white/70 transition"><X size={14} /></button>
        )}
      </div>

      {!hasResults ? (
        <EmptyState message="No results" />
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
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${bar.open ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"}`}>
              {bar.open ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Bar description + toggle */}
      <div className="p-4">
        <p className="text-sm text-white/60 leading-5">{bar.description}</p>
        {bar.address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(bar.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-xs text-violet-300/80 hover:text-violet-300 transition"
          >
            <MapPin size={12} />
            {bar.address}
          </a>
        )}

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
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    async function fetchAttendees() {
      const { data: rsvpData } = await supabase
        .from("rsvp")
        .select("user_id")
        .eq("event_id", event.id);

      if (!rsvpData || rsvpData.length === 0) { setAttendees([]); return; }

      const userIds = rsvpData.map(r => r.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, university, interests")
        .in("id", userIds);

      const profilesMap = {};
      if (profilesData) profilesData.forEach(p => { profilesMap[p.id] = p; });

      setAttendees(rsvpData.map(r => ({
        user_id: r.user_id,
        profiles: profilesMap[r.user_id] || null,
      })));
    }
    fetchAttendees();
  }, [event.id, isJoined]);

  const handleShare = async () => {
    const url = window.location.origin;
    const text = `Check out "${event.title}" on Outonight! 🌙`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text, url }); } catch {}
    } else {
      setShowShare(true);
    }
  };

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
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(event.barAddress || event.barName + ' Zlín')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[20px] border border-white/8 bg-white/5 p-3 text-center flex flex-col items-center active:scale-[0.97] transition"
        >
          <div className="mb-1 text-base leading-none">📍</div>
          <p className="text-[11px] font-semibold text-violet-300 leading-tight truncate w-full px-1">{event.barAddress ? event.barAddress.split(',')[0] : "—"}</p>
          <p className="mt-0.5 text-[10px] text-white/45">Maps</p>
        </a>
        <StatCard value={String(totalGoing)} label="Going" icon="👥" />
      </div>

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="About" />
        <p className="mt-3 text-sm leading-6 text-white/70">{event.description || "No description."}</p>
        <div className="mt-4">
          <button onClick={onJoin} className={`w-full rounded-2xl py-3 text-sm font-semibold transition active:scale-[0.98] ${isJoined ? "bg-violet-500 text-white" : "bg-white text-[#0B0C11]"}`}>
            {isJoined ? "✓ You're going" : "Join this event"}
          </button>
        </div>
        <button onClick={handleShare} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-white/65 transition active:scale-[0.98]">
          <Share2 size={14} />
          Share with friends
        </button>
      </section>

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShare(false)}>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-t-[32px] border border-white/10 bg-[#0F1018] p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-semibold">Share event</span>
              <button onClick={() => setShowShare(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out "${event.title}" on Outonight! 🌙 ${window.location.origin}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#25D366]/10 px-4 py-3 text-sm text-[#25D366] transition active:scale-[0.98]"
              >
                <span className="text-xl">💬</span> Share on WhatsApp
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.origin); setShowShare(false); }}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition active:scale-[0.98]"
              >
                <span className="text-xl">🔗</span> Copy link
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <section className="rounded-[28px] border border-white/8 bg-white/5 p-4">
        <SectionHeader title="Who's going" />
        {attendees.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">Be the first to join!</p>
        ) : (
          <div className="mt-3 space-y-2">
            {attendees.map((a, i) => {
              const name = a.profiles?.full_name || "Student";
              const isMe = user && a.user_id === user.id;
              const colors = ["bg-violet-400/20 text-violet-300","bg-sky-400/20 text-sky-300","bg-emerald-400/20 text-emerald-300","bg-amber-400/20 text-amber-300","bg-pink-400/20 text-pink-300"];
              return (
                <button key={a.user_id} onClick={() => setSelectedProfile({ ...a.profiles, user_id: a.user_id, isMe })} className="flex w-full items-center gap-3 rounded-[18px] border border-white/6 bg-white/[0.04] px-3 py-2.5 text-left transition hover:bg-white/[0.08] active:scale-[0.99]">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colors[i % colors.length]}`}>
                    {name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80">{name}{isMe ? " (you)" : ""}</p>
                    {a.profiles?.university && <p className="text-xs text-white/40 truncate">{a.profiles.university}</p>}
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-white/25" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-t-[32px] border border-white/10 bg-[#0F1018] p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.22em] text-white/35">Profile</span>
              <button onClick={() => setSelectedProfile(null)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/30 to-purple-600/30 text-2xl font-bold text-violet-300">
                {(selectedProfile.full_name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedProfile.full_name || "Student"}</h3>
                {selectedProfile.isMe && <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[11px] text-violet-300">You</span>}
              </div>
            </div>
            {selectedProfile.university && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <span className="text-base">🎓</span>
                <span className="text-sm text-white/70">{selectedProfile.university}</span>
              </div>
            )}
            {selectedProfile.interests && selectedProfile.interests.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-white/35 uppercase tracking-[0.2em]">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.interests.map((interest, idx) => (
                    <span key={idx} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">{interest}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-5 text-center text-xs text-white/25">Going to this event</p>
          </motion.div>
        </div>
      )}
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

function ProfileScreen({ profile, draft, setDraft, editOpen, setEditOpen, saveProfile, joinedCount, joinedEvents, onAdmin, user, isAdmin, onLogout }) {

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
          <SectionHeader title="Your events" />
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
