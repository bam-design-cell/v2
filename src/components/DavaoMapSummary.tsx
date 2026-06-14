import React, { useState } from "react";
import { Project } from "../types";
import { 
  Map, 
  MapPin, 
  Layers, 
  ArrowUpRight, 
  CheckCircle, 
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DavaoMapSummaryProps {
  projects: Project[];
}

export default function DavaoMapSummary({ projects }: DavaoMapSummaryProps) {
  const OFFICES = [
    { id: "Davao City", name: "Davao City", label: "Metro Davao", color: "from-blue-600 to-indigo-600" },
    { id: "Davao del Norte", name: "Davao del Norte", label: "PSTO DavNor", color: "from-sky-500 to-indigo-500" },
    { id: "Davao de Oro", name: "Davao de Oro", label: "PSTO DavOro", color: "from-teal-500 to-indigo-500" },
    { id: "Davao Oriental", name: "Davao Oriental", label: "PSTO DavOri", color: "from-emerald-500 to-indigo-500" },
    { id: "Davao del Sur", name: "Davao del Sur", label: "PSTO DavSur", color: "from-purple-500 to-indigo-500" },
    { id: "Davao Occidental", name: "Davao Occidental", label: "PSTO DavOcc", color: "from-pink-500 to-indigo-505" }
  ];

  const [activeProvince, setActiveProvince] = useState<string | null>("Davao City");
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // Math totals
  const totalProjects = projects.length;

  // Process data for each province
  const provinceStats = OFFICES.map((off) => {
    const provinceProjects = projects.filter(
      (p) => (p.cityProvincialOffice || "Davao City") === off.id
    );
    const count = provinceProjects.length;
    const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
    
    const completed = provinceProjects.filter((p) => p.projectStatus === "Completed").length;
    const compliance = count > 0 ? Math.round((completed / count) * 100) : 100;
    
    // Find most frequent product type
    const productCounts = provinceProjects.reduce((acc, current) => {
      if (current.product) {
        acc[current.product] = (acc[current.product] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const primeProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None registered";
    
    return {
      ...off,
      count,
      percentage: pct,
      completed,
      compliance,
      primeProduct,
      listOfProjects: provinceProjects
    };
  });

  const selectedStats = provinceStats.find((p) => p.id === activeProvince) || provinceStats[0];
  const maxCount = Math.max(...provinceStats.map((p) => p.count), 1);

  return (
    <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6" id="davao-regional-visualization">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Map size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">DOST DAVAO Province Mapping Matrix</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
              Interactive geographic cluster telemetry & load index
            </p>
          </div>
        </div>

        {/* Quick legend info tag */}
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-600"></span> High Volume</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-900/40"></span> Active Cluster</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-white/5"></span> Static Base</span>
        </div>
      </div>

      {/* Main visualization quadrant containing Interactive Map + Split breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Quadrant: Interactive Vector SVG Map (Lg: 5 columns) */}
        <div className="lg:col-span-5 bg-[#0e0e11]/50 border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between min-h-[380px] relative select-none overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Davao Region Outline</span>
              <span className="text-[9px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">SCHEMA_MODEL</span>
            </div>
            <p className="text-[10px] text-slate-400">Click a province path to load structural indicators.</p>
          </div>

          {/* SVG Canvas Map Model */}
          <div className="flex-1 flex items-center justify-center py-4 relative">
            <svg 
              viewBox="0 0 450 510" 
              className="w-full max-w-[345px] h-auto drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Graphic Davao Gulf Blue Backdrop Segment */}
              <path 
                d="M 132,205 C 150,220 180,240 185,235 C 195,250 200,270 215,275 C 230,280 240,265 254,242 C 220,290 160,330 115,310 Z" 
                fill="#3b82f6" 
                fillOpacity="0.04"
                stroke="#32323d"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text 
                x="185" 
                y="312" 
                fill="#475569" 
                fontSize="9" 
                fontFamily="SFMono-Regular, Consolas, Monaco, monospace" 
                fontWeight="black" 
                textAnchor="middle" 
                className="tracking-widest opacity-60"
              >
                DAVAO GULF
              </text>

              {/* DRAW MAP PROVINCES WITH ACCURATE HIGHER FIDELITY COORDINATE PATHS */}
              
              {/* 1. DAVAO DEL NORTE */}
              <g 
                onClick={() => setActiveProvince("Davao del Norte")}
                onMouseEnter={() => setHoveredProvince("Davao del Norte")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/prov"
              >
                <path
                  d="M 120,90 L 210,90 C 210,110 200,120 200,135 C 200,145 225,150 215,170 C 210,180 190,170 190,190 C 190,205 210,210 205,225 L 185,235 C 175,230 160,210 155,190 C 155,190 148,198 142,210 L 132,205 C 125,185 135,175 135,160 L 108,155 L 108,145 L 115,145 L 115,110 Z"
                  fill={activeProvince === "Davao del Norte" ? "#0284c7" : hoveredProvince === "Davao del Norte" ? "#0ea5e9" : "rgba(2, 132, 199, 0.4)"}
                  stroke={activeProvince === "Davao del Norte" ? "#ffffff" : hoveredProvince === "Davao del Norte" ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={activeProvince === "Davao del Norte" ? "2.5" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle cx="160" cy="135" r={(provinceStats.find(p=>p.id === "Davao del Norte")?.count || 0) > 0 ? "5" : "2.5"} className="fill-indigo-400" />
                <text x="160" y="152" fill="#e2e8f0" fontSize="9" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none font-sans tracking-wide">DavNor</text>
              </g>

              {/* 2. DAVAO DE ORO */}
              <g 
                onClick={() => setActiveProvince("Davao de Oro")}
                onMouseEnter={() => setHoveredProvince("Davao de Oro")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/prov"
              >
                <path
                  d="M 210,90 L 295,90 C 300,105 310,110 320,115 C 325,120 310,140 300,145 C 290,150 280,180 280,195 C 280,210 250,230 235,240 C 220,230 200,235 185,235 L 205,225 C 210,210 190,205 190,190 C 190,170 210,180 220,170 C 230,150 205,140 205,130 C 205,120 210,110 210,90 Z"
                  fill={activeProvince === "Davao de Oro" ? "#d97706" : hoveredProvince === "Davao de Oro" ? "#f59e0b" : "rgba(217, 119, 6, 0.4)"}
                  stroke={activeProvince === "Davao de Oro" ? "#ffffff" : hoveredProvince === "Davao de Oro" ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={activeProvince === "Davao de Oro" ? "2.5" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle cx="232" cy="145" r={(provinceStats.find(p=>p.id === "Davao de Oro")?.count || 0) > 0 ? "5" : "2.5"} className="fill-indigo-400" />
                <text x="232" y="162" fill="#e2e8f0" fontSize="9" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none font-sans tracking-wide">DavOro</text>
              </g>

              {/* 3. DAVAO ORIENTAL */}
              <g 
                onClick={() => setActiveProvince("Davao Oriental")}
                onMouseEnter={() => setHoveredProvince("Davao Oriental")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/prov"
              >
                <path
                  d="M 295,90 C 330,90 350,110 350,120 C 350,125 365,135 375,140 C 380,145 370,170 375,185 C 380,190 375,200 380,210 C 385,215 372,225 378,235 C 370,240 361,248 355,255 C 348,260 320,265 315,273 C 310,285 305,310 308,340 C 308,355 298,365 292,367 C 288,360 290,340 290,320 C 290,305 295,295 285,285 C 280,280 270,280 265,275 C 255,270 252,250 254,242 L 235,240 C 250,230 280,210 280,195 C 280,180 290,150 300,145 C 310,140 325,120 320,115 C 310,110 300,105 295,90 Z"
                  fill={activeProvince === "Davao Oriental" ? "#059669" : hoveredProvince === "Davao Oriental" ? "#10b981" : "rgba(5, 150, 105, 0.4)"}
                  stroke={activeProvince === "Davao Oriental" ? "#ffffff" : hoveredProvince === "Davao Oriental" ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={activeProvince === "Davao Oriental" ? "2.5" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle cx="315" cy="190" r={(provinceStats.find(p=>p.id === "Davao Oriental")?.count || 0) > 0 ? "5" : "2.5"} className="fill-indigo-400" />
                <text x="315" y="207" fill="#e2e8f0" fontSize="9" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none font-sans tracking-wide">DavOri</text>
              </g>

              {/* 4. DAVAO CITY */}
              <g 
                onClick={() => setActiveProvince("Davao City")}
                onMouseEnter={() => setHoveredProvince("Davao City")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/prov"
              >
                <path
                  d="M 132,205 C 135,170 135,160 135,160 L 108,155 L 95,155 C 85,155 80,155 78,155 C 70,175 75,195 75,210 C 75,220 65,230 65,240 C 65,255 78,260 82,270 C 95,265 110,260 120,255 C 125,245 130,235 132,205 Z"
                  fill={activeProvince === "Davao City" ? "#2563eb" : hoveredProvince === "Davao City" ? "#3b82f6" : "rgba(37, 99, 235, 0.4)"}
                  stroke={activeProvince === "Davao City" ? "#ffffff" : hoveredProvince === "Davao City" ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={activeProvince === "Davao City" ? "2.5" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle cx="95" cy="205" r={(provinceStats.find(p=>p.id === "Davao City")?.count || 0) > 0 ? "5" : "2.5"} className="fill-indigo-400" />
                <text x="95" y="222" fill="#e2e8f0" fontSize="9" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none font-sans tracking-wide">Davao City</text>
              </g>

              {/* 5. DAVAO DEL SUR */}
              <g 
                onClick={() => setActiveProvince("Davao del Sur")}
                onMouseEnter={() => setHoveredProvince("Davao del Sur")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/prov"
              >
                <path
                  d="M 82,270 C 95,265 110,260 120,255 C 125,260 130,270 130,280 C 130,285 125,290 125,305 C 125,310 110,320 110,320 C 105,322 95,318 90,315 C 85,310 75,305 70,295 C 65,285 72,275 82,270 Z"
                  fill={activeProvince === "Davao del Sur" ? "#6d28d9" : hoveredProvince === "Davao del Sur" ? "#8b5cf6" : "rgba(109, 40, 217, 0.4)"}
                  stroke={activeProvince === "Davao del Sur" ? "#ffffff" : hoveredProvince === "Davao del Sur" ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={activeProvince === "Davao del Sur" ? "2.5" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle cx="100" cy="288" r={(provinceStats.find(p=>p.id === "Davao del Sur")?.count || 0) > 0 ? "5" : "2.5"} className="fill-indigo-400" />
                <text x="100" y="305" fill="#e2e8f0" fontSize="9" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none font-sans tracking-wide">DavSur</text>
              </g>

              {/* 6. DAVAO OCCIDENTAL */}
              <g 
                onClick={() => setActiveProvince("Davao Occidental")}
                onMouseEnter={() => setHoveredProvince("Davao Occidental")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/prov"
              >
                <path
                  d="M 110,320 C 115,330 125,340 135,355 C 145,370 150,390 152,410 C 154,430 148,450 140,465 C 135,475 125,485 115,490 L 112,490 C 115,480 125,470 130,450 C 135,430 138,410 130,390 C 124,375 118,360 112,350 C 106,340 100,330 90,315 C 95,318 105,322 110,320 Z"
                  fill={activeProvince === "Davao Occidental" ? "#be185d" : hoveredProvince === "Davao Occidental" ? "#ec4899" : "rgba(190, 24, 93, 0.4)"}
                  stroke={activeProvince === "Davao Occidental" ? "#ffffff" : hoveredProvince === "Davao Occidental" ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={activeProvince === "Davao Occidental" ? "2.5" : "1.2"}
                  className="transition-all duration-300"
                />
                <circle cx="124" cy="405" r={(provinceStats.find(p=>p.id === "Davao Occidental")?.count || 0) > 0 ? "5" : "2.5"} className="fill-indigo-400" />
                <text x="124" y="422" fill="#e2e8f0" fontSize="9" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none font-sans tracking-wide">DavOcc</text>
              </g>

              {/* ISLAND OF SAMAL (Administratively under Davao del Norte) */}
              <g 
                onClick={() => setActiveProvince("Davao del Norte")}
                onMouseEnter={() => setHoveredProvince("Davao del Norte")}
                onMouseLeave={() => setHoveredProvince(null)}
                className="cursor-pointer group/island"
              >
                <path 
                  d="M 168,235 C 172,235 178,245 178,260 C 176,270 170,280 166,280 C 162,280 158,270 160,255 C 162,245 164,235 168,235 Z" 
                  fill={activeProvince === "Davao del Norte" ? "#0284c7" : hoveredProvince === "Davao del Norte" ? "#0ea5e9" : "rgba(2, 132, 199, 0.4)"}
                  stroke={activeProvince === "Davao del Norte" ? "#ffffff" : hoveredProvince === "Davao del Norte" ? "rgba(255,255,255,0.7)" : "rgba(254, 254, 254, 0.25)"}
                  strokeWidth="1.2"
                  className="transition-all duration-300"
                />
                {/* Micro island secondary label */}
                <text x="168" y="263" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none font-mono tracking-tighter opacity-70">SAMAL</text>
              </g>
            </svg>
          </div>

          <div className="pt-3 border-t border-white/[0.04] text-[9px] text-slate-500 font-mono flex justify-between uppercase">
            <span>Davao Gulf Vector Matrix</span>
            <span className="text-indigo-400 font-bold">Region XI Map Scale</span>
          </div>
        </div>

        {/* Right Quadrant: Provincial Distribution Table Summary + Drill Down (Lg: 7 columns) */}
        <div className="lg:col-span-12 xl:lg:col-span-7 flex flex-col justify-between gap-6">
          
          {/* Tabular summary list */}
          <div className="bg-[#0e0e11]/30 border border-white/[0.03] rounded-2xl p-4 space-y-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">Provincial Load Ledger</span>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    <th className="py-2.5 font-bold">Province</th>
                    <th className="py-2.5 text-center font-bold">Records</th>
                    <th className="py-2.5 text-center font-bold">Share</th>
                    <th className="py-2.5 text-center font-bold">Compliance</th>
                    <th className="py-2.5 text-right font-bold">Top Segment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {provinceStats.map((prov) => {
                    const isActive = activeProvince === prov.id;
                    return (
                      <tr 
                        key={prov.id}
                        onClick={() => setActiveProvince(prov.id)}
                        className={`group cursor-pointer transition-colors ${
                          isActive 
                            ? "bg-indigo-500/10 text-white" 
                            : "hover:bg-white/[0.02] text-slate-300"
                        }`}
                      >
                        <td className="py-3 px-2 font-semibold flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            prov.count > 0 ? "bg-indigo-400" : "bg-slate-700"
                          }`} />
                          {prov.name}
                        </td>
                        <td className="py-3 text-center font-mono font-bold">
                          {prov.count}
                        </td>
                        <td className="py-3 text-center font-mono text-[10px] text-slate-400">
                          {prov.percentage}%
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block font-mono text-[10px] px-1.5 py-0.5 rounded ${
                            prov.compliance >= 100 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                          }`}>
                            {prov.compliance}%
                          </span>
                        </td>
                        <td className="py-3 text-right text-[10px] text-slate-400 group-hover:text-slate-200 truncate max-w-[120px] font-mono">
                          {prov.primeProduct}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active selection Drill-Down HUD */}
          <div className="bg-[#121215]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${selectedStats.color || "from-indigo-500 to-blue-500"} opacity-5 rounded-full blur-2xl pointer-events-none`} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.04] pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Selected Cluster HUD</span>
                <h4 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <MapPin size={15} className="text-indigo-400 shrink-0" />
                  {selectedStats.name}
                </h4>
              </div>
              <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-right shrink-0">
                <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Cluster Ratio</span>
                <span className="text-sm font-black text-indigo-400 font-mono">{selectedStats.count} Projects</span>
              </div>
            </div>

            {/* Local brief listings panel */}
            <div className="mt-4 space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block">Direct Customer Briefings</span>
              
              {selectedStats.listOfProjects.length === 0 ? (
                <div className="py-8 text-center bg-black/20 border border-white/[0.01] rounded-xl text-slate-500 text-xs flex flex-col items-center justify-center gap-1.5">
                  <Info size={18} className="text-slate-600" />
                  <p>No design records reside in this provincial register.</p>
                </div>
              ) : (
                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                  {selectedStats.listOfProjects.map((proj) => (
                    <div 
                      key={proj.projectId}
                      className="flex items-center justify-between p-3 bg-black/40 border border-white/[0.02] rounded-xl hover:border-white/10 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-200 truncate">{proj.companyName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-indigo-300 font-bold">{proj.projectId}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block"></span>
                          <span className="text-[10px] text-slate-400 truncate">{proj.product}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          proj.projectStatus === "Completed" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : proj.projectStatus === "In Progress"
                            ? "bg-sky-500/10 text-sky-450 text-sky-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {proj.projectStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
