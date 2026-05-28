import React, { useState, useEffect, useRef } from "react";
import { 
    LayoutDashboard, 
    Inbox, 
    Users, 
    KanbanSquare, 
    CheckSquare, 
    BarChart3, 
    Mic, 
    Search,
    Bell,
    Settings,
    Send,
    Activity,
    AlertCircle,
    UserCircle,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster, toast } from 'sonner';

type ViewType = 'dashboard' | 'inbox' | 'contacts' | 'pipeline' | 'tasks';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Voice Assistant State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState('');

  useEffect(() => {
     fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
      try {
          const res = await fetch('/api/dashboard');
          const data = await res.json();
          setDashboardData(data);
          setLoading(false);
      } catch(e) {
          console.error("Failed to fetch dashboard data", e);
          setLoading(false);
      }
  };

  const handleVoiceCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery.trim()) return;
    setIsProcessingVoice(true);
    setLastAIResponse("");
    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: voiceQuery })
        });
        const data = await res.json();
        if (data.error) {
           toast.error(data.error);
        } else {
           setLastAIResponse(data.text);
           setVoiceQuery("");
           fetchDashboardData(); // Refresh data to see new events
        }
    } catch(err) {
        toast.error("Failed to process command.");
    } finally {
        setIsProcessingVoice(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans">
      <Toaster position="top-right" theme="dark" />
      
      {/* Sidebar sidebar */}
      <aside className="w-64 flex flex-col border-r border-white/10 bg-[#0f0f0f] z-10 shrink-0 py-6">
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600">
            <div className="h-5 w-5 rounded-full border-4 border-white/20"></div>
          </div>
          <span className="text-xl font-medium tracking-tight text-white">Lumina OS</span>
        </div>

        <div className="px-4 flex-1 flex flex-col gap-2">
            <NavItem 
                icon={<LayoutDashboard size={18} />} 
                label="Command Center" 
                active={activeView === 'dashboard'} 
                onClick={() => setActiveView('dashboard')} 
            />
            <NavItem 
                icon={<Inbox size={18} />} 
                label="Unified Inbox" 
                badge="3"
                active={activeView === 'inbox'} 
                onClick={() => setActiveView('inbox')} 
            />
            <NavItem 
                icon={<Users size={18} />} 
                label="Contacts" 
                active={activeView === 'contacts'} 
                onClick={() => setActiveView('contacts')} 
            />
            <NavItem 
                icon={<KanbanSquare size={18} />} 
                label="Deals Pipeline" 
                active={activeView === 'pipeline'} 
                onClick={() => setActiveView('pipeline')} 
            />
            <NavItem 
                icon={<CheckSquare size={18} />} 
                label="Tasks & Automations" 
                active={activeView === 'tasks'} 
                onClick={() => setActiveView('tasks')} 
            />
        </div>

        <div className="p-4 mt-auto">
             <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group text-sm border-t border-white/10 pt-4 mt-4">
                <Avatar className="w-9 h-9 border border-white/20">
                    <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                    <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-slate-200 truncate">Agent Marcus</p>
                    <p className="text-xs text-slate-500 truncate">Command Center</p>
                </div>
                <Settings size={16} className="text-slate-500 group-hover:text-slate-300" />
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-transparent z-10 shrink-0">
          <div className="flex items-center gap-2 max-w-md w-full rounded-full border border-white/10 bg-white/5 px-4 py-2">
             <Search size={16} className="text-slate-500" />
             <input 
                type="text" 
                placeholder="Search across intelligence graph... (Hint: try 'Sarah's intent')" 
                className="bg-transparent border-none focus:outline-none w-full text-sm placeholder:text-slate-500 font-medium text-slate-100"
             />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1">
               <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
               <span className="text-[10px] font-bold uppercase text-orange-400">System Processing</span>
             </div>
             <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-300">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-orange-500 border border-[#0a0a0a]"></span>
             </Button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <ScrollArea className="flex-1 h-full w-full">
            <div className="p-8 max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <>
                        {activeView === 'dashboard' && <DashboardView data={dashboardData} />}
                        {activeView === 'inbox' && <InboxView />}
                        {activeView === 'contacts' && <ContactsView data={dashboardData} />}
                        {activeView === 'pipeline' && <PipelineView data={dashboardData} />}
                        {activeView === 'tasks' && <TasksView />}
                    </>
                )}
            </div>
        </ScrollArea>

        {/* Global Floating AI Voice/Command Bar */}
        <div className="absolute bottom-8 right-8 z-50">
             <Dialog open={isVoiceActive} onOpenChange={setIsVoiceActive}>
                <DialogTrigger asChild>
                    <Button 
                        size="icon" 
                        className="h-14 w-14 rounded-full shadow-2xl border-2 border-dashed border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-all hover:scale-105"
                    >
                        <Mic size={24} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border border-white/10 shadow-2xl rounded-2xl p-0 overflow-hidden bg-[#141414]">
                    <div className="p-6 text-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                <div className="h-4 w-4 bg-orange-500 rounded-sm"></div>
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-tighter text-slate-400">Push to Command</h3>
                                <p className="text-orange-400/70 text-xs mt-1">Listening for commands...</p>
                            </div>
                        </div>

                        <form onSubmit={handleVoiceCommand} className="mt-4 flex flex-col gap-3">
                            <Input 
                                value={voiceQuery}
                                onChange={e => setVoiceQuery(e.target.value)}
                                placeholder="E.g., 'Summarize today's leads'"
                                className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-orange-500"
                                autoFocus
                            />
                            <Button type="submit" disabled={isProcessingVoice || !voiceQuery.trim()} className="bg-orange-600 hover:bg-orange-700 text-white w-full">
                                {isProcessingVoice ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><Send className="mr-2 h-4 w-4" /> Execute Command</>
                                )}
                            </Button>
                        </form>

                        {lastAIResponse && (
                            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm leading-relaxed text-slate-300">{lastAIResponse}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
             </Dialog>
        </div>

      </main>
    </div>
  );
}

