/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  BookOpen, 
  BarChart2, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Smile, 
  Frown, 
  Meh,
  Settings as SettingsIcon,
  Calendar,
  Flame
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  Mention, 
  JournalEntry, 
  MoodCheck, 
  UserProfile, 
  DailyStats 
} from './types';
import { analyzeJournalEntry } from './services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

// --- Mock Data ---
const MOCK_STATS: DailyStats[] = [
  { date: subDays(new Date(), 6).toISOString(), mentionCount: 12, averageMood: 2, journalCount: 1 },
  { date: subDays(new Date(), 5).toISOString(), mentionCount: 8, averageMood: 2.5, journalCount: 2 },
  { date: subDays(new Date(), 4).toISOString(), mentionCount: 15, averageMood: 1.5, journalCount: 1 },
  { date: subDays(new Date(), 3).toISOString(), mentionCount: 6, averageMood: 3, journalCount: 3 },
  { date: subDays(new Date(), 2).toISOString(), mentionCount: 4, averageMood: 3.5, journalCount: 1 },
  { date: subDays(new Date(), 1).toISOString(), mentionCount: 2, averageMood: 4, journalCount: 2 },
  { date: new Date().toISOString(), mentionCount: 3, averageMood: 3.8, journalCount: 1 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'journal' | 'dashboard' | 'insights'>('tracker');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [moods, setMoods] = useState<MoodCheck[]>([]);
  const [user, setUser] = useState<UserProfile>({
    name: "",
    onboarded: false,
    streak: 0,
    lettingGoScore: 0
  });

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedMentions = localStorage.getItem('mentions');
    const savedJournals = localStorage.getItem('journals');
    const savedMoods = localStorage.getItem('moods');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedMentions) setMentions(JSON.parse(savedMentions).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    if (savedJournals) setJournals(JSON.parse(savedJournals).map((j: any) => ({ ...j, timestamp: new Date(j.timestamp) })));
    if (savedMoods) setMoods(JSON.parse(savedMoods).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('mentions', JSON.stringify(mentions));
    localStorage.setItem('journals', JSON.stringify(journals));
    localStorage.setItem('moods', JSON.stringify(moods));
  }, [user, mentions, journals, moods]);

  const addMention = () => {
    const newMention: Mention = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      source: 'manual'
    };
    setMentions([newMention, ...mentions]);
  };

  const todayMentions = mentions.filter(m => isSameDay(m.timestamp, new Date())).length;

  if (!user.onboarded) {
    return <OnboardingScreen onComplete={(name) => setUser({ ...user, name, onboarded: true, streak: 1, lettingGoScore: 50 })} />;
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-neutral-bg flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-lavender/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-rose/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hello, {user.name}</h1>
          <p className="text-slate-500 text-sm">One day at a time. You've got this.</p>
        </div>
        <button className="p-2 rounded-full glass hover:bg-white transition-colors">
          <SettingsIcon className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'tracker' && (
            <TrackerScreen 
              key="tracker" 
              todayCount={todayMentions} 
              onAdd={addMention} 
              streak={user.streak}
            />
          )}
          {activeTab === 'journal' && (
            <JournalScreen 
              key="journal" 
              journals={journals} 
              onAdd={(entry) => setJournals([entry, ...journals])} 
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardScreen 
              key="dashboard" 
              stats={MOCK_STATS} 
              score={user.lettingGoScore}
            />
          )}
          {activeTab === 'insights' && (
            <InsightsScreen 
              key="insights" 
              journals={journals}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/40 px-6 py-4 flex justify-between items-center z-50">
        <NavButton 
          active={activeTab === 'tracker'} 
          onClick={() => setActiveTab('tracker')} 
          icon={<Heart className="w-6 h-6" />} 
          label="Track" 
        />
        <NavButton 
          active={activeTab === 'journal'} 
          onClick={() => setActiveTab('journal')} 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Journal" 
        />
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<BarChart2 className="w-6 h-6" />} 
          label="Stats" 
        />
        <NavButton 
          active={activeTab === 'insights'} 
          onClick={() => setActiveTab('insights')} 
          icon={<Sparkles className="w-6 h-6" />} 
          label="AI Coach" 
        />
      </nav>
    </div>
  );
}

function OnboardingScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-neutral-bg flex flex-col p-8 justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-lavender/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-rose/20 rounded-full blur-3xl" />
      
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-800 leading-tight">Welcome to your <span className="text-lavender">healing</span> journey.</h1>
              <p className="text-slate-500">We're here to help you move forward, one day at a time.</p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-slate-700">What should we call you?</p>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-4 glass rounded-2xl outline-none focus:ring-2 focus:ring-lavender text-lg"
              />
              <button 
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full py-4 bg-lavender text-white rounded-2xl font-bold shadow-lg shadow-lavender/20 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-800">How are you feeling today, {name}?</h2>
              <p className="text-slate-500">Be honest with yourself. This is a safe space.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {['Heartbroken', 'Angry', 'Confused', 'Numb', 'Ready to move on'].map(feeling => (
                <button 
                  key={feeling}
                  onClick={() => onComplete(name)}
                  className="w-full p-5 glass rounded-2xl text-left font-medium text-slate-700 hover:bg-white hover:scale-[1.02] transition-all flex justify-between items-center"
                >
                  {feeling}
                  <ChevronRight className="w-5 h-5 text-lavender" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Screens ---

function TrackerScreen({ todayCount, onAdd, streak }: { todayCount: number, onAdd: () => void, streak: number, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Streak Card */}
      <div className="glass rounded-3xl p-4 flex items-center gap-4 border-l-4 border-l-rose">
        <div className="w-12 h-12 rounded-2xl bg-rose/10 flex items-center justify-center">
          <Flame className="w-6 h-6 text-rose" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Streak</p>
          <p className="text-lg font-bold text-slate-800">{streak} Days of Healing</p>
        </div>
      </div>

      {/* Main Counter */}
      <div className="relative aspect-square flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender/30 to-blue-calm/30 rounded-full blur-2xl animate-pulse" />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="relative w-64 h-64 rounded-full glass flex flex-col items-center justify-center border-4 border-white/50 shadow-xl group"
        >
          <span className="text-6xl font-bold text-slate-800 mb-2">{todayCount}</span>
          <span className="text-slate-500 font-medium">Mentions Today</span>
          <div className="mt-4 p-3 rounded-full bg-white/50 group-hover:bg-white transition-colors">
            <Plus className="w-6 h-6 text-lavender" />
          </div>
        </motion.button>
      </div>

      {/* Insight Card */}
      <div className="glass rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-lavender">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">Daily Awareness</h3>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Every time you tap, you're becoming more aware. Awareness is the first step to letting go. You're doing great.
        </p>
      </div>
    </motion.div>
  );
}

function JournalScreen({ journals, onAdd }: { journals: JournalEntry[], onAdd: (e: JournalEntry) => void, key?: string }) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mood, setMood] = useState(3);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    
    const analysis = await analyzeJournalEntry(content);
    
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      content,
      mood,
      mentionsDetected: analysis.mentions,
      aiInsights: analysis.insight
    };
    
    onAdd(newEntry);
    setContent('');
    setIsAnalyzing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-800">How are you feeling?</h3>
        <div className="flex justify-between px-4">
          {[1, 2, 3, 4, 5].map((m) => (
            <button 
              key={m}
              onClick={() => setMood(m)}
              className={cn(
                "p-3 rounded-2xl transition-all",
                mood === m ? "bg-lavender text-white scale-110 shadow-lg" : "bg-white/50 text-slate-400 hover:bg-white"
              )}
            >
              {m === 1 && <Frown className="w-6 h-6" />}
              {m === 2 && <Frown className="w-6 h-6 opacity-60" />}
              {m === 3 && <Meh className="w-6 h-6" />}
              {m === 4 && <Smile className="w-6 h-6 opacity-60" />}
              {m === 5 && <Smile className="w-6 h-6" />}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write whatever is on your mind..."
          className="w-full h-40 bg-white/50 rounded-2xl p-4 focus:ring-2 focus:ring-lavender outline-none resize-none text-slate-700 placeholder:text-slate-400"
        />
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || !content.trim()}
          className="w-full py-4 bg-gradient-to-r from-lavender to-blue-calm text-white rounded-2xl font-bold shadow-lg shadow-lavender/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI is listening...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Save Entry
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Recent Reflections</h3>
        {journals.map((j) => (
          <div key={j.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400">{format(j.timestamp, 'MMM d, h:mm a')}</span>
              <div className="flex gap-1">
                {Array.from({ length: j.mentionsDetected }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose" />
                ))}
              </div>
            </div>
            <p className="text-slate-700 text-sm line-clamp-2">{j.content}</p>
            {j.aiInsights && (
              <div className="mt-2 p-3 bg-lavender/10 rounded-xl border border-lavender/20">
                <p className="text-xs text-lavender font-medium italic">"{j.aiInsights}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DashboardScreen({ stats, score }: { stats: DailyStats[], score: number, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      {/* Score Card */}
      <div className="glass rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-peach/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-2">Letting Go Score</h3>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-lavender via-rose to-peach">
          {score}%
        </div>
        <p className="text-slate-400 text-xs mt-4">Based on mention reduction and mood stability</p>
      </div>

      {/* Chart */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-calm" />
          Weekly Mentions
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats}>
              <defs>
                <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => format(new Date(str), 'EEE')}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(str) => format(new Date(str), 'MMMM d')}
              />
              <Area 
                type="monotone" 
                dataKey="mentionCount" 
                stroke="#C4B5FD" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMentions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Mentions</p>
          <p className="text-2xl font-bold text-slate-800">49</p>
          <p className="text-[10px] text-green-500 font-medium">↓ 12% from last week</p>
        </div>
        <div className="glass rounded-3xl p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg. Mood</p>
          <p className="text-2xl font-bold text-slate-800">3.2</p>
          <p className="text-[10px] text-green-500 font-medium">↑ 0.4 from last week</p>
        </div>
      </div>
    </motion.div>
  );
}

function InsightsScreen({ journals }: { journals: JournalEntry[], key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="glass rounded-3xl p-6 bg-gradient-to-br from-lavender/10 to-blue-calm/10 border-lavender/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-lavender" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Healing Insights</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Based on your patterns this week, your AI coach has identified a few things to help you move forward.
        </p>
      </div>

      <div className="space-y-4">
        <InsightItem 
          title="The Evening Peak"
          description="You tend to mention them more between 8 PM and 11 PM. This is often when we feel most lonely."
          action="Try a new evening ritual, like reading or a warm bath."
          color="bg-blue-calm/10 text-blue-calm"
        />
        <InsightItem 
          title="Mood Correlation"
          description="Your mood is 40% higher on days when you mention them less than 5 times."
          action="Focus on the feeling of peace you have on those low-mention days."
          color="bg-rose/10 text-rose"
        />
        <InsightItem 
          title="Growth Detected"
          description="You're using more 'future-focused' words in your journals compared to last week."
          action="Keep looking ahead. The best is yet to come."
          color="bg-peach/10 text-peach"
        />
      </div>

      <div className="glass rounded-3xl p-6 text-center space-y-4">
        <h4 className="font-bold text-slate-800">Need a distraction?</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Call a friend', 'Go for a walk', 'Listen to a podcast', 'Draw something', 'Cook a new meal'].map(act => (
            <span key={act} className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-500 border border-slate-100 shadow-sm">
              {act}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InsightItem({ title, description, action, color }: { title: string, description: string, action: string, color: string }) {
  return (
    <div className="glass rounded-3xl p-6 space-y-3 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl opacity-50", color.split(' ')[0])} />
      <h4 className="font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <ChevronRight className="w-4 h-4" />
        {action}
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-lavender scale-110" : "text-slate-400 hover:text-slate-600"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-all",
        active ? "bg-lavender/10 shadow-inner" : ""
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

