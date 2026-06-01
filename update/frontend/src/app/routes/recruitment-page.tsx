import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Filter, Loader2, Star, 
  Briefcase, Users, UserCheck, Calendar, 
  TrendingUp, ArrowUpRight, Mail, Phone, 
  FileText, MessageSquare, MoreHorizontal,
  CheckCircle2, Clock, XCircle, LayoutGrid,
  List, PieChart as PieChartIcon, Target,
  Zap, Share2, Eye, Download, ChevronRight,
  MapPin, Award, BookOpen, Building2
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Types ---
interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  stage: string;
  source: string;
  jobTitle: string;
  experience: string;
  appliedDate: string;
  matchScore: number;
  avatar?: string;
  skills: string[];
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'Published' | 'Draft' | 'Archived';
  applicants: number;
  postedDate: string;
}

// --- Mock Data ---
const CANDIDATES: Candidate[] = [
  { id: '1', firstName: 'Aarav', lastName: 'Patel', email: 'aarav@example.com', phone: '+91 98765 43210', stage: 'Technical Round', source: 'LinkedIn', jobTitle: 'Senior Frontend Engineer', experience: '6 Years', appliedDate: '2025-05-10', matchScore: 92, skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: '2', firstName: 'Ishani', lastName: 'Sharma', email: 'ishani@example.com', phone: '+91 98765 43211', stage: 'Screening', source: 'Referral', jobTitle: 'Product Manager', experience: '4 Years', appliedDate: '2025-05-12', matchScore: 85, skills: ['Roadmap', 'Agile', 'Jira'] },
  { id: '3', firstName: 'Vikram', lastName: 'Singh', email: 'vikram@example.com', phone: '+91 98765 43212', stage: 'Applied', source: 'Indeed', jobTitle: 'Full Stack Developer', experience: '3 Years', appliedDate: '2025-05-14', matchScore: 78, skills: ['Node.js', 'PostgreSQL', 'Docker'] },
  { id: '4', firstName: 'Ananya', lastName: 'Iyer', email: 'ananya@example.com', phone: '+91 98765 43213', stage: 'Offer Sent', source: 'Direct', jobTitle: 'UI/UX Designer', experience: '5 Years', appliedDate: '2025-05-08', matchScore: 95, skills: ['Figma', 'Prototyping', 'User Research'] },
];

const JOBS: Job[] = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', status: 'Published', applicants: 48, postedDate: '2025-05-01' },
  { id: '2', title: 'Product Manager', department: 'Product', location: 'Mumbai, IN', type: 'Full-time', status: 'Published', applicants: 32, postedDate: '2025-05-05' },
  { id: '3', title: 'Data Scientist', department: 'Analytics', location: 'Bangalore, IN', type: 'Full-time', status: 'Draft', applicants: 0, postedDate: '2025-05-14' },
];

const FUNNEL_DATA = [
  { name: 'Applied', value: 450, fill: '#3b82f6' },
  { name: 'Screening', value: 320, fill: '#60a5fa' },
  { name: 'Technical', value: 120, fill: '#93c5fd' },
  { name: 'HR Round', value: 45, fill: '#bfdbfe' },
  { name: 'Hired', value: 12, fill: '#10b981' },
];

const TREND_DATA = [
  { month: 'Jan', applicants: 120, hires: 5 },
  { month: 'Feb', applicants: 150, hires: 8 },
  { month: 'Mar', applicants: 180, hires: 12 },
  { month: 'Apr', applicants: 210, hires: 10 },
  { month: 'May', applicants: 250, hires: 15 },
];

const PIPELINE_STAGES = [
  'Applied', 'Screening', 'Shortlisted', 'Technical Round', 'HR Round', 'Offer Sent', 'Hired', 'Rejected'
];