// -- Components --

function NavItem({ icon, label, badge, active, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                active 
                ? "bg-white/10 text-orange-400" 
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
            }`}
        >
            <div className={`${active ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}>
                {icon}
            </div>
            <span className="flex-1 text-left truncate">{label}</span>
            {badge && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${active ? "bg-orange-500/20 text-orange-500" : "bg-white/10 text-slate-400"}`}>
                    {badge}
                </span>
            )}
        </button>
    )
}

function DashboardView({ data }: { data: any }) {
    return (
        <div className="space-y-6 slide-in-bottom animation-delay-100 font-sans text-slate-100 h-full flex flex-col">
            <div>
                <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Operating System / Command Center</h1>
                <div className="text-xl font-medium tracking-tight mt-1 text-slate-100">Good morning, Agent Marcus.</div>
            </div>

            {/* Top Metrics Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl transition-shadow text-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-tighter text-slate-400 flex items-center justify-between">
                            Active Deals
                            <Activity size={16} className="text-emerald-400" />
                        </CardDescription>
                        <CardTitle className="text-3xl lg:text-4xl mt-3 text-slate-100">14</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <p className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md inline-block mt-2">+2 from last week</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl transition-shadow text-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-tighter text-slate-400 flex items-center justify-between">
                            AI Confidence Score
                            <BarChart3 size={16} className="text-orange-500" />
                        </CardDescription>
                        <CardTitle className="text-3xl lg:text-4xl mt-3 text-emerald-400">84%</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mt-2">Pipeline closing probability</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-orange-500/30 bg-orange-500/5 shadow-2xl transition-shadow text-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-tighter text-orange-400/80 flex items-center justify-between">
                            Urgent Follow-ups
                            <AlertCircle size={16} className="text-orange-500" />
                        </CardDescription>
                        <CardTitle className="text-3xl lg:text-4xl mt-3 text-orange-400">
                            {data?.alerts?.length || 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <p className="text-[10px] uppercase font-bold text-orange-500/70 mt-2">Action required today to prevent slip</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
                {/* Primary Column */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl flex flex-col text-slate-100 p-0">
                        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-tighter text-slate-400">Relationship Memory Stream</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 space-y-4">
                            {data?.alerts?.map((alert: any) => (
                                <div key={alert.id} className="rounded-lg border-l-2 border-orange-500 bg-white/5 p-4 flex gap-4">
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-[#0f0f0f]">
                                        <AlertCircle className="text-orange-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">AI Detected Risk</div>
                                        <h4 className="text-sm text-slate-200">{alert.message}</h4>
                                        <div className="flex gap-2 mt-3">
                                            <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 rounded-lg px-4 text-xs font-bold">Draft Email</Button>
                                            <Button size="sm" variant="outline" className="border-white/20 text-slate-300 hover:bg-white/10 rounded-lg text-xs">Dismiss</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!data?.alerts || data.alerts.length === 0) && (
                                <p className="text-sm text-slate-500">No urgent alerts.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl text-slate-100 p-0">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 p-5 pb-3">
                            <CardTitle className="text-xs font-black uppercase tracking-tighter text-slate-400">Recent AI Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="space-y-3 font-medium">
                                {data?.recentEvents && data.recentEvents.length > 0 ? data.recentEvents.map((evt: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <span className="text-xs text-slate-200">{evt.type}: {evt.payload}</span>
                                            <span className="text-[10px] text-slate-500 uppercase">Now</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-slate-500 opacity-50 uppercase tracking-widest">Awaiting interaction</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                     <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#141414] shadow-2xl text-slate-100 p-0">
                        <CardHeader className="p-5 pb-3 flex flex-row justify-between items-center">
                            <CardTitle className="text-xs font-black uppercase tracking-tighter text-slate-400">Closing Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="space-y-3">
                                {data?.deals?.map((deal: any) => (
                                    <div key={deal.id} className="group cursor-pointer rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10 border border-transparent hover:border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm text-slate-200">{deal.address}</span>
                                            <span className="font-mono text-xs text-emerald-400">Prob: {deal.probability}%</span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="h-1.5 flex-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${deal.probability}%` }}></div></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    )
}

