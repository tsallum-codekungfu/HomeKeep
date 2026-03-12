import React, { useState } from "react";

// ─── SAMPLE DATA ────────────────────────────────────────────
const initialEquipment = [
  { id: 1, name: "Lawn Mower", brand: "Honda", model: "HRX217VKA", icon: "🌿",
    tasks: [
      { id: 1, name: "Change oil", intervalDays: 90, lastDone: "2025-12-10" },
      { id: 2, name: "Replace air filter", intervalDays: 180, lastDone: "2025-09-01" },
      { id: 3, name: "Sharpen blade", intervalDays: 60, lastDone: "2025-11-15" },
      { id: 4, name: "Replace spark plug", intervalDays: 365, lastDone: "2025-03-01" },
    ]},
  { id: 2, name: "HVAC System", brand: "Carrier", model: "24ACC636A003", icon: "❄️",
    tasks: [
      { id: 1, name: "Replace air filter", intervalDays: 30, lastDone: "2026-02-10" },
      { id: 2, name: "Clean condenser coils", intervalDays: 365, lastDone: "2025-05-01" },
      { id: 3, name: "Check refrigerant", intervalDays: 365, lastDone: "2025-05-01" },
    ]},
  { id: 3, name: "Generator", brand: "Generac", model: "GP3500iO", icon: "⚡",
    tasks: [
      { id: 1, name: "Change oil", intervalDays: 180, lastDone: "2025-10-01" },
      { id: 2, name: "Run test cycle", intervalDays: 30, lastDone: "2026-02-01" },
      { id: 3, name: "Replace spark plug", intervalDays: 365, lastDone: "2025-06-01" },
    ]},
  { id: 4, name: "Pressure Washer", brand: "Ryobi", model: "RY142300", icon: "💧",
    tasks: [
      { id: 1, name: "Inspect hoses & fittings", intervalDays: 90, lastDone: "2025-12-01" },
      { id: 2, name: "Flush pump with cleaner", intervalDays: 180, lastDone: "2025-09-01" },
    ]},
];

const REMINDER_CATS = ["General", "Weekly", "Monthly", "Seasonal", "Garage", "Yard", "Indoor"];
const reminderCatColors = {
  General: "#6c757d", Weekly: "#0d6efd", Monthly: "#6f42c1",
  Seasonal: "#fd7e14", Garage: "#795548", Yard: "#2e7d32", Indoor: "#0288d1"
};
const initialReminders = [
  { id: 1, text: "Take out the trash", category: "Weekly", done: false, dueDate: "", repeat: "weekly" },
  { id: 2, text: "Clean up garage", category: "Garage", done: false, dueDate: "", repeat: "none" },
  { id: 3, text: "Replace smoke detector batteries", category: "Monthly", done: false, dueDate: "2026-04-01", repeat: "none" },
  { id: 4, text: "Check gutters for debris", category: "Seasonal", done: false, dueDate: "2026-04-15", repeat: "none" },
  { id: 5, text: "Vacuum and dust living room", category: "Weekly", done: false, dueDate: "", repeat: "weekly" },
  { id: 6, text: "Deep clean kitchen appliances", category: "Monthly", done: false, dueDate: "2026-03-20", repeat: "none" },
];

const PROPERTY_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const priorityColors = { Low: "#27ae60", Medium: "#2980b9", High: "#e67e22", Urgent: "#c0392b" };
const PROPERTY_AREAS = ["Yard", "Driveway", "Roof", "Foundation", "Fencing", "Exterior", "Drainage", "Other"];
const areaColors = {
  Yard: "#2e7d32", Driveway: "#5d4037", Roof: "#1565c0", Foundation: "#6a1b9a",
  Fencing: "#ad1457", Exterior: "#00695c", Drainage: "#0277bd", Other: "#546e7a"
};
const initialPropertyTodos = [
  { id: 1, title: "Remove fallen tree near fence", area: "Yard", priority: "High", done: false, notes: "Large oak fell during last storm. May need chainsaw rental.", addedDate: "2026-01-15" },
  { id: 2, title: "Repair driveway pothole", area: "Driveway", priority: "Medium", done: false, notes: "Two potholes near the garage entrance. Get cold-patch asphalt.", addedDate: "2026-02-01" },
  { id: 3, title: "Fix sagging fence panel — east side", area: "Fencing", priority: "Medium", done: false, notes: "", addedDate: "2026-02-10" },
  { id: 4, title: "Reseal around back door frame", area: "Exterior", priority: "High", done: false, notes: "Caulk is cracking and pulling away. Draft coming through.", addedDate: "2026-01-20" },
  { id: 5, title: "Clear drainage ditch at back of property", area: "Drainage", priority: "Low", done: false, notes: "Gets blocked with leaves every fall.", addedDate: "2025-11-01" },
];

