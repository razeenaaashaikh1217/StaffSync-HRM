import { useEffect, useMemo, useState } from "react";
import { Users, CalendarCheck, BriefcaseBusiness, Award, LogOut, Megaphone, UserRound, Clock3, GraduationCap, Check, X, Plus, Trash2, Pencil, ArrowRight, ShieldCheck } from "lucide-react";

const API = "http://localhost:8000/api";
const readToken = () => localStorage.getItem("staffsync_token") || "";
async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (readToken()) headers.Authorization = `Bearer ${readToken()}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
const fmt = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtTime = (date) => date ? new Date(date).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) : "—";
function App() {
  const [page, setPage] = useState(readToken() ? "loading" : "home");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("register");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("Announcements");
  const [managerTab, setManagerTab] = useState("Leave Applications");
  const [data, setData] = useState({ employees:[], leaves:[], attendance:[], announcements:[], trainings:[] });

  async function loadData() {
    const [employees, leaves, attendance, announcements, trainings] = await Promise.all([
      api("/employees"), api("/leaves"), api("/attendance"), api("/announcements"), api("/trainings")
    ]);
    setData({ employees, leaves, attendance, announcements, trainings });
  }
  useEffect(() => {
    if (page !== "loading") return;
    api("/auth/me").then(({user}) => { setUser(user); setPage("dashboard"); }).catch(() => { localStorage.removeItem("staffsync_token"); setPage("home"); });
  }, [page]);
  useEffect(() => {
    if (page !== "dashboard" || !user) return;
    loadData().catch(e => setNotice(e.message));
  }, [page, user]);
  const role = user?.role || "Employee";
  function logout() { localStorage.removeItem("staffsync_token"); setUser(null); setPage("home"); setNotice(""); }
  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const result = await api(authMode === "register" ? "/auth/register" : "/auth/login", { method:"POST", body:JSON.stringify(body) });
      localStorage.setItem("staffsync_token", result.token); setUser(result.user); setPage("dashboard"); setTab("Announcements"); setNotice(`Welcome, ${result.user.name}!`);
    } catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  }
  async function act(fn, success) {
    setNotice("");
    try { await fn(); await loadData(); if (success) setNotice(success); }
    catch(e) { setNotice(e.message); }
  }
  async function addEmployee(e) {
    e.preventDefault(); const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    await act(async()=>{ await api("/employees",{method:"POST",body:JSON.stringify(body)}); e.currentTarget?.reset?.(); },"Employee added successfully.");
  }
  function employeeForm(e) {
    e.preventDefault(); const form = e.currentTarget; const body = Object.fromEntries(new FormData(form).entries());
    act(async()=>{await api("/employees",{method:"POST",body:JSON.stringify(body)}); form.reset();},"Employee added successfully.");
  }
  function leaveForm(e) {
    e.preventDefault(); const form=e.currentTarget; const body=Object.fromEntries(new FormData(form).entries());
    act(async()=>{await api("/leaves",{method:"POST",body:JSON.stringify(body)});form.reset();},"Leave application submitted.");
  }
  function announcementForm(e) {
    e.preventDefault(); const form=e.currentTarget; const body=Object.fromEntries(new FormData(form).entries());
    act(async()=>{await api("/announcements",{method:"POST",body:JSON.stringify(body)});form.reset();},"Announcement published.");
  }
  function trainingForm(e) {
    e.preventDefault(); const form=e.currentTarget; const body=Object.fromEntries(new FormData(form).entries());
    act(async()=>{await api("/trainings",{method:"POST",body:JSON.stringify(body)});form.reset();},"Training created.");
  }
  if (page === "loading") return <div className="loading">Connecting to StaffSync…</div>;
  if (page === "home") return <div className="site-shell">
    <header className="topbar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setPage("home")}}>StaffSync</a><span className="brand-sub">HRM PORTAL</span><button className="btn btn-blue small" onClick={()=>{setAuthMode("login");setPage("auth")}}>Login / Register</button></header>
    <main className="landing">
      <div className="eyebrow"><span className="eyebrow-dot"/> HUMAN RESOURCE MANAGEMENT</div>
      <h1>Empower Your Workforce with <span>HRM Portal</span></h1>
      <p className="hero-copy">A smart Human Resource Management platform designed to simplify attendance tracking,<br className="desktop"/> leave management, employee records, and communication across teams.</p>
      <button className="btn btn-blue get-started" onClick={()=>{setAuthMode("register");setPage("auth")}}>Get Started <ArrowRight size={15}/></button>
      <div className="feature-grid">
        <Feature icon={<Users/>} color="blue" title="Employee Management" text="Manage employee records, roles, and information efficiently."/>
        <Feature icon={<CalendarCheck/>} color="green" title="Attendance & Leave" text="Track attendance and handle leave approvals easily."/>
        <Feature icon={<BriefcaseBusiness/>} color="amber" title="HR & Manager Tools" text="Handle team announcements, performance, and training modules."/>
        <Feature icon={<Award/>} color="pink" title="Employee Growth" text="Monitor performance and assign development trainings."/>
      </div>
      <footer className="landing-footer">© 2026 StaffSync HRM — Empowering Teams, Simplifying Workflows.</footer>
    </main>
  </div>;
  if (page === "auth") return <div className="auth-screen"><button className="auth-brand" onClick={()=>setPage("home")}>StaffSync <span>HRM PORTAL</span></button>
    <form className="auth-card" onSubmit={authenticate}>
      <h2>HRM Portal {authMode === "register" ? "Register" : "Login"}</h2>
      {authMode === "register" && <><label>Name</label><input name="name" placeholder="Enter your name" required autoComplete="name"/></>}
      <label>Email</label><input name="email" type="email" placeholder="Enter your email" required autoComplete="email"/>
      <label>Password</label><input name="password" type="password" placeholder="Enter your password" required minLength="6" autoComplete={authMode==="register"?"new-password":"current-password"}/>
      {authMode === "register" && <><label>Role</label><select name="role" defaultValue="Employee"><option>Employee</option><option>Manager</option><option>HR</option></select></>}
      <button className="btn btn-blue auth-submit" disabled={busy}>{busy ? "Please wait…" : authMode === "register" ? "Register" : "Login"}</button>
      <p className="auth-switch">{authMode === "register" ? "Already have an account? " : "Don't have an account? "}<button type="button" onClick={()=>{setAuthMode(authMode==="register"?"login":"register");setNotice("")}}>{authMode==="register"?"Login":"Register"}</button></p>
      {notice && <p className="notice">{notice}</p>}
    </form>
  </div>;
  if (!user) return null;
  return <div className="portal">
    <header className="portal-header"><div className="portal-brand"><span className="brand-mark">S</span><div><strong>{role === "HR" ? "HR Portal" : role === "Manager" ? "Manager Dashboard" : "Employee Portal"}</strong><small>StaffSync · People & operations</small></div></div><div className="user-area"><span className="user-chip"><span className="online-dot"/>{user.name} <em>{role}</em></span><button className="btn btn-red small" onClick={logout}><LogOut size={13}/> Logout</button></div></header>
    <main className="portal-main">
      {role === "Employee" && <EmployeeDashboard user={user} data={data} tab={tab} setTab={setTab} onLeave={leaveForm} act={act} notice={notice}/>}
      {role === "HR" && <HRDashboard data={data} tab={tab} setTab={setTab} act={act} onEmployee={employeeForm} onAnnouncement={announcementForm}/>}
      {role === "Manager" && <ManagerDashboard data={data} tab={managerTab} setTab={setManagerTab} act={act} onTraining={trainingForm}/>}
      {notice && <div className="toast" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </main>
  </div>;
}
function Feature({icon,color,title,text}) { return <article className="feature-card"><div className={`feature-icon ${color}`}>{icon}</div><h3>{title}</h3><p>{text}</p></article>; }
function Tabs({items,active,onChange}) { return <nav className="tabs">{items.map(item=><button key={item} className={active===item?"active":""} onClick={()=>onChange(item)}>{item}</button>)}</nav>; }
function Panel({title,children,extra}) { return <section className="panel"><div className="panel-head"><h3>{title}</h3>{extra}</div>{children}</section>; }
function Empty({text}) { return <div className="empty-state">{text}</div>; }
function EmployeeDashboard({user,data,tab,setTab,onLeave,act,notice}) {
  const [checkBusy,setCheckBusy] = useState(false);
  const todayRecord = data.attendance.find(a=>new Date(a.date).toDateString()===new Date().toDateString());
  const tabs=["Announcements","Leaves","Attendance","Profile"];
  return <><div className="page-heading"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>Welcome back, {user.name.split(" ")[0]}</h1><p>Here’s what’s happening with your work today.</p></div><div className="date-chip"><Clock3 size={15}/>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}</div></div>
    <Tabs items={tabs} active={tab} onChange={setTab}/>
    {tab==="Announcements" && <div className="two-col"><Panel title="Announcements" extra={<span className="count">{data.announcements.length} updates</span>}>{data.announcements.length ? data.announcements.map(a=><article className="announcement-item" key={a._id}><span className="item-icon"><Megaphone size={16}/></span><div><h4>{a.title}</h4><p>{a.message}</p><small>{fmt(a.createdAt)} · {a.createdBy}</small></div></article>):<Empty text="No announcements available."/>}</Panel><Panel title="Trainings" extra={<span className="count">{data.trainings.length} sessions</span>}>{data.trainings.length ? data.trainings.map(t=><article className="training-mini" key={t._id}><span className="item-icon violet"><GraduationCap size={17}/></span><div><h4>{t.title}</h4><p>{t.description || "Training and development session"}</p><small>Trainer: {t.trainer} · {fmt(t.date)}</small></div></article>):<Empty text="No training sessions available."/>}</Panel></div>}
    {tab==="Leaves" && <div className="two-col leave-layout"><Panel title="Apply for Leave"><form className="form-stack" onSubmit={onLeave}><div className="form-grid"><div><label>Start Date</label><input type="date" name="startDate" required/></div><div><label>End Date</label><input type="date" name="endDate" required/></div></div><label>Reason</label><textarea name="reason" placeholder="Reason for leave" rows="3" required/><button className="btn btn-blue full">Apply Leave</button></form></Panel><Panel title="My Leaves" extra={<span className="count">{data.leaves.length} requests</span>}>{data.leaves.length ? data.leaves.map(l=><article className="leave-card" key={l._id}><div className="leave-card-top"><strong>{fmt(l.startDate)} → {fmt(l.endDate)}</strong><Status status={l.status}/></div><p>{l.reason}</p><small>Submitted {fmt(l.createdAt)}</small></article>):<Empty text="You have no leave requests yet."/>}</Panel></div>}
    {tab==="Attendance" && <Panel title="Attendance" extra={<button className="btn btn-blue small" disabled={checkBusy || !!todayRecord} onClick={async()=>{setCheckBusy(true);await act(()=>api("/attendance/check-in",{method:"POST",body:"{}"}),"Checked in successfully.");setCheckBusy(false);}}>{todayRecord ? (todayRecord.checkOut ? "Checked Out" : "Checked In") : "Check In"}</button>}>{data.attendance.length ? <div className="attendance-list">{data.attendance.map(a=><div className="attendance-row" key={a._id}><div><strong>{fmt(a.date)}</strong><small>In {fmtTime(a.checkIn)} · Out {fmtTime(a.checkOut)}</small></div><div className="attendance-actions"><Status status={a.checkOut?"Checked Out":"Present"}/>{!a.checkOut && <button className="btn btn-soft small" onClick={()=>act(()=>api(`/attendance/${a._id}/check-out`,{method:"PATCH",body:"{}"}),"Checked out successfully.")}>Check Out</button>}</div></div>)}</div>:<Empty text="No attendance records yet. Check in to create your first record."/>}</Panel>}
    {tab==="Profile" && <Panel title="My Profile"><div className="profile-box"><div className="avatar">{user.name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()}</div><div><h3>{user.name}</h3><p>{user.email}</p><div className="profile-role"><ShieldCheck size={14}/>{user.role}</div></div></div><div className="profile-detail"><span>Full name</span><strong>{user.name}</strong><span>Email address</span><strong>{user.email}</strong><span>Role</span><strong>{user.role}</strong></div></Panel>}
  </>;
}
function Status({status}) { const cls=String(status).toLowerCase().replace(/\s/g,"-"); return <span className={`status ${cls}`}>{status}</span>; }
function HRDashboard({data,tab,setTab,act,onEmployee,onAnnouncement}) {
 const tabs=["Leave Applications","Employee Management","Announcements","Attendance"];
 return <><div className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS</div><h1>HR Dashboard</h1><p>Manage your people, requests, and workplace updates.</p></div><div className="metric-pill"><Users size={15}/>{data.employees.length} employees</div></div><Tabs items={tabs} active={tab} onChange={setTab}/>
 {tab==="Leave Applications" && <Panel title="Leave Applications" extra={<span className="count">{data.leaves.filter(l=>l.status==="Pending").length} pending</span>}>{data.leaves.length ? <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Email</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.leaves.map(l=><tr key={l._id}><td>{l.name}</td><td>{l.email}</td><td>{fmt(l.startDate)}</td><td>{fmt(l.endDate)}</td><td>{l.reason}</td><td><Status status={l.status}/></td><td><div className="action-row"><button className="btn btn-green tiny" disabled={l.status!=="Pending"} onClick={()=>act(()=>api(`/leaves/${l._id}/status`,{method:"PATCH",body:JSON.stringify({status:"Approved"})}),"Leave approved.")}>Approve</button><button className="btn btn-red tiny" disabled={l.status!=="Pending"} onClick={()=>act(()=>api(`/leaves/${l._id}/status`,{method:"PATCH",body:JSON.stringify({status:"Rejected"})}),"Leave rejected.")}>Reject</button></div></td></tr>)}</tbody></table></div>:<Empty text="No leave applications have been submitted."/>}</Panel>}
 {tab==="Employee Management" && <Panel title="Employee Management"><form className="employee-form" onSubmit={onEmployee}><input name="name" placeholder="Name" required/><input name="email" type="email" placeholder="Email" required/><input name="department" placeholder="Department" required/><input name="position" placeholder="Position" required/><input name="salary" type="number" min="0" placeholder="Salary" required/><input name="joinDate" type="date" aria-label="Join date"/><input name="phone" placeholder="Phone"/><input name="address" placeholder="Address"/><button className="btn btn-red full form-wide"><Plus size={15}/> Add Employee</button></form>{data.employees.length ? <div className="table-wrap employee-table"><table><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Salary</th><th>Join Date</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead><tbody>{data.employees.map(emp=><tr key={emp._id}><td>{emp.name}</td><td>{emp.email}</td><td>{emp.department}</td><td>{emp.position}</td><td>₹{Number(emp.salary).toLocaleString("en-IN")}</td><td>{fmt(emp.joinDate)}</td><td>{emp.phone||"—"}</td><td>{emp.address||"—"}</td><td><button className="btn btn-red tiny" onClick={()=>{if(confirm(`Delete ${emp.name}?`)) act(()=>api(`/employees/${emp._id}`,{method:"DELETE"}),"Employee deleted.");}}><Trash2 size={12}/> Delete</button></td></tr>)}</tbody></table></div>:<Empty text="No employee records yet. Add the first employee above."/>}</Panel>}
 {tab==="Announcements" && <Panel title="Announcements"><form className="form-stack" onSubmit={onAnnouncement}><input name="title" placeholder="Title" required/><textarea name="message" placeholder="Message" rows="3" required/><div className="inline-form"><select name="audience" defaultValue="All"><option>All</option><option>Employee</option><option>Manager</option><option>HR</option></select><button className="btn btn-red"><Plus size={14}/> Create</button></div></form><div className="record-list">{data.announcements.map(a=><article className="announcement-item" key={a._id}><span className="item-icon"><Megaphone size={16}/></span><div><h4>{a.title}</h4><p>{a.message}</p><small>{a.audience} · {fmt(a.createdAt)}</small></div></article>)}</div></Panel>}
 {tab==="Attendance" && <Panel title="Attendance Records">{data.attendance.length ? <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead><tbody>{data.attendance.map(a=><tr key={a._id}><td>{a.name}</td><td>{fmt(a.date)}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td><Status status={a.checkOut?"Checked Out":"Present"}/></td></tr>)}</tbody></table></div>:<Empty text="No attendance records yet."/>}</Panel>}
 </>;
}
function ManagerDashboard({data,tab,setTab,act,onTraining}) {
 return <><div className="page-heading"><div><div className="eyebrow">TEAM LEADERSHIP</div><h1>Welcome Back, Manager</h1><p>Review team leave requests and manage training and development.</p></div><div className="metric-pill"><GraduationCap size={15}/>{data.trainings.length} training sessions</div></div><Tabs items={["Leave Applications","Training & Development"]} active={tab} onChange={setTab}/>
 {tab==="Leave Applications" && <Panel title="Leave Applications" extra={<span className="count">{data.leaves.length} requests</span>}>{data.leaves.length ? <div className="manager-cards">{data.leaves.map(l=><article className="manager-leave" key={l._id}><div className="manager-leave-top"><span className="item-icon"><UserRound size={15}/></span><Status status={l.status}/></div><strong>Employee: {l.name}</strong><small>({l.email})</small><p><b>From:</b> {fmt(l.startDate)}<br/><b>To:</b> {fmt(l.endDate)}<br/><b>Reason:</b> {l.reason}</p><small>Reviewed by: {l.reviewedBy || "Pending HR review"}</small></article>)}</div>:<Empty text="No leave applications yet."/>}</Panel>}
 {tab==="Training & Development" && <Panel title="Training & Development"><form className="training-form" onSubmit={onTraining}><input name="title" placeholder="Training Title" required/><input name="date" type="date" required/><textarea name="description" placeholder="Description" rows="2"/><input name="trainer" placeholder="Trainer Name" required/><input name="assignedTo" placeholder="Assign To (Employee ID or email)"/><button className="btn btn-blue full form-wide">Create Training</button></form>{data.trainings.length ? <div className="training-grid">{data.trainings.map(t=><article className="training-card" key={t._id}><div className="training-card-icon"><GraduationCap size={18}/></div><h4>{t.title}</h4><p>{t.description || "Training and development session"}</p><div className="training-meta"><span>Date: {fmt(t.date)}</span><span>Trainer: {t.trainer}</span><span>Assigned To: {t.assignedTo || "N/A"}</span></div><div className="action-row"><button className="btn btn-amber tiny" onClick={()=>{const title=prompt("Training title",t.title);if(title)act(()=>api(`/trainings/${t._id}`,{method:"PUT",body:JSON.stringify({...t,title})}),"Training updated.");}}><Pencil size={12}/> Edit</button><button className="btn btn-red tiny" onClick={()=>{if(confirm(`Delete training "${t.title}"?`))act(()=>api(`/trainings/${t._id}`,{method:"DELETE"}),"Training deleted.");}}><Trash2 size={12}/> Delete</button></div></article>)}</div>:<Empty text="No training sessions available."/>}</Panel>}
 <Panel title="Resources"><Empty text="No resources available."/></Panel>
 </>;
}
export default App;
