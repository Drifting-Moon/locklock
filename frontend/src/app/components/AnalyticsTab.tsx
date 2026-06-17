"use client";
import React, { useEffect, useState } from 'react';

export default function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('http://localhost:8000/api/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-on-surface">Loading Analytics...</div>;

  return (
    <div className="flex-grow space-y-lg">
      <div className="flex flex-col gap-xs">
        <div className="flex justify-between items-end">
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface">Violation Analytics</h2>
          <div className="flex items-center gap-xs px-sm py-xs bg-surface-container-high rounded-lg border border-outline-variant text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span className="font-label-md text-label-md">Last 24 Hours</span>
          </div>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="glass-card p-md rounded-xl flex justify-between items-center bg-surface-container/50 border border-outline-variant">
          <div className="space-y-xs">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Violations</p>
            <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">{data.metrics?.totalViolations?.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>gavel</span>
          </div>
        </div>
        
        <div className="flex gap-md pb-xs">
          <div className="glass-card p-md rounded-xl flex-1 bg-surface-container/50 border border-outline-variant">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">Avg. Clearance</p>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-md text-headline-md text-secondary">{data.metrics?.avgClearanceTime}</span>
            </div>
          </div>
          <div className="glass-card p-md rounded-xl flex-1 bg-surface-container/50 border border-outline-variant">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">Revenue Impact</p>
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-md text-headline-md text-tertiary">{data.metrics?.revenueImpact}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">EST.</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Violation Breakdown */}
      <section className="glass-card rounded-xl p-md space-y-lg bg-surface-container/50 border border-outline-variant">
        <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-widest">Violation Breakdown</h3>
        <div className="h-48 flex items-end justify-around gap-sm pt-md">
          {data.violation_breakdown?.map((v: any, i: number) => {
            const colors = ["#bdc2ff", "#14d1ff", "#7d37ff", "#444656", "#ffb4ab"];
            const color = colors[i % colors.length];
            const max = data.violation_breakdown[0]?.count || 1;
            const pct = Math.max(10, Math.min(100, (v.count / max) * 100));
            return (
              <div key={i} className="flex flex-col items-center justify-end gap-sm w-full h-full">
                <div className="w-full max-w-[40px] rounded-t-lg transition-all" style={{ height: `${pct}%`, backgroundColor: color }}></div>
                <span className="font-label-md text-[10px] text-on-surface-variant text-center leading-tight">{v.type.replace('Violation', '')} ({v.count})</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vehicle Breakdown */}
      <section className="space-y-md pb-12">
        <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-widest">Vehicle Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {data.vehicle_breakdown?.map((v: any, i: number) => {
            const icons = ["directions_car", "local_shipping", "two_wheeler", "airport_shuttle", "directions_bus"];
            const iconCols = ["text-primary", "text-secondary", "text-tertiary", "text-outline", "text-error"];
            return (
              <div key={i} className="glass-card p-md rounded-xl flex flex-col gap-sm bg-surface-container/50 border border-outline-variant">
                <div className="flex justify-between items-start">
                  <span className={`material-symbols-outlined ${iconCols[i % iconCols.length]}`}>{icons[i % icons.length]}</span>
                  <span className="text-on-surface font-bold font-body-md text-body-md">{v.count}</span>
                </div>
                <p className="font-label-md text-[11px] text-on-surface-variant">{v.type}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
