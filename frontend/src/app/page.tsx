'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  Send, 
  RefreshCw, 
  Coffee, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Database,
  Mail,
  MessageSquare,
  PhoneCall,
  Search,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { api, Customer, Campaign, CampaignLog, DashboardAnalytics } from '../lib/api';

type TabType = 'copilot' | 'hub' | 'audience';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('copilot');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [dbMode, setDbMode] = useState<string>('Detecting...');
  
  // State for Customer directory
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  // State for AI Builder
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [selectedPreviewCustomer, setSelectedPreviewCustomer] = useState<string>('');
  const [personalizedPreview, setPersonalizedPreview] = useState<string>('');
  const [selectedCta, setSelectedCta] = useState<string>('');
  
  // State for Campaign Hub
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardAnalytics | null>(null);
  
  // Loading & error alerts
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [globalWarning, setGlobalWarning] = useState<string | null>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('xeno-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('xeno-theme', nextTheme);
  };

  // Poll intervals
  useEffect(() => {
    fetchInitialData();
    
    // Refresh dashboard stats and campaigns list periodically
    const interval = setInterval(() => {
      fetchAnalyticsAndCampaigns();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Poll selected campaign details if it is currently 'Running'
  useEffect(() => {
    if (!selectedCampaign || selectedCampaign.status !== 'Running') return;

    const interval = setInterval(async () => {
      try {
        const data = await api.getCampaignDetails(selectedCampaign._id);
        setSelectedCampaign(data.campaign);
        setCampaignLogs(data.logs);
      } catch (err) {
        console.error('Error polling campaign logs', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedCampaign]);

  // Update personalized preview when selected preview customer or AI result changes
  useEffect(() => {
    if (!aiResult || !aiResult.matchedCustomers || aiResult.matchedCustomers.length === 0) {
      setPersonalizedPreview('');
      return;
    }
    
    const customerId = selectedPreviewCustomer || aiResult.matchedCustomers[0]._id;
    const targetCust = aiResult.matchedCustomers.find((c: any) => c._id === customerId);
    
    if (targetCust) {
      // Fetch latest orders for this customer from our local database state
      const detailedCust = customers.find(c => c._id === targetCust._id);
      const orders = detailedCust?.orders || [];
      const lastProduct = orders.length > 0 ? orders[orders.length - 1].itemBought : 'your favorite item';
      
      let inactiveDays = 15;
      if (targetCust.lastOrderDate) {
        const diffTime = Math.abs(new Date().getTime() - new Date(targetCust.lastOrderDate).getTime());
        inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Interpolate client-side preview
      let previewText = aiResult.analysis.messageTemplate
        .replace(/\{\{name\}\}/gi, targetCust.name)
        .replace(/\{\{lastProduct\}\}/gi, lastProduct)
        .replace(/\{\{totalSpend\}\}/gi, targetCust.totalSpend.toString())
        .replace(/\{\{inactiveDays\}\}/gi, inactiveDays.toString());

      if (targetCust.totalSpend > 5000) {
        previewText = `🌟 [VIP Special] ` + previewText;
      }
      
      setPersonalizedPreview(previewText);
    }
  }, [selectedPreviewCustomer, aiResult, customers]);

  const fetchInitialData = async () => {
    try {
      const custData = await api.getCustomers();
      setCustomers(custData.customers);
      setDbMode(custData.databaseMode);
      await fetchAnalyticsAndCampaigns();
    } catch (err: any) {
      setGlobalError('Could not connect to CRM backend service. Make sure it is running on Port 5000.');
    }
  };

  const fetchAnalyticsAndCampaigns = async () => {
    try {
      const stats = await api.getDashboardAnalytics();
      setDashboardStats(stats);
      const campList = await api.getCampaigns();
      setCampaigns(campList);
      
      // Update selected campaign reference if it's currently open
      if (selectedCampaign) {
        const updated = campList.find(c => c._id === selectedCampaign._id);
        if (updated) {
          setSelectedCampaign(updated);
          // Also fetch detailed logs
          const details = await api.getCampaignDetails(selectedCampaign._id);
          setCampaignLogs(details.logs);
        }
      }
    } catch (err) {
      console.warn('Silent analytics refresh failed:', err);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setGlobalError(null);
    setGlobalWarning(null);
    try {
      const res = await api.seedCustomers();
      setGlobalSuccess(res.message);
      setTimeout(() => setGlobalSuccess(null), 4000);
      
      const custData = await api.getCustomers();
      setCustomers(custData.customers);
      setDbMode(custData.databaseMode);
      await fetchAnalyticsAndCampaigns();
    } catch (err: any) {
      setGlobalError('Failed to seed database: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAnalyzeGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAnalyzing(true);
    setAiResult(null);
    setGlobalError(null);
    setGlobalWarning(null);
    
    // Simulate multi-step cosmic loading tracker
    setAnalysisStep(1); // Parsing
    await new Promise(r => setTimeout(r, 600));
    setAnalysisStep(2); // Filtering DB
    await new Promise(r => setTimeout(r, 700));
    setAnalysisStep(3); // Drafting templates
    await new Promise(r => setTimeout(r, 800));
    setAnalysisStep(4); // Completing

    try {
      const res = await api.analyzeGoal(aiPrompt);
      setAiResult(res);
      if (res.matchedCustomers.length > 0) {
        setSelectedPreviewCustomer(res.matchedCustomers[0]._id!);
      }
      if (res.analysis.suggestedCTAs && res.analysis.suggestedCTAs.length > 0) {
        setSelectedCta(res.analysis.suggestedCTAs[0]);
      }
    } catch (err: any) {
      setGlobalError('AI goal analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!aiResult) return;
    setGlobalError(null);
    setGlobalSuccess(null);
    setGlobalWarning(null);

    try {
      // 1. Create campaign in Draft state
      const created = await api.createCampaign({
        name: aiResult.analysis.campaignName,
        description: aiResult.analysis.campaignSummary,
        channel: aiResult.analysis.recommendedChannel,
        audienceCriteria: aiResult.analysis.audienceCriteria,
        audienceSize: aiResult.estimatedAudienceSize,
        messageTemplate: aiResult.analysis.messageTemplate
      });

      // 2. Launch sending pipeline
      const launchResult = await api.sendCampaign(created._id);

      if (launchResult && (launchResult as any).warning) {
        // Soft alert: segment was empty, saved as draft
        setGlobalWarning((launchResult as any).warning);
        
        // Refresh campaigns
        await fetchAnalyticsAndCampaigns();
        
        // Select campaign detail view
        const list = await api.getCampaigns();
        const freshCamp = list.find(c => c._id === created._id);
        setSelectedCampaign(freshCamp || created);
        setCampaignLogs([]);
        setActiveTab('hub');
        setAiResult(null);
        setAiPrompt('');
      } else {
        setGlobalSuccess(`Campaign "${created.name}" launched successfully! Directing to monitoring hub...`);
        setTimeout(() => setGlobalSuccess(null), 4000);

        // 3. Open campaign details
        setSelectedCampaign(created);
        setCampaignLogs([]);
        setActiveTab('hub');
        setAiResult(null);
        setAiPrompt('');
      }
    } catch (err: any) {
      setGlobalError('Failed to launch campaign: ' + err.message);
    }
  };

  const selectQuickPreset = (presetText: string) => {
    setAiPrompt(presetText);
  };

  const filteredCustomers = customers.filter(cust => {
    const term = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(term) ||
      cust.email.toLowerCase().includes(term) ||
      cust.phone.includes(term)
    );
  });

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar-bg flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-500 p-2 rounded-lg shadow-md shadow-violet-500/10">
                <Sparkles className="w-4.5 h-4.5 text-white glow-active" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  XENO COPILOT
                </h1>
                <span className="text-[9px] text-violet-400 font-semibold tracking-widest uppercase block mt-0.5">
                  Marketing CRM
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
            </button>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-white/5 text-violet-400 border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'copilot' ? 'text-violet-400' : 'text-gray-400'}`} />
              Campaign Copilot
            </button>

            <button
              onClick={() => { setActiveTab('hub'); setSelectedCampaign(null); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'hub'
                  ? 'bg-white/5 text-violet-400 border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${activeTab === 'hub' ? 'text-violet-400' : 'text-gray-400'}`} />
              Campaign Hub
            </button>

            <button
              onClick={() => setActiveTab('audience')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audience'
                  ? 'bg-white/5 text-violet-400 border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'audience' ? 'text-violet-400' : 'text-gray-400'}`} />
              Audience Base
            </button>
          </nav>
        </div>

        {/* Database Status Widget */}
        <div className="bg-white/[0.02] border border-sidebar-border p-3.5 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Database Engine</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${dbMode === 'MongoDB' ? 'bg-emerald-500' : 'bg-amber-400 glow-active'}`}></span>
              <span className="text-[9px] uppercase font-black text-gray-300">{dbMode}</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 leading-normal">
            {dbMode === 'MongoDB' 
              ? 'Mongoose MongoDB cluster is connected and reading.' 
              : 'MongoDB local server offline. Local JSONDB active.'
            }
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden p-8">
        
        {/* Alerts */}
        {globalError && (
          <div className="mb-5 flex items-center gap-3 bg-red-950/20 border border-red-500/20 px-4 py-3 rounded-lg text-red-200 text-xs transition-all">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}
        {globalWarning && (
          <div className="mb-5 flex items-center gap-3 bg-amber-950/20 border border-amber-500/20 px-4 py-3 rounded-lg text-amber-200 text-xs transition-all">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>{globalWarning}</span>
          </div>
        )}
        {globalSuccess && (
          <div className="mb-5 flex items-center gap-3 bg-emerald-950/20 border border-emerald-500/20 px-4 py-3 rounded-lg text-emerald-200 text-xs transition-all">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{globalSuccess}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* TAB 1: COPILOT BUILDER */}
          {activeTab === 'copilot' && (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gradient">
                  AI Campaign Copilot
                </h2>
                <p className="text-text-secondary text-xs mt-1">
                  Describe a shopper targeting goal. Our engine compiles filters, designs personalized messages, and runs lifecycle delivery simulations.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Prompt Box & Presets */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="glass-panel p-5">
                    <form onSubmit={handleAnalyzeGoal} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-accent-violet flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> Copilot Command Console
                        </label>
                        <span className="text-[10px] text-text-tertiary">Gemini Mock mode (Free)</span>
                      </div>
                      
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. 'Launch a WhatsApp campaign to win-back coffee buyers who spent above 500 but haven't ordered in 30 days...'"
                        className="w-full h-32 bg-input-bg border border-card-border rounded-lg p-3 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/15 transition-all resize-none"
                      />

                      <button
                        type="submit"
                        disabled={isAnalyzing || !aiPrompt.trim()}
                        className="w-full bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 disabled:opacity-50 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-all shadow-md shadow-accent-violet/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Parsing Campaign Intent...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Generate Strategy
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Preset Templates */}
                  <div className="glass-panel p-5 space-y-3.5">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                      Quick Marketing Presets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => selectQuickPreset('Target coffee buyers who spent over ₹500 but haven\'t ordered in 30 days.')}
                        className="p-3 bg-panel-bg hover:bg-white/[0.03] border border-card-border hover:border-accent-violet/20 rounded-lg text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Coffee className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-semibold text-text-primary">Coffee Winback</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-normal">
                          Re-engage cold coffee shoppers with WhatsApp coffee deals.
                        </p>
                      </button>

                      <button
                        onClick={() => selectQuickPreset('Target premium sneaker shoppers who spent above ₹5000 in our database.')}
                        className="p-3 bg-panel-bg hover:bg-white/[0.03] border border-card-border hover:border-accent-violet/20 rounded-lg text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-xs font-semibold text-text-primary">Sneaker VIP Drops</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-normal">
                          Send luxury visual sneaker email stock updates to VIPs.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: AI Execution Wizard / Strategy Output */}
                <div className="lg:col-span-5">
                  {/* Empty State */}
                  {!isAnalyzing && !aiResult && (
                    <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                      <div className="p-3 bg-panel-bg border border-card-border rounded-full mb-3 text-text-tertiary">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-text-primary">Copilot Engine Idle</h4>
                      <p className="text-[10px] text-text-secondary max-w-xs mt-1 leading-normal">
                        Input a campaign objective in the command console or choose a quick preset above.
                      </p>
                    </div>
                  )}

                  {/* Processing / Thinking Loader */}
                  {isAnalyzing && (
                    <div className="glass-panel p-6 space-y-5 min-h-[280px] flex flex-col justify-center">
                      <div className="flex flex-col items-center text-center">
                        <RefreshCw className="w-6 h-6 text-accent-violet animate-spin mb-3" />
                        <h4 className="text-xs font-bold text-text-primary">Copilot Strategizer</h4>
                        <p className="text-[10px] text-accent-violet mt-0.5">Segmenting datasets...</p>
                      </div>

                      {/* Timeline loader steps */}
                      <div className="space-y-3 max-w-[240px] mx-auto">
                        <div className="flex items-center gap-2.5 text-[11px]">
                          <div className={`w-2 h-2 rounded-full ${analysisStep >= 1 ? 'bg-accent-violet glow-active' : 'bg-text-tertiary'}`}></div>
                          <span className={analysisStep >= 1 ? 'text-text-primary font-bold' : 'text-text-tertiary'}>Parsing goals & keywords...</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px]">
                          <div className={`w-2 h-2 rounded-full ${analysisStep >= 2 ? 'bg-accent-violet glow-active' : 'bg-text-tertiary'}`}></div>
                          <span className={analysisStep >= 2 ? 'text-text-primary font-bold' : 'text-text-tertiary'}>Calculating database counts...</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px]">
                          <div className={`w-2 h-2 rounded-full ${analysisStep >= 3 ? 'bg-accent-violet glow-active' : 'bg-text-tertiary'}`}></div>
                          <span className={analysisStep >= 3 ? 'text-text-primary font-bold' : 'text-text-tertiary'}>Drafting copywriting & themes...</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px]">
                          <div className={`w-2 h-2 rounded-full ${analysisStep >= 4 ? 'bg-accent-violet glow-active' : 'bg-text-tertiary'}`}></div>
                          <span className={analysisStep >= 4 ? 'text-text-primary font-bold' : 'text-text-tertiary'}>Configuring CTA triggers...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strategy Output Result */}
                  {aiResult && (
                    <div className="glass-panel p-5 space-y-4">
                      <div className="border-b border-card-border pb-2.5">
                        <div className="text-[9px] font-bold text-accent-violet uppercase tracking-widest">
                          Suggested Strategy
                        </div>
                        <h3 className="text-base font-bold text-text-primary mt-0.5">
                          {aiResult.analysis.campaignName}
                        </h3>
                      </div>

                      {/* Grid cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-panel-bg border border-card-border rounded-lg p-3">
                          <span className="text-[9px] text-text-tertiary uppercase font-bold block">Audience Match</span>
                          <span className="text-lg font-black text-text-primary mt-0.5 block">
                            {aiResult.estimatedAudienceSize} <span className="text-xs text-text-secondary font-medium">shoppers</span>
                          </span>
                        </div>

                        <div className="bg-panel-bg border border-card-border rounded-lg p-3">
                          <span className="text-[9px] text-text-tertiary uppercase font-bold block">Channel Channel</span>
                          <span className="text-xs font-bold text-accent-violet mt-1.5 flex items-center gap-1.5">
                            {aiResult.analysis.recommendedChannel === 'Email' && <Mail className="w-3.5 h-3.5 text-accent-indigo" />}
                            {aiResult.analysis.recommendedChannel === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                            {aiResult.analysis.recommendedChannel === 'SMS' && <PhoneCall className="w-3.5 h-3.5 text-violet-400" />}
                            {aiResult.analysis.recommendedChannel}
                          </span>
                        </div>
                      </div>

                      {/* Summary explanation */}
                      <div>
                        <span className="text-[9px] text-text-tertiary uppercase font-bold block mb-1">AI Rationale</span>
                        <p className="text-[11px] text-text-secondary leading-normal bg-panel-bg p-2.5 rounded-lg border border-card-border">
                          {aiResult.analysis.campaignSummary}
                        </p>
                      </div>

                      {/* Message Previewer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-text-tertiary uppercase font-bold">Personalized Message Preview</span>
                          {aiResult.matchedCustomers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-text-tertiary">Previewing:</span>
                              <select
                                value={selectedPreviewCustomer}
                                onChange={(e) => setSelectedPreviewCustomer(e.target.value)}
                                className="bg-input-bg border border-card-border rounded px-1.5 py-0.5 text-[9px] text-text-primary focus:outline-none focus:border-accent-violet"
                              >
                                {aiResult.matchedCustomers.map((cust: any) => (
                                  <option key={cust._id} value={cust._id}>
                                    {cust.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="bg-input-bg border border-card-border rounded-lg p-3 text-[11px] space-y-2">
                          {aiResult.matchedCustomers.length === 0 ? (
                            <p className="text-text-tertiary leading-relaxed italic">
                              [No matching customers in segment. Message template below will be saved as draft.]
                              <br/><br/>
                              {aiResult.analysis.messageTemplate}
                            </p>
                          ) : (
                            <p className="text-text-secondary leading-relaxed whitespace-pre-line select-all">
                              {personalizedPreview || aiResult.analysis.messageTemplate}
                            </p>
                          )}
                          {selectedCta && aiResult.analysis.suggestedCTAs && (
                            <div className="flex gap-1.5 pt-2 border-t border-card-border">
                              {aiResult.analysis.suggestedCTAs.map((cta: string, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedCta(cta)}
                                  className={`text-[9px] px-2.5 py-1 rounded font-bold border transition-all cursor-pointer ${
                                    selectedCta === cta 
                                      ? 'bg-accent-violet/10 text-accent-violet border-accent-violet/30' 
                                      : 'bg-white/[0.01] text-text-tertiary border-card-border hover:text-text-secondary'
                                  }`}
                                >
                                  {cta}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={handleLaunchCampaign}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 animate-pulse" />
                        {aiResult.estimatedAudienceSize === 0 ? 'Save Campaign as Draft' : 'Launch Campaign & Simulate Webhooks'}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CAMPAIGN HUB */}
          {activeTab === 'hub' && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              
              {!selectedCampaign ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gradient">
                      Campaign Hub
                    </h2>
                    <p className="text-text-secondary text-xs mt-1">
                      Monitor overall engagement, click frequencies, and campaign metrics aggregated across channels.
                    </p>
                  </div>

                  {/* Dashboard Metrics */}
                  {dashboardStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="glass-panel p-4">
                        <span className="text-[9px] text-text-tertiary uppercase font-bold block">Total Reach</span>
                        <div className="text-xl font-bold text-text-primary mt-0.5">{dashboardStats.metrics.sent}</div>
                        <div className="text-[9px] text-text-tertiary mt-0.5">Across all campaigns</div>
                      </div>
                      <div className="glass-panel p-4">
                        <span className="text-[9px] text-text-tertiary uppercase font-bold block">Delivered</span>
                        <div className="text-xl font-bold text-emerald-400 mt-0.5">{dashboardStats.metrics.delivered}</div>
                        <div className="text-[9px] text-emerald-500 mt-0.5">({dashboardStats.metrics.deliveryRate}% rate)</div>
                      </div>
                      <div className="glass-panel p-4">
                        <span className="text-[9px] text-text-tertiary uppercase font-bold block">Open Rate</span>
                        <div className="text-xl font-bold text-accent-violet mt-0.5">{dashboardStats.metrics.openRate}%</div>
                        <div className="text-[9px] text-accent-violet mt-0.5">({dashboardStats.metrics.opened} opens)</div>
                      </div>
                      <div className="glass-panel p-4">
                        <span className="text-[9px] text-text-tertiary uppercase font-bold block">Click-Through</span>
                        <div className="text-xl font-bold text-accent-indigo mt-0.5">{dashboardStats.metrics.clickRate}%</div>
                        <div className="text-[9px] text-accent-indigo mt-0.5">({dashboardStats.metrics.clicked} clicks)</div>
                      </div>
                    </div>
                  )}

                  {/* Campaigns List */}
                  <div className="glass-panel flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-card-border flex items-center justify-between">
                      <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">All Campaigns</h3>
                      <span className="text-xs text-text-tertiary font-bold">{campaigns.length} campaigns</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {campaigns.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center">
                          <Users className="w-8 h-8 text-text-tertiary mb-3" />
                          <h4 className="text-xs font-semibold text-text-secondary">No campaigns launched</h4>
                          <p className="text-[10px] text-text-tertiary mt-1 max-w-xs leading-normal">
                            Build a strategy using the AI Campaign Copilot first to populate this repository.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-card-border">
                          {campaigns.map((camp) => (
                            <button
                              key={camp._id}
                              onClick={() => setSelectedCampaign(camp)}
                              className="w-full p-4 hover:bg-panel-bg flex items-center justify-between text-left transition-all group cursor-pointer"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-text-primary group-hover:text-accent-violet transition-colors">
                                    {camp.name}
                                  </span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                                    camp.status === 'Completed' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' :
                                    camp.status === 'Running' ? 'bg-violet-950/20 text-violet-400 border border-violet-500/10 glow-active' :
                                    'bg-text-tertiary/10 text-text-tertiary border border-card-border'
                                  }`}>
                                    {camp.status}
                                  </span>
                                </div>
                                <p className="text-xs text-text-secondary line-clamp-1 max-w-xl">
                                  {camp.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-8 text-right shrink-0">
                                <div className="text-xs hidden md:block">
                                  <span className="text-text-tertiary text-[9px] uppercase font-bold block">Delivery</span>
                                  <span className="font-bold text-text-primary mt-0.5 block">
                                    {camp.deliveredCount} / {camp.audienceSize}
                                  </span>
                                </div>

                                <div className="text-xs hidden md:block">
                                  <span className="text-text-tertiary text-[9px] uppercase font-bold block">CTR</span>
                                  <span className="font-bold text-accent-indigo mt-0.5 block">
                                    {camp.openedCount > 0 ? Math.round((camp.clickedCount / camp.openedCount) * 100) : 0}%
                                  </span>
                                </div>

                                <ChevronRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                
                // DETAILED CAMPAIGN TRACKER (WEBHOOK SIMULATOR PROGRESS)
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                  
                  {/* Detail Header */}
                  <div className="flex items-center justify-between border-b border-card-border pb-3">
                    <div className="space-y-1">
                      <button 
                        onClick={() => setSelectedCampaign(null)} 
                        className="text-xs text-accent-violet hover:text-accent-violet/80 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0"
                      >
                        &larr; Back to Campaigns
                      </button>
                      <h2 className="text-lg font-bold text-text-primary flex items-center gap-3 mt-1">
                        {selectedCampaign.name}
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                          selectedCampaign.status === 'Completed' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' :
                          selectedCampaign.status === 'Running' ? 'bg-violet-950/20 text-violet-400 border border-violet-500/10 glow-active' :
                          'bg-text-tertiary/10 text-text-tertiary border border-card-border'
                        }`}>
                          {selectedCampaign.status}
                        </span>
                      </h2>
                    </div>

                    <div className="text-xs text-text-tertiary">
                      Channel: <span className="font-semibold text-text-secondary">{selectedCampaign.channel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                    
                    {/* Left Column: Live Analytics & Recipient Logs */}
                    <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-1">
                      
                      {/* Live Counter Cards */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-panel-bg border border-card-border p-3.5 rounded-lg text-center">
                          <span className="text-[9px] text-text-tertiary font-bold uppercase block">Sent</span>
                          <span className="text-lg font-bold mt-0.5 block text-text-primary">{selectedCampaign.sentCount}</span>
                        </div>
                        <div className="bg-panel-bg border border-card-border p-3.5 rounded-lg text-center">
                          <span className="text-[9px] text-text-tertiary font-bold uppercase block">Delivered</span>
                          <span className="text-lg font-bold mt-0.5 block text-emerald-500">{selectedCampaign.deliveredCount}</span>
                        </div>
                        <div className="bg-panel-bg border border-card-border p-3.5 rounded-lg text-center">
                          <span className="text-[9px] text-text-tertiary font-bold uppercase block">Opened</span>
                          <span className="text-lg font-bold mt-0.5 block text-accent-violet">{selectedCampaign.openedCount}</span>
                        </div>
                        <div className="bg-panel-bg border border-card-border p-3.5 rounded-lg text-center">
                          <span className="text-[9px] text-text-tertiary font-bold uppercase block">Clicked</span>
                          <span className="text-lg font-bold mt-0.5 block text-accent-indigo">{selectedCampaign.clickedCount}</span>
                        </div>
                      </div>

                      {/* Recipient Details Table */}
                      <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[260px]">
                        <div className="p-3.5 border-b border-card-border">
                          <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">
                            Recipient Status Logs
                          </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {selectedCampaign.audienceSize === 0 ? (
                            <div className="p-14 text-center flex flex-col items-center justify-center">
                              <AlertCircle className="w-8 h-8 text-amber-500 mb-2.5 animate-pulse" />
                              <h4 className="text-xs font-semibold text-text-primary">Empty Audience Segment</h4>
                              <p className="text-[10px] text-text-secondary mt-1 max-w-xs leading-normal">
                                This campaign was saved as a Draft because there were 0 matching customers. Seed database mock values or tweak criteria to launch.
                              </p>
                            </div>
                          ) : campaignLogs.length === 0 ? (
                            <div className="p-10 text-center text-xs text-text-tertiary">
                              Preparing logs...
                            </div>
                          ) : (
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-card-border text-text-tertiary bg-white/[0.01]">
                                  <th className="p-3 font-semibold">Customer</th>
                                  <th className="p-3 font-semibold">Contact Destination</th>
                                  <th className="p-3 font-semibold">Status Event</th>
                                  <th className="p-3 font-semibold">Message Preview</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-card-border">
                                {campaignLogs.map((log) => (
                                  <tr key={log._id} className="hover:bg-panel-bg">
                                    <td className="p-3 font-bold text-text-primary">
                                      {log.recipientDetails.name}
                                    </td>
                                    <td className="p-3 text-text-secondary">
                                      {selectedCampaign.channel === 'Email' 
                                        ? log.recipientDetails.email 
                                        : log.recipientDetails.phone
                                      }
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                        log.status === 'clicked' ? 'bg-indigo-950/20 text-indigo-400 border border-indigo-500/10' :
                                        log.status === 'opened' ? 'bg-violet-950/20 text-violet-400 border border-violet-500/10' :
                                        log.status === 'delivered' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' :
                                        log.status === 'failed' ? 'bg-red-950/20 text-red-400 border border-red-500/10' :
                                        'bg-text-tertiary/10 text-text-tertiary'
                                      }`}>
                                        {log.status}
                                      </span>
                                    </td>
                                    <td className="p-3 text-text-tertiary max-w-xs truncate" title={log.customMessage}>
                                      {log.customMessage}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Webhook Simulator Console */}
                    <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
                      <div className="glass-panel flex flex-col h-full overflow-hidden">
                        <div className="p-3.5 border-b border-card-border flex items-center justify-between bg-black/20">
                          <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-accent-violet glow-active" />
                            <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                              Live Webhook Console
                            </span>
                          </div>
                          <span className="text-[9px] text-text-tertiary">Callbacks Listener</span>
                        </div>

                        <div className="flex-1 p-3.5 bg-black/60 font-mono text-[9px] text-text-secondary overflow-y-auto space-y-2.5">
                          {selectedCampaign.status === 'Running' && (
                            <div className="text-accent-violet flex items-center gap-2 mb-2 animate-pulse font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-violet glow-active"></span>
                              Listening for incoming webhook logs...
                            </div>
                          )}
                          
                          {selectedCampaign.audienceSize === 0 ? (
                            <div className="text-text-tertiary text-center py-10 italic">Console idle (draft state).</div>
                          ) : campaignLogs.length === 0 ? (
                            <div className="text-text-tertiary text-center py-10">No webhooks captured yet.</div>
                          ) : (
                            [...campaignLogs]
                              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                              .map((log) => (
                                <div key={log._id} className="p-2 rounded bg-white/[0.01] border border-card-border space-y-1">
                                  <div className="flex justify-between text-text-tertiary text-[8px]">
                                    <span>{new Date(log.updatedAt).toLocaleTimeString()}</span>
                                    <span className="text-text-tertiary font-bold uppercase">webhook</span>
                                  </div>
                                  <div className="leading-relaxed text-text-secondary">
                                    CRM $\leftarrow$ Simulator: <span className="text-emerald-400 font-bold">{log.status}</span> notification for{' '}
                                    <span className="text-text-primary">{log.recipientDetails.name}</span>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              )}

            </div>
          )}

          {/* TAB 3: AUDIENCE BASE */}
          {activeTab === 'audience' && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              
              {/* Header section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gradient">
                    Audience Base
                  </h2>
                  <p className="text-text-secondary text-xs mt-1">
                    Manage profiles, transaction totals, and marketing engagement statuses of registered customer contacts.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="bg-white/5 border border-card-border hover:border-accent-violet/30 text-text-primary font-bold text-xs py-2 px-3 rounded-lg transition-all hover:bg-white/10 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSeeding ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Seeding Sandbox...
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5 text-accent-violet" /> Seed Mock Database
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Data Table Container */}
              <div className="glass-panel flex-1 flex flex-col overflow-hidden">
                
                {/* Search & Header */}
                <div className="p-4 border-b border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/10">
                  <div className="relative w-full md:w-72">
                    <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search shopper names, emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-input-bg border border-card-border rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-violet/50"
                    />
                  </div>
                  <span className="text-xs text-text-tertiary font-bold">{filteredCustomers.length} registered profiles</span>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                  {customers.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 text-text-tertiary mb-3" />
                      <h3 className="text-xs font-semibold text-text-secondary">Database is empty</h3>
                      <p className="text-[10px] text-text-tertiary mt-1 max-w-xs leading-normal">
                        To test the CRM segments and AI features, seed our custom marketing sandbox database.
                      </p>
                      <button
                        onClick={handleSeedDatabase}
                        disabled={isSeeding}
                        className="mt-4 bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all cursor-pointer shadow-md shadow-accent-violet/10"
                      >
                        {isSeeding ? 'Seeding...' : 'Seed Sandbox Database'}
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-card-border text-text-tertiary bg-white/[0.01] font-semibold">
                          <th className="p-3.5">Customer Details</th>
                          <th className="p-3.5">Contact Info</th>
                          <th className="p-3.5">Total Spending</th>
                          <th className="p-3.5">Last Order Product</th>
                          <th className="p-3.5">Last Order Date</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-border">
                        {filteredCustomers.map((cust) => {
                          const orders = cust.orders || [];
                          const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;
                          
                          // Segment active vs sluggish vs lost
                          let healthColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                          let healthText = 'Active';
                          
                          if (cust.lastOrderDate) {
                            const diff = Math.abs(new Date().getTime() - new Date(cust.lastOrderDate).getTime());
                            const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                            if (diffDays > 60) {
                              healthColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                              healthText = 'Lost';
                            } else if (diffDays > 30) {
                              healthColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                              healthText = 'Sluggish';
                            }
                          }

                          return (
                            <tr key={cust._id} className="hover:bg-panel-bg transition-all group">
                              <td className="p-3.5">
                                <div className="font-bold text-text-primary group-hover:text-accent-violet transition-colors">
                                  {cust.name}
                                </div>
                                <div className="text-[9px] text-text-tertiary mt-0.5">ID: {cust._id}</div>
                              </td>
                              <td className="p-3.5 text-text-secondary">
                                <div>{cust.email}</div>
                                <div className="text-[9px] text-text-tertiary mt-0.5">{cust.phone}</div>
                              </td>
                              <td className="p-3.5 font-bold text-text-primary">
                                ₹{cust.totalSpend}
                              </td>
                              <td className="p-3.5 text-text-secondary">
                                {lastOrder ? lastOrder.itemBought : '-'}
                              </td>
                              <td className="p-3.5 text-text-tertiary">
                                {cust.lastOrderDate 
                                  ? new Date(cust.lastOrderDate).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  : 'Never'
                                }
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${healthColor}`}>
                                  {healthText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