function InboxView() {
    return (
        <div className="slide-in-bottom font-sans text-slate-100 h-full">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">Unified Inbox</h1>
                    <div className="text-xl font-medium tracking-tight mt-1 text-slate-100">Multi-channel communication</div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 rounded-lg hover:bg-white/10 hover:text-white"><Search className="w-4 h-4 mr-2"/>Filter</Button>
                </div>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl p-0 overflow-hidden text-slate-100">
                <div className="flex flex-col md:flex-row h-[600px]">
                    <div className="w-full md:w-80 border-r border-white/10 bg-[#0f0f0f]">
                        <div className="p-4 border-b border-white/10 flex gap-2">
                           <Badge className="bg-white text-[#0a0a0a]">All</Badge>
                           <Badge variant="secondary" className="bg-white/5 text-slate-400 hover:bg-white/10 border-none">Needs Reply</Badge>
                        </div>
                        <ScrollArea className="h-[calc(100%-65px)]">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${i === 1 ? 'bg-orange-500/10 border-l-4 border-l-orange-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-slate-200">Michael Chen</h4>
                                        <span className="font-mono text-[10px] text-slate-500">10:42 AM</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium mb-1 line-clamp-1 italic">Re: 902 Hillside Avenue Tour</p>
                                    <p className="text-xs text-slate-500 line-clamp-1">We loved the kitchen! What's the disclosure status?</p>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className="flex-1 bg-[#141414] flex flex-col items-center p-8">
                        {/* Placeholder for selected message view */}
                        <div className="max-w-2xl w-full bg-white/5 rounded-2xl border border-white/10 p-8 shadow-sm relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 opacity-20 rounded-t-2xl"></div>
                            
                            <div className="flex justify-between items-start pb-6 border-b border-white/10 mb-6">
                                <div className="flex gap-4 items-center">
                                     <Avatar className="w-12 h-12 border border-white/20">
                                        <AvatarImage src="https://i.pravatar.cc/150?u=a04258" />
                                        <AvatarFallback>MC</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-100">Michael Chen</h3>
                                        <p className="text-xs text-slate-500">michael.c@example.com <span className="mx-2">•</span> SMS</p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-none text-[10px] font-bold uppercase">Sentiment: Positive</Badge>
                            </div>
                            <div className="text-sm text-slate-300 leading-relaxed font-medium space-y-4">
                                <p>Hi! We absolutely loved the kitchen at the Hillside place. We're very interested in moving forward.</p>
                                <p>Could you clarify the status on the seller disclosures? Specifically looking for the roof age.</p>
                                <p className="text-slate-400">Thanks,<br/>Michael</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h4 className="text-xs font-black uppercase tracking-tighter text-slate-400 mb-4 flex items-center gap-2">
                                    <Activity size={12}/> AI Memory Layer Suggestions
                                </h4>
                                <div className="p-4 rounded-xl bg-orange-500/10 border-l-2 border-orange-500 mb-4">
                                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Suggested Next Action</p>
                                    <p className="text-sm text-slate-300">Reply confirming the roof is 8 years old (from MLS docs) and suggest drafting an offer.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button className="bg-white text-black hover:bg-slate-200 shadow-sm text-xs font-bold px-6">Draft Response</Button>
                                    <Button variant="outline" className="border-white/20 text-slate-300 hover:bg-white/10 bg-transparent text-xs">Create Task</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

function ContactsView({ data }: { data: any }) {
    return (
        <div className="slide-in-bottom font-sans text-slate-100">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">Intelligence Graph</h1>
                    <div className="text-xl font-medium tracking-tight mt-1 text-slate-100">Relationships augmented by memory</div>
                </div>
                <Button className="bg-white text-[#0a0a0a] shadow-sm hover:bg-slate-200">+ Add Node</Button>
            </div>

            <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl p-0 overflow-hidden text-slate-100">
                <Table>
                  <TableHeader className="bg-white/5 border-b border-white/10">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="py-4 text-xs font-black uppercase tracking-tighter text-slate-400">Contact (Node)</TableHead>
                      <TableHead className="text-xs font-black uppercase tracking-tighter text-slate-400">Stage</TableHead>
                      <TableHead className="text-xs font-black uppercase tracking-tighter text-slate-400">Intent / Confidence</TableHead>
                      <TableHead className="text-xs font-black uppercase tracking-tighter text-slate-400">Last Interaction</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.contacts?.map((contact: any) => (
                        <TableRow key={contact.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer">
                            <TableCell className="font-medium py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold">
                                        {contact.name.substring(0, 1)}
                                    </div>
                                    <span className="text-slate-200 font-bold">{contact.name}</span>
                                </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10">{contact.stage}</Badge></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                     <span className="font-mono text-xs text-orange-400">{contact.intentScore}%</span>
                                     <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${contact.intentScore}%` }}></div>
                                     </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">{contact.lastContact}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 hover:bg-white/10"><ChevronRight size={16}/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </Card>
        </div>
    )
}

function PipelineView({ data }: { data: any }) {
    const stages = ["Lead", "Qualified", "Touring", "Under Contract", "Closed"];
    
    return (
        <div className="slide-in-bottom h-[calc(100vh-140px)] flex flex-col font-sans text-slate-100">
            <div className="mb-6 flex items-end justify-between shrink-0">
                <div>
                    <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">Predictive Pipeline</h1>
                    <div className="text-xl font-medium tracking-tight mt-1 text-slate-100">Board sorted by closing probability</div>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-stretch">
                {stages.map((stage) => (
                    <div key={stage} className="min-w-[320px] w-80 bg-[#141414] rounded-2xl p-4 flex flex-col border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xs uppercase tracking-tighter text-slate-400">{stage}</h3>
                            <Badge variant="secondary" className="bg-white/10 text-slate-400 border-none">{stage === "Touring" ? 1 : 0}</Badge>
                        </div>
                        
                        <div className="flex flex-col gap-3 flex-1">
                             {stage === "Touring" && data?.deals?.map((deal: any) => (
                                 <Card key={deal.id} className="border-0 shadow-sm cursor-grab hover:ring-2 ring-emerald-500/20 transition-all group relative overflow-hidden bg-white/5 rounded-xl">
                                     <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                     <CardContent className="p-4 pl-5">
                                         <div className="flex justify-between items-start mb-2">
                                             <h4 className="font-semibold text-sm text-slate-200 leading-tight">{deal.address}</h4>
                                         </div>
                                         <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-1.5">
                                                <Activity size={14} className="text-emerald-500" />
                                                <span className="text-xs text-slate-400 font-medium">95% Prob</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-slate-500" />
                                                <span className="text-xs text-slate-400 font-medium">S. Jenkins</span>
                                            </div>
                                         </div>
                                     </CardContent>
                                 </Card>
                             ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TasksView() {
    return (
        <div className="slide-in-bottom font-sans text-slate-100">
            <div className="mb-6">
                <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">Task Engine</h1>
                <div className="text-xl font-medium tracking-tight mt-1 text-slate-100">AI-generated deterministic actions</div>
            </div>
             <Card className="rounded-2xl border border-white/10 bg-[#141414] shadow-2xl p-0 overflow-hidden text-slate-100">
                 <div className="p-12 text-center bg-white/5 rounded-xl border border-white/5 m-4">
                     <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-slate-200 mb-2">Zero Manual Tasks</h3>
                     <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">The system has handled all follow-ups and CRM updates based on recent events. You are at inbox zero.</p>
                     
                     <div className="mt-8">
                        <Button className="bg-white text-black hover:bg-slate-200 font-bold px-6 border-none shadow-none text-xs">Run Automation Check</Button>
                     </div>
                 </div>
             </Card>
        </div>
    )
}

