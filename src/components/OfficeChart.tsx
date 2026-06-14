import React, { useState } from "react";
import { Project } from "../types";
import { Building2, TrendingUp, MapPin, Layers, Award, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OfficeChartProps {
  projects: Project[];
}

export default function OfficeChart({ projects }: OfficeChartProps) {
  const OFFICES = [
    "Davao City",
    "Davao Oriental",
    "Davao de Oro",
    "Davao del Norte",
    "Davao Occidental",
    "Davao del Sur",
  ];

  const totalProjects = projects.length;

  // Initialize counts for structured offices to ensure 0-value items are beautifully preserved
  const counts = OFFICES.reduce((acc, office) => {
    acc[office] = 0;
    return acc;
  }, {} as Record<string, number>);

  // Tally project offices
  projects.forEach((p) => {
    const office = p.cityProvincialOffice || "Davao City";
    if (OFFICES.includes(office)) {
      counts[office]++;
    } else {
      counts[office] = (counts[office] || 0) + 1;
    }
  });

  const chartData = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: totalProjects > 0 ? Math.round((value / totalProjects) * 100) : 0,
  }));

  // Sort by highest load first to show prioritized insights
  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const maxVal = Math.max(...sortedData.map((d) => d.value), 1);

  // High-level regional statistics
  const topOffice = sortedData[0];
  const activeOfficesCount = sortedData.filter((d) => d.value > 0).length;

  // State to track hover for interactive labels/glowing highlights
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col justify-between h-full" id="office-load-chart-panel">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <BarChart3 size={15} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                Regional Distribution Matrix
              </h4>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-none">
                Volume density across Davao Region provincial centers
              </p>
            </div>
          </div>
          {/* Quick Stats Tags */}
          <div className="flex items-center gap-2">
            <span className="bg-[#121214] border border-white/5 text-[9px] font-mono text-slate-400 px-2 py-1 rounded-lg">
              CENTERS: <strong className="text-indigo-400">{activeOfficesCount} / 6</strong>
            </span>
          </div>
        </div>

        {/* Chart + Quick card layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          
          {/* Visual SVG Chart (Left / 2 Cols) */}
          <div className="xl:col-span-2 bg-black/10 rounded-xl p-4 border border-white/[0.02] flex flex-col justify-center min-h-[290px]">
            <div className="space-y-4">
              {sortedData.map((data, index) => {
                const ratio = data.value / maxVal;
                // Animate to full width
                const barWidth = `${ratio * 100}%`;
                const isHovered = hoveredIndex === index;

                return (
                  <div 
                    key={data.name} 
                    className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 transition-all"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Office Name Label */}
                    <div className="w-full sm:w-36 text-xs text-slate-300 font-bold truncate flex items-center gap-1.5 shrink-0 select-none">
                      <MapPin size={11} className={`${isHovered ? "text-indigo-400" : "text-slate-500"} transition-colors`} />
                      <span className={isHovered ? "text-indigo-200" : ""}>{data.name}</span>
                    </div>

                    {/* Bar Container */}
                    <div className="flex-1 h-9 bg-black/40 border border-white/[0.03] rounded-xl flex items-center px-2 relative overflow-hidden group-hover:border-white/10 transition-all">
                      {/* Interactive Bar */}
                      <motion.div
                        className={`h-5 rounded-lg bg-gradient-to-r from-indigo-600/90 to-indigo-500/95 absolute left-2 ${
                          isHovered 
                            ? "shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                            : ""
                        }`}
                        style={{ originX: 0 }}
                        initial={{ width: 0 }}
                        animate={{ width: `calc(${barWidth} - 16px)` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />

                      {/* Display Count Overlay (Only visible on top of bar background) */}
                      <div className="absolute right-3.5 flex items-center gap-2 z-10 select-none font-mono">
                        <span className={`text-[10px] font-black ${isHovered ? "text-indigo-200 scale-105" : "text-slate-500"} transition-all`}>
                          {data.value} {data.value === 1 ? "file" : "files"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-600">
                          ({data.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Insights / Regional Summary Card (Right / 1 Col) */}
          <div className="xl:col-span-1 flex flex-col justify-between gap-4">
            
            {/* Top Regional Resource Focus */}
            <div className="bg-[#121214]/60 border border-white/5 rounded-xl p-4 flex-1 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Regional Load Peak</span>
                <span className="text-xl font-bold text-white mt-1 block truncate">
                  {topOffice?.value > 0 ? topOffice.name : "N/A"}
                </span>
                <span className="text-[11px] text-slate-400 mt-1.5 block font-sans">
                  Represents the highest concentration of packaging and labeling briefs.
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Peak Load:</span>
                <span className="text-indigo-400 font-extrabold">{topOffice?.value || 0} active files</span>
              </div>
            </div>

            {/* Quick Informational Tip */}
            <div className="bg-[#121214]/30 border border-white/[0.02] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Award size={13} className="text-amber-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">DOST DAVAO Service Note</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                To balance resources, PSTO coordinators must track load ratios periodically. Heavy skewing towards Davao Metropolitan centers requires proactive layout assignment.
              </p>
            </div>

          </div>

        </div>
      </div>

      <div className="pt-4 border-t border-white/5 mt-6 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-500 font-mono gap-2">
        <span className="uppercase tracking-widest">Analytics Scope: DOST DAVAO REGION Provincial Clusters</span>
        <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider">
          Interactive Live
        </span>
      </div>
    </div>
  );
}
