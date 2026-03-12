import React, { useState, useEffect, useRef } from "react";

// ─── SAMPLE DATA ─────────────────────────────────────────────
const initialEquipment = [
  { id: 1, name: "Lawn Mower", brand: "Honda", model: "HRX217VKA", serial: "MAGA-1234567", icon: "🌿", photo: null,
    tasks: [
      { id: 1, name: "Change oil", intervalDays: 90, lastDone: "2025-12-10" },
      { id: 2, name: "Replace air filter", intervalDays: 180, lastDone: "2025-09-01" },
      { id: 3, name: "Sharpen blade", intervalDays: 60, lastDone: "2025-11-15" },
      { id: 4, name: "Replace spark plug", intervalDays: 365, lastDone: "2025-03-01" },
    ]},
  { id: 2, name: "HVAC System", brand: "Carrier", model: "24ACC636A003", serial: "CARR-9876543", icon: "❄️", photo: null,
    tasks: [
      { id: 1, name: "Replace air filter", intervalDays: 30, lastDone: "2026-02-10" },
      { id: 2, name: "Clean condenser coils", intervalDays: 365, lastDone: "2025-05-01" },
      { id: 3, name: "Check refrigerant", intervalDays: 365, lastDone: "2025-05-01" },
    ]},
  { id: 3, name: "Generator", brand: "Generac", model: "GP3500iO", serial: "GENR-5551234", icon: "⚡", photo: null,
    tasks: [
      { id: 1, name: "Change oil", intervalDays: 180, lastDone: "2025-10-01" },
      { id: 2, name: "Run test cycle", intervalDays: 30, lastDone: "2026-02-01" },
      { id: 3, name: "Replace spark plug", intervalDays: 365, lastDone: "2025-06-01" },
    ]},
  { id: 4, name: "Pressure Washer", brand: "Ryobi", model: "RY142300", serial: "RYOB-7778901", icon: "💧", photo: null,
    tasks: [
      { id: 1, name: "Inspect hoses & fittings", intervalDays: 90, lastDone: "2025-12-01" },
      { id: 2, name: "Flush pump with cleaner", intervalDays: 180, lastDone: "2025-09-01" },
    ]},
];

const REMINDER_CATS = ["General", "Weekly", "Monthly", "Seasonal", "Garage", "Yard", "Indoor"];
const reminderCatColors = {
  General: "#64748b", Weekly: "#3b82f6", Monthly: "#8b5cf6",
  Seasonal: "#f59e0b", Garage: "#78716c", Yard: "#22c55e", Indoor: "#06b6d4"
};
const initialReminders = [
  { id: 1, text: "Take out the trash", category: "Weekly", done: false, dueDate: "", repeat: "weekly", photo: null },
  { id: 2, text: "Clean up garage", category: "Garage", done: false, dueDate: "", repeat: "none", photo: null },
  { id: 3, text: "Replace smoke detector batteries", category: "Monthly", done: false, dueDate: "2026-04-01", repeat: "none", photo: null },
  { id: 4, text: "Check gutters for debris", category: "Seasonal", done: false, dueDate: "2026-04-15", repeat: "none", photo: null },
  { id: 5, text: "Vacuum and dust living room", category: "Weekly", done: false, dueDate: "", repeat: "weekly", photo: null },
  { id: 6, text: "Deep clean kitchen appliances", category: "Monthly", done: false, dueDate: "2026-03-20", repeat: "none", photo: null },
];

const PROPERTY_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const priorityColors = { Low: "#22c55e", Medium: "#3b82f6", High: "#f59e0b", Urgent: "#ef4444" };
const PROPERTY_AREAS = ["Yard", "Driveway", "Roof", "Foundation", "Fencing", "Exterior", "Drainage", "Other"];
const areaColors = {
  Yard: "#22c55e", Driveway: "#78716c", Roof: "#3b82f6", Foundation: "#8b5cf6",
  Fencing: "#ec4899", Exterior: "#06b6d4", Drainage: "#0ea5e9", Other: "#64748b"
};
const initialPropertyTodos = [
  { id: 1, title: "Remove fallen tree near fence", area: "Yard", priority: "High", done: false, notes: "Large oak fell during last storm. May need chainsaw rental.", addedDate: "2026-01-15", photo: null },
  { id: 2, title: "Repair driveway pothole", area: "Driveway", priority: "Medium", done: false, notes: "Two potholes near the garage entrance. Get cold-patch asphalt.", addedDate: "2026-02-01", photo: null },
  { id: 3, title: "Fix sagging fence panel — east side", area: "Fencing", priority: "Medium", done: false, notes: "", addedDate: "2026-02-10", photo: null },
  { id: 4, title: "Reseal around back door frame", area: "Exterior", priority: "High", done: false, notes: "Caulk is cracking and pulling away. Draft coming through.", addedDate: "2026-01-20", photo: null },
  { id: 5, title: "Clear drainage ditch at back of property", area: "Drainage", priority: "Low", done: false, notes: "Gets blocked with leaves every fall.", addedDate: "2025-11-01", photo: null },
];

