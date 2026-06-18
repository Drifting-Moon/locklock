"use client";

import React from 'react';

interface SelectedHotspot {
  id: number;
  locationName: string;
  policeStation: string;
  violationCount: number;
  laneCount: number;
  highwayType: string;
  capacityLoss: number;
  bprDelay: number;
}

interface PhysicsInspectorProps {
  hotspot: SelectedHotspot | null;
  onClose: () => void;
}

export default function PhysicsInspector({ hotspot, onClose }: PhysicsInspectorProps) {
  if (!hotspot) return null;

  // Determine severity color/badge
  let severityBadge = "Moderate";
  let severityColor = "text-primary border-primary/30 bg-primary/10";
  if (hotspot.bprDelay >= 15) {
    severityBadge = "Critical";
    severityColor = "text-[#f44336] border-[#f44336]/30 bg-[#f44336]/10";
  } else if (hotspot.bprDelay >= 5) {
    severityBadge = "High";
    severityColor = "text-amber-500 border-amber-500/30 bg-amber-500/10";
  }

  return (
    <div className="absolute right-0 top-0 h-full w-[350px] bg-[#121626]/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
          <h3 className="font-headline-md text-lg font-bold text-[#dae2fd]">Physics Inspector</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-on-surface-variant hover:text-white cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-6 text-sm">
        {/* Section 1: Location & Severity */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${severityColor}`}>
              {severityBadge}
            </span>
            <span className="text-[10px] text-white/40 font-mono">ID: HS-{hotspot.id}</span>
          </div>
          <h4 className="font-bold text-base text-white">{hotspot.locationName}</h4>
          <p className="text-xs text-on-surface-variant mt-1">Jurisdiction: {hotspot.policeStation} Division</p>
        </div>

        {/* Section 2: OSM Source Data */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-wider uppercase mb-3">
            <span className="material-symbols-outlined text-xs">public</span>
            <span>OSM Ground Truth</span>
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">Road Class:</span>
              <span className="text-white capitalize">{hotspot.highwayType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Base Capacity:</span>
              <span className="text-white">{hotspot.laneCount} Lanes</span>
            </div>
          </div>
        </div>

        {/* Section 3: Obstruction Physics */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-wider uppercase mb-3">
            <span className="material-symbols-outlined text-xs">grid_view</span>
            <span>Obstruction Analysis</span>
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">Obstructions:</span>
              <span className="text-white">1 Lane Blocked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Capacity Loss:</span>
              <span className="text-[#f44336] font-bold">-{hotspot.capacityLoss.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Deduplicated Sweeps:</span>
              <span className="text-white">{hotspot.violationCount} events</span>
            </div>
          </div>
        </div>

        {/* Section 4: Bureau of Public Roads Delay Math */}
        <div className="bg-gradient-to-br from-primary/10 to-[#f44336]/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-wider uppercase mb-2">
            <span className="material-symbols-outlined text-xs">analytics</span>
            <span>BPR delay equation</span>
          </div>
          
          {/* Formula Display */}
          <div className="bg-black/30 rounded p-2.5 text-center font-mono text-[10px] text-primary mb-3">
            T_f = T_0 × (1 + 0.15 × (V/C)^4)
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">Free Flow T_0:</span>
              <span className="text-white">10.0 mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Projected Delay:</span>
              <span className="text-[#ff9800] font-bold">+{hotspot.bprDelay.toFixed(1)} mins</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className="w-full bg-[#bdc2ff] text-[#00149e] font-bold py-2.5 rounded-lg hover:brightness-110 transition-all cursor-pointer text-center font-mono text-xs uppercase mt-auto"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
