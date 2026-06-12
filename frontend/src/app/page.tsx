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
  Moon,
  Megaphone,
  Target,
  IndianRupee,
  Plus,
  Trash2,
  FileText,
  MoreVertical
} from 'lucide-react';
import { api, Customer, Campaign, CampaignLog, DashboardAnalytics, Segment } from '../lib/api';

type TabType = 'dashboard' | 'campaigns' | 'segments' | 'audience';

interface LocationItem {
  id: string;
  name: string;
  percentage: number;
  count: number;
  flag: string;
  cx: number;
  cy: number;
}

// Custom World Map & Locations Component
const TopLocationsCard = () => {
  const [hoveredLoc, setHoveredLoc] = useState<string | null>(null);

  const locations: LocationItem[] = [
    { id: 'australia', name: 'Australia', percentage: 48, count: 48, flag: '🇦🇺', cx: 215, cy: 92 },
    { id: 'india', name: 'India', percentage: 30, count: 30, flag: '🇮🇳', cx: 162, cy: 56 },
    { id: 'indonesia', name: 'Indonesia', percentage: 15, count: 15, flag: '🇮🇩', cx: 178, cy: 78 },
    { id: 'singapore', name: 'Singapore', percentage: 7, count: 7, flag: '🇸🇬', cx: 172, cy: 73 }
  ];

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      {/* SVG Map */}
      <div className="relative flex items-center justify-center py-2 bg-black/5 dark:bg-black/20 rounded-xl border border-card-border/40 p-2 overflow-hidden group">
        <svg viewBox="0 0 260 120" className="w-full h-auto select-none overflow-visible opacity-90 transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Stylized World Map Path */}
          {/* North America */}
          <path 
            d="M16 22 L40 20 L58 30 L48 48 L42 50 L34 58 L32 54 L22 52 L20 40 Z" 
            className="fill-text-tertiary/10 dark:fill-white/5 stroke-none transition-colors duration-300"
          />
          {/* Greenland */}
          <path 
            d="M58 8 L68 10 L66 18 L60 16 Z" 
            className="fill-text-tertiary/10 dark:fill-white/5 stroke-none transition-colors duration-300"
          />
          {/* South America */}
          <path 
            d="M34 58 L42 60 L38 68 L46 78 L44 95 L40 108 L36 104 L32 80 L28 66 Z" 
            className="fill-text-tertiary/10 dark:fill-white/5 stroke-none transition-colors duration-300"
          />
          {/* Africa */}
          <path 
            d="M90 54 L108 52 L118 58 L124 64 L128 76 L122 88 L116 96 L110 92 L106 82 L102 70 L92 64 Z" 
            className="fill-text-tertiary/10 dark:fill-white/5 stroke-none transition-colors duration-300"
          />
          {/* Europe */}
          <path 
            d="M82 26 L98 24 L104 34 L100 44 L90 46 L86 40 Z" 
            className="fill-text-tertiary/10 dark:fill-white/5 stroke-none transition-colors duration-300"
          />
          {/* Asia */}
          <path 
            d="M98 24 L145 22 L165 30 L170 48 L160 58 L148 60 L142 54 L132 56 L124 52 L116 54 L106 44 L104 38 Z" 
            className={`transition-colors duration-300 stroke-none ${
              hoveredLoc === 'india' || hoveredLoc === 'singapore' || hoveredLoc === 'indonesia'
                ? 'fill-accent-violet/10 dark:fill-accent-violet/15' 
                : 'fill-text-tertiary/10 dark:fill-white/5'
            }`}
          />
          {/* Australia & Oceania */}
          <path 
            d="M196 85 L218 85 L222 96 L212 104 L196 98 Z" 
            className={`transition-colors duration-300 stroke-none ${
              hoveredLoc === 'australia' ? 'fill-sky-500/20 dark:fill-sky-400/20' : 'fill-text-tertiary/10 dark:fill-white/5'
            }`} 
          />

          {/* Glowing markers for pins */}
          {locations.map((loc) => {
            const isHovered = hoveredLoc === loc.id;
            return (
              <g 
                key={loc.id} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLoc(loc.id)}
                onMouseLeave={() => setHoveredLoc(null)}
              >
                {/* Outer pulsing ping circle */}
                <circle 
                  cx={loc.cx} 
                  cy={loc.cy} 
                  r={isHovered ? 11 : 6} 
                  className={`transition-all duration-300 opacity-60 ${
                    loc.id === 'australia' ? 'fill-sky-400' : 
                    loc.id === 'indonesia' ? 'fill-emerald-400' : 
                    loc.id === 'singapore' ? 'fill-violet-400' : 'fill-amber-400'
                  } ${isHovered ? 'animate-ping' : 'animate-pulse'}`} 
                />
                {/* Core solid dot */}
                <circle 
                  cx={loc.cx} 
                  cy={loc.cy} 
                  r={isHovered ? 4 : 2.5} 
                  className={`transition-all duration-300 ${
                    loc.id === 'australia' ? 'fill-sky-500' : 
                    loc.id === 'indonesia' ? 'fill-emerald-500' : 
                    loc.id === 'singapore' ? 'fill-violet-500' : 'fill-amber-500'
                  }`} 
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* List below map */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-center">
        {locations.map((loc, idx) => {
          const isHovered = hoveredLoc === loc.id;
          return (
            <div 
              key={loc.id}
              onMouseEnter={() => setHoveredLoc(loc.id)}
              onMouseLeave={() => setHoveredLoc(null)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isHovered 
                  ? 'bg-accent-violet/5 dark:bg-white/[0.04] border-accent-violet/20 translate-x-1 hover:shadow-md' 
                  : 'bg-transparent border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-text-tertiary">{idx + 1}.</span>
                <span className="text-sm leading-none select-none">{loc.flag}</span>
                <span className={`text-xs font-bold transition-colors ${
                  isHovered ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {loc.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-text-tertiary font-medium">
                  {loc.count}%
                </span>
                <div className="w-12 h-1 bg-white/[0.04] rounded-full overflow-hidden shrink-0">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      loc.id === 'australia' ? 'bg-sky-500' : 
                      loc.id === 'indonesia' ? 'bg-emerald-500' : 
                      loc.id === 'singapore' ? 'bg-violet-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${loc.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Custom SVG Chart component
const RevenueChart = ({ data }: { data: Array<{ month: string; revenue: number }> }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  
  if (!data || data.length === 0) return <div className="text-center py-10 text-xs text-text-tertiary">No data available</div>;

  const maxVal = Math.max(...data.map(d => d.revenue), 800000);
  const yMax = Math.ceil(maxVal / 200000) * 200000;
  
  const width = 500;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / yMax) * chartHeight;
  };
  
  const colWidth = chartWidth / data.length;
  const barWidth = Math.min(colWidth * 0.5, 36);

  const ticks = [];
  const tickCount = 5;
  for (let i = 0; i < tickCount; i++) {
    const val = (yMax / (tickCount - 1)) * i;
    ticks.push(val);
  }

  return (
    <div className="relative w-full animate-graph-slide-in">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        {ticks.map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                className="stroke-card-border" 
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                textAnchor="end" 
                className="fill-text-tertiary font-mono text-[9px]"
              >
                ₹{(tick / 1000).toFixed(0)}K
              </text>
            </g>
          );
        })}
        
        {data.map((item, idx) => {
          const barHeight = (item.revenue / yMax) * chartHeight;
          const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
          const y = getY(item.revenue);
          
          return (
            <g 
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={paddingLeft + idx * colWidth + 4}
                y={paddingTop}
                width={colWidth - 8}
                height={chartHeight}
                className="fill-transparent hover:fill-white/[0.02] transition-colors duration-200"
                rx={4}
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                className="fill-accent-indigo hover:fill-accent-violet transition-all duration-300 origin-bottom hover:scale-y-[1.03] hover:-translate-y-0.5"
                rx={4}
              />
            </g>
          );
        })}
        
        {data.map((item, idx) => {
          const x = paddingLeft + idx * colWidth + colWidth / 2;
          const y = height - paddingBottom + 16;
          
          return (
            <text
              key={idx}
              x={x}
              y={y}
              textAnchor="middle"
              className="fill-text-secondary text-[9px] font-semibold"
            >
              {item.month}
            </text>
          );
        })}
      </svg>
      
      {hoveredIndex !== null && (
        <div 
          className="absolute z-10 bg-sidebar-bg border border-card-border p-2 rounded-lg shadow-xl text-[10px] pointer-events-none transition-all duration-100"
          style={{
            left: `${(paddingLeft + hoveredIndex * colWidth + colWidth / 2) / width * 100}%`,
            top: `${(getY(data[hoveredIndex].revenue) - 35) / height * 100}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-bold text-text-primary">{data[hoveredIndex].month}</div>
          <div className="text-accent-indigo font-semibold">₹{data[hoveredIndex].revenue.toLocaleString('en-IN')}</div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
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
  const [segments, setSegments] = useState<Segment[]>([]);

  // Sub-navigation toggles
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);

  // AI Suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  // Segment creation inputs
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [newSegmentSpendMin, setNewSegmentSpendMin] = useState<string>('');
  const [newSegmentLastOrderDays, setNewSegmentLastOrderDays] = useState<string>('');
  const [newSegmentProduct, setNewSegmentProduct] = useState('');
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  
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
      const segmentsList = await api.getSegments();
      setSegments(segmentsList);
      
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
        setActiveTab('campaigns');
        setAiResult(null);
        setAiPrompt('');
      } else {
        setGlobalSuccess(`Campaign "${created.name}" launched successfully! Directing to monitoring hub...`);
        setTimeout(() => setGlobalSuccess(null), 4000);

        // 3. Open campaign details
        setSelectedCampaign(created);
        setCampaignLogs([]);
        setActiveTab('campaigns');
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

  const applySuggestion = (promptText: string) => {
    setAiPrompt(promptText);
    setActiveTab('campaigns');
    setShowCampaignBuilder(true);
    
    // Automatically click generate strategy after switching
    setTimeout(() => {
      const submitBtn = document.getElementById('ai-submit-button');
      if (submitBtn) submitBtn.click();
    }, 150);
  };

  const formatRevenue = (val: number): string => {
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName.trim()) {
      setGlobalError('Segment name is required.');
      return;
    }
    
    setIsCreatingSegment(true);
    setGlobalError(null);
    setGlobalSuccess(null);
    
    try {
      const criteria: any = {};
      if (newSegmentSpendMin) criteria.totalSpendMin = parseFloat(newSegmentSpendMin);
      if (newSegmentLastOrderDays) criteria.lastOrderDaysAgo = parseInt(newSegmentLastOrderDays);
      if (newSegmentProduct.trim()) criteria.specificProduct = newSegmentProduct.trim();
      
      const created = await api.createSegment({
        name: newSegmentName,
        description: newSegmentDesc,
        audienceCriteria: criteria
      });
      
      setGlobalSuccess(`Segment "${created.name}" created successfully with ${created.audienceSize} matched customers.`);
      setTimeout(() => setGlobalSuccess(null), 4000);
      
      // Reset form
      setNewSegmentName('');
      setNewSegmentDesc('');
      setNewSegmentSpendMin('');
      setNewSegmentLastOrderDays('');
      setNewSegmentProduct('');
      
      // Refresh segments list and analytics
      await fetchAnalyticsAndCampaigns();
      setShowSegmentBuilder(false);
    } catch (err: any) {
      setGlobalError('Failed to create segment: ' + err.message);
    } finally {
      setIsCreatingSegment(false);
    }
  };

  const handleGetSuggestions = () => {
    setIsSuggestionsLoading(true);
    setTimeout(() => {
      setShowSuggestions(true);
      setIsSuggestionsLoading(false);
    }, 500);
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
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden transition-colors duration-300 relative">
      
      {/* Ambient background auras & grid network (web effect) */}
      <div className="dashboard-web-grid pointer-events-none" />
      <div className="glowing-orb orb-violet" />
      <div className="glowing-orb orb-indigo" />
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar-bg flex flex-col justify-between p-6 animate-slide-in-left z-10">
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
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white/5 text-violet-400 border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-violet-400' : 'text-gray-400'}`} />
              Dashboard
            </button>

            <button
              onClick={() => { setActiveTab('campaigns'); setSelectedCampaign(null); setShowCampaignBuilder(false); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-white/5 text-violet-400 border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Megaphone className={`w-3.5 h-3.5 ${activeTab === 'campaigns' ? 'text-violet-400' : 'text-gray-400'}`} />
              Campaigns
            </button>

            <button
              onClick={() => { setActiveTab('segments'); setShowSegmentBuilder(false); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'segments'
                  ? 'bg-white/5 text-violet-400 border border-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Target className={`w-3.5 h-3.5 ${activeTab === 'segments' ? 'text-violet-400' : 'text-gray-400'}`} />
              Segments
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
      <main className="flex-1 flex flex-col overflow-hidden p-8 z-10 relative">
        
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
            {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              {/* Header */}
              <div className="animate-slide-in-bottom">
                <h2 className="text-2xl font-bold tracking-tight text-gradient">
                  Dashboard
                </h2>
                <p className="text-text-secondary text-xs mt-1">
                  Overview of your customer base and campaign performance
                </p>
              </div>

              {/* 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Customers */}
                <div className="glass-panel p-5 relative overflow-hidden flex items-center justify-between group hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-violet/5 hover:border-accent-violet/20 transition-all duration-300 animate-slide-in-top">
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-tertiary uppercase font-bold block">Total Customers</span>
                    <span className="text-2xl font-black text-text-primary block">
                      {dashboardStats?.customerCount ?? 200}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full min-h-[60px]">
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 animate-pulse">
                      ↗ 19 new
                    </span>
                    <div className="bg-violet-500/10 text-violet-400 p-2.5 rounded-xl border border-violet-500/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="glass-panel p-5 relative overflow-hidden flex items-center justify-between group hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-violet/5 hover:border-accent-violet/20 transition-all duration-300 animate-slide-in-top delay-75">
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-tertiary uppercase font-bold block">Total Revenue</span>
                    <span className="text-2xl font-black text-text-primary block">
                      {dashboardStats?.totalRevenue ? formatRevenue(dashboardStats.totalRevenue) : '₹53.9L'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-end h-full min-h-[60px]">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Campaigns Sent */}
                <div className="glass-panel p-5 relative overflow-hidden flex items-center justify-between group hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-violet/5 hover:border-accent-violet/20 transition-all duration-300 animate-slide-in-top delay-150">
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-tertiary uppercase font-bold block">Campaigns Sent</span>
                    <span className="text-2xl font-black text-text-primary block">
                      {dashboardStats?.campaignCount ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full min-h-[60px]">
                    <span className="text-[10px] text-emerald-500 font-bold">
                      ↗ —
                    </span>
                    <div className="bg-amber-500/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Megaphone className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Segments */}
                <div className="glass-panel p-5 relative overflow-hidden flex items-center justify-between group hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-violet/5 hover:border-accent-violet/20 transition-all duration-300 animate-slide-in-top delay-200">
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-tertiary uppercase font-bold block">Segments</span>
                    <span className="text-2xl font-black text-text-primary block">
                      {dashboardStats?.segmentCount ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-end h-full min-h-[60px]">
                    <div className="bg-pink-500/10 text-pink-400 p-2.5 rounded-xl border border-pink-500/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row with Revenue Timeline & Top Cities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Revenue Timeline (2/3) */}
                <div className="lg:col-span-8 glass-panel p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-accent-violet/5 hover:border-accent-violet/10 transition-all duration-300 animate-slide-in-top delay-300">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Revenue Timeline
                    </h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    {dashboardStats?.revenueTimeline ? (
                      <RevenueChart data={dashboardStats.revenueTimeline} />
                    ) : (
                      <div className="text-text-tertiary text-xs">Loading timeline...</div>
                    )}
                  </div>
                </div>

                {/* Top Customer Locations (1/3) */}
                <div className="lg:col-span-4 glass-panel p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-accent-violet/5 hover:border-accent-violet/10 transition-all duration-300 animate-slide-in-top delay-400">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Top Customer Locations
                    </h3>
                    <button className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-white/5 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <TopLocationsCard />
                  </div>
                </div>
              </div>

              {/* Bottom Section: AI Campaign Suggestions */}
              <div className="glass-panel p-5 space-y-4 animate-slide-in-top delay-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-violet-500/10 text-violet-400 p-2 rounded-lg mt-0.5 animate-pulse">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                        AI Campaign Suggestions
                      </h3>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-normal">
                        Click "Get Suggestions" to let AI analyze your customer data and recommend smart campaigns.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGetSuggestions}
                    disabled={isSuggestionsLoading}
                    className="bg-accent-violet hover:bg-accent-violet/90 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-md shadow-accent-violet/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-center"
                  >
                    {isSuggestionsLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Analyzing Data...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Get Suggestions
                      </>
                    )}
                  </button>
                </div>

                {/* Suggestions Cards Grid */}
                {showSuggestions && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Coffee Winback */}
                    <div className="bg-panel-bg border border-card-border p-4 rounded-xl flex flex-col justify-between gap-3.5 hover:-translate-y-1 hover:border-accent-violet/45 hover:shadow-lg hover:shadow-accent-violet/5 hover:scale-[1.01] transition-all duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase bg-emerald-950/20 text-emerald-400 border border-emerald-500/10">WhatsApp</span>
                          <span className="text-[9px] text-text-tertiary font-bold">Criteria Match: 2</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary mt-1">Coffee Winback</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                          Target coffee buyers who spent over ₹500 but haven't ordered in 30 days.
                        </p>
                      </div>
                      <button
                        onClick={() => applySuggestion("Target coffee buyers who spent over ₹500 but haven't ordered in 30 days.")}
                        className="w-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-primary font-bold text-[10px] py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Use Prompt &rarr;
                      </button>
                    </div>

                    {/* Sneaker VIP Drop */}
                    <div className="bg-panel-bg border border-card-border p-4 rounded-xl flex flex-col justify-between gap-3.5 hover:-translate-y-1 hover:border-accent-violet/45 hover:shadow-lg hover:shadow-accent-violet/5 hover:scale-[1.01] transition-all duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/10">Email</span>
                          <span className="text-[9px] text-text-tertiary font-bold">Criteria Match: 3</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary mt-1">Sneaker VIP Drops</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                          Target premium sneaker shoppers who spent above ₹5000 in our database.
                        </p>
                      </div>
                      <button
                        onClick={() => applySuggestion("Target premium sneaker shoppers who spent above ₹5000 in our database.")}
                        className="w-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-primary font-bold text-[10px] py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Use Prompt &rarr;
                      </button>
                    </div>

                    {/* Delhi Special Offer */}
                    <div className="bg-panel-bg border border-card-border p-4 rounded-xl flex flex-col justify-between gap-3.5 hover:-translate-y-1 hover:border-accent-violet/45 hover:shadow-lg hover:shadow-accent-violet/5 hover:scale-[1.01] transition-all duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase bg-violet-950/20 text-violet-400 border border-violet-500/10">SMS</span>
                          <span className="text-[9px] text-text-tertiary font-bold">Criteria Match: 5</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary mt-1">Delhi Special Offer</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                          Target shoppers in Delhi who bought Filter Coffee.
                        </p>
                      </div>
                      <button
                        onClick={() => applySuggestion("Target shoppers in Delhi who bought Filter Coffee.")}
                        className="w-full bg-white/5 hover:bg-white/10 active:scale-95 text-text-primary font-bold text-[10px] py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Use Prompt &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden animate-slide-in-bottom">
              
              {selectedCampaign ? (
                /* DETAILED CAMPAIGN TRACKER (WEBHOOK SIMULATOR PROGRESS) */
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
                                    CRM &larr; Simulator: <span className="text-emerald-400 font-bold">{log.status}</span> notification for{' '}
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
              ) : showCampaignBuilder ? (
                /* AI CAMPAIGN WIZARD (OLD COPILOT) */
                <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                  
                  {/* Header */}
                  <div>
                    <button
                      onClick={() => { setShowCampaignBuilder(false); setAiResult(null); }}
                      className="text-xs text-accent-violet hover:text-accent-violet/80 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0 mb-1"
                    >
                      &larr; Back to Campaigns
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-gradient">
                      AI Campaign Builder
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Prompt input */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="glass-panel p-5">
                        <form onSubmit={handleAnalyzeGoal} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-accent-violet flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Campaign Copywriter Console
                            </label>
                            <span className="text-[10px] text-text-tertiary">Mock Gemini Engine</span>
                          </div>
                          
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. 'Launch a WhatsApp campaign to win-back coffee buyers who spent above 500 but haven't ordered in 30 days...'"
                            className="w-full h-32 bg-input-bg border border-card-border rounded-lg p-3 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/15 transition-all resize-none"
                          />

                          <button
                            id="ai-submit-button"
                            type="submit"
                            disabled={isAnalyzing || !aiPrompt.trim()}
                            className="w-full bg-gradient-to-r from-accent-violet to-accent-indigo hover:opacity-95 disabled:opacity-50 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-all shadow-md shadow-accent-violet/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isAnalyzing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Analyzing Shopper Match...
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

                      {/* Quick presets */}
                      <div className="glass-panel p-5 space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                          Quick Presets
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            onClick={() => selectQuickPreset("Target coffee buyers who spent over ₹500 but haven't ordered in 30 days.")}
                            className="p-3 bg-panel-bg hover:bg-white/[0.03] border border-card-border hover:border-accent-violet/20 rounded-lg text-left transition-all cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-text-primary block mb-1">Coffee Winback</span>
                            <span className="text-[10px] text-text-secondary leading-normal block">Re-engage inactive coffee shoppers with WhatsApp codes.</span>
                          </button>
                          <button
                            onClick={() => selectQuickPreset("Target premium sneaker shoppers who spent above ₹5000 in our database.")}
                            className="p-3 bg-panel-bg hover:bg-white/[0.03] border border-card-border hover:border-accent-violet/20 rounded-lg text-left transition-all cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-text-primary block mb-1">Sneaker VIP Drops</span>
                            <span className="text-[10px] text-text-secondary leading-normal block">Email luxury sneaker catalog updates to VIP customers.</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Output */}
                    <div className="lg:col-span-5">
                      {!isAnalyzing && !aiResult && (
                        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                          <div className="p-3 bg-panel-bg border border-card-border rounded-full mb-3 text-text-tertiary">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <h4 className="text-xs font-bold text-text-primary">Copilot Engine Idle</h4>
                          <p className="text-[10px] text-text-secondary max-w-xs mt-1 leading-normal">
                            Describe your targeting goal or choose a suggestion preset to let AI draft your campaign.
                          </p>
                        </div>
                      )}

                      {isAnalyzing && (
                        <div className="glass-panel p-6 space-y-5 min-h-[280px] flex flex-col justify-center">
                          <div className="flex flex-col items-center text-center">
                            <RefreshCw className="w-6 h-6 text-accent-violet animate-spin mb-3" />
                            <h4 className="text-xs font-bold text-text-primary">Copilot Strategizer</h4>
                            <p className="text-[10px] text-accent-violet mt-0.5">Segmenting datasets...</p>
                          </div>

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

                      {aiResult && (
                        <div className="glass-panel p-5 space-y-4">
                          <div className="border-b border-card-border pb-2.5">
                            <div className="text-[9px] font-bold text-accent-violet uppercase tracking-widest">Suggested Strategy</div>
                            <h3 className="text-base font-bold text-text-primary mt-0.5">{aiResult.analysis.campaignName}</h3>
                          </div>

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

                          <div>
                            <span className="text-[9px] text-text-tertiary uppercase font-bold block mb-1">AI Rationale</span>
                            <p className="text-[11px] text-text-secondary leading-normal bg-panel-bg p-2.5 rounded-lg border border-card-border">
                              {aiResult.analysis.campaignSummary}
                            </p>
                          </div>

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
                                      <option key={cust._id} value={cust._id}>{cust.name}</option>
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
              ) : (
                /* CAMPAIGNS LIST VIEW */
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gradient">
                        Campaigns
                      </h2>
                      <p className="text-text-secondary text-xs mt-1">
                        Create and send personalized campaigns to your segments
                      </p>
                    </div>

                    {campaigns.length > 0 && (
                      <button
                        onClick={() => setShowCampaignBuilder(true)}
                        className="bg-accent-violet hover:bg-accent-violet/90 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent-violet/10"
                      >
                        <Plus className="w-4 h-4" /> New Campaign
                      </button>
                    )}
                  </div>

                  {campaigns.length === 0 ? (
                    /* EMPTY STATE (IMAGE 3) */
                    <div className="glass-panel flex-1 flex flex-col items-center justify-center p-20 text-center min-h-[350px]">
                      <div className="p-4 bg-white/[0.02] border border-card-border rounded-full mb-4 text-text-tertiary">
                        <Megaphone className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-sm text-text-primary">No campaigns yet</h3>
                      <p className="text-xs text-text-secondary mt-1 max-w-xs leading-normal">
                        Create your first campaign to start reaching your customers
                      </p>
                      <button
                        onClick={() => setShowCampaignBuilder(true)}
                        className="mt-5 bg-accent-violet hover:bg-accent-violet/90 text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all shadow-md shadow-accent-violet/15 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Create Campaign
                      </button>
                    </div>
                  ) : (
                    /* DYNAMIC LIST */
                    <div className="glass-panel flex-1 flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-card-border flex items-center justify-between bg-black/10">
                        <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">All Campaigns</h3>
                        <span className="text-xs text-text-tertiary font-bold">{campaigns.length} campaigns</span>
                      </div>

                      <div className="flex-1 overflow-y-auto divide-y divide-card-border">
                        {campaigns.map((camp) => (
                          <button
                            key={camp._id}
                            onClick={() => setSelectedCampaign(camp)}
                            className="w-full p-4 hover:bg-panel-bg flex items-center justify-between text-left transition-all group cursor-pointer border-0 bg-transparent focus:outline-none"
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
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* TAB: SEGMENTS */}
          {activeTab === 'segments' && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden animate-slide-in-bottom">
              
              {showSegmentBuilder ? (
                /* SEGMENT CREATION FORM */
                <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                  <div>
                    <button
                      onClick={() => setShowSegmentBuilder(false)}
                      className="text-xs text-accent-violet hover:text-accent-violet/80 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0 mb-1"
                    >
                      &larr; Back to Segments
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-gradient">
                      Create New Segment
                    </h2>
                    <p className="text-text-secondary text-xs mt-1">
                      Group customers dynamically by setting transaction and purchasing criteria constraints.
                    </p>
                  </div>

                  <div className="glass-panel p-6 max-w-xl space-y-4">
                    <form onSubmit={handleCreateSegment} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                          Segment Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newSegmentName}
                          onChange={(e) => setNewSegmentName(e.target.value)}
                          placeholder="e.g. Inactive Big Spenders"
                          className="w-full bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-violet"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                          Description
                        </label>
                        <textarea
                          value={newSegmentDesc}
                          onChange={(e) => setNewSegmentDesc(e.target.value)}
                          placeholder="e.g. Customers who purchased items above ₹1000 but are inactive for more than 40 days."
                          className="w-full h-20 bg-input-bg border border-card-border rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-accent-violet resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                            Minimum Spending (₹)
                          </label>
                          <input
                            type="number"
                            value={newSegmentSpendMin}
                            onChange={(e) => setNewSegmentSpendMin(e.target.value)}
                            placeholder="e.g. 1000"
                            className="w-full bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-violet"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                            Last Order Recency (Days Inactive)
                          </label>
                          <input
                            type="number"
                            value={newSegmentLastOrderDays}
                            onChange={(e) => setNewSegmentLastOrderDays(e.target.value)}
                            placeholder="e.g. 30"
                            className="w-full bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-violet"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                          Purchased Specific Product Affinity
                        </label>
                        <select
                          value={newSegmentProduct}
                          onChange={(e) => setNewSegmentProduct(e.target.value)}
                          className="w-full bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-violet"
                        >
                          <option value="">Any Product</option>
                          <option value="Cappuccino">Cappuccino</option>
                          <option value="Cold Brew Coffee">Cold Brew Coffee</option>
                          <option value="Filter Coffee">Filter Coffee</option>
                          <option value="Latte">Latte</option>
                          <option value="Air Jordan Sneakers">Air Jordan Sneakers</option>
                          <option value="Nike Pegasus Running Shoes">Nike Pegasus Running Shoes</option>
                          <option value="Adidas Ultraboost Sneakers">Adidas Ultraboost Sneakers</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isCreatingSegment}
                          className="flex-1 bg-accent-violet hover:bg-accent-violet/90 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all shadow-md shadow-accent-violet/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isCreatingSegment ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Creating Segment...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Segment
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSegmentBuilder(false)}
                          className="bg-white/5 border border-card-border hover:border-white/10 text-text-primary font-bold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* SEGMENTS LIST VIEW */
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gradient">
                        Segments
                      </h2>
                      <p className="text-text-secondary text-xs mt-1">
                        Create audience segments using AI-powered natural language
                      </p>
                    </div>

                    {segments.length > 0 && (
                      <button
                        onClick={() => setShowSegmentBuilder(true)}
                        className="bg-accent-violet hover:bg-accent-violet/90 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent-violet/10"
                      >
                        <Plus className="w-4 h-4" /> New Segment
                      </button>
                    )}
                  </div>

                  {segments.length === 0 ? (
                    /* EMPTY STATE (IMAGE 2) */
                    <div className="glass-panel flex-1 flex flex-col items-center justify-center p-20 text-center min-h-[350px]">
                      <div className="p-4 bg-white/[0.02] border border-card-border rounded-full mb-4 text-text-tertiary">
                        <Target className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-sm text-text-primary">No segments yet</h3>
                      <p className="text-xs text-text-secondary mt-1 max-w-xs leading-normal">
                        Create your first audience segment using the AI builder above
                      </p>
                      <button
                        onClick={() => setShowSegmentBuilder(true)}
                        className="mt-5 bg-accent-violet hover:bg-accent-violet/90 text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all shadow-md shadow-accent-violet/15 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Create Segment
                      </button>
                    </div>
                  ) : (
                    /* DYNAMIC LIST */
                    <div className="glass-panel flex-1 flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-card-border flex items-center justify-between bg-black/10">
                        <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">All Segments</h3>
                        <span className="text-xs text-text-tertiary font-bold">{segments.length} segments</span>
                      </div>

                      <div className="flex-1 overflow-y-auto divide-y divide-card-border">
                        {segments.map((seg) => (
                          <div
                            key={seg._id}
                            className="p-4 hover:bg-panel-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-xs text-text-primary">
                                {seg.name}
                              </span>
                              <p className="text-xs text-text-secondary leading-relaxed">
                                {seg.description || 'No description provided.'}
                              </p>
                              
                              {/* Render criteria tags */}
                              <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {seg.audienceCriteria?.totalSpendMin !== undefined && (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded text-[9px] font-bold">
                                    Spend &ge; ₹{seg.audienceCriteria.totalSpendMin}
                                  </span>
                                )}
                                {seg.audienceCriteria?.lastOrderDaysAgo !== undefined && (
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/15 px-2 py-0.5 rounded text-[9px] font-bold">
                                    Inactive &ge; {seg.audienceCriteria.lastOrderDaysAgo}d
                                  </span>
                                )}
                                {seg.audienceCriteria?.specificProduct && (
                                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                                    Product: {seg.audienceCriteria.specificProduct}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-right shrink-0">
                              <div className="text-xs">
                                <span className="text-text-tertiary text-[9px] uppercase font-bold block">Size</span>
                                <span className="font-extrabold text-text-primary mt-0.5 block text-sm">
                                  {seg.audienceSize} <span className="text-[10px] font-medium text-text-secondary">shoppers</span>
                                </span>
                              </div>
                              
                              <div className="text-xs hidden sm:block">
                                <span className="text-text-tertiary text-[9px] uppercase font-bold block">Created</span>
                                <span className="font-medium text-text-secondary mt-0.5 block">
                                  {new Date(seg.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* TAB 3: AUDIENCE BASE */}
          {activeTab === 'audience' && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden animate-slide-in-bottom">
              
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