// ─── HELPERS ─────────────────────────────────────────────────
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
function readPhotoAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function StatusBadge({ days }) {
  if (days < 0) return <span style={{...S.badge, background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca"}}>Overdue {Math.abs(days)}d</span>;
  if (days <= 7) return <span style={{...S.badge, background:"#fef3c7", color:"#d97706", border:"1px solid #fde68a"}}>Due in {days}d</span>;
  if (days <= 30) return <span style={{...S.badge, background:"#dbeafe", color:"#2563eb", border:"1px solid #bfdbfe"}}>In {days}d</span>;
  return <span style={{...S.badge, background:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0"}}>In {days}d</span>;
}
function DueDateBadge({ dueDate }) {
  const diff = dueDateDiff(dueDate);
  if (diff === null) return null;
  if (diff < 0) return <span style={{...S.badge, background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca"}}>Overdue {Math.abs(diff)}d</span>;
  if (diff <= 3) return <span style={{...S.badge, background:"#fef3c7", color:"#d97706", border:"1px solid #fde68a"}}>Due in {diff}d</span>;
  return <span style={{...S.badge, background:"#dbeafe", color:"#2563eb", border:"1px solid #bfdbfe"}}>Due {new Date(dueDate).toLocaleDateString()}</span>;
}

function PhotoUpload({ currentPhoto, onPhotoChange, small }) {
  const inputRef = useRef();
  return (
    <div style={small ? S.photoThumbWrap : S.photoUploadWrap}>
      {currentPhoto ? (
        <div style={{position:"relative", display:"inline-block"}}>
          <img src={currentPhoto} alt="attached" style={small ? S.photoThumb : S.photoFull} />
          <button style={S.photoRemoveBtn} onClick={()=>onPhotoChange(null)} title="Remove photo">✕</button>
        </div>
      ) : (
        <button style={small ? S.photoAddSmall : S.photoAddBtn} onClick={()=>inputRef.current.click()}>
          📷 {small ? "" : "Add Photo"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
        onChange={async(e)=>{ if(e.target.files[0]){ const b64 = await readPhotoAsBase64(e.target.files[0]); onPhotoChange(b64); }}} />
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────
export default function App() {
  // Equipment
  const [equipment, setEquipment] = useState(() => { try { const s = localStorage.getItem("hk_equipment"); return s ? JSON.parse(s) : initialEquipment; } catch(e) { return initialEquipment; }});
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [view, setView] = useState("dashboard");
  const [history, setHistory] = useState(() => { try { const s = localStorage.getItem("hk_history"); return s ? JSON.parse(s) : []; } catch(e) { return []; }});
  const [logModal, setLogModal] = useState(null);
  const [logNote, setLogNote] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAddEquip, setShowAddEquip] = useState(false);
  const [newEquip, setNewEquip] = useState({ name: "", brand: "", model: "", serial: "", icon: "🔧", photo: null });
  const [activeTab, setActiveTab] = useState("tasks");
  const [editEquip, setEditEquip] = useState(null);
  const [deleteEquipId, setDeleteEquipId] = useState(null);

  // Reminders
  const [reminders, setReminders] = useState(() => { try { const s = localStorage.getItem("hk_reminders"); return s ? JSON.parse(s) : initialReminders; } catch(e) { return initialReminders; }});
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ text: "", category: "General", dueDate: "", repeat: "none", photo: null });
  const [reminderFilter, setReminderFilter] = useState("All");
  const [showDoneReminders, setShowDoneReminders] = useState(false);

  // Property
  const [propertyTodos, setPropertyTodos] = useState(() => { try { const s = localStorage.getItem("hk_property"); return s ? JSON.parse(s) : initialPropertyTodos; } catch(e) { return initialPropertyTodos; }});
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", area: "Yard", priority: "Medium", notes: "", photo: null });
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [showDoneProperty, setShowDoneProperty] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState(null);

  // Auto-save
  useEffect(() => { localStorage.setItem("hk_equipment", JSON.stringify(equipment)); }, [equipment]);
  useEffect(() => { localStorage.setItem("hk_reminders", JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem("hk_property", JSON.stringify(propertyTodos)); }, [propertyTodos]);
  useEffect(() => { localStorage.setItem("hk_history", JSON.stringify(history)); }, [history]);

  // Computed
  const allTasks = equipment.flatMap(eq =>
    eq.tasks.map(t => ({ ...t, equipId: eq.id, equipName: eq.name, equipIcon: eq.icon,
      daysUntil: getDaysUntilDue(t.lastDone, t.intervalDays) }))
  ).sort((a, b) => a.daysUntil - b.daysUntil);

  const overdueEquip = allTasks.filter(t => t.daysUntil < 0).length;
  const dueSoonEquip = allTasks.filter(t => t.daysUntil >= 0 && t.daysUntil <= 7).length;
  const pendingReminders = reminders.filter(r => !r.done).length;
  const openPropertyTodos = propertyTodos.filter(t => !t.done).length;
  const urgentPropertyTodos = propertyTodos.filter(t => !t.done && (t.priority === "Urgent" || t.priority === "High")).length;

  // Equipment fns
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
    setNewEquip({ name: "", brand: "", model: "", serial: "", icon: "🔧", photo: null }); setShowAddEquip(false);
  }
  function deleteEquipment(id) { setEquipment(prev => prev.filter(e => e.id !== id)); setDeleteEquipId(null); }
  function saveEditEquip() {
    if (!editEquip.name.trim()) return;
    setEquipment(prev => prev.map(e => e.id === editEquip.id ? {...e, ...editEquip} : e));
    setEditEquip(null);
  }
  function searchParts(eq) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`${eq.brand} ${eq.model} parts buy online`)}`, "_blank");
  }

  // Reminder fns
  function toggleReminder(id) { setReminders(p => p.map(r => r.id === id ? { ...r, done: !r.done } : r)); }
  function deleteReminder(id) { setReminders(p => p.filter(r => r.id !== id)); }
  function addReminder() {
    if (!newReminder.text.trim()) return;
    setReminders(p => [...p, { id: Date.now(), ...newReminder, done: false }]);
    setNewReminder({ text: "", category: "General", dueDate: "", repeat: "none", photo: null }); setShowAddReminder(false);
  }

  // Property fns
  function togglePropertyTodo(id) { setPropertyTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function deletePropertyTodo(id) { setPropertyTodos(p => p.filter(t => t.id !== id)); }
  function addPropertyTodo() {
    if (!newTodo.title.trim()) return;
    setPropertyTodos(p => [...p, { id: Date.now(), ...newTodo, done: false, addedDate: new Date().toISOString().split("T")[0] }]);
    setNewTodo({ title: "", area: "Yard", priority: "Medium", notes: "", photo: null }); setShowAddProperty(false);
  }

  // Filtered reminders
  const filteredReminders = reminders.filter(r => (showDoneReminders || !r.done) && (reminderFilter === "All" || r.category === reminderFilter));
  const activeReminders = [...filteredReminders.filter(r => !r.done)].sort((a,b) => {
    const da = a.dueDate ? dueDateDiff(a.dueDate) : 9999;
    const db = b.dueDate ? dueDateDiff(b.dueDate) : 9999;
    return da - db;
  });
  const doneReminders = filteredReminders.filter(r => r.done);
  const reminderCatCounts = REMINDER_CATS.reduce((acc, cat) => {
    acc[cat] = reminders.filter(r => !r.done && r.category === cat).length; return acc;
  }, {});

  // Filtered property todos
  const filteredTodos = propertyTodos.filter(t => (showDoneProperty || !t.done) && (propertyFilter === "All" || t.area === propertyFilter));
  const activeTodos = [...filteredTodos.filter(t => !t.done)].sort((a,b) => {
    const order = { Urgent:0, High:1, Medium:2, Low:3 };
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
            <div style={S.logoIconWrap}>🏠</div>
            <div>
              <div style={S.logoTitle}>HomeKeep</div>
              <div style={S.logoSub}>Home & Property Management</div>
            </div>
          </div>
          <div style={S.headerStats}>
            {overdueEquip > 0 && <div style={{...S.chip, background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca"}}>🚨 {overdueEquip} Overdue</div>}
            {dueSoonEquip > 0 && <div style={{...S.chip, background:"#fef3c7", color:"#d97706", border:"1px solid #fde68a"}}>⏰ {dueSoonEquip} Due Soon</div>}
            {pendingReminders > 0 && <div style={{...S.chip, background:"#dbeafe", color:"#2563eb", border:"1px solid #bfdbfe"}}>📋 {pendingReminders} Reminders</div>}
            {urgentPropertyTodos > 0 && <div style={{...S.chip, background:"#f3e8ff", color:"#7c3aed", border:"1px solid #e9d5ff"}}>🏗️ {urgentPropertyTodos} Property</div>}
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

          {/* Urgent banner */}
          {allTasks.filter(t => t.daysUntil <= 7).length > 0 && (
            <div style={S.urgentBanner}>
              <div style={S.urgentTitle}>⚠️ Equipment Needs Attention</div>
              {allTasks.filter(t => t.daysUntil <= 7).map(t => (
                <div key={`${t.equipId}-${t.id}`} style={S.urgentItem}>
                  <span style={{fontSize:14}}>{t.equipIcon} <strong>{t.equipName}</strong> — {t.name}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <StatusBadge days={t.daysUntil}/>
                    <button style={S.logBtn} onClick={()=>markEquipDone(t.equipId,t.id)}>✓ Log It</button>
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
              const allGood = urgent === 0 && soon === 0;
              return (
                <div key={eq.id} style={{...S.card,...(urgent>0?S.cardUrgent:soon>0?S.cardSoon:S.cardGood)}}>
                  {/* Photo strip */}
                  {eq.photo && <img src={eq.photo} alt={eq.name} style={S.cardPhotoStrip}/>}
                  <div style={S.cardContent} onClick={()=>{setSelectedEquip(eq.id);setView("detail");setActiveTab("tasks");}}>
                    <div style={S.cardTopRow}>
                      <span style={S.cardIconLg}>{eq.icon}</span>
                      <div style={{width:10,height:10,borderRadius:"50%",background:urgent>0?"#ef4444":soon>0?"#f59e0b":"#22c55e"}}/>
                    </div>
                    <div style={S.cardName}>{eq.name}</div>
                    <div style={S.cardModel}>{eq.brand} · {eq.model}</div>
                    {eq.serial && <div style={S.cardSerial}>S/N: {eq.serial}</div>}
                    {nextTask && <div style={S.cardNext}><StatusBadge days={nextTask.daysUntil}/> {nextTask.name}</div>}
                    <div style={S.cardTaskCount}>{eq.tasks.length} tasks</div>
                  </div>
                  <div style={S.cardActions}>
                    <PhotoUpload small currentPhoto={eq.photo} onPhotoChange={photo=>setEquipment(p=>p.map(e=>e.id===eq.id?{...e,photo}:e))}/>
                    <button style={S.iconActionBtn} onClick={e=>{e.stopPropagation();setEditEquip({...eq});}} title="Edit">✏️</button>
                    <button style={S.iconActionBtn} onClick={e=>{e.stopPropagation();setDeleteEquipId(eq.id);}} title="Delete">🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={S.divider}/>

          {/* ── SECTION 2: HOUSEHOLD ── */}
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>🏡 Household Maintenance</h2>
              <p style={S.sectionHint}>Chores, reminders, and recurring tasks around the home</p>
            </div>
            <button style={S.addBtn} onClick={()=>setShowAddReminder(true)}>+ Add Reminder</button>
          </div>

          <div style={S.filterRow}>
            <button style={{...S.pill,...(reminderFilter==="All"?S.pillActive:{})}} onClick={()=>setReminderFilter("All")}>
              All <span style={S.pillBadge}>{reminders.filter(r=>!r.done).length}</span>
            </button>
            {REMINDER_CATS.filter(cat=>reminderCatCounts[cat]>0||reminderFilter===cat).map(cat=>(
              <button key={cat} style={{...S.pill,...(reminderFilter===cat?S.pillActive:{})}} onClick={()=>setReminderFilter(reminderFilter===cat?"All":cat)}>
                <span style={{width:7,height:7,borderRadius:"50%",background:reminderFilter===cat?"white":reminderCatColors[cat],display:"inline-block",flexShrink:0}}/>
                {cat} {reminderCatCounts[cat]>0&&<span style={S.pillBadge}>{reminderCatCounts[cat]}</span>}
              </button>
            ))}
          </div>

          <div style={S.listStack}>
            {activeReminders.length===0 && <div style={S.emptyState}>{reminderFilter!=="All"?`No pending "${reminderFilter}" reminders.`:"All caught up! Tap '+ Add Reminder' to create one."}</div>}
            {activeReminders.map(r => {
              const diff = r.dueDate ? dueDateDiff(r.dueDate) : null;
              return (
                <div key={r.id} style={{...S.listRow,...(diff!==null&&diff<0?S.listRowOverdue:diff!==null&&diff<=3?S.listRowSoon:{})}}>
                  <button style={S.check} onClick={()=>toggleReminder(r.id)}>✓</button>
                  <div style={S.listContent}>
                    <div style={S.listTitle}>{r.text}</div>
                    <div style={S.listMeta}>
                      <span style={{...S.tag,background:reminderCatColors[r.category]||"#64748b"}}>{r.category}</span>
                      {r.dueDate&&<DueDateBadge dueDate={r.dueDate}/>}
                      {r.repeat!=="none"&&<span style={S.tagGray}>🔁 {r.repeat}</span>}
                    </div>
                    {r.photo&&<img src={r.photo} alt="reminder" style={S.inlinePhoto}/>}
                  </div>
                  <div style={S.listActions}>
                    <PhotoUpload small currentPhoto={r.photo} onPhotoChange={photo=>setReminders(p=>p.map(x=>x.id===r.id?{...x,photo}:x))}/>
                    <button style={S.deleteX} onClick={()=>deleteReminder(r.id)}>✕</button>
                  </div>
                </div>
              );
            })}
            {reminders.filter(r=>r.done).length>0&&(
              <div>
                <button style={S.showMoreBtn} onClick={()=>setShowDoneReminders(!showDoneReminders)}>
                  {showDoneReminders?"▲ Hide":"▼ Show"} {reminders.filter(r=>r.done).length} completed
                </button>
                {showDoneReminders&&doneReminders.map(r=>(
                  <div key={r.id} style={{...S.listRow,opacity:0.5}}>
                    <button style={{...S.check,...S.checkDone}} onClick={()=>toggleReminder(r.id)}>✓</button>
                    <div style={S.listContent}>
                      <div style={{...S.listTitle,textDecoration:"line-through",color:"#94a3b8"}}>{r.text}</div>
                      <div style={S.listMeta}><span style={{...S.tag,background:reminderCatColors[r.category]||"#64748b"}}>{r.category}</span><span style={S.tagGreen}>✅ Done</span></div>
                    </div>
                    <button style={S.deleteX} onClick={()=>deleteReminder(r.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={S.divider}/>

          {/* ── SECTION 3: PROPERTY ── */}
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>🏗️ Property Management</h2>
              <p style={S.sectionHint}>One-off jobs and repairs — get it done when you can</p>
            </div>
            <button style={S.addBtn} onClick={()=>setShowAddProperty(true)}>+ Add Job</button>
          </div>

          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {PROPERTY_PRIORITIES.slice().reverse().map(p=>{
              const count = propertyTodos.filter(t=>!t.done&&t.priority===p).length;
              if(!count) return null;
              return <span key={p} style={{...S.badge,background:priorityColors[p]+"20",color:priorityColors[p],border:`1px solid ${priorityColors[p]}40`,fontWeight:600}}>{p}: {count}</span>;
            })}
            {openPropertyTodos===0&&<span style={{...S.badge,background:"#dcfce7",color:"#16a34a",border:"1px solid #bbf7d0"}}>✅ All jobs complete!</span>}
          </div>

          <div style={S.filterRow}>
            <button style={{...S.pill,...(propertyFilter==="All"?S.pillActive:{})}} onClick={()=>setPropertyFilter("All")}>
              All <span style={S.pillBadge}>{openPropertyTodos}</span>
            </button>
            {PROPERTY_AREAS.filter(area=>areaCounts[area]>0||propertyFilter===area).map(area=>(
              <button key={area} style={{...S.pill,...(propertyFilter===area?S.pillActive:{})}} onClick={()=>setPropertyFilter(propertyFilter===area?"All":area)}>
                <span style={{width:7,height:7,borderRadius:"50%",background:propertyFilter===area?"white":areaColors[area],display:"inline-block",flexShrink:0}}/>
                {area} {areaCounts[area]>0&&<span style={S.pillBadge}>{areaCounts[area]}</span>}
              </button>
            ))}
          </div>

          <div style={S.listStack}>
            {activeTodos.length===0&&<div style={S.emptyState}>{propertyFilter!=="All"?`No open jobs in "${propertyFilter}".`:"No property jobs yet. Tap '+ Add Job' to log one."}</div>}
            {activeTodos.map(todo=>(
              <div key={todo.id} style={S.todoCard}>
                <div style={S.todoTop}>
                  <button style={S.check} onClick={()=>togglePropertyTodo(todo.id)}>✓</button>
                  <div style={S.listContent}>
                    <div style={S.listTitle}>{todo.title}</div>
                    <div style={S.listMeta}>
                      <span style={{...S.tag,background:areaColors[todo.area]||"#64748b"}}>{todo.area}</span>
                      <span style={{...S.badge,background:priorityColors[todo.priority]+"20",color:priorityColors[todo.priority],border:`1px solid ${priorityColors[todo.priority]}40`}}>{todo.priority}</span>
                      <span style={S.tagGray}>Added {new Date(todo.addedDate).toLocaleDateString()}</span>
                    </div>
                    {todo.photo&&<img src={todo.photo} alt="property" style={S.inlinePhoto}/>}
                  </div>
                  <div style={S.listActions}>
                    <PhotoUpload small currentPhoto={todo.photo} onPhotoChange={photo=>setPropertyTodos(p=>p.map(t=>t.id===todo.id?{...t,photo}:t))}/>
                    {todo.notes&&<button style={S.notesBtn} onClick={()=>setExpandedTodo(expandedTodo===todo.id?null:todo.id)}>{expandedTodo===todo.id?"▲":"▼"}</button>}
                    <button style={S.deleteX} onClick={()=>deletePropertyTodo(todo.id)}>✕</button>
                  </div>
                </div>
                {expandedTodo===todo.id&&todo.notes&&<div style={S.todoNotes}>📝 {todo.notes}</div>}
              </div>
            ))}
            {propertyTodos.filter(t=>t.done).length>0&&(
              <div>
                <button style={S.showMoreBtn} onClick={()=>setShowDoneProperty(!showDoneProperty)}>
                  {showDoneProperty?"▲ Hide":"▼ Show"} {propertyTodos.filter(t=>t.done).length} completed jobs
                </button>
                {showDoneProperty&&doneTodos.map(todo=>(
                  <div key={todo.id} style={{...S.todoCard,opacity:0.5}}>
                    <div style={S.todoTop}>
                      <button style={{...S.check,...S.checkDone}} onClick={()=>togglePropertyTodo(todo.id)}>✓</button>
                      <div style={S.listContent}>
                        <div style={{...S.listTitle,textDecoration:"line-through",color:"#94a3b8"}}>{todo.title}</div>
                        <div style={S.listMeta}><span style={{...S.tag,background:areaColors[todo.area]||"#64748b"}}>{todo.area}</span><span style={S.tagGreen}>✅ Done</span></div>
                      </div>
                      <button style={S.deleteX} onClick={()=>deletePropertyTodo(todo.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── MODALS ── */}
          {showAddEquip&&(
            <div style={S.overlay} onClick={()=>setShowAddEquip(false)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>Add New Equipment</h3>
                <div style={S.fg}><label style={S.lbl}>Equipment Name *</label><input style={S.inp} placeholder="e.g. Riding Mower" value={newEquip.name} onChange={e=>setNewEquip({...newEquip,name:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Brand</label><input style={S.inp} placeholder="e.g. Husqvarna" value={newEquip.brand} onChange={e=>setNewEquip({...newEquip,brand:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Model Number</label><input style={S.inp} placeholder="e.g. YTH18542" value={newEquip.model} onChange={e=>setNewEquip({...newEquip,model:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Serial Number</label><input style={S.inp} placeholder="e.g. ABC-1234567" value={newEquip.serial} onChange={e=>setNewEquip({...newEquip,serial:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Photo</label><PhotoUpload currentPhoto={newEquip.photo} onPhotoChange={photo=>setNewEquip({...newEquip,photo})}/></div>
                <div style={S.fg}><label style={S.lbl}>Icon</label>
                  <div style={S.iconRow}>{["🔧","🌿","❄️","⚡","💧","🚗","🏊","🌡️","🔥","🏠","🛠️","⛽"].map(icon=>(
                    <button key={icon} style={{...S.iconBtn,...(newEquip.icon===icon?S.iconBtnOn:{})}} onClick={()=>setNewEquip({...newEquip,icon})}>{icon}</button>
                  ))}</div>
                </div>
                <div style={S.modalFoot}><button style={S.cancelBtn} onClick={()=>setShowAddEquip(false)}>Cancel</button><button style={S.saveBtn} onClick={addEquipment}>Add Equipment</button></div>
              </div>
            </div>
          )}

          {editEquip&&(
            <div style={S.overlay} onClick={()=>setEditEquip(null)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>✏️ Edit Equipment</h3>
                <div style={S.fg}><label style={S.lbl}>Equipment Name *</label><input style={S.inp} value={editEquip.name} onChange={e=>setEditEquip({...editEquip,name:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Brand</label><input style={S.inp} value={editEquip.brand} onChange={e=>setEditEquip({...editEquip,brand:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Model Number</label><input style={S.inp} value={editEquip.model} onChange={e=>setEditEquip({...editEquip,model:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Serial Number</label><input style={S.inp} value={editEquip.serial||""} onChange={e=>setEditEquip({...editEquip,serial:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Photo</label><PhotoUpload currentPhoto={editEquip.photo} onPhotoChange={photo=>setEditEquip({...editEquip,photo})}/></div>
                <div style={S.fg}><label style={S.lbl}>Icon</label>
                  <div style={S.iconRow}>{["🔧","🌿","❄️","⚡","💧","🚗","🏊","🌡️","🔥","🏠","🛠️","⛽"].map(icon=>(
                    <button key={icon} style={{...S.iconBtn,...(editEquip.icon===icon?S.iconBtnOn:{})}} onClick={()=>setEditEquip({...editEquip,icon})}>{icon}</button>
                  ))}</div>
                </div>
                <div style={S.modalFoot}><button style={S.cancelBtn} onClick={()=>setEditEquip(null)}>Cancel</button><button style={S.saveBtn} onClick={saveEditEquip}>Save Changes</button></div>
              </div>
            </div>
          )}

          {deleteEquipId&&(
            <div style={S.overlay} onClick={()=>setDeleteEquipId(null)}>
              <div style={{...S.modal,maxWidth:360}} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>🗑️ Delete Equipment?</h3>
                <p style={{color:"#64748b",fontSize:14,marginBottom:20}}>Are you sure you want to delete <strong>{equipment.find(e=>e.id===deleteEquipId)?.name}</strong>? All its tasks will be removed. This cannot be undone.</p>
                <div style={S.modalFoot}><button style={S.cancelBtn} onClick={()=>setDeleteEquipId(null)}>Cancel</button><button style={{...S.saveBtn,background:"#dc2626"}} onClick={()=>deleteEquipment(deleteEquipId)}>Yes, Delete</button></div>
              </div>
            </div>
          )}

          {showAddReminder&&(
            <div style={S.overlay} onClick={()=>setShowAddReminder(false)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>🏡 Add Household Reminder</h3>
                <div style={S.fg}><label style={S.lbl}>What needs to be done? *</label><input style={S.inp} placeholder="e.g. Clean out the gutters" value={newReminder.text} onChange={e=>setNewReminder({...newReminder,text:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Category</label>
                  <div style={S.iconRow}>{REMINDER_CATS.map(cat=>(
                    <button key={cat} style={{...S.catBtn,background:newReminder.category===cat?reminderCatColors[cat]:"#f1f5f9",color:newReminder.category===cat?"white":"#475569",border:`1.5px solid ${newReminder.category===cat?reminderCatColors[cat]:"transparent"}`}} onClick={()=>setNewReminder({...newReminder,category:cat})}>{cat}</button>
                  ))}</div>
                </div>
                <div style={S.fg}><label style={S.lbl}>Due Date (optional)</label><input type="date" style={S.inp} value={newReminder.dueDate} onChange={e=>setNewReminder({...newReminder,dueDate:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Repeats</label>
                  <select style={S.inp} value={newReminder.repeat} onChange={e=>setNewReminder({...newReminder,repeat:e.target.value})}>
                    <option value="none">Does not repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="seasonally">Seasonally</option><option value="yearly">Yearly</option>
                  </select>
                </div>
                <div style={S.fg}><label style={S.lbl}>Photo (optional)</label><PhotoUpload currentPhoto={newReminder.photo} onPhotoChange={photo=>setNewReminder({...newReminder,photo})}/></div>
                <div style={S.modalFoot}><button style={S.cancelBtn} onClick={()=>setShowAddReminder(false)}>Cancel</button><button style={S.saveBtn} onClick={addReminder}>Add Reminder</button></div>
              </div>
            </div>
          )}

          {showAddProperty&&(
            <div style={S.overlay} onClick={()=>setShowAddProperty(false)}>
              <div style={S.modal} onClick={e=>e.stopPropagation()}>
                <h3 style={S.modalTitle}>🏗️ Add Property Job</h3>
                <div style={S.fg}><label style={S.lbl}>What needs to be done? *</label><input style={S.inp} placeholder="e.g. Remove fallen tree near fence" value={newTodo.title} onChange={e=>setNewTodo({...newTodo,title:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Area</label>
                  <div style={S.iconRow}>{PROPERTY_AREAS.map(area=>(
                    <button key={area} style={{...S.catBtn,background:newTodo.area===area?areaColors[area]:"#f1f5f9",color:newTodo.area===area?"white":"#475569",border:`1.5px solid ${newTodo.area===area?areaColors[area]:"transparent"}`}} onClick={()=>setNewTodo({...newTodo,area})}>{area}</button>
                  ))}</div>
                </div>
                <div style={S.fg}><label style={S.lbl}>Priority</label>
                  <div style={{display:"flex",gap:8}}>{PROPERTY_PRIORITIES.map(p=>(
                    <button key={p} style={{...S.catBtn,flex:1,background:newTodo.priority===p?priorityColors[p]:"#f1f5f9",color:newTodo.priority===p?"white":"#475569",border:`1.5px solid ${newTodo.priority===p?priorityColors[p]:"transparent"}`}} onClick={()=>setNewTodo({...newTodo,priority:p})}>{p}</button>
                  ))}</div>
                </div>
                <div style={S.fg}><label style={S.lbl}>Notes (optional)</label><textarea style={{...S.inp,height:70,resize:"vertical"}} placeholder="e.g. May need chainsaw rental..." value={newTodo.notes} onChange={e=>setNewTodo({...newTodo,notes:e.target.value})}/></div>
                <div style={S.fg}><label style={S.lbl}>Photo (optional)</label><PhotoUpload currentPhoto={newTodo.photo} onPhotoChange={photo=>setNewTodo({...newTodo,photo})}/></div>
                <div style={S.modalFoot}><button style={S.cancelBtn} onClick={()=>setShowAddProperty(false)}>Cancel</button><button style={S.saveBtn} onClick={addPropertyTodo}>Add Job</button></div>
              </div>
            </div>
          )}

        </div>)}

        {/* ══════════ EQUIPMENT DETAIL ══════════ */}
        {view==="detail"&&currentEquip&&(<div>
          <button style={S.backBtn} onClick={()=>{setSelectedEquip(null);setView("dashboard");}}>← Back</button>
          <div style={S.detailCard}>
            {currentEquip.photo&&<img src={currentEquip.photo} alt={currentEquip.name} style={S.detailPhoto}/>}
            <div style={S.detailBody}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <span style={{fontSize:40}}>{currentEquip.icon}</span>
                <div>
                  <h2 style={S.detailTitle}>{currentEquip.name}</h2>
                  <div style={S.detailMeta}>{currentEquip.brand} · Model: <strong>{currentEquip.model}</strong></div>
                  {currentEquip.serial&&<div style={S.detailMeta}>Serial: <strong>{currentEquip.serial}</strong></div>}
                </div>
                <button style={{...S.addBtn,marginLeft:"auto"}} onClick={()=>searchParts(currentEquip)}>🔍 Find Parts</button>
              </div>
            </div>
          </div>

          <div style={S.tabs}>
            <button style={{...S.tab,...(activeTab==="tasks"?S.tabOn:{})}} onClick={()=>setActiveTab("tasks")}>Maintenance Tasks</button>
            <button style={{...S.tab,...(activeTab==="history"?S.tabOn:{})}} onClick={()=>setActiveTab("history")}>History</button>
          </div>

          {activeTab==="tasks"&&(
            <div style={S.listStack}>
              {currentEquip.tasks.length===0&&<div style={S.emptyState}>No tasks yet.</div>}
              {currentEquip.tasks.map(task=>{
                const days = getDaysUntilDue(task.lastDone, task.intervalDays);
                const due = getDueDate(task.lastDone, task.intervalDays);
                return (
                  <div key={task.id} style={{...S.listRow,...(days<0?S.listRowOverdue:days<=7?S.listRowSoon:{})}}>
                    <div style={{flex:1}}>
                      <div style={S.listTitle}>{task.name}</div>
                      <div style={{fontSize:12,color:"#94a3b8",marginTop:3}}>Every {task.intervalDays} days · Last: {new Date(task.lastDone).toLocaleDateString()} · Due: {due.toLocaleDateString()}</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <StatusBadge days={days}/>
                      <button style={S.logBtn} onClick={()=>markEquipDone(currentEquip.id,task.id)}>✓ Log Done</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab==="history"&&(
            <div>
              {history.filter(h=>h.equipName===currentEquip.name).length===0
                ?<div style={S.emptyState}>No history yet.</div>
                :history.filter(h=>h.equipName===currentEquip.name).map(h=>(
                  <div key={h.id} style={S.listRow}>
                    <div style={{flex:1}}>
                      <div style={S.listTitle}>{h.taskName}</div>
                      <div style={{fontSize:12,color:"#94a3b8"}}>{new Date(h.date).toLocaleDateString()}</div>
                      {h.note&&<div style={{fontSize:13,color:"#64748b",marginTop:4,fontStyle:"italic"}}>📝 {h.note}</div>}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>)}

        {/* ══════════ HISTORY ══════════ */}
        {view==="log"&&(<div>
          <h2 style={S.sectionTitle}>📋 Maintenance History</h2>
          <p style={S.sectionHint}>A complete log of all equipment maintenance</p>
          {history.length===0
            ?<div style={S.emptyState}>No history yet! Log a completed task to see it here.</div>
            :history.map(h=>(
              <div key={h.id} style={S.listRow}>
                <div style={{flex:1}}>
                  <div style={S.listTitle}><strong>{h.equipName}</strong> · {h.taskName}</div>
                  <div style={{fontSize:12,color:"#94a3b8"}}>{new Date(h.date).toLocaleDateString()}</div>
                  {h.note&&<div style={{fontSize:13,color:"#64748b",marginTop:4,fontStyle:"italic"}}>📝 {h.note}</div>}
                </div>
              </div>
            ))
          }
        </div>)}
      </main>

      {/* Log Modal */}
      {logModal&&(
        <div style={S.overlay} onClick={()=>setLogModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <h3 style={S.modalTitle}>✓ Log Maintenance</h3>
            <p style={{color:"#64748b",fontSize:14,marginBottom:16}}>Recording: <strong>{logModal.task.name}</strong></p>
            <div style={S.fg}><label style={S.lbl}>Date Completed</label><input type="date" style={S.inp} value={logDate} onChange={e=>setLogDate(e.target.value)}/></div>
            <div style={S.fg}><label style={S.lbl}>Notes (optional)</label><textarea style={{...S.inp,height:80,resize:"vertical"}} placeholder="e.g. Used Mobil 1 10W-30..." value={logNote} onChange={e=>setLogNote(e.target.value)}/></div>
            <div style={S.modalFoot}><button style={S.cancelBtn} onClick={()=>setLogModal(null)}>Cancel</button><button style={S.saveBtn} onClick={submitLog}>Save Log</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f0f4f8", minHeight: "100vh", color: "#1e293b" },

  // Header
  header: { background: "linear-gradient(135deg, #1e3a5f 0%, #2d5282 100%)", color: "white", padding: "16px 24px", boxShadow: "0 2px 12px rgba(30,58,95,0.3)" },
  headerInner: { maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  logo: { display: "flex", gap: 12, alignItems: "center" },
  logoIconWrap: { fontSize: 28, background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" },
  logoTitle: { fontSize: 20, fontWeight: 700, letterSpacing: 0.5 },
  logoSub: { fontSize: 11, opacity: 0.7, marginTop: 1 },
  headerStats: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },

  // Nav
  nav: { background: "#1e293b", display: "flex", gap: 2, padding: "6px 20px", overflowX: "auto" },
  navBtn: { background: "none", border: "none", color: "#94a3b8", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", transition: "all 0.15s" },
  navBtnActive: { background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600 },

  main: { maxWidth: 960, margin: "0 auto", padding: "24px 16px" },

  // Urgent banner
  urgentBanner: { background: "white", border: "1.5px solid #fecaca", borderLeft: "4px solid #ef4444", borderRadius: 10, padding: 16, marginBottom: 28, boxShadow: "0 2px 8px rgba(239,68,68,0.08)" },
  urgentTitle: { fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#dc2626" },
  urgentItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #fee2e2", flexWrap: "wrap", gap: 8 },

  // Section
  divider: { borderTop: "1.5px solid #e2e8f0", margin: "36px 0 28px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 3px", color: "#0f172a" },
  sectionHint: { color: "#94a3b8", fontSize: 12, margin: "0 0 16px" },
  addBtn: { background: "#1e3a5f", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 1px 4px rgba(30,58,95,0.2)" },

  // Equipment grid
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginBottom: 4 },
  card: { background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column" },
  cardGood: { borderTop: "3px solid #22c55e" },
  cardSoon: { borderTop: "3px solid #f59e0b" },
  cardUrgent: { borderTop: "3px solid #ef4444" },
  cardPhotoStrip: { width: "100%", height: 100, objectFit: "cover" },
  cardContent: { padding: "14px 14px 8px", flex: 1, cursor: "pointer" },
  cardTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardIconLg: { fontSize: 28 },
  cardName: { fontWeight: 700, fontSize: 15, marginBottom: 2, color: "#0f172a" },
  cardModel: { fontSize: 12, color: "#94a3b8", marginBottom: 3 },
  cardSerial: { fontSize: 11, color: "#94a3b8", marginBottom: 6, fontFamily: "monospace" },
  cardNext: { fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardTaskCount: { fontSize: 11, color: "#cbd5e1" },
  cardActions: { padding: "8px 14px 12px", display: "flex", gap: 6, alignItems: "center", borderTop: "1px solid #f1f5f9" },
  iconActionBtn: { background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14, color: "#64748b" },

  // Photo upload
  photoUploadWrap: { marginTop: 4 },
  photoThumbWrap: { display: "inline-block" },
  photoAddBtn: { background: "#f1f5f9", border: "1.5px dashed #cbd5e1", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 },
  photoAddSmall: { background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px", cursor: "pointer", fontSize: 14 },
  photoFull: { maxWidth: "100%", maxHeight: 180, borderRadius: 8, display: "block", marginTop: 6 },
  photoThumb: { width: 32, height: 32, objectFit: "cover", borderRadius: 6, display: "block" },
  photoRemoveBtn: { position: "absolute", top: -6, right: -6, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  inlinePhoto: { maxWidth: "100%", maxHeight: 120, borderRadius: 8, marginTop: 8, display: "block" },

  // Filter pills
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 },
  pill: { background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#475569", display: "flex", alignItems: "center", gap: 5 },
  pillActive: { background: "#1e3a5f", color: "white", border: "1.5px solid #1e3a5f" },
  pillBadge: { background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "1px 5px", fontSize: 10 },

  // List rows
  listStack: { display: "flex", flexDirection: "column", gap: 8 },
  listRow: { background: "white", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1.5px solid #f1f5f9" },
  listRowOverdue: { background: "#fff5f5", border: "1.5px solid #fecaca" },
  listRowSoon: { background: "#fffbeb", border: "1.5px solid #fde68a" },
  listContent: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4, color: "#0f172a" },
  listMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  listActions: { display: "flex", gap: 4, alignItems: "center", flexShrink: 0 },

  // Checkboxes
  check: { width: 26, height: 26, minWidth: 26, borderRadius: 6, border: "2px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  checkDone: { background: "#22c55e", border: "2px solid #22c55e", color: "white" },

  // Tags & badges
  badge: { padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  tag: { color: "white", padding: "2px 7px", borderRadius: 8, fontSize: 11, fontWeight: 600 },
  tagGray: { fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "2px 7px", borderRadius: 8 },
  tagGreen: { fontSize: 11, background: "#dcfce7", color: "#16a34a", padding: "2px 7px", borderRadius: 8 },

  // Buttons
  logBtn: { background: "#16a34a", color: "white", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  deleteX: { background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 15, padding: "4px 5px", flexShrink: 0 },
  notesBtn: { background: "none", border: "1px solid #e2e8f0", borderRadius: 5, padding: "3px 7px", cursor: "pointer", fontSize: 12, color: "#64748b" },
  showMoreBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12, padding: "8px 0", fontWeight: 500 },

  // Property todo
  todoCard: { background: "white", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1.5px solid #f1f5f9", overflow: "hidden" },
  todoTop: { padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 },
  todoNotes: { background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "10px 14px", fontSize: 13, color: "#475569", lineHeight: 1.5 },

  // Detail view
  backBtn: { background: "white", border: "1.5px solid #e2e8f0", padding: "6px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 20, fontSize: 13, fontWeight: 500, color: "#475569" },
  detailCard: { background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: 20 },
  detailPhoto: { width: "100%", height: 160, objectFit: "cover" },
  detailBody: { padding: 16 },
  detailTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" },
  detailMeta: { color: "#64748b", fontSize: 13, marginTop: 2 },
  tabs: { display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e2e8f0" },
  tab: { background: "none", border: "none", padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#94a3b8" },
  tabOn: { color: "#1e3a5f", fontWeight: 700, borderBottom: "3px solid #1e3a5f", marginBottom: -2 },

  // Empty state
  emptyState: { textAlign: "center", padding: 36, color: "#94a3b8", fontSize: 14, background: "white", borderRadius: 10, border: "1.5px dashed #e2e8f0" },

  // Modals
  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "white", borderRadius: 14, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#0f172a" },
  modalFoot: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 },
  fg: { marginBottom: 14 },
  lbl: { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#475569", textTransform: "uppercase", letterSpacing: 0.4 },
  inp: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc", color: "#0f172a" },
  cancelBtn: { background: "none", border: "1.5px solid #e2e8f0", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#64748b", fontWeight: 500 },
  saveBtn: { background: "#1e3a5f", color: "white", border: "none", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  iconRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  iconBtn: { fontSize: 20, background: "#f1f5f9", border: "2px solid transparent", borderRadius: 8, padding: "6px 9px", cursor: "pointer" },
  iconBtnOn: { border: "2px solid #1e3a5f", background: "#eff6ff" },
  catBtn: { padding: "5px 11px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit" },
};
