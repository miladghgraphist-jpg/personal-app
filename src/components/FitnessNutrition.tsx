import { useMemo, useState } from 'react'
import { Activity, Apple, Check, ChevronDown, CirclePlus, Dumbbell, Heart, Pencil, Plus, Save, Trash2, Utensils } from 'lucide-react'

export type FitnessExercise = { id: string; name: string; sets: number; reps: string }
export type FitnessWorkout = { id: string; name: string; duration: number; note: string; exercises: FitnessExercise[] }
export type FitnessFood = { id: string; name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number; source: string }
export type FitnessDay = { foods: FitnessFood[]; completedWorkouts: string[] }
export type FitnessData = {
  goalKcal: number | null
  goalProtein: number | null
  workouts: FitnessWorkout[]
  logs: Record<string, FitnessDay>
}
export const initialFitnessData: FitnessData = { goalKcal: null, goalProtein: null, workouts: [], logs: {} }

const id = () => globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
const number = (value: number) => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value)
const emptyDay = (): FitnessDay => ({ foods: [], completedWorkouts: [] })

export default function FitnessNutrition({ data, onChange, date }: { data: FitnessData; onChange: (next: FitnessData) => void; date: string }) {
  const [tab, setTab] = useState<'overview'|'workouts'|'food'|'progress'>('overview')
  const [workoutName, setWorkoutName] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [foodName, setFoodName] = useState('')
  const [foodAmount, setFoodAmount] = useState('100 گرم')
  const [foodKcal, setFoodKcal] = useState('')
  const [foodProtein, setFoodProtein] = useState('')
  const [foodCarbs, setFoodCarbs] = useState('')
  const [foodFat, setFoodFat] = useState('')
  const [foodSource, setFoodSource] = useState('')
  const [editingGoals, setEditingGoals] = useState(false)
  const [goalKcal, setGoalKcal] = useState(data.goalKcal?.toString() ?? '')
  const [goalProtein, setGoalProtein] = useState(data.goalProtein?.toString() ?? '')
  const day = data.logs[date] ?? emptyDay()
  const kcal = day.foods.reduce((sum, food) => sum + food.kcal, 0)
  const protein = day.foods.reduce((sum, food) => sum + food.protein, 0)
  const carbs = day.foods.reduce((sum, food) => sum + food.carbs, 0)
  const fat = day.foods.reduce((sum, food) => sum + food.fat, 0)
  const completedCount = day.completedWorkouts.length
  const recentDays = useMemo(() => Object.entries(data.logs).sort(([a],[b]) => b.localeCompare(a)).slice(0,7), [data.logs])
  const updateDay = (next: FitnessDay) => onChange({ ...data, logs: { ...data.logs, [date]: next } })
  const addWorkout = () => {
    if (!workoutName.trim()) return
    onChange({ ...data, workouts: [...data.workouts, { id: id(), name: workoutName.trim(), duration: 10, note: 'برنامه شخصی و قابل ویرایش', exercises: exerciseName.trim() ? [{ id: id(), name: exerciseName.trim(), sets: 1, reps: 'طبق توان و تأیید متخصص' }] : [] }] })
    setWorkoutName(''); setExerciseName('')
  }
  const addExercise = (workoutId: string) => {
    if (!exerciseName.trim()) return
    onChange({ ...data, workouts: data.workouts.map(w => w.id === workoutId ? { ...w, exercises: [...w.exercises, { id: id(), name: exerciseName.trim(), sets: 1, reps: 'قابل تنظیم' }] } : w) })
    setExerciseName('')
  }
  const addFood = () => {
    if (!foodName.trim() || !foodKcal.trim() || !foodSource.trim()) return
    const food: FitnessFood = { id: id(), name: foodName.trim(), amount: foodAmount.trim() || 'ثبت نشده', kcal: Math.max(0, Number(foodKcal)||0), protein: Math.max(0, Number(foodProtein)||0), carbs: Math.max(0, Number(foodCarbs)||0), fat: Math.max(0, Number(foodFat)||0), source: foodSource.trim() }
    updateDay({ ...day, foods: [...day.foods, food] })
    setFoodName(''); setFoodAmount('100 گرم'); setFoodKcal(''); setFoodProtein(''); setFoodCarbs(''); setFoodFat(''); setFoodSource('')
  }
  const saveGoals = () => {
    onChange({ ...data, goalKcal: goalKcal.trim() ? Math.max(0, Number(goalKcal)||0) : null, goalProtein: goalProtein.trim() ? Math.max(0, Number(goalProtein)||0) : null })
    setEditingGoals(false)
  }
  const toggleWorkout = (workoutId: string) => updateDay({ ...day, completedWorkouts: day.completedWorkouts.includes(workoutId) ? day.completedWorkouts.filter(x => x !== workoutId) : [...day.completedWorkouts, workoutId] })
  const removeFood = (foodId: string) => updateDay({ ...day, foods: day.foods.filter(f => f.id !== foodId) })

  return <section className="fitness-area" dir="rtl">
    <div className="fitness-heading"><div><span className="eyebrow"><Heart size={14}/> همراه سلامت</span><h1>تغذیه و تمرین، با سرعت خودت</h1><p>ثبت و پیگیری شخصی؛ هدف‌ها و برنامه‌ها قابل ویرایش‌اند.</p></div><div className="fitness-mascot" aria-label="همراه تشویق‌کننده"><span>✦</span><Heart size={27}/><small>{completedCount ? 'آفرین، ثبتش کردی' : kcal ? 'قدم‌به‌قدم جلو می‌ریم' : 'شروع کوچک هم ارزشمنده'}</small></div></div>
    <div className="fitness-safety"><Heart size={17}/><span>این بخش ابزار ثبت و پیگیری است، نه نسخه پزشکی. پیش از شروع یا افزایش شدت تمرین، با توجه به شرایط پزشکی‌ات از پزشک تأیید بگیر؛ اگر حرکت درد یا علامت نگران‌کننده ایجاد کرد، متوقفش کن.</span></div>
    <nav className="fitness-tabs" aria-label="بخش‌های همراه سلامت">
      {([['overview','خلاصه امروز'],['workouts','برنامه ورزشی'],['food','ثبت تغذیه'],['progress','پیشرفت']] as const).map(([key,label]) => <button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}
    </nav>
    {tab === 'overview' && <>
      <div className="fitness-stats">
        <article><span><Utensils size={17}/> کالری ثبت‌شده</span><strong>{number(kcal)}</strong><small>{data.goalKcal === null ? 'هدف روزانه تنظیم نشده' : `از ${number(data.goalKcal)} کیلوکالری`}</small></article>
        <article><span><Apple size={17}/> پروتئین</span><strong>{number(protein)} <small>گرم</small></strong><small>{data.goalProtein === null ? 'هدف پروتئین تنظیم نشده' : `از ${number(data.goalProtein)} گرم`}</small></article>
        <article><span><Activity size={17}/> تمرین ثبت‌شده</span><strong>{number(completedCount)}</strong><small>جلسه در امروز</small></article>
      </div>
      <div className="fitness-columns"><section className="fitness-panel"><div className="fitness-panel-title"><h2>امروز چه خوردی؟</h2><button onClick={()=>setTab('food')}>ثبت غذا <Plus size={15}/></button></div>{day.foods.length ? day.foods.map(food=><div className="fitness-food-row" key={food.id}><div><b>{food.name}</b><small>{food.amount} · منبع: {food.source}</small></div><strong>{number(food.kcal)} kcal</strong></div>) : <p className="fitness-empty">هنوز غذایی ثبت نشده است.</p>}</section>
      <section className="fitness-panel"><div className="fitness-panel-title"><h2>برنامه‌های من</h2><button onClick={()=>setTab('workouts')}>مدیریت برنامه <ChevronDown size={15}/></button></div>{data.workouts.length ? data.workouts.slice(0,4).map(w=><div className="fitness-workout-row" key={w.id}><Dumbbell size={18}/><div><b>{w.name}</b><small>{w.exercises.length} حرکت · {w.duration} دقیقه</small></div></div>) : <p className="fitness-empty">برنامه‌ای اضافه نشده؛ بعد از تأیید پزشکی می‌توانی برنامه مناسب خودت را ثبت کنی.</p>}</section></div>
    </>}
    {tab === 'workouts' && <div className="fitness-columns"><section className="fitness-panel"><h2>ساخت برنامه قابل ویرایش</h2><label className="fitness-label">نام برنامه<input value={workoutName} onChange={e=>setWorkoutName(e.target.value)} placeholder="مثلاً برنامه A"/></label><label className="fitness-label">اولین حرکت (اختیاری)<input value={exerciseName} onChange={e=>setExerciseName(e.target.value)} placeholder="نام حرکت"/></label><button className="fitness-primary" onClick={addWorkout}><CirclePlus size={16}/> ساخت برنامه</button><p className="fitness-hint">نمونه‌ها را خودت یا همراه متخصص وارد کن؛ این ابزار به‌تنهایی ایمنی حرکت را تأیید نمی‌کند.</p></section><section className="fitness-panel"><h2>برنامه‌ها و ثبت انجام</h2>{data.workouts.length ? data.workouts.map(w=><article className="fitness-plan" key={w.id}><div className="fitness-plan-head"><div className="fitness-plan-edit"><label>نام برنامه<input value={w.name} onChange={e=>onChange({...data,workouts:data.workouts.map(x=>x.id===w.id?{...x,name:e.target.value}:x)})}/></label><label>مدت (دقیقه)<input type="number" min="1" value={w.duration} onChange={e=>onChange({...data,workouts:data.workouts.map(x=>x.id===w.id?{...x,duration:Math.max(1,Number(e.target.value)||1)}:x)})}/></label><small>{w.exercises.length} حرکت</small></div><button aria-label="حذف برنامه" onClick={()=>onChange({...data,workouts:data.workouts.filter(x=>x.id!==w.id),logs:Object.fromEntries(Object.entries(data.logs).map(([k,v])=>[k,{...v,completedWorkouts:v.completedWorkouts.filter(x=>x!==w.id)}]))})}><Trash2 size={16}/></button></div>{w.exercises.map(ex=><div className="fitness-exercise" key={ex.id}><div className="fitness-exercise-fields"><label>نام حرکت<input value={ex.name} onChange={e=>onChange({...data,workouts:data.workouts.map(x=>x.id===w.id?{...x,exercises:x.exercises.map(y=>y.id===ex.id?{...y,name:e.target.value}:y)}:x)})}/></label><label>ست<input type="number" min="1" value={ex.sets} onChange={e=>onChange({...data,workouts:data.workouts.map(x=>x.id===w.id?{...x,exercises:x.exercises.map(y=>y.id===ex.id?{...y,sets:Math.max(1,Number(e.target.value)||1)}:y)}:x)})}/></label><label>تکرار / مدت<input value={ex.reps} onChange={e=>onChange({...data,workouts:data.workouts.map(x=>x.id===w.id?{...x,exercises:x.exercises.map(y=>y.id===ex.id?{...y,reps:e.target.value}:y)}:x)})}/></label></div><button aria-label="حذف حرکت" onClick={()=>onChange({...data,workouts:data.workouts.map(x=>x.id===w.id?{...x,exercises:x.exercises.filter(e=>e.id!==ex.id)}:x)})}><Trash2 size={15}/></button></div>)}<form className="fitness-inline-form" onSubmit={e=>{e.preventDefault();addExercise(w.id)}}><input value={exerciseName} onChange={e=>setExerciseName(e.target.value)} placeholder="افزودن حرکت"/><button aria-label="افزودن حرکت"><Plus size={16}/></button></form><button className={day.completedWorkouts.includes(w.id)?'fitness-done':'fitness-primary'} onClick={()=>toggleWorkout(w.id)}>{day.completedWorkouts.includes(w.id)?<Check size={16}/>:<Save size={16}/>} {day.completedWorkouts.includes(w.id)?'برای امروز ثبت شده':'ثبت انجام امروز'}</button></article>) : <p className="fitness-empty">هنوز برنامه‌ای وجود ندارد.</p>}</section></div>}
    {tab === 'food' && <div className="fitness-columns"><section className="fitness-panel"><h2>ثبت یک وعده یا خوراکی</h2><label className="fitness-label">نام غذا<input value={foodName} onChange={e=>setFoodName(e.target.value)} placeholder="مثلاً نان، تخم‌مرغ یا برنج"/></label><label className="fitness-label">مقدار<input value={foodAmount} onChange={e=>setFoodAmount(e.target.value)} placeholder="مثلاً ۲ عدد"/></label><div className="fitness-form-grid"><label className="fitness-label">کالری<input type="number" min="0" value={foodKcal} onChange={e=>setFoodKcal(e.target.value)} required/></label><label className="fitness-label">پروتئین (g)<input type="number" min="0" step=".1" value={foodProtein} onChange={e=>setFoodProtein(e.target.value)} /></label><label className="fitness-label">کربوهیدرات (g)<input type="number" min="0" step=".1" value={foodCarbs} onChange={e=>setFoodCarbs(e.target.value)} /></label><label className="fitness-label">چربی (g)<input type="number" min="0" step=".1" value={foodFat} onChange={e=>setFoodFat(e.target.value)} /></label></div><label className="fitness-label">منبع اطلاعات غذایی (اجباری)<input value={foodSource} onChange={e=>setFoodSource(e.target.value)} placeholder="برچسب محصول، USDA، منبع معتبر…"/></label><button className="fitness-primary" onClick={addFood}><Plus size={16}/> ثبت غذا</button><p className="fitness-hint">مقادیر را از برچسب محصول یا منبع معتبر وارد کن؛ اعداد دستی به‌عنوان داده تأییدنشده نمایش داده می‌شوند.</p></section><section className="fitness-panel"><h2>جمع امروز</h2><div className="fitness-nutrients"><span>کالری <b>{number(kcal)}</b></span><span>پروتئین <b>{number(protein)} g</b></span><span>کربوهیدرات <b>{number(carbs)} g</b></span><span>چربی <b>{number(fat)} g</b></span></div>{day.foods.map(food=><div className="fitness-food-row" key={food.id}><div><b>{food.name}</b><small>{food.amount} · {food.source}</small></div><strong>{number(food.kcal)} kcal</strong><button aria-label="حذف غذا" onClick={()=>removeFood(food.id)}><Trash2 size={15}/></button></div>)}</section></div>}
    {tab === 'progress' && <section className="fitness-panel"><h2>گزارش روزهای ثبت‌شده</h2><div className="fitness-progress-summary"><span>روزهای دارای ثبت <b>{number(recentDays.length)}</b></span><span>کالری امروز <b>{number(kcal)}</b></span><span>پروتئین امروز <b>{number(protein)} g</b></span><span>تمرین امروز <b>{number(completedCount)}</b></span></div>{recentDays.length ? recentDays.map(([dayKey,log])=><div className="fitness-history-row" key={dayKey}><b>{dayKey}</b><span>{number(log.foods.reduce((s,f)=>s+f.kcal,0))} kcal</span><span>{number(log.foods.reduce((s,f)=>s+f.protein,0))} g پروتئین</span><span>{number(log.completedWorkouts.length)} جلسه</span></div>) : <p className="fitness-empty">با ثبت غذا یا تمرین، گزارش اینجا نمایش داده می‌شود.</p>}<button className="fitness-secondary" onClick={()=>setEditingGoals(v=>!v)}><Pencil size={15}/> تنظیم هدف‌های اختیاری</button>{editingGoals&&<div className="fitness-goals"><label className="fitness-label">هدف کالری روزانه (اختیاری)<input type="number" min="0" value={goalKcal} onChange={e=>setGoalKcal(e.target.value)}/></label><label className="fitness-label">هدف پروتئین روزانه (اختیاری)<input type="number" min="0" value={goalProtein} onChange={e=>setGoalProtein(e.target.value)}/></label><button className="fitness-primary" onClick={saveGoals}>ذخیره هدف‌ها</button></div>}</section>}
  </section>
}
