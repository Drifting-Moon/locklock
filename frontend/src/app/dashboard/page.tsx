"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapRef } from 'react-map-gl/maplibre';

// Child components
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modals from '../components/Modals';
import CommandCenterTab from '../components/CommandCenterTab';
import PhysicsInspector from '../components/PhysicsInspector';
import AnalyticsTab from '../components/AnalyticsTab';
import EnforcementTab from '../components/EnforcementTab';
import DetectionTab from '../components/DetectionTab';
import EconomicCalculator from '../components/EconomicCalculator';

// Libs
import { apiUrl } from '../lib/api';

type MapTheme = 'dark' | 'light' | 'satellite';
type Timeframe = 'Recent Dataset Window' | 'Most Recent Day' | 'Most Recent Week';

export default function TrafficDashboard() {
  // Navigation & Dropdown State
  const [activeTab, setActiveTab] = useState("Command Center");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDispatchPanelOpen, setIsDispatchPanelOpen] = useState(false);

  // Filter State
  const [timeframe, setTimeframe] = useState<Timeframe>("Recent Dataset Window");
  const [district, setDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Map Theme & Prediction Mode
  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');
  const [isPredictiveMode, setIsPredictiveMode] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(9);

  // Data State
  const [loading, setLoading] = useState(false);
  const [hotspots, setHotspots] = useState<any | null>(null);
  const [blindspots, setBlindspots] = useState<any[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [stats, setStats] = useState({ totalViolations: 0, avgSpeed: 0, busBlocks: 0, loadingZones: 0 });

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Severe Congestion in CBD', time: '2 mins ago', read: false },
  ]);

  // Support Help & Login Modals State
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportForm, setSupportForm] = useState({ category: 'Technical Issue', message: '' });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  
  // Login Details State
  const [loginEmail, setLoginEmail] = useState('admin@gridlock.app');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Map reference
  const mapRef = useRef<MapRef>(null);

  // 1. Fetch available districts on startup
  useEffect(() => {
    fetch(apiUrl("/api/districts"))
      .then(res => res.json())
      .then(data => {
        if (data.districts) setAvailableDistricts(data.districts);
      })
      .catch(err => console.error("Error fetching districts:", err));
  }, []);

  // 2. Fetch active cluster polygons and calculate stats when timeframe, district, or selectedHour changes
  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/v1/clusters/active?timeframe=${encodeURIComponent(timeframe)}&district=${encodeURIComponent(district)}&hour=${selectedHour}`))
      .then(res => res.json())
      .then(data => {
        setHotspots(data);
        
        let total = 0;
        let busBlocks = 0;
        let mainRoadBlocks = 0;
        
        if (data && data.features) {
          data.features.forEach((f: any) => {
            total += f.properties.violationCount;
            if (f.properties.highwayType && f.properties.highwayType.toLowerCase().includes('primary')) {
              mainRoadBlocks += f.properties.violationCount;
            }
            if (f.properties.locationName && f.properties.locationName.toLowerCase().includes('bus')) {
              busBlocks += f.properties.violationCount;
            }
          });
        }

        setStats({
          totalViolations: total,
          avgSpeed: 14.2,
          busBlocks: busBlocks || Math.floor(total * 0.12),
          loadingZones: mainRoadBlocks || Math.floor(total * 0.18)
        });
      })
      .catch(err => console.error("Error fetching active clusters:", err))
      .finally(() => setLoading(false));
  }, [timeframe, district, selectedHour]);

  // 3. Fetch patrol bias blindspots when timeframe changes
  useEffect(() => {
    fetch(apiUrl(`/api/v1/intel/blindspots?timeframe=${encodeURIComponent(timeframe)}`))
      .then(res => res.json())
      .then(data => {
        if (data.blindspots) {
          setBlindspots(data.blindspots);
        }
      })
      .catch(err => console.error("Error fetching blindspots:", err));
  }, [timeframe]);

  // 4. Fetch predictive forecasts on demand (maintained for predictability compatibility)
  useEffect(() => {
    if (isPredictiveMode && !forecastData) {
      fetch(apiUrl('/api/forecast'))
        .then(res => res.json())
        .then(data => {
          if (data.forecasts) {
            setForecastData({
              type: "FeatureCollection",
              features: data.forecasts.map((f: any) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [f.longitude, f.latitude] },
                properties: { name: f.name, risk: f.risk, color: f.color, trigger: f.trigger }
              }))
            });
          }
        })
        .catch(err => console.error("Error fetching forecast:", err));
    }
  }, [isPredictiveMode, forecastData]);

  // Global Search Handler (searches and selects district)
  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearchQuery.trim() !== '') {
      const matchedDistrict = availableDistricts.find(d => 
        d.toLowerCase().includes(globalSearchQuery.toLowerCase().trim())
      );
      
      if (matchedDistrict) {
        setDistrict(matchedDistrict);
      } else {
        setDistrict(globalSearchQuery.trim());
      }
      setActiveTab("Command Center");
      setActiveDropdown(null);
    }
  };

  // CSV Report Exporter
  const handleExportReport = () => {
    if (!hotspots || !hotspots.features || hotspots.features.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["ID", "Location Name", "Police Division", "OSM Class", "OSM Lanes", "BPR delay (mins)", "Violations count"];
    const rows = hotspots.features.map((f: any) => 
      `${f.properties.id},"${f.properties.locationName}","${f.properties.policeStation}","${f.properties.highwayType}",${f.properties.laneCount},${f.properties.bprDelay},${f.properties.violationCount}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gridlock_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div 
      className="text-on-surface font-body-md overflow-hidden h-screen w-full relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-hero.png")' }}
    >
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-[#060a16]/70 z-0 pointer-events-none"></div>
      
      {/* Main Dashboard Flex Layout Wrapper */}
      <div className="flex h-full w-full relative z-10">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDispatchPanelOpen={isDispatchPanelOpen}
          setIsDispatchPanelOpen={setIsDispatchPanelOpen}
          onExportReport={handleExportReport}
          setShowSupportModal={setShowSupportModal}
          setShowLogoutConfirm={setShowLogoutConfirm}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* Top Bar Header */}
          <Header 
            globalSearchQuery={globalSearchQuery}
            setGlobalSearchQuery={setGlobalSearchQuery}
            onGlobalSearch={handleGlobalSearch}
            notifications={notifications}
            setNotifications={setNotifications}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            setShowLogoutConfirm={setShowLogoutConfirm}
          />

          {/* Tab Content Canvas */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent flex flex-col relative z-10">
            {activeTab === "Command Center" && (
              <CommandCenterTab 
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                district={district}
                setDistrict={setDistrict}
                availableDistricts={availableDistricts}
                stats={stats}
                hotspots={hotspots}
                blindspots={blindspots}
                loading={loading}
                mapRef={mapRef}
                mapTheme={mapTheme}
                setMapTheme={setMapTheme}
                isPredictiveMode={isPredictiveMode}
                setIsPredictiveMode={setIsPredictiveMode}
                forecastData={forecastData}
                isDispatchPanelOpen={isDispatchPanelOpen}
                setIsDispatchPanelOpen={setIsDispatchPanelOpen}
                onSelectHotspot={setSelectedHotspot}
                selectedHour={selectedHour}
                setSelectedHour={setSelectedHour}
              />
            )}

            {activeTab === "Analytics" && <AnalyticsTab />}
            {activeTab === "Economics" && <EconomicCalculator />}
            {activeTab === "Enforcement" && <EnforcementTab />}
            {activeTab === "Detection" && <DetectionTab />}
          </main>
        </div>
      </div>

      {/* Global Modals overlay */}
      <Modals 
        showSupportModal={showSupportModal}
        setShowSupportModal={setShowSupportModal}
        supportSuccess={supportSuccess}
        setSupportSuccess={setSupportSuccess}
        supportForm={supportForm}
        setSupportForm={setSupportForm}
        isSubmittingSupport={isSubmittingSupport}
        setIsSubmittingSupport={setIsSubmittingSupport}
        faqOpenIndex={faqOpenIndex}
        setFaqOpenIndex={setFaqOpenIndex}
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Slide-out right panel Physics Inspector */}
      <PhysicsInspector 
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
      />
    </div>
  );
}
