"use client";

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertCircle, Navigation, Clock, Activity, ShieldAlert, X } from 'lucide-react';
import AnalyticsTab from './components/AnalyticsTab';
import EnforcementTab from './components/EnforcementTab';
import DetectionTab from './components/DetectionTab';
import EconomicCalculator from './components/EconomicCalculator';
import DispatchPanel from './components/DispatchPanel';

export default function TrafficDashboard() {
  const [hotspots, setHotspots] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [timeframe, setTimeframe] = useState("Live Data");
  const [district, setDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [stats, setStats] = useState({ totalViolations: 0, avgSpeed: 0, busBlocks: 0, loadingZones: 0 });
  const [activeTab, setActiveTab] = useState("Command Center");
  const [mapTheme, setMapTheme] = useState('dark');
  const [isPredictiveMode, setIsPredictiveMode] = useState(false);
  const [isDispatchPanelOpen, setIsDispatchPanelOpen] = useState(false);
  const [forecastData, setForecastData] = useState<any>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Severe Congestion in CBD', time: '2 mins ago', read: false },
  ]);
  const mapRef = useRef<MapRef>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [supportForm, setSupportForm] = useState({ category: 'Technical Issue', message: '' });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@gridlock.app');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const getMapStyleUrl = (theme: string) => {
    if (theme === 'dark') return "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    if (theme === 'light') return "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
    if (theme === 'satellite') return {
      "version": 8,
      "sources": {
        "esri": {
          "type": "raster",
          "tiles": ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          "tileSize": 256
        }
      },
      "layers": [{
        "id": "satellite",
        "type": "raster",
        "source": "esri",
        "minzoom": 0,
        "maxzoom": 22
      }]
    };
    return "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  };

  const tabs = [
    { id: "Command Center", icon: "dashboard", fill: true },
    { id: "Analytics", icon: "insert_chart", fill: false },
    { id: "Economics", icon: "account_balance", fill: false },
    { id: "Enforcement", icon: "gavel", fill: false },
    { id: "Detection", icon: "radar", fill: false }
  ];

  useEffect(() => {
    fetch("http://localhost:8000/api/districts")
      .then(res => res.json())
      .then(data => {
        if (data.districts) setAvailableDistricts(data.districts);
      })
      .catch(err => console.error("Error fetching districts:", err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/hotspots?timeframe=${encodeURIComponent(timeframe)}&district=${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(data => {
        const hotspotArray = data.hotspots || [];
        const maxWeight = Math.max(...hotspotArray.map((h: any) => h.weight), 1);
        
        const geojsonData = {
          type: "FeatureCollection",
          features: hotspotArray.map((h: any) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [h.longitude, h.latitude] },
            properties: {
              locationName: h.location,
              violationCount: h.weight,
              severityScore: (h.weight / maxWeight) * 10
            }
          }))
        };
        
        setHotspots(geojsonData);
        
        let total = 0;
        let busBlocks = 0;
        let loadingZones = 0;
        
        hotspotArray.forEach((h: any) => {
          total += h.weight;
        });
        
        if (data.stats) {
          setStats({
            totalViolations: data.stats.totalViolations,
            avgSpeed: 14.2,
            busBlocks: data.stats.busBlocks,
            loadingZones: data.stats.mainRoadBlocks
          });
        } else {
          busBlocks = Math.floor(total * 0.12);
          loadingZones = Math.floor(total * 0.18);
          
          setStats({
            totalViolations: total,
            avgSpeed: 14.2,
            busBlocks,
            loadingZones
          });
        }
      })
      .catch(err => console.error("Error fetching hotspots:", err))
      .finally(() => setLoading(false));
  }, [timeframe, district]);

  useEffect(() => {
    if (isPredictiveMode && !forecastData) {
      fetch('http://localhost:8000/api/forecast')
        .then(res => res.json())
        .then(data => {
          const forecasts = data.forecasts || [];
          const geojsonData = {
            type: "FeatureCollection",
            features: forecasts.map((f: any) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [f.longitude, f.latitude] },
              properties: { name: f.name, risk: f.risk, color: f.color, trigger: f.trigger }
            }))
          };
          setForecastData(geojsonData);
        })
        .catch(err => console.error("Error fetching forecast:", err));
    }
  }, [isPredictiveMode, forecastData]);

  const handleExportReport = () => {
    if (!hotspots || !hotspots.features || hotspots.features.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Latitude", "Longitude", "Violation Count", "Severity Score", "Location Name"];
    const rows = hotspots.features.map((f: any) => 
      `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]},${f.properties.violationCount},${f.properties.severityScore.toFixed(2)},"${f.properties.locationName}"`
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

  const heatmapLayer = {
    id: 'parking-heatmap',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'severityScore'], 0, 0, 10, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 0, 0)',
        0.2, '#3e52ff',
        0.4, '#14d1ff',
        0.6, '#bdc2ff',
        0.8, '#ffb4ab',
        1, '#93000a'
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
      'heatmap-opacity': 0.8
    }
  };

  const pointLayer = {
    id: 'parking-point',
    type: 'circle',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 8],
      'circle-color': '#ffb4ab',
      'circle-stroke-color': '#93000a',
      'circle-stroke-width': 1,
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0, 15, 1]
    }
  };

  const predictiveLayer = {
    id: 'predictive-zones',
    type: 'circle',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 30, 15, 120],
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.25,
      'circle-stroke-width': 2,
      'circle-stroke-color': ['get', 'color']
    }
  };

  const predictiveLabels = {
    id: 'predictive-labels',
    type: 'symbol',
    layout: {
      'text-field': ['concat', ['get', 'name'], '\n', ['get', 'risk']],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      'text-radial-offset': 1.5,
      'text-justify': 'center',
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2
    }
  };

  if (!isLoggedIn) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("/bg-hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          fontFamily: 'var(--font-body-md)',
          color: '#dae2fd'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(6, 10, 22, 0.8)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        ></div>
        
        <div 
          style={{
            backgroundColor: 'rgba(18, 22, 38, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#3e52ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(62, 82, 255, 0.2)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#e9e9ff' }}>domain</span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#bdc2ff', letterSpacing: '-0.5px' }}>Urban Intel</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#c5c5d9', fontFamily: '"Geist", monospace' }}>Traffic & City Command Center</p>
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setIsLoggingIn(true);
              setTimeout(() => {
                setIsLoggingIn(false);
                setIsLoggedIn(true);
              }, 1500);
            }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#dae2fd',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#dae2fd',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn}
              style={{
                width: '100%',
                backgroundColor: '#bdc2ff',
                color: '#00149e',
                fontWeight: 'bold',
                padding: '10px',
                borderRadius: '8px',
                marginTop: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: '"Geist", monospace'
              }}
            >
              {isLoggingIn ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '11px', color: 'rgba(197, 197, 217, 0.7)' }}>
            For assistance, contact <span style={{ color: '#bdc2ff', textDecoration: 'underline', cursor: 'pointer' }}>support@gridlock.app</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="text-on-surface font-body-md overflow-hidden h-screen w-full relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-hero.png")' }}
    >
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-[#060a16]/70 z-0 pointer-events-none"></div>
      
      {/* Main Dashboard Flex Layout Wrapper */}
      <div className="flex h-full w-full relative z-10">
        {/* SideNavBar */}
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
              className={`flex items-center gap-md px-md py-sm rounded transition-colors duration-200 w-full text-left ${
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
            className={`w-full font-label-md text-label-md py-sm rounded transition-all flex items-center justify-center gap-xs ${
              isDispatchPanelOpen 
                ? 'bg-[#f44336] text-white hover:brightness-110 shadow-lg shadow-[#f44336]/20' 
                : 'bg-primary text-on-primary hover:brightness-110'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">emergency_share</span>
            {isDispatchPanelOpen ? 'Close Dispatch' : 'Dispatch AI'}
          </button>
          <button onClick={handleExportReport} className="w-full bg-surface-container-high text-on-surface font-label-md text-label-md py-sm rounded hover:brightness-110 transition-all flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <div className="flex flex-col gap-xs mt-sm">
            <button 
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-md px-sm py-xs rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 w-full text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="font-body-sm text-body-sm">Support</span>
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-md px-sm py-xs rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 w-full text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-body-sm text-body-sm">Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TopNavBar */}
        <header className="bg-[#121626]/60 backdrop-blur-md top-0 sticky z-30 border-b border-white/5 flex justify-between items-center h-16 px-4 md:px-6 lg:px-8 shrink-0 gap-4">
          <div className="flex items-center gap-md shrink-0">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface hidden lg:block truncate">Urban Intelligence Platform</h2>
            <button className="lg:hidden text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-4 lg:gap-lg flex-1 justify-end min-w-0">
            <div className="relative hidden md:block max-w-md w-full min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
              <input 
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                placeholder="Search analytics, districts..." 
                type="text"
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-sm shrink-0 relative" ref={dropdownRef}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'search' ? null : 'search')} className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200 relative">
                <span className="material-symbols-outlined">search</span>
              </button>
              {activeDropdown === 'search' && (
                <div className="absolute top-12 right-0 mt-2 w-64 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg p-2 z-50 md:hidden">
                  <input autoFocus className="w-full bg-surface-container-low border border-outline-variant rounded py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="Search..." type="text" />
                </div>
              )}

              <button onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200 relative">
                <span className="material-symbols-outlined">notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                )}
              </button>
              {activeDropdown === 'notifications' && (
                <div className="absolute top-12 right-0 mt-2 w-80 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-outline-variant bg-surface-container-highest">
                    <h4 className="font-label-md font-bold text-on-surface">Notifications</h4>
                  </div>
                  <div className="p-2 space-y-1">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-surface-container-low ${ n.read ? 'bg-surface-container opacity-60' : 'bg-surface-container-lowest' }`}>
                        <p className={`font-label-md ${n.read ? 'text-on-surface-variant' : 'text-on-surface'}`}>{n.text}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="w-full p-2 border-t border-outline-variant text-center hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="text-xs font-label-md text-primary">Mark all as read</span>
                  </button>
                </div>
              )}

              <button onClick={() => setActiveDropdown(activeDropdown === 'settings' ? null : 'settings')} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200">
                <span className="material-symbols-outlined">settings_suggest</span>
              </button>
              {activeDropdown === 'settings' && (
                <div className="absolute top-12 right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                  <ul className="py-2 text-sm text-on-surface">
                    <li className="px-4 py-2 hover:bg-surface-container-low cursor-pointer">System Preferences</li>
                    <li className="px-4 py-2 hover:bg-surface-container-low cursor-pointer">API Integrations</li>
                    <li className="px-4 py-2 hover:bg-surface-container-low cursor-pointer">User Roles</li>
                  </ul>
                </div>
              )}

              <button onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute top-12 right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-sm font-label-md text-on-surface">Admin User</p>
                    <p className="text-xs text-on-surface-variant truncate">admin@gridlock.app</p>
                  </div>
                  <ul className="py-1 text-sm text-on-surface">
                    <li className="px-4 py-2 hover:bg-surface-container-low cursor-pointer">View Profile</li>
                    <li 
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setActiveDropdown(null);
                      }} 
                      className="px-4 py-2 hover:bg-surface-container-low cursor-pointer text-error"
                    >
                      Sign out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent flex flex-col relative z-10">
          
          {activeTab === "Command Center" && (
            <>
              {/* Page Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
              <div className="flex items-center gap-xs text-on-surface-variant font-label-md mb-xs">
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                <span>TRAFFIC FLOW</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-primary">IMPACT ANALYTICS</span>
              </div>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">Traffic Impact & Violations</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Real-time mapping of parking violations and average sector speed.</p>
            </div>
            
            <div className="flex gap-sm w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full md:w-auto appearance-none bg-surface-container border border-outline-variant rounded py-2 pl-3 pr-8 text-body-sm focus:outline-none focus:border-primary text-on-surface"
                >
                  <option value="Live Data">Live Data</option>
                  <option value="Last 24 Hours">Last 24 Hours</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'filters' ? null : 'filters')}
                  className={`bg-surface-container border hover:border-primary text-on-surface px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 h-[38px] ${activeDropdown === 'filters' ? 'border-primary' : 'border-outline-variant'}`}
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">filter_list</span>
                  <span className="font-label-md hidden sm:inline leading-none font-medium mt-[1px]">Filters {district && '(1)'}</span>
                </button>

                {activeDropdown === 'filters' && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#1e2025]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 p-2 text-body-sm max-h-[320px] overflow-y-auto">
                    <div className="font-bold text-white/50 mb-2 px-2 text-[10px] uppercase tracking-wider">Police Station</div>
                    <button onClick={() => { setDistrict(""); setActiveDropdown(null); }} className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/5 transition-colors ${district === "" ? 'text-[#3e52ff] font-bold bg-[#3e52ff]/10' : 'text-white/80'}`}>All Districts</button>
                    {availableDistricts.map(dist => (
                      <button 
                        key={dist} 
                        onClick={() => { setDistrict(dist); setActiveDropdown(null); }} 
                        className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/5 transition-colors ${district === dist ? 'text-[#3e52ff] font-bold bg-[#3e52ff]/10' : 'text-white/80'}`}
                      >
                        {dist}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-auto min-h-0 flex-1">
            
            {/* Left Column: Map & Metrics (Spans 2 columns on XL) */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              
              {/* Top Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#1e2025]/80 backdrop-blur-md border border-white/5 border-t-[3px] border-t-[#f44336] rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
                  <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-widest uppercase mb-3">
                    <span className="material-symbols-outlined text-[14px]">report</span>
                    <span className="truncate">TOTAL VIOLATIONS</span>
                  </div>
                  <div className="font-display-lg text-3xl font-black text-white tracking-tight mb-2">{stats.totalViolations.toLocaleString()}</div>
                  <div className="flex items-center gap-1.5 text-[#f44336] font-bold text-[10px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px] animate-pulse">trending_up</span>
                    <span>Live Tracking</span>
                  </div>
                </div>

                <div className="bg-[#1e2025]/80 backdrop-blur-md border border-white/5 border-t-[3px] border-t-[#3e52ff] rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
                  <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-widest uppercase mb-3">
                    <span className="material-symbols-outlined text-[14px]">speed</span>
                    <span className="truncate">AVG SPEED (CBD)</span>
                  </div>
                  <div className="font-display-lg text-3xl font-black text-white tracking-tight mb-2">{stats.avgSpeed} <span className="text-white/40 text-base font-semibold">mph</span></div>
                  <div className="flex items-center gap-1.5 text-[#f44336] font-bold text-[10px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">trending_down</span>
                    <span>-2.4 mph avg</span>
                  </div>
                </div>

                <div className="bg-[#1e2025]/80 backdrop-blur-md border border-white/5 border-t-[3px] border-t-amber-500 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
                  <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-widest uppercase mb-3">
                    <span className="material-symbols-outlined text-[14px]">bus_alert</span>
                    <span className="truncate">BUS LANE BLOCKS</span>
                  </div>
                  <div className="font-display-lg text-3xl font-black text-white tracking-tight mb-3">{stats.busBlocks.toLocaleString()}</div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="bg-[#1e2025]/80 backdrop-blur-md border border-white/5 border-t-[3px] border-t-emerald-500 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
                  <div className="flex items-center gap-2 text-white/50 font-bold text-[10px] tracking-widest uppercase mb-3">
                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span className="truncate">MAIN ROAD BLOCKS</span>
                  </div>
                  <div className="font-display-lg text-3xl font-black text-white tracking-tight mb-3">{stats.loadingZones.toLocaleString()}</div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              {/* Map Area */}
              <div className="bg-surface-container-low border border-outline-variant rounded-lg flex-1 flex flex-col relative overflow-hidden min-h-[600px]">
                <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant shrink-0 bg-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">map</span>
                    <h3 className="font-headline-md text-lg font-bold">Live Traffic Heatmap</h3>
                  </div>
                  <div className="flex items-center gap-2 font-label-md text-xs text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    <span>LIVE STREAM</span>
                  </div>
                </div>
                
                <div className="flex-1 relative w-full h-full">
                  <Map
                    ref={mapRef}
                    initialViewState={{
                      longitude: 77.5946,
                      latitude: 12.9716,
                      zoom: 11
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle={getMapStyleUrl(mapTheme) as any}
                  >
                    {hotspots && (
                      <Source type="geojson" data={hotspots}>
                        <Layer {...(heatmapLayer as any)} />
                        <Layer {...(pointLayer as any)} />
                      </Source>
                    )}
                    {isPredictiveMode && forecastData && (
                      <Source type="geojson" data={forecastData as any}>
                        <Layer {...(predictiveLayer as any)} />
                        <Layer {...(predictiveLabels as any)} />
                      </Source>
                    )}
                  </Map>
                  
                  {/* Dispatch Panel Overlay */}
                  <DispatchPanel 
                    isOpen={isDispatchPanelOpen} 
                    onClose={() => setIsDispatchPanelOpen(false)} 
                    district={district}
                  />

                  {/* Map Style Switcher Overlay */}
                  <div className="absolute top-4 left-4 bg-[#1e2025]/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-xl z-10 flex items-center gap-4">
                    <div className="flex items-center gap-1 pl-2 pr-2 hidden sm:flex">
                      <div className="flex bg-black/40 rounded-xl p-1">
                        <button 
                          onClick={() => setIsPredictiveMode(false)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${!isPredictiveMode ? 'bg-error/20 text-error border border-error/30 shadow-md' : 'text-white/60 hover:text-white border border-transparent'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${!isPredictiveMode ? 'bg-error animate-pulse' : 'bg-transparent'}`}></div>
                          LIVE
                        </button>
                        <button 
                          onClick={() => setIsPredictiveMode(true)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${isPredictiveMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md' : 'text-white/60 hover:text-white border border-transparent'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isPredictiveMode ? 'bg-amber-400 animate-pulse' : 'bg-transparent'}`}></div>
                          FORECAST
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-[1px] h-6 bg-white/10 hidden sm:block"></div>
                    
                    <div className="flex bg-black/40 rounded-xl p-1">
                      <button 
                        onClick={() => setMapTheme('dark')}
                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapTheme === 'dark' ? 'bg-[#3e52ff] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                      >
                        DARK
                      </button>
                      <button 
                        onClick={() => setMapTheme('light')}
                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapTheme === 'light' ? 'bg-[#3e52ff] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                      >
                        LIGHT
                      </button>
                      <button 
                        onClick={() => setMapTheme('satellite')}
                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapTheme === 'satellite' ? 'bg-[#3e52ff] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                      >
                        SATELLITE
                      </button>
                    </div>
                  </div>
                  
                  {/* Recenter Button */}
                  <button 
                    onClick={() => mapRef.current?.flyTo({ center: [77.5946, 12.9716], zoom: 11, duration: 1500 })}
                    className="absolute top-4 right-4 bg-surface-container-high/95 backdrop-blur-md border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary p-2 rounded-xl shadow-lg transition-all flex items-center justify-center group z-10"
                    title="Recenter Map"
                  >
                    <span className="material-symbols-outlined text-[20px] group-active:scale-90 transition-transform">my_location</span>
                  </button>
                  
                  {/* Map Legend Overlay */}
                  <div className="absolute bottom-6 left-4 md:bottom-8 md:left-6 bg-surface-container-high/95 backdrop-blur-md border border-outline-variant rounded-xl p-3 shadow-xl z-10 pointer-events-none">
                    <h4 className="font-label-md font-bold text-on-surface mb-3 text-[10px] uppercase tracking-wider text-on-surface-variant">Map Legend</h4>
                    
                    <div className="flex flex-col gap-3 text-xs text-on-surface font-label-md">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-[1.5px] border-[#93000a] flex items-center justify-center relative">
                          <div className="w-1 h-1 rounded-full bg-[#93000a]"></div>
                        </div>
                        <span>Reported Violation</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="mb-0.5">Violation Density Area</span>
                        <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-transparent via-[#14d1ff] to-[#93000a] border border-outline-variant/30"></div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant px-0.5 mt-0.5">
                          <span>Sparse</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Sidebar: Active Hotspots */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-xl">warning</span>
                  <h3 className="font-headline-md text-lg font-bold">Active Hotspots</h3>
                </div>
                <span className="text-xs bg-surface-variant px-2 py-1 rounded text-on-surface-variant">{hotspots?.features?.length || 0} Zones</span>
              </div>
              
              <div className="p-3 border-b border-outline-variant shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">filter_alt</span>
                  <input 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    placeholder="Filter district..." 
                    type="text"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="p-4 text-center text-on-surface-variant text-sm flex flex-col items-center">
                    <span className="material-symbols-outlined animate-spin text-2xl mb-2">sync</span>
                    <p>Loading Hotspots...</p>
                  </div>
                ) : hotspots?.features && hotspots.features.length > 0 ? hotspots.features.map((feature: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => mapRef.current?.flyTo({ center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]], zoom: 15, duration: 1500 })}
                    className="p-3 hover:bg-surface-container rounded cursor-pointer border-b border-outline-variant/50 last:border-0 transition-colors group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{feature.properties.locationName}</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant ml-3.5 mb-1">Severity: <span className="text-on-surface">{feature.properties.severityScore.toFixed(1)}/10</span></p>
                      <p className="text-xs text-on-surface-variant ml-3.5">Violations: <span className="text-on-surface">{feature.properties.violationCount} active</span></p>
                    </div>
                    {feature.properties.severityScore >= 8 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error/20 text-error border border-error/30 mt-1 uppercase">Critical</span>
                    ) : feature.properties.severityScore >= 4 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary-container/20 text-secondary-container border border-secondary-container/30 mt-1 uppercase">High</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 mt-1 uppercase">Moderate</span>
                    )}
                  </div>
                )) : (
                  <div className="p-4 text-center text-on-surface-variant text-sm">
                    <p>No hotspots found matching criteria.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
            </>
          )}

          {activeTab === "Analytics" && <AnalyticsTab />}
          {activeTab === "Economics" && <EconomicCalculator />}
          {activeTab === "Enforcement" && <EnforcementTab />}
          {activeTab === "Detection" && <DetectionTab />}
        </main>
      </div>
    </div>

      {/* Support Help Center Modal */}
      {showSupportModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 10, 22, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#121626',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => {
                setShowSupportModal(false);
                setSupportSuccess(false);
                setSupportForm({ category: 'Technical Issue', message: '' });
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#c5c5d9',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: '#bdc2ff', fontSize: '24px' }}>help_center</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#dae2fd' }}>Support & Help Center</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#c5c5d9' }}>Resolve platform issues and submit tickets</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '8px' }}>
              {/* FAQ Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', uppercase: 'true', tracking: '0.05em' }}>Frequently Asked Questions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
                  {[
                    {
                      q: "How is congestion score calculated?",
                      a: "It is derived dynamically by calculating live traffic speeds relative to historical sector baselines, weighted with active parking violation counts."
                    },
                    {
                      q: "How can I export CSV reports?",
                      a: "Choose the timeframe and district in the Command Center tab filters, then click the 'Export Report' button at the bottom of the sidebar."
                    },
                    {
                      q: "How does the AI Dispatch routing work?",
                      a: "Our forecasting system monitors hotspot trend cycles to suggest where police units will have the maximum deterrent effect."
                    }
                  ].map((faq, idx) => (
                    <div key={idx} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <button 
                        onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#dae2fd',
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          justifyContent: 'between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ flex: 1 }}>{faq.q}</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', transform: faqOpenIndex === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                      </button>
                      {faqOpenIndex === idx && (
                        <div style={{ padding: '0 12px 10px 12px', fontSize: '11px', color: '#c5c5d9', lineHeight: '1.4', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Ticket Form Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '24px' }}>
                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', uppercase: 'true', tracking: '0.05em' }}>Submit a Support Ticket</h4>
                
                {supportSuccess ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px', backgroundColor: 'rgba(62, 82, 255, 0.1)', borderRadius: '12px', border: '1px solid rgba(62, 82, 255, 0.2)' }}>
                    <span className="material-symbols-outlined animate-bounce" style={{ fontSize: '36px', color: '#bdc2ff', marginBottom: '8px' }}>check_circle</span>
                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#dae2fd' }}>Ticket Submitted</h5>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#c5c5d9' }}>We will review your inquiry and get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSubmittingSupport(true);
                      setTimeout(() => {
                        setIsSubmittingSupport(false);
                        setSupportSuccess(true);
                      }, 1000);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>Category</label>
                      <select 
                        value={supportForm.category}
                        onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          border: '1px solid #444656',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: '#dae2fd',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      >
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Data Discrepancy">Data Discrepancy</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Account Settings">Account Settings</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>Description</label>
                      <textarea 
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        required
                        rows={4}
                        placeholder="Describe your issue..."
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          border: '1px solid #444656',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          color: '#dae2fd',
                          fontSize: '12px',
                          outline: 'none',
                          resize: 'none'
                        }}
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isSubmittingSupport}
                      style={{
                        width: '100%',
                        backgroundColor: '#bdc2ff',
                        color: '#00149e',
                        fontWeight: 'bold',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {isSubmittingSupport ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(6, 10, 22, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#121626',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 180, 171, 0.15)',
                color: '#ffb4ab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>logout</span>
            </div>
            
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#dae2fd' }}>Confirm Log Out</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#c5c5d9', lineHeight: '1.4' }}>Are you sure you want to end your current session? You will need to log back in to access the command center.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  width: '100%',
                  border: '1px solid #444656',
                  backgroundColor: 'transparent',
                  color: '#dae2fd',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setIsLoggedIn(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#ffb4ab',
                  color: '#690005',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 'none'
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
