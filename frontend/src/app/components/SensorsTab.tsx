"use client";
import React, { useEffect, useState } from 'react';

export default function SensorsTab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/sensors')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-on-surface">Loading Sensor Network...</div>;

  return (
    <div className="flex-grow space-y-lg pb-12">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 className="font-headline-md text-headline-md-mobile text-on-surface">Sensor Network</h2>
          <p className="font-body-sm text-on-surface-variant">Live view of AI Traffic Cameras.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {data.sensors?.map((s: any, i: number) => (
          <div key={i} className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden flex flex-col">
            <div className="h-24 bg-surface-container-high relative overflow-hidden flex items-center justify-center border-b border-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-outline opacity-20">videocam</span>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-surface-container-lowest/80 px-2 py-0.5 rounded backdrop-blur-sm border border-outline-variant/50">
                <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Online' ? 'bg-[#4ade80] animate-pulse' : 'bg-error'}`}></span>
                <span className="font-label-md text-[10px] text-on-surface">{s.status === 'Online' ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </div>
            
            <div className="p-md space-y-md">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-body-md font-bold text-on-surface line-clamp-1">{s.junction_name}</h3>
                  <span className="font-code-sm text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">{s.id}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-xs">
                <div className="bg-surface-container-lowest rounded-lg p-xs border border-outline-variant/50">
                  <span className="font-label-md text-[10px] text-outline block mb-0.5">LATENCY</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">wifi</span>
                    <span className="font-body-sm text-on-surface">{s.ping}</span>
                  </div>
                </div>
                
                <div className="bg-surface-container-lowest rounded-lg p-xs border border-outline-variant/50 overflow-hidden">
                  <span className="font-label-md text-[10px] text-outline block mb-0.5">LAST TRIGGER</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-error">warning</span>
                    <span className="font-body-sm text-on-surface truncate" title={s.last_violation}>{s.last_violation.split(' - ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