// ─── HELPERS ────────────────────────────────────────────────
function getDueDate(lastDone, intervalDays) {
  const d = new Date(lastDone); d.setDate(d.getDate() + intervalDays); return d;
}
function getDaysUntilDue(lastDone, intervalDays) {
  const due = getDueDate(lastDone, intervalDays);
  const today = new Date(); today.setHours(0,0,0,0); due.setHours(0,0,0,0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}
function dueDateDiff(dueDate) {
  if (!dueDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueDate); due.setHours(0,0,0,0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ days }) {
  if (days < 0) return <span style={S.badgeOverdue}>Overdue {Math.abs(days)}d</span>;
  if (days <= 7) return <span style={S.badgeSoon}>Due in {days}d</span>;
  if (days <= 30) return <span style={S.badgeUpcoming}>In {days}d</span>;
  return <span style={S.badgeOk}>In {days}d</span>;
}
function DueDateBadge({ dueDate }) {
  const diff = dueDateDiff(dueDate);
  if (diff === null) return null;
  if (diff < 0) return <span style={S.badgeOverdue}>Overdue {Math.abs(diff)}d</span>;
  if (diff <= 3) return <span style={S.badgeSoon}>Due in {diff}d</span>;
  if (diff <= 14) return <span style={S.badgeUpcoming}>Due {new Date(dueDate).toLocaleDateString()}</span>;
  return <span style={S.badgeOk}>Due {new Date(dueDate).toLocaleDateString()}</span>;
}

// ─── APP ────────────────────────────────────────────────────
export default function App() {
  // Equipment
  const [equipment, setEquipment] = useState(initialEquipment);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [view, setView] = useState("dashboard");
  const [history, setHistory] = useState([]);
  const [logModal, setLogModal] = useState(null);
  const [logNote, setLogNote] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAddEquip, setShowAddEquip] = useState(false);
  const [newEquip, setNewEquip] = useState({ name: "", brand: "", model: "", icon: "🔧" });
  const [activeTab, setActiveTab] = useState("tasks");

  // Reminders
  const [reminders, setReminders] = useState(initialReminders);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: "", category: "General", dueDate: "", repeat: "none" });
  const [reminderFilter, setReminderFilter] = useState("All");
  const [showDoneReminders, setShowDoneReminders] = useState(false);

  // Property To-Do
  const [propertyTodos, setPropertyTodos] = useState(initialPropertyTodos);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", area: "Yard", priority: "Medium", notes: "" });
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [showDoneProperty, setShowDoneProperty] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState(null);

  // ── Computed ──
  const allTasks = equipment.flatMap(eq =>
    eq.tasks.map(t => ({ ...t, equipId: eq.id, equipName: eq.name, equipIcon: eq.icon,
      daysUntil: getDaysUntilDue(t.lastDone, t.intervalDays) }))
  ).sort((a, b) => a.daysUntil - b.daysUntil);

  const overdueEquip = allTasks.filter(t => t.daysUntil < 0).length;
  const dueSoonEquip = allTasks.filter(t => t.daysUntil >= 0 && t.daysUntil <= 7).length;
  const pendingReminders = reminders.filter(r => !r.done).length;
  const openPropertyTodos = propertyTodos.filter(t => !t.done).length;
  const urgentPropertyTodos = propertyTodos.filter(t => !t.done && (t.priority === "Urgent" || t.priority === "High")).length;

  // ── Equipment fns ──
  function markEquipDone(equipId, taskId) {
    const eq = equipment.find(e => e.id === equipId);
    setLogModal({ equipId, task: eq.tasks.find(t => t.id === taskId) });
    setLogNote(""); setLogDate(new Date().toISOString().split("T")[0]);
  }
  function submitLog() {
    const { equipId, task } = logModal;
    setEquipment(prev => prev.map(eq => eq.id !== equipId ? eq : {
      ...eq, tasks: eq.tasks.map(t => t.id === task.id ? { ...t, lastDone: logDate } : t)
    }));
    const eq = equipment.find(e => e.id === equipId);
    setHistory(prev => [{ id: Date.now(), date: logDate, equipName: eq.name, taskName: task.name, note: logNote }, ...prev]);
    setLogModal(null);
  }
  function addEquipment() {
    if (!newEquip.name.trim()) return;
    setEquipment(prev => [...prev, { id: Date.now(), ...newEquip, tasks: [] }]);
    setNewEquip({ name: "", brand: "", model: "", icon: "🔧" }); setShowAddEquip(false);
  }
  function searchParts(eq) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`${eq.brand} ${eq.model} parts buy online`)}`, "_blank");
  }

  // ── Reminder fns ──
  function toggleReminder(id) { setReminders(p => p.map(r => r.id === id ? { ...r, done: !r.done } : r)); }
  function deleteReminder(id) { setReminders(p => p.filter(r => r.id !== id)); }
  function addReminder() {
    if (!newReminder.text.trim()) return;
    setReminders(p => [...p, { id: Date.now(), ...newReminder, done: false }]);
    setNewReminder({ text: "", category: "General", dueDate: "", repeat: "none" }); setShowAddReminder(false);
  }

  // ── Property fns ──
  function togglePropertyTodo(id) { setPropertyTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function deletePropertyTodo(id) { setPropertyTodos(p => p.filter(t => t.id !== id)); }
  function addPropertyTodo() {
    if (!newTodo.title.trim()) return;
    setPropertyTodos(p => [...p, { id: Date.now(), ...newTodo, done: false, addedDate: new Date().toISOString().split("T")[0] }]);
    setNewTodo({ title: "", area: "Yard", priority: "Medium", notes: "" }); setShowAddProperty(false);
  }

  // ── Filtered reminders ──
  const filteredReminders = reminders.filter(r => (showDoneReminders || !r.done) && (reminderFilter === "All" || r.category === reminderFilter));
  const activeReminders = [...filteredReminders.filter(r => !r.done)].sort((a, b) => {
    const da = a.dueDate ? dueDateDiff(a.dueDate) : 9999;
    const db = b.dueDate ? dueDateDiff(b.dueDate) : 9999;
    return da - db;
  });
  const doneReminders = filteredReminders.filter(r => r.done);
  const reminderCatCounts = REMINDER_CATS.reduce((acc, cat) => {
    acc[cat] = reminders.filter(r => !r.done && r.category === cat).length; return acc;
  }, {});

  // ── Filtered property todos ──
  const filteredTodos = propertyTodos.filter(t => (showDoneProperty || !t.done) && (propertyFilter === "All" || t.area === propertyFilter));
  const activeTodos = [...filteredTodos.filter(t => !t.done)].sort((a, b) => {
    const order = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    return order[a.priority] - order[b.priority];
  });
  const doneTodos = filteredTodos.filter(t => t.done);
  const areaCounts = PROPERTY_AREAS.reduce((acc, area) => {
    acc[area] = propertyTodos.filter(t => !t.done && t.area === area).length; return acc;
  }, {});

  const currentEquip = selectedEquip ? equipment.find(e => e.id === selectedEquip) : null;

  return (
    <div style={S.app}>
      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <span style={S.logoIcon}>🏠</span>
            <div>
              <div style={S.logoTitle}>HomeKeep</div>
              <div style={S.logoSub}>Home & Property Management</div>
            </div>
          </div>
          <div style={S.headerStats}>
            {(overdueEquip) > 0 && <div style={{...S.chip, background:"#c0392b"}}>🚨 {overdueEquip} Overdue</div>}
            {dueSoonEquip > 0 && <div style={{...S.chip, background:"#d68910"}}>⏰ {dueSoonEquip} Due Soon</div>}
            {pendingReminders > 0 && <div style={{...S.chip, background:"#1a6e3c"}}>📋 {pendingReminders} Reminders</div>}
            {urgentPropertyTodos > 0 && <div style={{...S.chip, background:"#7b3fa0"}}>🏗️ {urgentPropertyTodos} Property</div>}
          </div>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <button style={{...S.navBtn,...(view==="dashboard"?S.navBtnActive:{})}} onClick={()=>{setView("dashboard");setSelectedEquip(null);}}>📊 Dashboard</button>
        <button style={{...S.navBtn,...(view==="log"?S.navBtnActive:{})}} onClick={()=>setView("log")}>📋 History</button>
      </nav>

      <main style={S.main}>

        {/* ══════════ DASHBOARD ══════════ */}
        {view === "dashboard" && !selectedEquip && (<div>

          {/* Urgent equipment banner */}
          {allTasks.filter(t => t.daysUntil <= 7).length > 0 && (
            <div style={S.urgentBanner}>
              <div style={S.urgentTitle}>⚠️ Equipment Needs Attention</div>
              {allTasks.filter(t => t.daysUntil <= 7).map(t => (
                <div key={`${t.equipId}-${t.id}`} style={S.urgentItem}>
                  <span>{t.equipIcon} <strong>{t.equipName}</strong> — {t.name}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <StatusBadge days={t.daysUntil}/>
                    <button style={S.doneBtn} onClick={()=>markEquipDone(t.equipId,t.id)}>✓ Log It</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SECTION 1: EQUIPMENT ── */}
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>🔧 Your Equipment</h2>
              <p style={S.sectionHint}>Click any card to view tasks and log maintenance</p>
            </div>
            <button style={S.addBtn} onClick={()=>setShowAddEquip(true)}>+ Add Equipment</button>
          </div>
          <div style={S.grid}>
            {equipment.map(eq => {
              const eqTasks = eq.tasks.map(t => ({...t, daysUntil: getDaysUntilDue(t.lastDone, t.intervalDays)}));
              const urgent = eqTasks.filter(t => t.daysUntil < 0).length;
              const soon = eqTasks.filter(t => t.daysUntil >= 0 && t.daysUntil <= 7).length;
              const nextTask = [...eqTasks].sort((a,b)=>a.daysUntil-b.daysUntil)[0];
              return (
                <div key={eq.id} style={{...S.card,...(urgent>0?S.cardUrgent:soon>0?S.cardSoon:{})}}
                  onClick={()=>{setSelectedEquip(eq.id);setView("detail");setActiveTab("tasks");}}>
                  <div style={S.cardIcon}>{eq.icon}</div>
                  <div style={S.cardBody}>
                    <div style={S.cardName}>{eq.name}</div>
                    <div style={S.cardModel}>{eq.brand} · {eq.model}</div>
                    {nextTask && <div style={S.cardNext}>Next: {nextTask.name} <StatusBadge days={nextTask.daysUntil}/></div>}
                    <div style={S.cardTaskCount}>{eq.tasks.length} maintenance tasks</div>
                  </div>
                  {(urgent>0||soon>0) && <div style={S.cardAlert}>{urgent>0?"🚨":"⏰"}</div>}
                </div>
              );
            })}
          </div>

          <div style={S.divider}/>

          {/* ── SECTION 2: HOUSEHOLD MAINTENANCE ── */}
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>🏡 Household Maintenance</h2>
              <p style={S.sectionHint}>Chores, reminders, and recurring tasks around the home</p>
            </div>
            <button style={S.addBtn} onClick={()=>setShowAddReminder(true)}>+ Add Reminder</button>
          </div>

          <div style={S.filterRow}>
            <button style={{...S.filterPill,...(reminderFilter==="All"?S.filterPillActive:{})}} onClick={()=>setReminderFilter("All")}>
              All <span style={S.pillCount}>{reminders.filter(r=>!r.done).length}</span>
            </button>
            {REMINDER_CATS.filter(cat => reminderCatCounts[cat] > 0 || reminderFilter === cat).map(cat => (
              <button key={cat} style={{...S.filterPill,...(reminderFilter===cat?S.filterPillActive:{})}}
                onClick={()=>setReminderFilter(reminderFilter===cat?"All":cat)}>
                <span style={{width:8,height:8,borderRadius:"50%",display:"inline-block",background:reminderFilter===cat?"white":reminderCatColors[cat]}}/>
                {cat} {reminderCatCounts[cat]>0&&<span style={S.pillCount}>{reminderCatCounts[cat]}</span>}
              </button>
            ))}
          </div>

          <div style={S.reminderList}>
            {activeReminders.length === 0 && (
              <div style={S.emptyState}>{reminderFilter!=="All"?`No pending "${reminderFilter}" reminders.`:"All caught up! Tap '+ Add Reminder' to create one."}</div>
            )}
            {activeReminders.map(r => {
              const diff = r.dueDate ? dueDateDiff(r.dueDate) : null;
              return (
                <div key={r.id} style={{...S.reminderRow,...(diff!==null&&diff<0?S.reminderOverdue:diff!==null&&diff<=3?S.reminderSoon:{})}}>
                  <button style={S.checkbox} onClick={()=>toggleReminder(r.id)}>✓</button>
                  <div style={S.reminderContent}>
                    <div style={S.reminderText}>{r.text}</div>
                    <div style={S.reminderMeta}>
                      <span style={{...S.categoryTag,background:reminderCatColors[r.category]||"#888"}}>{r.category}</span>
                      {r.dueDate && <DueDateBadge dueDate={r.dueDate}/>}
                      {r.repeat!=="none" && <span style={S.repeatTag}>🔁 {r.repeat}</span>}
                    </div>
                  </div>
                  <button style={S.deleteBtn} onClick={()=>deleteReminder(r.id)}>✕</button>
                </div>
              );
            })}
            {reminders.filter(r=>r.done).length > 0 && (
              <div>
                <button style={S.showDoneBtn} onClick={()=>setShowDoneReminders(!showDoneReminders)}>
                  {showDoneReminders?"▲ Hide":"▼ Show"} {reminders.filter(r=>r.done).length} completed
                </button>
                {showDoneReminders && doneReminders.map(r=>(
                  <div key={r.id} style={{...S.reminderRow,opacity:0.55}}>
                    <button style={{...S.checkbox,...S.checkboxDone}} onClick={()=>toggleReminder(r.id)}>✓</button>
                    <div style={S.reminderContent}>
                      <div style={{...S.reminderText,textDecoration:"line-through",color:"#aaa"}}>{r.text}</div>
                      <div style={S.reminderMeta}>
                        <span style={{...S.categoryTag,background:reminderCatColors[r.category]||"#888"}}>{r.category}</span>
                        <span style={S.doneTag}>✅ Completed</span>
                      </div>
                    </div>
                    <button style={S.deleteBtn} onClick={()=>deleteReminder(r.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={S.divider}/>

          {/* ── SECTION 3: PROPERTY MANAGEMENT ── */}
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>🏗️ Property Management</h2>
              <p style={S.sectionHint}>One-off jobs and repairs — no schedule needed, just get it done when you can</p>
            </div>
            <button style={S.addBtn} onClick={()=>setShowAddProperty(true)}>+ Add Job</button>
          </div>

          {/* Summary chips */}
          <div style={S.propertyStats}>
            {PROPERTY_PRIORITIES.slice().reverse().map(p => {
              const count = propertyTodos.filter(t => !t.done && t.priority === p).length;
              if (count === 0) return null;
              return (
                <div key={p} style={{...S.priorityStat, background: priorityColors[p]}}>
                  {p}: {count}
                </div>
              );
            })}
            {openPropertyTodos === 0 && <span style={{color:"#27ae60",fontSize:14}}>✅ All jobs complete!</span>}
          </div>

          {/* Area filter pills */}
          <div style={{...S.filterRow, marginTop: 10}}>
            <button style={{...S.filterPill,...(propertyFilter==="All"?S.filterPillActive:{})}} onClick={()=>setPropertyFilter("All")}>
              All <span style={S.pillCount}>{openPropertyTodos}</span>
            </button>
            {PROPERTY_AREAS.filter(area => areaCounts[area] > 0 || propertyFilter === area).map(area => (
              <button key={area} style={{...S.filterPill,...(propertyFilter===area?S.filterPillActive:{})}}
                onClick={()=>setPropertyFilter(propertyFilter===area?"All":area)}>
                <span style={{width:8,height:8,borderRadius:"50%",display:"inline-block",background:propertyFilter===area?"white":areaColors[area]}}/>
                {area} {areaCounts[area]>0&&<span style={S.pillCount}>{areaCounts[area]}</span>}
              </button>
            ))}
          </div>

          {/* Property to-do list */}
          <div style={S.todoList}>
            {activeTodos.length === 0 && (
              <div style={S.emptyState}>{propertyFilter!=="All"?`No open jobs in "${propertyFilter}".`:"No property jobs yet. Tap '+ Add Job' to log one."}</div>
            )}
            {activeTodos.map(todo => (
              <div key={todo.id} style={S.todoCard}>
                <div style={S.todoTop}>
                  {/* Checkbox */}
                  <button style={S.checkbox} onClick={()=>togglePropertyTodo(todo.id)} title="Mark complete">✓</button>
                  <div style={S.todoMain}>
                    <div style={S.todoTitle}>{todo.title}</div>
                    <div style={S.todoMeta}>
                      <span style={{...S.categoryTag, background: areaColors[todo.area]||"#888"}}>{todo.area}</span>
                      <span style={{...S.priorityBadge, background: priorityColors[todo.priority]}}>{todo.priority} Priority</span>
                      <span style={S.addedDate}>Added {new Date(todo.addedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={S.todoActions}>
                    {todo.notes && (
                      <button style={S.notesToggle} onClick={()=>setExpandedTodo(expandedTodo===todo.id?null:todo.id)}>
                        {expandedTodo===todo.id?"▲":"▼"} Notes
                      </button>
                    )}
                    <button style={S.deleteBtn} onClick={()=>deletePropertyTodo(todo.id)}>✕</button>
                  </div>
                </div>
                {/* Expanded notes */}
                {expandedTodo === todo.id && todo.notes && (
                  <div style={S.todoNotes}>📝 {todo.notes}</div>
                )}
              </div>
            ))}

            {/* Completed jobs toggle */}
            {propertyTodos.filter(t=>t.done).length > 0 && (
              <div>
                <button style={S.showDoneBtn} onClick={()=>setShowDoneProperty(!showDoneProperty)}>
                  {showDoneProperty?"▲ Hide":"▼ Show"} {propertyTodos.filter(t=>t.done).length} completed jobs
                </button>
                {showDoneProperty && doneTodos.map(todo=>(
                  <div key={todo.id} style={{...S.todoCard, opacity:0.55}}>
                    <div style={S.todoTop}>
                      <button style={{...S.checkbox,...S.checkboxDone}} onClick={()=>togglePropertyTodo(todo.id)}>✓</button>
                      <div style={S.todoMain}>
                        <div style={{...S.todoTitle,textDecoration:"line-through",color:"#aaa"}}>{todo.title}</div>
                        <div style={S.todoMeta}>
                          <span style={{...S.categoryTag,background:areaColors[todo.area]||"#888"}}>{todo.area}</span>
                          <span style={S.doneTag}>✅ Completed</span>
                        </div>
                      </div>
                      <button style={S.deleteBtn} onClick={()=>deletePropertyTodo(todo.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── MODALS ── */}
          {showAddEquip && (
            <div style={S.modalOverlay} onClick={()=>setShowAddEquip(false)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>Add New Equipment</h3>
                <div style={S.formGroup}><label style={S.label}>Equipment Name *</label>
                  <input style={S.input} placeholder="e.g. Riding Mower" value={newEquip.name} onChange={e=>setNewEquip({...newEquip,name:e.target.value})}/></div>
                <div style={S.formGroup}><label style={S.label}>Brand</label>
                  <input style={S.input} placeholder="e.g. Husqvarna" value={newEquip.brand} onChange={e=>setNewEquip({...newEquip,brand:e.target.value})}/></div>
                <div style={S.formGroup}><label style={S.label}>Model Number</label>
                  <input style={S.input} placeholder="e.g. YTH18542" value={newEquip.model} onChange={e=>setNewEquip({...newEquip,model:e.target.value})}/></div>
                <div style={S.formGroup}><label style={S.label}>Icon</label>
                  <div style={S.iconPicker}>
                    {["🔧","🌿","❄️","⚡","💧","🚗","🏊","🌡️","🔥","🏠","🛠️","⛽"].map(icon=>(
                      <button key={icon} style={{...S.iconBtn,...(newEquip.icon===icon?S.iconBtnActive:{})}} onClick={()=>setNewEquip({...newEquip,icon})}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div style={S.modalActions}>
                  <button style={S.cancelBtn} onClick={()=>setShowAddEquip(false)}>Cancel</button>
                  <button style={S.saveBtn} onClick={addEquipment}>Add Equipment</button>
                </div>
              </div>
            </div>
          )}

          {showAddReminder && (
            <div style={S.modalOverlay} onClick={()=>setShowAddReminder(false)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>🏡 Add Household Reminder</h3>
                <div style={S.formGroup}><label style={S.label}>What needs to be done? *</label>
                  <input style={S.input} placeholder="e.g. Clean out the gutters" value={newReminder.text} onChange={e=>setNewReminder({...newReminder,text:e.target.value})}/></div>
                <div style={S.formGroup}><label style={S.label}>Category</label>
                  <div style={S.iconPicker}>
                    {REMINDER_CATS.map(cat=>(
                      <button key={cat} style={{...S.catBtn,background:newReminder.category===cat?reminderCatColors[cat]:"#f0ece4",color:newReminder.category===cat?"white":"#444",border:`2px solid ${newReminder.category===cat?reminderCatColors[cat]:"transparent"}`}}
                        onClick={()=>setNewReminder({...newReminder,category:cat})}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div style={S.formGroup}><label style={S.label}>Due Date (optional)</label>
                  <input type="date" style={S.input} value={newReminder.dueDate} onChange={e=>setNewReminder({...newReminder,dueDate:e.target.value})}/></div>
                <div style={S.formGroup}><label style={S.label}>Repeats</label>
                  <select style={S.input} value={newReminder.repeat} onChange={e=>setNewReminder({...newReminder,repeat:e.target.value})}>
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="seasonally">Seasonally</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div style={S.modalActions}>
                  <button style={S.cancelBtn} onClick={()=>setShowAddReminder(false)}>Cancel</button>
                  <button style={S.saveBtn} onClick={addReminder}>Add Reminder</button>
                </div>
              </div>
            </div>
          )}

          {showAddProperty && (
            <div style={S.modalOverlay} onClick={()=>setShowAddProperty(false)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>🏗️ Add Property Job</h3>
                <p style={S.modalDesc}>Log a repair, project, or one-off task on your property.</p>
                <div style={S.formGroup}><label style={S.label}>What needs to be done? *</label>
                  <input style={S.input} placeholder="e.g. Remove fallen tree near fence" value={newTodo.title} onChange={e=>setNewTodo({...newTodo,title:e.target.value})}/></div>
                <div style={S.formGroup}><label style={S.label}>Area of Property</label>
                  <div style={S.iconPicker}>
                    {PROPERTY_AREAS.map(area=>(
                      <button key={area} style={{...S.catBtn,background:newTodo.area===area?areaColors[area]:"#f0ece4",color:newTodo.area===area?"white":"#444",border:`2px solid ${newTodo.area===area?areaColors[area]:"transparent"}`}}
                        onClick={()=>setNewTodo({...newTodo,area})}>{area}</button>
                    ))}
                  </div>
                </div>
                <div style={S.formGroup}><label style={S.label}>Priority</label>
                  <div style={{display:"flex",gap:8}}>
                    {PROPERTY_PRIORITIES.map(p=>(
                      <button key={p} style={{...S.catBtn,flex:1,background:newTodo.priority===p?priorityColors[p]:"#f0ece4",color:newTodo.priority===p?"white":"#444",border:`2px solid ${newTodo.priority===p?priorityColors[p]:"transparent"}`}}
                        onClick={()=>setNewTodo({...newTodo,priority:p})}>{p}</button>
                    ))}
                  </div>
                </div>
                <div style={S.formGroup}><label style={S.label}>Notes (optional)</label>
                  <textarea style={{...S.input,height:70,resize:"vertical"}} placeholder="e.g. May need to rent a chainsaw, get 3 quotes first..."
                    value={newTodo.notes} onChange={e=>setNewTodo({...newTodo,notes:e.target.value})}/></div>
                <div style={S.modalActions}>
                  <button style={S.cancelBtn} onClick={()=>setShowAddProperty(false)}>Cancel</button>
                  <button style={S.saveBtn} onClick={addPropertyTodo}>Add Job</button>
                </div>
              </div>
            </div>
          )}

        </div>)}

        {/* ══════════ EQUIPMENT DETAIL ══════════ */}
        {view === "detail" && currentEquip && (<div>
          <button style={S.backBtn} onClick={()=>{setSelectedEquip(null);setView("dashboard");}}>← Back to Dashboard</button>
          <div style={S.detailHeader}>
            <span style={S.detailIcon}>{currentEquip.icon}</span>
            <div>
              <h2 style={S.detailTitle}>{currentEquip.name}</h2>
              <div style={S.detailModel}>{currentEquip.brand} · Model: <strong>{currentEquip.model}</strong></div>
            </div>
            <button style={S.partsBtn} onClick={()=>searchParts(currentEquip)}>🔍 Find Parts Online</button>
          </div>
          <div style={S.tabs}>
            <button style={{...S.tab,...(activeTab==="tasks"?S.tabActive:{})}} onClick={()=>setActiveTab("tasks")}>Maintenance Tasks</button>
            <button style={{...S.tab,...(activeTab==="history"?S.tabActive:{})}} onClick={()=>setActiveTab("history")}>History</button>
          </div>
          {activeTab === "tasks" && (
            <div style={S.taskList}>
              {currentEquip.tasks.length===0 && <div style={S.emptyState}>No tasks yet.</div>}
              {currentEquip.tasks.map(task => {
                const days = getDaysUntilDue(task.lastDone, task.intervalDays);
                const due = getDueDate(task.lastDone, task.intervalDays);
                return (
                  <div key={task.id} style={{...S.taskRow,...(days<0?S.taskOverdue:days<=7?S.taskSoon:{})}}>
                    <div style={S.taskInfo}>
                      <div style={S.taskName}>{task.name}</div>
                      <div style={S.taskMeta}>Every {task.intervalDays} days · Last done: {new Date(task.lastDone).toLocaleDateString()} · Due: {due.toLocaleDateString()}</div>
                    </div>
                    <div style={S.taskActions}>
                      <StatusBadge days={days}/>
                      <button style={S.doneBtn} onClick={()=>markEquipDone(currentEquip.id,task.id)}>✓ Log Done</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === "history" && (
            <div>
              {history.filter(h=>h.equipName===currentEquip.name).length===0
                ? <div style={S.emptyState}>No history yet for this equipment.</div>
                : history.filter(h=>h.equipName===currentEquip.name).map(h=>(
                  <div key={h.id} style={S.historyRow}>
                    <div style={S.historyDate}>{new Date(h.date).toLocaleDateString()}</div>
                    <div style={S.historyTask}>{h.taskName}</div>
                    {h.note && <div style={S.historyNote}>📝 {h.note}</div>}
                  </div>
                ))
              }
            </div>
          )}
        </div>)}

        {/* ══════════ HISTORY ══════════ */}
        {view === "log" && (<div>
          <h2 style={S.sectionTitle}>📋 Maintenance History</h2>
          <p style={S.sectionHint}>A log of all equipment maintenance you've recorded</p>
          {history.length===0
            ? <div style={S.emptyState}>No history yet! Log a completed task on any equipment to see it here.</div>
            : history.map(h=>(
              <div key={h.id} style={S.historyRow}>
                <div style={S.historyDate}>{new Date(h.date).toLocaleDateString()}</div>
                <div><span style={S.historyEquip}>{h.equipName}</span><span style={S.historyTask}> · {h.taskName}</span></div>
                {h.note && <div style={S.historyNote}>📝 {h.note}</div>}
              </div>
            ))
          }
        </div>)}
      </main>

      {/* Log Modal */}
      {logModal && (
        <div style={S.modalOverlay} onClick={()=>setLogModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <h3 style={S.modalTitle}>✓ Log Maintenance</h3>
            <p style={S.modalDesc}>Recording: <strong>{logModal.task.name}</strong></p>
            <div style={S.formGroup}><label style={S.label}>Date Completed</label>
              <input type="date" style={S.input} value={logDate} onChange={e=>setLogDate(e.target.value)}/></div>
            <div style={S.formGroup}><label style={S.label}>Notes (optional)</label>
              <textarea style={{...S.input,height:80,resize:"vertical"}} placeholder="e.g. Used Mobil 1 10W-30..."
                value={logNote} onChange={e=>setLogNote(e.target.value)}/></div>
            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={()=>setLogModal(null)}>Cancel</button>
              <button style={S.saveBtn} onClick={submitLog}>Save Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Georgia', serif", background: "#f4f1ec", minHeight: "100vh", color: "#2c2416" },
  header: { background: "#2c2416", color: "#f4f1ec", padding: "16px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  headerInner: { maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  logo: { display: "flex", gap: 12, alignItems: "center" },
  logoIcon: { fontSize: 32 },
  logoTitle: { fontSize: 22, fontWeight: "bold", letterSpacing: 1 },
  logoSub: { fontSize: 12, opacity: 0.7 },
  headerStats: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: { padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: "bold", color: "white" },
  nav: { background: "#3d3426", display: "flex", gap: 4, padding: "8px 24px", overflowX: "auto" },
  navBtn: { background: "none", border: "none", color: "#c8b99a", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", whiteSpace: "nowrap" },
  navBtnActive: { background: "#f4f1ec", color: "#2c2416", fontWeight: "bold" },
  main: { maxWidth: 960, margin: "0 auto", padding: "24px 16px" },
  urgentBanner: { background: "#fff3cd", border: "2px solid #f0a500", borderRadius: 10, padding: 16, marginBottom: 28 },
  urgentTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 10, color: "#7a4f00" },
  urgentItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #f0d080", flexWrap: "wrap", gap: 8 },
  divider: { borderTop: "2px solid #ddd8cc", margin: "40px 0 32px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", margin: "0 0 4px" },
  sectionHint: { color: "#999", fontSize: 13, margin: "0 0 16px" },
  addBtn: { background: "#2c2416", color: "#f4f1ec", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap", flexShrink: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 4 },
  card: { background: "white", borderRadius: 12, padding: 20, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", gap: 14, alignItems: "flex-start", border: "2px solid transparent", position: "relative" },
  cardUrgent: { border: "2px solid #c0392b", background: "#fff8f8" },
  cardSoon: { border: "2px solid #f0a500", background: "#fffdf5" },
  cardIcon: { fontSize: 36, lineHeight: 1 },
  cardBody: { flex: 1 },
  cardName: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  cardModel: { fontSize: 12, color: "#888", marginBottom: 6 },
  cardNext: { fontSize: 13, marginBottom: 4 },
  cardTaskCount: { fontSize: 12, color: "#aaa" },
  cardAlert: { fontSize: 20 },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  filterPill: { background: "#e8e3d8", border: "none", borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif", color: "#555", display: "flex", alignItems: "center", gap: 5 },
  filterPillActive: { background: "#2c2416", color: "white" },
  pillCount: { background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "1px 6px", fontSize: 11 },
  reminderList: { display: "flex", flexDirection: "column", gap: 8 },
  reminderRow: { background: "white", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  reminderOverdue: { background: "#fff0f0", border: "1px solid #f5c6cb" },
  reminderSoon: { background: "#fff9e6", border: "1px solid #ffd970" },
  checkbox: { width: 28, height: 28, minWidth: 28, borderRadius: 6, border: "2px solid #ccc", background: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold", color: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  checkboxDone: { background: "#2c7a2c", border: "2px solid #2c7a2c", color: "white" },
  reminderContent: { flex: 1, minWidth: 0 },
  reminderText: { fontSize: 15, fontWeight: "500", marginBottom: 5 },
  reminderMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  categoryTag: { color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: "bold" },
  repeatTag: { fontSize: 11, color: "#888", background: "#f0f0f0", padding: "2px 7px", borderRadius: 10 },
  doneTag: { fontSize: 11, background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 10 },
  deleteBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "4px 6px", borderRadius: 4, flexShrink: 0 },
  showDoneBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, padding: "8px 0", fontFamily: "Georgia, serif" },
  // Property section
  propertyStats: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  priorityStat: { color: "white", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: "bold" },
  todoList: { display: "flex", flexDirection: "column", gap: 10 },
  todoCard: { background: "white", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" },
  todoTop: { padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 },
  todoMain: { flex: 1, minWidth: 0 },
  todoTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6, lineHeight: 1.4 },
  todoMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  priorityBadge: { color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: "bold" },
  addedDate: { fontSize: 11, color: "#aaa" },
  todoActions: { display: "flex", gap: 4, alignItems: "center", flexShrink: 0 },
  notesToggle: { background: "none", border: "1px solid #ddd", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 12, color: "#666", fontFamily: "Georgia, serif" },
  todoNotes: { background: "#f9f6f0", borderTop: "1px solid #ede8df", padding: "10px 16px", fontSize: 13, color: "#555", lineHeight: 1.5 },
  // Equipment detail
  backBtn: { background: "none", border: "1px solid #ccc", padding: "6px 14px", borderRadius: 6, cursor: "pointer", marginBottom: 20, fontSize: 14 },
  detailHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  detailIcon: { fontSize: 48 },
  detailTitle: { margin: 0, fontSize: 24 },
  detailModel: { color: "#666", fontSize: 14 },
  partsBtn: { marginLeft: "auto", background: "#2c7a2c", color: "white", border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold" },
  tabs: { display: "flex", gap: 4, marginBottom: 16, borderBottom: "2px solid #ddd" },
  tab: { background: "none", border: "none", padding: "10px 20px", cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", color: "#888" },
  tabActive: { color: "#2c2416", fontWeight: "bold", borderBottom: "3px solid #2c2416", marginBottom: -2 },
  taskList: { display: "flex", flexDirection: "column", gap: 10 },
  taskRow: { background: "white", borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", flexWrap: "wrap" },
  taskOverdue: { background: "#fff0f0", border: "1px solid #f5c6cb" },
  taskSoon: { background: "#fff9e6", border: "1px solid #ffd970" },
  taskInfo: { flex: 1 },
  taskName: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
  taskMeta: { fontSize: 12, color: "#888" },
  taskActions: { display: "flex", gap: 8, alignItems: "center" },
  doneBtn: { background: "#2c7a2c", color: "white", border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: "bold" },
  historyRow: { background: "white", borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  historyDate: { fontSize: 12, color: "#888", marginBottom: 4 },
  historyEquip: { fontWeight: "bold" },
  historyTask: { color: "#444" },
  historyNote: { fontSize: 13, color: "#666", marginTop: 4, fontStyle: "italic" },
  emptyState: { textAlign: "center", padding: 40, color: "#aaa", fontSize: 15, background: "white", borderRadius: 10 },
  badgeOverdue: { background: "#c0392b", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" },
  badgeSoon: { background: "#f0a500", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" },
  badgeUpcoming: { background: "#3498db", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" },
  badgeOk: { background: "#27ae60", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "white", borderRadius: 14, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 8px", fontSize: 20 },
  modalDesc: { color: "#555", marginBottom: 16, fontSize: 14 },
  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: "bold", marginBottom: 6, color: "#444" },
  input: { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, fontFamily: "Georgia, serif", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },
  cancelBtn: { background: "none", border: "1px solid #ccc", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  saveBtn: { background: "#2c2416", color: "white", border: "none", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: "bold" },
  iconPicker: { display: "flex", gap: 8, flexWrap: "wrap" },
  iconBtn: { fontSize: 22, background: "#f0ece4", border: "2px solid transparent", borderRadius: 8, padding: "6px 10px", cursor: "pointer" },
  iconBtnActive: { border: "2px solid #2c2416" },
  catBtn: { padding: "5px 12px", borderRadius: 16, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif" },
};
