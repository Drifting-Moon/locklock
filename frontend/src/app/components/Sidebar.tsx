"use client";

import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDispatchPanelOpen: boolean;
  setIsDispatchPanelOpen: (open: boolean) => void;
  onExportReport: () => void;
  onPrintBriefing: () => void;
  setShowSupportModal: (show: boolean) => void;
  setShowLogoutConfirm: (show: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isDispatchPanelOpen,
  setIsDispatchPanelOpen,
  onExportReport,
  onPrintBriefing,
  setShowSupportModal,
  setShowLogoutConfirm
}: SidebarProps) {
  const tabs = [
    { id: "Command Center", icon: "dashboard", fill: true },
    { id: "Analytics", icon: "insert_chart", fill: false },
    { id: "Economics", icon: "account_balance", fill: false },
    { id: "Enforcement", icon: "gavel", fill: false },
    { id: "Detection", icon: "radar", fill: false }
  ];

  return (
    <nav className="bg-[#121626]/40 backdrop-blur-2xl h-screen w-[280px] shrink-0 border-r border-white/10 hidden md:flex flex-col py-md z-40 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="px-md pb-lg flex items-center gap-sm border-b border-outline-variant">
        <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Urban Intel</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">City Admin</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-md flex flex-col gap-xs px-sm">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-md px-md py-sm rounded transition-colors duration-200 w-full text-left cursor-pointer ${
              activeTab === tab.id 
                ? 'text-primary border-r-4 border-primary font-bold bg-surface-container-high/50' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined" style={tab.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
            <span className="font-body-md text-body-md">{tab.id}</span>
          </button>
        ))}
      </div>

      {/* CTA & Footer */}
      <div className="px-md pt-md border-t border-outline-variant flex flex-col gap-sm">
        <button 
          onClick={() => setIsDispatchPanelOpen(!isDispatchPanelOpen)}
          className={`w-full font-label-md text-label-md py-sm rounded transition-all cursor-pointer flex items-center justify-center gap-xs ${
            isDispatchPanelOpen 
              ? 'bg-[#f44336] text-white hover:brightness-110 shadow-lg shadow-[#f44336]/20' 
              : 'bg-primary text-on-primary hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">emergency_share</span>
          {isDispatchPanelOpen ? 'Close Dispatch' : 'Dispatch Plan'}
        </button>
        <button 
          onClick={onExportReport} 
          className="w-full bg-surface-container-high text-on-surface font-label-md text-label-md py-sm rounded hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
        <button 
          onClick={onPrintBriefing} 
          className="w-full bg-surface-container-high text-on-surface font-label-md text-label-md py-sm rounded hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print Briefing
        </button>
        <div className="flex flex-col gap-xs mt-sm">
          <button 
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-md px-sm py-xs rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="font-body-sm text-body-sm">Support</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