export function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="pb-10 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Recruitment Console</h1>
          <div className="flex items-center gap-3">
             <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100">
               Live: 12 Open Positions
             </span>
             <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
               <Users className="h-3.5 w-3.5" /> 24 New applicants today
             </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-wider">
            <Share2 className="mr-2 h-4 w-4" /> Career Page
          </Button>
          <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> Create New Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-slate-100/50 rounded-2xl mb-8">
          <TabsTrigger value="dashboard" className="rounded-xl py-3 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TrendingUp className="mr-2 h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="candidates" className="rounded-xl py-3 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="mr-2 h-4 w-4" /> Candidates
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-xl py-3 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Target className="mr-2 h-4 w-4" /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-xl py-3 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Briefcase className="mr-2 h-4 w-4" /> Job Postings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl py-3 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <PieChartIcon className="mr-2 h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Active Jobs" value="12" icon={Briefcase} trend="+2 new" color="text-blue-600" bg="bg-blue-50" />
                <StatCard title="Total Applicants" value="1,248" icon={Users} trend="+18% YoY" color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard title="Interviews Today" value="8" icon={Calendar} trend="3 completed" color="text-amber-600" bg="bg-amber-50" />
                <StatCard title="Offers Sent" value="5" icon={Award} trend="+1 this week" color="text-emerald-600" bg="bg-emerald-50" />
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                {/* Hiring Funnel Chart */}
                <Card className="lg:col-span-8 border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
                    <div>
                      <CardTitle className="text-lg font-black">Hiring Funnel</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase">Overall candidate progression across stages</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-black uppercase tracking-wider">
                      Export Report
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8">
                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ left: 40, right: 40 }}>
                             <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#64748b' }} />
                             <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                             <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                                {FUNNEL_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                             </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </CardContent>
                </Card>

                {/* Upcoming Interviews */}
                <Card className="lg:col-span-4 border-none shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 px-6 py-6">
                    <CardTitle className="text-base font-black">Upcoming Interviews</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                       {[1, 2, 3, 4].map(i => (
                         <div key={i} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">
                               VP
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-black text-slate-900 truncate">Vikram Patel</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Senior React Developer</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-indigo-600">10:30 AM</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Round 2</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t border-slate-50 text-center">
                     <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                       View All Interviews
                     </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'candidates' && (
            <motion.div
              key="candidates"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-col gap-4 px-8 py-6 border-b border-slate-50 md:flex-row md:items-center md:justify-between">
                   <div className="flex items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search by name, skill, or job..." className="h-10 pl-10 rounded-xl bg-slate-50/50 border-slate-200" />
                      </div>
                      <Button variant="outline" className="h-10 rounded-xl gap-2 font-bold text-xs">
                         <Filter className="h-4 w-4" /> Filters
                      </Button>
                   </div>
                   <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><LayoutGrid className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-slate-100"><List className="h-4 w-4" /></Button>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Candidate</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Application</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Stage</th>
                            <th className="px-8 py-4 text-center text-[10px] font-black uppercase text-slate-400">Match</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {CANDIDATES.map((c) => (
                            <tr key={c.id} className="group hover:bg-indigo-50/20 transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-2xl bg-slate-100 border flex items-center justify-center font-black text-xs uppercase">
                                     {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900">{c.firstName} {c.lastName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <p className="text-xs font-black text-slate-700">{c.jobTitle}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.experience} Exp • {c.source}</p>
                              </td>
                              <td className="px-8 py-4">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border",
                                  c.stage === 'Offer Sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                )}>
                                  {c.stage}
                                </span>
                              </td>
                              <td className="px-8 py-4">
                                <div className="flex flex-col items-center gap-1.5">
                                   <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.matchScore}%` }} />
                                   </div>
                                   <span className="text-[10px] font-black text-indigo-600">{c.matchScore}%</span>
                                </div>
                              </td>
                              <td className="px-8 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Eye className="h-4 w-4" /></Button>
                                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-amber-500"><Star className="h-4 w-4" /></Button>
                                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400"><MoreHorizontal className="h-4 w-4" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'pipeline' && (
             <motion.div
              key="pipeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar"
            >
               {PIPELINE_STAGES.map((stage) => (
                 <div key={stage} className="flex-shrink-0 w-[300px] space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                         {stage}
                         <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 border border-slate-200">
                           {CANDIDATES.filter(c => c.stage === stage).length}
                         </span>
                       </h3>
                       <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-slate-300 hover:text-slate-600"><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="min-h-[500px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 p-3 space-y-3">
                       {CANDIDATES.filter(c => c.stage === stage).map(c => (
                         <CandidateCard key={c.id} candidate={c} />
                       ))}
                    </div>
                 </div>
               ))}
             </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
               {JOBS.map(job => (
                 <JobCard key={job.id} job={job} />
               ))}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
               <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 px-8 py-6">
                      <CardTitle className="text-lg font-black">Monthly Hiring Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                       <div className="h-[260px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={TREND_DATA}>
                                <defs>
                                  <linearGradient id="colorHire" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94a3b8' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="applicants" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHire)" name="Applicants" />
                                <Area type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} fill="none" name="Hires" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 px-8 py-6">
                      <CardTitle className="text-lg font-black">Candidate Sources</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                       <div className="h-[260px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                  data={[
                                    { name: 'LinkedIn', value: 45 },
                                    { name: 'Referrals', value: 25 },
                                    { name: 'Direct', value: 15 },
                                    { name: 'Indeed', value: 10 },
                                    { name: 'Others', value: 5 },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                   {[ '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8' ].map((color, i) => (
                                      <Cell key={i} fill={color} />
                                   ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }} />
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                    </CardContent>
                  </Card>
               </div>

               <div className="grid gap-6 md:grid-cols-4">
                  <KPICard title="Average Time-to-Hire" value="24 Days" trend="-4 days vs LW" />
                  <KPICard title="Offer Acceptance Rate" value="82%" trend="+5% vs LW" />
                  <KPICard title="Cost-per-Hire" value="₹12,400" trend="On target" />
                  <KPICard title="Application Rate" value="3.2%" trend="+0.8% vs LW" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ title, value, icon: Icon, trend, color, bg }: any) {
  return (
    <Card className="border-none shadow-md overflow-hidden group hover:shadow-xl transition-all cursor-default bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl transition-colors", bg, color)}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">
             <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
      </CardContent>
    </Card>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group"
    >
       <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
             </div>
             <div>
                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.firstName} {candidate.lastName}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate w-[140px] uppercase tracking-tighter">{candidate.jobTitle}</p>
             </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-600 transition-colors">
             <MoreHorizontal className="h-4 w-4" />
          </Button>
       </div>
       <div className="flex flex-wrap gap-1.5 mb-4">
          {candidate.skills.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 rounded-lg bg-slate-50 text-[9px] font-bold text-slate-500 border border-slate-100">
               {skill}
            </span>
          ))}
       </div>
       <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{candidate.matchScore}% Match</span>
          </div>
          <div className="flex -space-x-2">
             {[1, 2].map(i => (
               <div key={i} className="h-5 w-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[7px] font-black uppercase">
                 JD
               </div>
             ))}
          </div>
       </div>
    </motion.div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white hover:shadow-2xl transition-all group group cursor-default">
       <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Briefcase className="h-5 w-5" />
             </div>
             <span className={cn(
               "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
               job.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
             )}>
                {job.status}
             </span>
          </div>
          <CardTitle className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs font-bold mt-2">
             <MapPin className="h-3 w-3" /> {job.location} • {job.department}
          </CardDescription>
       </CardHeader>
       <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mt-2">
             <div className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Applicants</p>
                <p className="text-lg font-black text-slate-900">{job.applicants}</p>
             </div>
             <div className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Open Days</p>
                <p className="text-lg font-black text-slate-900">14</p>
             </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
             <Button className="flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700">View Applicants</Button>
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600"><Share2 className="h-4 w-4" /></Button>
          </div>
       </CardContent>
    </Card>
  );
}

function KPICard({ title, value, trend }: any) {
  return (
    <Card className="border-none shadow-md rounded-2xl bg-white p-5 hover:shadow-xl transition-all border border-slate-100">
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{title}</p>
       <h4 className="text-xl font-black text-slate-900 mb-2">{value}</h4>
       <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50/50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100/50">
          <Zap className="h-3 w-3" /> {trend}
       </div>
    </Card>
  );
}
