import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, HeartPulse, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'

type Profile = {
  goal: string
  work: string
  level: string
  pain: string
  symptoms: string[]
  redFlags: string[]
  days: string
}
const STORAGE = 'fit-journey-clinical-v1'
const defaultProfile: Profile = { goal: 'forward-head', work: 'desk', level: 'beginner', pain: 'none', symptoms: [], redFlags: [], days: '3' }
const redFlagOptions = [
  'درد پس از ضربه یا تصادف اخیر',
  'ضعف جدید یا پیشرونده در دست/پا یا اختلال راه‌رفتن',
  'بی‌حسی گسترده یا رو به افزایش',
  'تب، کاهش وزن بی‌دلیل یا درد شدید و مداوم شبانه',
  'درد قفسه سینه یا تنگی نفس شدید/غیرمعمول همراه علائم',
]
const symptomOptions = ['درد گردن', 'گزگز یا بی‌حسی دست', 'سردرد مرتبط با گردن', 'خشکی بین کتف‌ها', 'بدون درد؛ فقط نگرانی از وضعیت بدن']
const exercises = [
  { id:'chin', title:'جمع‌کردن ملایم چانه', focus:['forward-head','general'], reps: '۵ تا ۸ تکرار', dose:'هر تکرار ۳ ثانیه نگه‌دار', detail:'نگاه روبه‌رو؛ سر را آرام به عقب بلغزان، بدون خم‌کردن رو به پایین یا فشار دادن.', avoid:'چانه را با زور به سینه نچسبان و گردن را نکش.', visual:'chin' },
  { id:'scap', title:'تنظیم آرام کتف‌ها', focus:['rounded-shoulders','forward-head','general'], reps:'۸ تا ۱۰ تکرار', dose:'۲ ثانیه مکث', detail:'شانه‌ها را پایین و کتف‌ها را اندکی به هم نزدیک کن؛ دنده‌ها را بیرون نده و کمر را گود نکن.', avoid:'شانه‌ها را بالا نکش و کتف‌ها را با حداکثر نیرو نفشار.', visual:'scap' },
  { id:'thoracic', title:'بازشدن ملایم پشت سینه‌ای روی صندلی', focus:['upper-back','rounded-shoulders','general'], reps:'۵ تا ۸ تکرار', dose:'آرام و بدون درد', detail:'روی صندلی محکم بنشین، دست‌ها را روی سینه بگذار و از قسمت بالای پشت کمی به پشتی تکیه بده.', avoid:'سر را به عقب پرت نکن و کمر را بیش از حد قوس نده.', visual:'thoracic' },
  { id:'break', title:'وقفهٔ حرکتی کنار میز', focus:['forward-head','rounded-shoulders','upper-back','general'], reps:'۱ تا ۲ دقیقه', dose:'هر ۳۰ تا ۶۰ دقیقه نشستن', detail:'بلند شو، چند قدم راه برو و موقع برگشت صفحه را روبه‌رو و نزدیک ارتفاع چشم تنظیم کن.', avoid:'نیازی به نگه‌داشتن بدن در یک حالت «کاملاً صاف» در تمام روز نیست.', visual:'break' },
]
const goals: Record<string,string> = {'forward-head':'سر متمایل به جلو','rounded-shoulders':'شانه‌های گرد/رو به جلو','upper-back':'خشکی یا گردی پشت فوقانی','general':'کاهش خشکی ناشی از نشستن'}
function MotionFigure({kind}:{kind:string}) {
  return <div className={'motion-visual motion-'+kind} aria-label="نمای آموزشی متحرک تمرین">
    <svg viewBox="0 0 260 150" role="img" aria-label="شخصیت آموزشی در حال اجرای حرکت کنترل‌شده">
      <defs><linearGradient id="shirt" x1="0" x2="1"><stop offset="0%" stopColor="#9bcbb0"/><stop offset="100%" stopColor="#4f9974"/></linearGradient></defs>
      <path d="M18 127 H242" stroke="#dfe9e0" strokeWidth="2" strokeLinecap="round"/>
      {kind==='break' ? <g className="figure-body"><circle cx="129" cy="30" r="14" fill="#8bcaa4"/><path d="M116 47 Q129 40 142 47 L151 83 L109 83Z" fill="url(#shirt)"/><path d="M115 55 L88 72 L79 60 M143 55 L163 68 L174 57" fill="none" stroke="#4f9974" strokeWidth="9" strokeLinecap="round"/><path d="M119 82 L111 112 L105 126 M140 82 L151 108 L157 125" fill="none" stroke="#527d66" strokeWidth="10" strokeLinecap="round"/><path d="M116 19 Q129 5 142 19" fill="#4a6a55"/><path d="M123 31 Q129 35 135 31" fill="none" stroke="#326d4e" strokeWidth="2" strokeLinecap="round"/></g> :
      <g className="figure-body"><path d="M58 124 H206" stroke="#c8d9cb" strokeWidth="5" strokeLinecap="round"/><path d="M70 124 V86 H198 V124" fill="none" stroke="#a9c8b4" strokeWidth="4" strokeLinecap="round"/><path d="M77 89 H191" stroke="#a9c8b4" strokeWidth="5" strokeLinecap="round"/><path d="M94 88 L94 123 M173 88 L173 123" stroke="#b7d0bd" strokeWidth="4" strokeLinecap="round"/><circle cx="129" cy="35" r="14" fill="#8bcaa4"/><path d="M116 26 Q105 7 118 16 L125 23 M140 24 Q154 5 145 17 L136 24" fill="#8bcaa4" stroke="#579d78" strokeWidth="2"/><path d="M118 50 Q129 45 140 50 L150 87 L108 87Z" fill="url(#shirt)"/><path d="M117 57 L103 76 M141 57 L155 76" fill="none" stroke="#4f9974" strokeWidth="8" strokeLinecap="round"/><path d="M118 86 L113 104 L108 119 M140 86 L145 104 L150 119" fill="none" stroke="#527d66" strokeWidth="9" strokeLinecap="round"/><path d="M124 37 Q129 40 134 37" fill="none" stroke="#326d4e" strokeWidth="2" strokeLinecap="round"/></g>}
      {kind==='chin' && <g className="motion-arrow"><path d="M162 31 H187" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round"/><path d="M181 25 L188 31 L181 37" fill="none" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><text x="188" y="20" fontSize="9" fill="#b87d43" textAnchor="middle">عقب</text></g>}
      {kind==='scap' && <g className="motion-arrow"><path d="M102 65 L116 65 M156 65 L142 65" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round"/><path d="M110 59 L116 65 L110 71 M148 59 L142 65 L148 71" fill="none" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>}
      {kind==='thoracic' && <g className="motion-arrow"><path d="M161 85 Q183 73 176 57" fill="none" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round"/><path d="M169 62 L176 56 L181 64" fill="none" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>}
      {kind==='break' && <g className="motion-arrow"><path d="M180 43 Q201 53 195 70" fill="none" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round"/><path d="M188 66 L195 72 L201 64" fill="none" stroke="#dc9d5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>}
    </svg>
    <span className="motion-caption"><Sparkles size={13}/> حرکت آرام و کنترل‌شده</span>
  </div>
}
export default function ClinicalTraining() {
  const [profile,setProfile] = useState<Profile>(()=>{ try { const v=localStorage.getItem(STORAGE); return v ? {...defaultProfile,...JSON.parse(v)} : defaultProfile } catch { return defaultProfile } })
  const [started,setStarted] = useState(false)
  useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(profile))}catch{}},[profile])
  const unsafe = profile.redFlags.length>0
  const requiresAssessment = profile.symptoms.includes('گزگز یا بی‌حسی دست') || profile.symptoms.includes('سردرد مرتبط با گردن') || profile.pain==='moderate' || profile.pain==='high'
  const minutes = profile.level==='beginner' ? '۶ تا ۸ دقیقه' : profile.level==='regular' ? '۱۰ تا ۱۲ دقیقه' : '۱۲ تا ۱۵ دقیقه'
  const plan = useMemo(()=>exercises.filter(e=>e.focus.includes(profile.goal) || e.id==='break'),[profile.goal])
  const change = (key:keyof Profile,value:string)=>setProfile(p=>({...p,[key]:value}))
  const toggle = (key:'symptoms'|'redFlags',value:string)=>setProfile(p=>({...p,[key]:p[key].includes(value)?p[key].filter(x=>x!==value):[...p[key],value]}))
  return <div className="clinical-wrap">
    <section className="clinical-hero"><div className="clinical-hero-copy"><span className="clinical-pill"><ShieldCheck size={14}/> برنامهٔ تمرینی مبتنی بر راهنما</span><h2>اول شرایطت را می‌شناسیم؛ بعد تمرین می‌چینیم.</h2><p>این ارزیابی کوتاه تشخیص پزشکی نیست. کمک می‌کند یک مسیر شروع محافظه‌کارانه و قابل تنظیم انتخاب کنی.</p></div><div className="clinical-mascot"><div className="mascot"><div className="mascot-blush left"/><div className="mascot-blush right"/><div className="mascot-eyes"><i/><i/></div><div className="mascot-mouth"/><div className="mascot-feet"><i/><i/></div></div><span>همراه تمرین</span></div></section>
    <section className="clinical-panel"><div className="clinical-section-title"><span>۰۱</span><div><h3>شناخت شرایط</h3><p>پاسخ‌ها روی همین دستگاه ذخیره می‌شوند.</p></div></div>
      <div className="clinical-fields">
        <label>هدف اصلی<select value={profile.goal} onChange={e=>change('goal',e.target.value)}><option value="forward-head">سر متمایل به جلو</option><option value="rounded-shoulders">شانه‌های گرد/رو به جلو</option><option value="upper-back">خشکی یا گردی پشت فوقانی</option><option value="general">خشکی ناشی از نشستن</option></select></label>
        <label>نوع فعالیت روزانه<select value={profile.work} onChange={e=>change('work',e.target.value)}><option value="desk">نشستن طولانی پشت میز</option><option value="standing">ایستادن طولانی</option><option value="mixed">ترکیبی از نشستن و حرکت</option></select></label>
        <label>سطح فعلی<select value={profile.level} onChange={e=>change('level',e.target.value)}><option value="beginner">تازه‌کار / آمادگی پایین</option><option value="regular">گاهی تمرین می‌کنم</option><option value="active">فعال و آشنا با تمرین</option></select></label>
        <label>شدت درد در حال حاضر<select value={profile.pain} onChange={e=>change('pain',e.target.value)}><option value="none">بدون درد</option><option value="mild">خفیف</option><option value="moderate">متوسط یا محدودکننده</option><option value="high">شدید یا رو به افزایش</option></select></label>
        <label>تعداد روزهای قابل انجام در هفته<select value={profile.days} onChange={e=>change('days',e.target.value)}><option value="2">۲ روز</option><option value="3">۳ روز</option><option value="4">۴ روز</option><option value="5">۵ روز</option></select></label>
      </div>
      <div className="clinical-question"><h4>کدام مورد درباره‌ات صدق می‌کند؟ (چند مورد قابل انتخاب است)</h4><div className="clinical-options">{symptomOptions.map(s=><label key={s} className={profile.symptoms.includes(s)?'clinical-check selected':'clinical-check'}><input type="checkbox" checked={profile.symptoms.includes(s)} onChange={()=>toggle('symptoms',s)}/><span>{s}</span></label>)}</div></div>
      <div className="clinical-question safety-question"><h4><AlertTriangle size={16}/> قبل از شروع، علائم هشدار را بررسی کن</h4><p>اگر هر موردی در حال حاضر وجود دارد، برنامهٔ خودکار را متوقف کن و به‌جای آن ارزیابی پزشکی بگیر.</p><div className="clinical-options">{redFlagOptions.map(s=><label key={s} className={profile.redFlags.includes(s)?'clinical-check warning selected':'clinical-check warning'}><input type="checkbox" checked={profile.redFlags.includes(s)} onChange={()=>toggle('redFlags',s)}/><span>{s}</span></label>)}</div></div>
      <div className="clinical-actions"><button className="primary-btn" onClick={()=>setStarted(true)}>ساخت برنامهٔ متناسب <span>←</span></button><button className="secondary-btn" onClick={()=>{setProfile(defaultProfile);setStarted(false)}}><RotateCcw size={14}/> پاک‌کردن پاسخ‌ها</button></div>
    </section>
    {started && <section className="clinical-panel generated-plan">
      {unsafe ? <div className="clinical-alert danger-alert"><AlertTriangle size={23}/><div><h3>فعلاً برنامهٔ تمرینی تولید نمی‌شود</h3><p>با توجه به علامت هشدار انتخاب‌شده، تمرین اصلاحی خودکار امن نیست. لطفاً ارزیابی پزشکی فوری/به‌موقع بگیر. اگر درد قفسه سینه، تنگی نفس شدید، ضعف ناگهانی یا اختلال جدید راه‌رفتن وجود دارد، با خدمات اورژانس محل تماس بگیر.</p></div></div> :
      <><div className="clinical-section-title"><span>۰۲</span><div><h3>مسیر شروع پیشنهادی تو</h3><p>هدف: {goals[profile.goal]} · {minutes} · {profile.days} روز در هفته</p></div></div>
      {requiresAssessment && <div className="clinical-alert"><HeartPulse size={21}/><div><strong>پیش از اجرای تمرین‌ها، ارزیابی متخصص توصیه می‌شود.</strong><p>درد متوسط/شدید، گزگز یا بی‌حسی و سردرد همراه گردن می‌تواند به بررسی فردی نیاز داشته باشد. برنامهٔ زیر جای ارزیابی پزشک یا فیزیوتراپیست را نمی‌گیرد؛ حرکتی که علامت را تشدید کند انجام نده.</p></div></div>}
      <div className="clinical-summary"><div><CheckCircle2 size={18}/><span>شروع با حجم کم</span></div><div><Clock3 size={18}/><span>افزایش تدریجی فقط در صورت تحمل</span></div><div><ShieldCheck size={18}/><span>بدون فشار یا کشش اجباری</span></div></div>
      <div className="exercise-cards">{plan.map((e,i)=><article className="exercise-card" key={e.id}><div className="exercise-card-top"><span className="exercise-index">{String(i+1).padStart(2,'0')}</span><span className="exercise-dose">{e.reps}</span></div><MotionFigure kind={e.visual}/><div className="exercise-copy"><h4>{e.title}</h4><p>{e.detail}</p><div className="dose-line"><strong>{e.dose}</strong><span>{e.id==='break'?'در طول روز':profile.level==='beginner'?'۱ دور در شروع':'۱ تا ۲ دور، در صورت تحمل'}</span></div><div className="avoid-line"><AlertTriangle size={14}/>{e.avoid}</div></div></article>)}</div>
      <div className="weekly-schedule"><strong>توزیع هفتگی پیشنهادی</strong><span>{profile.days} جلسه در هفته؛ بین جلسات کنترلی روز استراحت یا فعالیت سبک بگذار. وقفه‌های کوتاه را هر روز متناسب با نوع کار انجام بده.</span><small>{profile.work==='desk' ? 'برای کار پشت میز: هر ۳۰ تا ۶۰ دقیقه ۱ تا ۲ دقیقه تغییر وضعیت و چند قدم راه‌رفتن.' : profile.work==='standing' ? 'برای ایستادن طولانی: در طول روز بین ایستادن، نشستن و قدم‌زدن جابه‌جا شو؛ یک وضعیت ثابت را طولانی نگه ندار.' : 'برای کار ترکیبی: هر بار که مدت طولانی در یک وضعیت ماندی، وضعیت را عوض کن و چند حرکت راحت انجام بده.'}</small></div><div className="progression-box"><h3>قانون پیشرفت تدریجی</h3><ol><li><b>جلسهٔ اول:</b> یک دور، آرام و با دامنهٔ راحت شروع کن.</li><li><b>اگر حین حرکت و روز بعد علائم بدتر نشد:</b> ابتدا چند تکرار اضافه کن؛ بعد از چند جلسهٔ قابل‌تحمل می‌توانی دور دوم را اضافه کنی.</li><li><b>اگر درد تیز، سرگیجه، بی‌حسی/گزگز تازه یا تشدیدشونده داشتی:</b> حرکت را متوقف کن و ارزیابی مناسب بگیر.</li></ol><p>«صاف نشستن» را به حالت اجباری و ثابت تبدیل نکن؛ تغییر وضعیت و وقفه‌های کوتاه در طول روز مهم‌اند.</p></div>
      </>}
    </section>}
    <section className="clinical-sources"><h3>منابع و منطق طراحی</h3><p>این ماژول از راهنماها برای اصول کلی غربالگری، خودمدیریتی، فعالیت تدریجی و تمرین استفاده می‌کند؛ دوز دقیق برای هر فرد باید با معاینه و پاسخ واقعی بدن تنظیم شود.</p><ul><li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12620902/" target="_blank" rel="noreferrer">راهنمای بالینی آلمانی ۲۰۲۵ دربارهٔ درد غیراختصاصی گردن <ExternalLink size={12}/></a></li><li><a href="https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/" target="_blank" rel="noreferrer">NHS: مراقبت و علائم نیازمند ارزیابی برای درد گردن <ExternalLink size={12}/></a></li><li><a href="https://www.orthopt.org/content/s/neck-pain-2017" target="_blank" rel="noreferrer">راهنمای بالینی فیزیوتراپی APTA/JOSPT دربارهٔ گردن <ExternalLink size={12}/></a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/42445930/" target="_blank" rel="noreferrer">مرور نظام‌مند ۲۰۲۶ دربارهٔ تمرین درمانی در سرِ متمایل به جلو (با محدودیت‌های شواهد) <ExternalLink size={12}/></a></li></ul><small>شفافیت: این نسخه به اینترنت یا پروندهٔ پزشکی کاربر متصل نیست و تشخیص خودکار انجام نمی‌دهد. منابع باید در نگهداری محصول دوره‌ای بازبینی شوند.</small></section>
  </div>
}