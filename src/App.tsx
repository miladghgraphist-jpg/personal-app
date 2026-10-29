import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Activity, ArrowDown, ArrowUpRight, BarChart3, Check, ChevronLeft, CirclePlus, Dumbbell, Flame, Heart, Home, Pencil, Plus, RotateCcw, Search, Settings2, Sparkles, Utensils, X } from 'lucide-react'
import './styles.css'

type Tab = 'today' | 'workout' | 'food' | 'progress'
type Exercise = { id: string; name: string; sets: number; reps: string; done: boolean }
type Workout = { id: string; title: string; subtitle: string; minutes: number; exercises: Exercise[] }
type Food = { id: string; name: string; amount: number; unit: string; kcal: number; protein: number; carbs: number; fat: number; source: string }
type DayLog = { date: string; foods: Food[]; workouts: string[] }
type AppData = { workouts: Workout[]; logs: Record<string, DayLog>; goalKcal: number; goalProtein: number }

const today = () => new Date().toLocaleDateString('en-CA')
const uid = () => Math.random().toString(36).slice(2, 10)
const starterWorkouts: Workout[] = [
  { id: 'a', title: 'Full-body foundations', subtitle: 'Beginner · low impact', minutes: 20, exercises: [
    { id: 'a1', name: 'Gentle warm-up', sets: 1, reps: '4 min', done: false },
    { id: 'a2', name: 'Wall push-ups', sets: 2, reps: '8–10 reps', done: false },
    { id: 'a3', name: 'Seated march', sets: 2, reps: '30 sec', done: false },
    { id: 'a4', name: 'Standing calf raises', sets: 2, reps: '8–10 reps', done: false },
  ]},
  { id: 'b', title: 'Mobility & posture', subtitle: 'Gentle · no equipment', minutes: 12, exercises: [
    { id: 'b1', name: 'Shoulder rolls', sets: 2, reps: '8 reps', done: false },
    { id: 'b2', name: 'Wall slides (comfortable range)', sets: 2, reps: '6 reps', done: false },
    { id: 'b3', name: 'Easy walk or seated movement', sets: 1, reps: '5 min', done: false },
  ]},
  { id: 'c', title: 'Easy movement day', subtitle: 'Adjust to your energy', minutes: 10, exercises: [
    { id: 'c1', name: 'Comfortable-paced walk', sets: 1, reps: '5–10 min', done: false },
    { id: 'c2', name: 'Gentle upper-body mobility', sets: 1, reps: '3 min', done: false },
  ]},
]
const foodCatalog: Food[] = [
  { id: 'f1', name: 'Oats, dry', amount: 40, unit: 'g', kcal: 152, protein: 5.3, carbs: 27.1, fat: 2.6, source: 'USDA FoodData Central · generic oats, dry' },
  { id: 'f2', name: 'Whole egg, boiled', amount: 1, unit: 'large', kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3, source: 'USDA FoodData Central · hard-boiled egg' },
  { id: 'f3', name: 'Plain yogurt', amount: 170, unit: 'g', kcal: 104, protein: 9.0, carbs: 12.0, fat: 2.5, source: 'USDA FoodData Central · plain yogurt, reference estimate' },
  { id: 'f4', name: 'Walnuts', amount: 15, unit: 'g', kcal: 98, protein: 2.3, carbs: 2.1, fat: 9.8, source: 'USDA FoodData Central · English walnuts' },
  { id: 'f5', name: 'Banana', amount: 1, unit: 'medium', kcal: 105, protein: 1.3, carbs: 27.0, fat: 0.4, source: 'USDA FoodData Central · raw banana, medium' },
  { id: 'f6', name: 'Cooked white rice', amount: 150, unit: 'g', kcal: 195, protein: 4.0, carbs: 42.5, fat: 0.4, source: 'USDA FoodData Central · cooked white rice, reference estimate' },
]
const initialData: AppData = { workouts: starterWorkouts, logs: {}, goalKcal: 2200, goalProtein: 85 }
function loadData(): AppData {
  try {
    const raw = localStorage.getItem('companion-fitness-v1')
    if (raw) return { ...initialData, ...JSON.parse(raw) as Partial<AppData> }
  } catch { /* start with an empty local session if storage is unavailable */ }
  return initialData
}
function Companion({ mood }: { mood: 'calm' | 'happy' | 'focused' }) {
  return <svg className={`companion companion-${mood}`} viewBox="0 0 140 150" role="img" aria-label={mood === 'happy' ? 'Happy companion' : mood === 'focused' ? 'Focused companion' : 'Calm companion'}>
    <defs><linearGradient id="toy" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e6d8ff"/><stop offset="100%" stopColor="#b7a0ee"/></linearGradient></defs>
    <ellipse cx="70" cy="135" rx="37" ry="7" fill="#d8d0e8" opacity=".45"/>
    <path d="M69 12 C86 8 94 21 92 31 C111 38 121 58 116 81 C112 111 94 128 70 128 C43 128 23 107 24 80 C20 57 31 39 49 32 C47 20 55 12 69 12Z" fill="url(#toy)"/>
    <path d="M55 17 Q69 7 81 18" fill="none" stroke="#a48bdc" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="51" cy="65" rx="5.5" ry="8" fill="#353047"/><ellipse cx="86" cy="64" rx="5.5" ry="8" fill="#353047"/>
    <circle cx="53" cy="62" r="1.8" fill="#fff"/><circle cx="88" cy="61" r="1.8" fill="#fff"/>
    <path d={mood === 'happy' ? 'M53 83 Q69 101 86 82' : mood === 'focused' ? 'M58 84 Q69 87 80 83' : 'M57 84 Q69 92 81 84'} fill="none" stroke="#353047" strokeWidth="3.5" strokeLinecap="round"/>
    {mood === 'happy' && <><ellipse cx="39" cy="80" rx="7" ry="3.5" fill="#e7a6b6" opacity=".8"/><ellipse cx="99" cy="79" rx="7" ry="3.5" fill="#e7a6b6" opacity=".8"/></>}
  </svg>
}
function formatNum(n: number) { return Math.round(n).toLocaleString('en-US') }

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [data, setData] = useState<AppData>(loadData)
  const [selectedWorkout, setSelectedWorkout] = useState('a')
  const [foodSearch, setFoodSearch] = useState('')
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [customFood, setCustomFood] = useState({ name: '', amount: '100', kcal: '', protein: '', carbs: '', fat: '', source: '' })
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [notice, setNotice] = useState('')
  const [editGoals, setEditGoals] = useState(false)
  const [goalKcal, setGoalKcal] = useState(String(data.goalKcal))
  const [goalProtein, setGoalProtein] = useState(String(data.goalProtein))

  useEffect(() => {
    try { localStorage.setItem('companion-fitness-v1', JSON.stringify(data)) } catch { /* app remains usable for this session */ }
  }, [data])
  useEffect(() => { if (!notice) return; const t = window.setTimeout(() => setNotice(''), 2400); return () => window.clearTimeout(t) }, [notice])

  const date = today()
  const day = data.logs[date] ?? { date, foods: [], workouts: [] }
  const kcal = day.foods.reduce((s, f) => s + f.kcal, 0)
  const protein = day.foods.reduce((s, f) => s + f.protein, 0)
  const carbs = day.foods.reduce((s, f) => s + f.carbs, 0)
  const fat = day.foods.reduce((s, f) => s + f.fat, 0)
  const doneExercises = data.workouts.flatMap(w => w.exercises).filter(e => e.done).length
  const allExercises = data.workouts.flatMap(w => w.exercises).length
  const mood = day.workouts.length || doneExercises ? 'happy' : kcal > 0 ? 'focused' : 'calm'
  const catalog = useMemo(() => foodCatalog.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())), [foodSearch])

  function updateDay(next: DayLog) { setData(d => ({ ...d, logs: { ...d.logs, [date]: next } })) }
  function toggleExercise(workoutId: string, exerciseId: string) {
    setData(d => ({ ...d, workouts: d.workouts.map(w => w.id !== workoutId ? w : { ...w, exercises: w.exercises.map(e => e.id !== exerciseId ? e : { ...e, done: !e.done }) }) }))
  }
  function addFood(food: Food) {
    updateDay({ ...day, foods: [...day.foods, { ...food, id: uid() }] })
    setFoodSearch('')
    setNotice(`${food.name} added to today's log`)
  }
  function saveCustomFood(e: FormEvent) {
    e.preventDefault()
    if (!customFood.name.trim() || !customFood.kcal || !customFood.source.trim()) { setNotice('Add a food name, calories and a source.'); return }
    addFood({ id: uid(), name: customFood.name.trim(), amount: Number(customFood.amount) || 100, unit: 'g', kcal: Number(customFood.kcal) || 0, protein: Number(customFood.protein) || 0, carbs: Number(customFood.carbs) || 0, fat: Number(customFood.fat) || 0, source: customFood.source.trim() })
    setCustomFood({ name: '', amount: '100', kcal: '', protein: '', carbs: '', fat: '', source: '' })
    setShowFoodForm(false)
  }
  function addWorkout(e: FormEvent) {
    e.preventDefault()
    if (!workoutName.trim()) return
    const w: Workout = { id: uid(), title: workoutName.trim(), subtitle: 'Custom plan', minutes: 15, exercises: exerciseName.trim() ? [{ id: uid(), name: exerciseName.trim(), sets: 2, reps: '8 reps', done: false }] : [] }
    setData(d => ({ ...d, workouts: [...d.workouts, w] }))
    setSelectedWorkout(w.id); setWorkoutName(''); setExerciseName(''); setShowWorkoutForm(false); setNotice('Your workout plan was created')
  }
  function saveGoals(e: FormEvent) {
    e.preventDefault()
    setData(d => ({ ...d, goalKcal: Math.max(0, Number(goalKcal) || 0), goalProtein: Math.max(0, Number(goalProtein) || 0) }))
    setEditGoals(false); setNotice('Your daily targets were updated')
  }
  function finishWorkout(id: string) {
    if (!day.workouts.includes(id)) updateDay({ ...day, workouts: [...day.workouts, id] })
    setNotice('Workout saved. Nice work showing up.')
  }
  const workout = data.workouts.find(w => w.id === selectedWorkout) ?? data.workouts[0]

  return <div className="app-shell" dir="rtl">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={20}/></div><div><b>همراه</b><small>سلامت، به سبک خودت</small></div></div>
      <div className="profile-chip"><Companion mood={mood}/><div><b>همراه تو</b><small>هر قدم، یک پیشرفت</small></div></div>
      <nav className="nav-list">
        <button className={tab === 'today' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('today')}><Home size={18}/> امروز</button>
        <button className={tab === 'workout' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('workout')}><Dumbbell size={18}/> برنامه ورزشی</button>
        <button className={tab === 'food' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('food')}><Utensils size={18}/> ثبت تغذیه</button>
        <button className={tab === 'progress' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('progress')}><BarChart3 size={18}/> پیشرفت</button>
      </nav>
      <div className="sidebar-note"><Heart size={17}/><span>برنامه باید با زندگی تو هماهنگ شود؛ نه برعکس.</span></div>
      <div className="sidebar-footer">نسخه آزمایشی · اطلاعات روی همین دستگاه ذخیره می‌شود</div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">فضای شخصی تو</span><h1>{tab === 'today' ? 'سلام، به امروز خوش اومدی' : tab === 'workout' ? 'برنامه ورزشی تو' : tab === 'food' ? 'ثبت تغذیه' : 'مسیر پیشرفتت'}</h1></div><div className="top-date"><span>{new Date().toLocaleDateString('fa-IR', { weekday: 'long' })}</span><b>{new Date().toLocaleDateString('fa-IR', { day: 'numeric', month: 'long' })}</b></div></header>

      {tab === 'today' && <div className="page-content">
        <section className="hero-card"><div className="hero-copy"><span className="eyebrow">قدم‌های کوچک، تغییر واقعی</span><h2>{day.workouts.length ? 'امروز برای خودت وقت گذاشتی ✨' : kcal > 0 ? 'خوبه، داری روزت رو می‌سازی' : 'لازم نیست همه‌چیز رو یک‌باره تغییر بدی'}</h2><p>{day.workouts.length ? 'پیشرفت یعنی ادامه دادن با سرعتی که برای تو مناسبه.' : 'یک حرکت کوچک یا ثبت یک وعده، شروع خوبیه. من همراهتم.'}</p><button className="primary-btn" onClick={() => setTab('workout')}>رفتن به برنامه ورزشی <ChevronLeft size={17}/></button></div><Companion mood={mood}/><div className="hero-orb orb-one"/><div className="hero-orb orb-two"/></section>
        <div className="section-heading"><div><h2>خلاصه امروز</h2><p>چیزی که تا این لحظه ثبت کردی</p></div><button className="text-btn" onClick={() => setTab('progress')}>دیدن گزارش <ArrowUpRight size={16}/></button></div>
        <div className="stats-grid">
          <article className="stat-card"><div className="stat-icon lilac"><Flame size={19}/></div><span>کالری دریافتی</span><strong>{formatNum(kcal)} <small>کیلوکالری</small></strong><div className="progress-track"><i style={{width:`${Math.min(100, data.goalKcal ? kcal/data.goalKcal*100 : 0)}%`}}/></div><small>{formatNum(Math.max(0, data.goalKcal-kcal))} تا هدف روزانه</small></article>
          <article className="stat-card"><div className="stat-icon mint"><Heart size={19}/></div><span>پروتئین</span><strong>{protein.toFixed(1)} <small>گرم</small></strong><div className="progress-track green"><i style={{width:`${Math.min(100, data.goalProtein ? protein/data.goalProtein*100 : 0)}%`}}/></div><small>هدف {data.goalProtein} گرم</small></article>
          <article className="stat-card"><div className="stat-icon peach"><Dumbbell size={19}/></div><span>ورزش امروز</span><strong>{day.workouts.length} <small>جلسه</small></strong><small>{day.workouts.length ? 'ثبت شده و قابل مشاهده در گزارش' : 'هر مقدار حرکت متناسب با توانت ارزشمند است'}</small></article>
        </div>
        <div className="two-col">
          <section className="panel"><div className="panel-title"><div><h3>برنامه پیشنهادی</h3><p>قابل تغییر و متناسب با شرایطت</p></div><button className="icon-btn" onClick={() => setTab('workout')} aria-label="Go to workouts"><ChevronLeft size={18}/></button></div>{data.workouts.slice(0,3).map(w=><button className="workout-mini" key={w.id} onClick={() => {setSelectedWorkout(w.id);setTab('workout')}}><div className="mini-icon"><Dumbbell size={18}/></div><div className="mini-copy"><b>{w.title}</b><small>{w.subtitle} · {w.minutes} دقیقه</small></div><ChevronLeft size={16}/></button>)}</section>
          <section className="panel"><div className="panel-title"><div><h3>آنچه خوردی</h3><p>ثبت غذا همراه با منبع اطلاعات</p></div><button className="icon-btn" onClick={() => setTab('food')} aria-label="Add food"><Plus size={18}/></button></div>{day.foods.length ? day.foods.slice(-4).reverse().map(f=><div className="food-row" key={f.id}><div className="food-dot"><Utensils size={15}/></div><div className="mini-copy"><b>{f.name}</b><small>{f.amount} {f.unit} · {f.source}</small></div><strong>{formatNum(f.kcal)}</strong></div>) : <div className="empty-state">هنوز غذایی ثبت نشده. برای شروع، یک وعده اضافه کن.</div>}</section>
        </div>
      </div>}

      {tab === 'workout' && <div className="page-content">
        <section className="intro-strip"><div className="intro-icon"><Dumbbell size={22}/></div><div><h2>برنامه‌ای که می‌تونی تغییرش بدی</h2><p>جلسه‌ها، حرکات، تعداد ست و تکرارها قابل تنظیم‌اند. هر حرکت را با توان و شرایط خودت تطبیق بده.</p></div><button className="primary-btn" onClick={() => setShowWorkoutForm(v=>!v)}><CirclePlus size={17}/> برنامه جدید</button></section>
        <div className="workout-layout"><section className="panel workout-list"><div className="panel-title"><div><h3>برنامه‌های من</h3><p>{data.workouts.length} برنامه</p></div><Settings2 size={18}/></div>{data.workouts.map(w=><button key={w.id} className={selectedWorkout===w.id?'plan-choice selected':'plan-choice'} onClick={()=>setSelectedWorkout(w.id)}><div className="mini-icon"><Dumbbell size={18}/></div><div className="mini-copy"><b>{w.title}</b><small>{w.exercises.length} حرکت · {w.minutes} دقیقه</small></div>{selectedWorkout===w.id&&<Check size={17}/>}</button>)}</section>
          {workout && <section className="panel workout-detail"><div className="panel-title"><div><span className="eyebrow">{workout.subtitle}</span><h2>{workout.title}</h2><p>{workout.minutes} دقیقه · {workout.exercises.length} حرکت</p></div><button className="icon-btn" onClick={()=>setShowWorkoutForm(v=>!v)} aria-label="Edit plan"><Pencil size={17}/></button></div>
            <div className="safety-hint"><Heart size={16}/> اگر حرکت درد ایجاد می‌کند، متوقفش کن و نسخه مناسب‌تری انتخاب کن. این برنامه جای ارزیابی تخصصی را نمی‌گیرد.</div>
            <div className="exercise-list">{workout.exercises.map((ex,i)=><div className={ex.done?'exercise-row done':'exercise-row'} key={ex.id}><button className="exercise-check" onClick={()=>toggleExercise(workout.id,ex.id)} aria-label={ex.done?'Mark incomplete':'Mark complete'}>{ex.done?<Check size={17}/>:i+1}</button><div className="exercise-main"><b>{ex.name}</b><div className="exercise-settings"><label>ست <input type="number" min="1" max="20" value={ex.sets} onChange={e=>setData(d=>({...d,workouts:d.workouts.map(w=>w.id!==workout.id?w:{...w,exercises:w.exercises.map(x=>x.id!==ex.id?x:{...x,sets:Math.max(1,Number(e.target.value)||1)})})}))}/></label><label>تکرار / مدت <input value={ex.reps} onChange={e=>setData(d=>({...d,workouts:d.workouts.map(w=>w.id!==workout.id?w:{...w,exercises:w.exercises.map(x=>x.id!==ex.id?x:{...x,reps:e.target.value})})}))}/></label></div></div><button className="remove-btn" onClick={()=>setData(d=>({...d,workouts:d.workouts.map(w=>w.id!==workout.id?w:{...w,exercises:w.exercises.filter(x=>x.id!==ex.id)})}))} aria-label="Remove exercise"><X size={16}/></button></div>)}</div>
            <form className="add-exercise" onSubmit={e=>{ e.preventDefault(); const name=exerciseName.trim(); if(!name)return; setData(d=>({...d,workouts:d.workouts.map(w=>w.id!==workout.id?w:{...w,exercises:[...w.exercises,{id:uid(),name,sets:2,reps:'8 reps',done:false}]})})); setExerciseName('') }}><input value={exerciseName} onChange={e=>setExerciseName(e.target.value)} placeholder="نام حرکت جدید..." aria-label="New exercise name"/><button className="secondary-btn" type="submit"><Plus size={16}/> افزودن حرکت</button></form>
            <button className="primary-btn full-btn" onClick={()=>finishWorkout(workout.id)}><Check size={17}/> ثبت این جلسه به‌عنوان انجام‌شده</button>
          </section>}
        </div>
        {showWorkoutForm && <div className="modal-backdrop" onClick={()=>setShowWorkoutForm(false)}><form className="modal-card" onClick={e=>e.stopPropagation()} onSubmit={addWorkout}><div className="panel-title"><h3>ساخت برنامه جدید</h3><button type="button" className="icon-btn" onClick={()=>setShowWorkoutForm(false)}><X size={17}/></button></div><label>نام برنامه<input value={workoutName} onChange={e=>setWorkoutName(e.target.value)} placeholder="مثلاً تمرین قدرتی A" required/></label><label>اولین حرکت (اختیاری)<input value={exerciseName} onChange={e=>setExerciseName(e.target.value)} placeholder="مثلاً شنا روی دیوار"/></label><button className="primary-btn full-btn">ساخت برنامه</button></form></div>}
      </div>}

      {tab === 'food' && <div className="page-content">
        <section className="intro-strip"><div className="intro-icon food"><Utensils size={22}/></div><div><h2>ثبت غذا با منبع مشخص</h2><p>مقادیر غذایی تخمینی‌اند و با برند، روش پخت و اندازه واقعی تغییر می‌کنند. منبع هر مورد را بررسی کن.</p></div><button className="primary-btn" onClick={()=>setEditGoals(v=>!v)}><Settings2 size={17}/> هدف روزانه</button></section>
        <section className="panel food-search-panel"><div className="search-field"><Search size={18}/><input value={foodSearch} onChange={e=>setFoodSearch(e.target.value)} placeholder="جست‌وجوی غذا، مثل جو دوسر یا برنج..." aria-label="Search foods"/></div><div className="food-catalog">{catalog.map(f=><article className="catalog-item" key={f.id}><div className="food-dot"><Utensils size={15}/></div><div className="catalog-copy"><b>{f.name}</b><small>{f.amount} {f.unit} · {formatNum(f.kcal)} kcal</small><small className="source-text">منبع: {f.source}</small><small>پروتئین {f.protein}g · کربوهیدرات {f.carbs}g · چربی {f.fat}g</small></div><button className="add-round" onClick={()=>addFood(f)} aria-label={`Add ${f.name}`}><Plus size={18}/></button></article>)}</div><button className="secondary-btn custom-food-btn" onClick={()=>setShowFoodForm(v=>!v)}><CirclePlus size={17}/> ثبت غذای دلخواه</button></section>
        <section className="panel"><div className="panel-title"><div><h3>جمع امروز</h3><p>بر اساس موارد ثبت‌شده</p></div><Flame size={19}/></div><div className="nutrition-totals"><div><span>کالری</span><b>{formatNum(kcal)}</b><small>از {formatNum(data.goalKcal)}</small></div><div><span>پروتئین</span><b>{protein.toFixed(1)} g</b><small>از {data.goalProtein} g</small></div><div><span>کربوهیدرات</span><b>{carbs.toFixed(1)} g</b></div><div><span>چربی</span><b>{fat.toFixed(1)} g</b></div></div>{day.foods.length>0&&<div className="logged-foods">{day.foods.map(f=><div key={f.id} className="logged-food"><div><b>{f.name}</b><small>{f.amount} {f.unit} · {f.source}</small></div><strong>{formatNum(f.kcal)} kcal</strong><button className="remove-btn" onClick={()=>updateDay({...day,foods:day.foods.filter(x=>x.id!==f.id)})} aria-label="Remove food"><X size={15}/></button></div>)}</div>}</section>
        {showFoodForm && <form className="panel custom-food-form" onSubmit={saveCustomFood}><div className="panel-title"><h3>غذای دلخواه</h3><button type="button" className="icon-btn" onClick={()=>setShowFoodForm(false)}><X size={17}/></button></div><label>نام غذا<input value={customFood.name} onChange={e=>setCustomFood({...customFood,name:e.target.value})} required/></label><div className="form-grid"><label>مقدار (گرم)<input type="number" min="1" value={customFood.amount} onChange={e=>setCustomFood({...customFood,amount:e.target.value})}/></label><label>کالری<input type="number" min="0" value={customFood.kcal} onChange={e=>setCustomFood({...customFood,kcal:e.target.value})} required/></label><label>پروتئین (g)<input type="number" min="0" step=".1" value={customFood.protein} onChange={e=>setCustomFood({...customFood,protein:e.target.value})}/></label><label>کربوهیدرات (g)<input type="number" min="0" step=".1" value={customFood.carbs} onChange={e=>setCustomFood({...customFood,carbs:e.target.value})}/></label><label>چربی (g)<input type="number" min="0" step=".1" value={customFood.fat} onChange={e=>setCustomFood({...customFood,fat:e.target.value})}/></label></div><label>منبع داده (اجباری)<input value={customFood.source} onChange={e=>setCustomFood({...customFood,source:e.target.value})} placeholder="نام منبع یا برچسب محصول" required/></label><button className="primary-btn full-btn">ثبت غذا</button></form>}
        {editGoals && <form className="panel goals-form" onSubmit={saveGoals}><div className="panel-title"><h3>اهداف روزانه</h3><button type="button" className="icon-btn" onClick={()=>setEditGoals(false)}><X size={17}/></button></div><div className="form-grid"><label>هدف کالری<input type="number" min="0" value={goalKcal} onChange={e=>setGoalKcal(e.target.value)}/></label><label>هدف پروتئین (گرم)<input type="number" min="0" value={goalProtein} onChange={e=>setGoalProtein(e.target.value)}/></label></div><button className="primary-btn full-btn">ذخیره اهداف</button></form>}
      </div>}

      {tab === 'progress' && <div className="page-content">
        <section className="hero-card progress-hero"><div className="hero-copy"><span className="eyebrow">پیشرفت تو، با معیارهای خودت</span><h2>قرار نیست هر روز عالی باشه.</h2><p>ثبات یعنی برگشتن به مسیر، حتی بعد از روزهای معمولی.</p></div><Companion mood={mood}/></section>
        <div className="stats-grid"><article className="stat-card"><div className="stat-icon lilac"><Dumbbell size={19}/></div><span>جلسه‌های ثبت‌شده امروز</span><strong>{day.workouts.length}</strong><small>هر جلسه ثبت‌شده در تاریخچه نگه‌داری می‌شود.</small></article><article className="stat-card"><div className="stat-icon mint"><Utensils size={19}/></div><span>کالری امروز</span><strong>{formatNum(kcal)}</strong><small>هدف شخصی: {formatNum(data.goalKcal)} kcal</small></article><article className="stat-card"><div className="stat-icon peach"><Activity size={19}/></div><span>حرکت‌های تکمیل‌شده</span><strong>{doneExercises}/{allExercises}</strong><small>پیشرفت فعلی برنامه‌های تمرینی</small></article></div>
        <section className="panel"><div className="panel-title"><div><h3>ثبت‌های اخیر</h3><p>مروری بر روزهای ثبت‌شده روی همین دستگاه</p></div><BarChart3 size={18}/></div><div className="history-list">{Object.values(data.logs).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7).map(log=>{const c=log.foods.reduce((s,f)=>s+f.kcal,0);return <div className="history-row" key={log.date}><div className="history-date"><b>{new Date(log.date+'T12:00:00').toLocaleDateString('fa-IR',{day:'numeric'})}</b><small>{new Date(log.date+'T12:00:00').toLocaleDateString('fa-IR',{month:'short',weekday:'short'})}</small></div><div className="history-main"><b>{c.toLocaleString('fa-IR')} کیلوکالری</b><small>{log.foods.length} مورد غذا · {log.workouts.length} جلسه ورزشی</small></div><div className="history-meter"><i style={{width:`${Math.min(100,data.goalKcal?c/data.goalKcal*100:0)}%`}}/></div></div>})}{Object.keys(data.logs).length===0&&<div className="empty-state">وقتی غذا یا جلسه ورزشی ثبت کنی، تاریخچه اینجا نمایش داده می‌شود.</div>}</div></section>
        <button className="secondary-btn reset-btn" onClick={()=>{if(window.confirm('فقط داده‌های آزمایشی این دستگاه پاک شود؟')){setData(initialData);localStorage.removeItem('companion-fitness-v1');setNotice('داده‌های آزمایشی این دستگاه پاک شد')}}}><RotateCcw size={16}/> پاک‌کردن داده‌های آزمایشی این دستگاه</button>
      </div>}

      <footer className="app-footer">نسخه اولیه · داده‌ها فعلاً روی همین دستگاه ذخیره می‌شوند · همگام‌سازی ابری در مرحله بعد</footer>
    </main>
    {notice && <div className="toast"><Check size={16}/>{notice}</div>}
    {showFoodForm && tab !== 'food' && null}
  </div>
}
