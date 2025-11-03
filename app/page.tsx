"use client";

import  { useEffect, useState, useRef } from "react";
import {
  Hotel,
  UtensilsCrossed,
  ChefHat,
  FileCheck,
  DollarSign,
  ChevronDown,
  Calendar,
  Clock,
  Menu,
  X,
  TrendingUp,
  Users,
  Sparkles,
  Activity,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";

// Sidebar Component
function Sidebar({ 
  isOpen, 
  onClose, 
  sections, 
  expandedSection, 
  setExpandedSection,
  sectionsRef 
}: {
  isOpen: boolean;
  onClose: () => void;
  sections: any[];
  expandedSection: number | null;
  setExpandedSection: (index: number | null) => void;
  sectionsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <>
      {/* Left Sidebar with Enhanced Visibility */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-96 z-50 transform transition-all duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "2px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "10px 0 40px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <h2 className="text-sm tracking-widest text-white font-light">MODULES</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 hover:rotate-90 transition-all duration-300 rounded-lg group"
          >
            <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === index;

            return (
              <div key={index} className="border-b border-white/10">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-light text-white">
                      {section.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                <div
                  ref={(el) => {
                    sectionsRef.current[index] = el;
                  }}
                  className="overflow-hidden"
                  style={{ 
                    height: 0, 
                    opacity: 0,
                    background: "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  {section.options.map((option: any, optionIndex: number) => (
                    <button
                      key={optionIndex}
                      className="w-full text-left py-3 px-5 pl-14 hover:bg-white/10 hover:pl-16 transition-all duration-200 group relative overflow-hidden"
                      onClick={() => {
                        console.log(`Navigate to ${option.link}`);
                        onClose();
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-light text-gray-300 group-hover:text-white transition-colors">
                          {option.name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono group-hover:text-gray-300 transition-colors">
                          {option.shortcut}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay with blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-all duration-500"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default function ResortDashboard() {
  const [showLoading, setShowLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredUpdate, setHoveredUpdate] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const loadingRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Loading animation with GSAP
  useEffect(() => {
    if (!loadingRef.current || !logoRef.current || !textRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => setShowLoading(false), 500);
      }
    });

    tl.from(logoRef.current, {
      duration: 1,
      scale: 0.5,
      opacity: 0,
      ease: "back.out(1.7)",
    })
    .from(textRef.current, {
      duration: 0.8,
      y: 20,
      opacity: 0,
      ease: "power2.out",
    }, "-=0.3")
    .to(loadingRef.current, {
      duration: 0.8,
      opacity: 0,
      ease: "power2.inOut",
      delay: 1.5,
    });
  }, []);

  // Update time every second for more dynamic feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickStats = [
    { label: "Occupancy", value: "85%", change: "+5%", icon: Hotel, color: "from-blue-500 to-cyan-500" },
    { label: "Revenue Today", value: "₹45.2K", change: "+12%", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
    { label: "Active Guests", value: "34", change: "+3", icon: Users, color: "from-purple-500 to-pink-500" },
    { label: "Tasks Pending", value: "7", change: "-2", icon: Activity, color: "from-orange-500 to-red-500" },
  ];

  const todaysUpdates = [
    { time: "09:15 AM", event: "12 new guest check-ins processed", type: "booking", icon: Hotel },
    { time: "10:30 AM", event: "Kitchen inventory restocked - 15 items", type: "inventory", icon: ChefHat },
    { time: "11:45 AM", event: "Restaurant revenue: ₹45,200", type: "revenue", icon: DollarSign },
    { time: "02:20 PM", event: "3 vendor invoices approved", type: "vendor", icon: FileCheck },
    { time: "04:15 PM", event: "Room 204 & 305 maintenance completed", type: "maintenance", icon: Sparkles },
    { time: "05:30 PM", event: "Evening occupancy: 85% (34/40 rooms)", type: "occupancy", icon: TrendingUp },
  ];

  const dashboardSections = [
    {
      title: "Room Booking & Status",
      desc: "Manage all resort rooms, check occupancy, and book new guests.",
      icon: Hotel,
      options: [
        { name: "View All Rooms", link: "/rooms/view-all", shortcut: "⌘R" },
        { name: "New Booking", link: "/rooms/new-booking", shortcut: "⌘N" },
        { name: "Check-In / Check-Out", link: "/rooms/checkin-out", shortcut: "⌘C" },
        { name: "Room Status & Maintenance", link: "/rooms/status", shortcut: "⌘M" },
        { name: "Occupancy Reports", link: "/rooms/reports", shortcut: "⌘O" },
      ],
    },
    {
      title: "Restaurant Management",
      desc: "Handle table orders, create KOTs, and manage food billing types.",
      icon: UtensilsCrossed,
      options: [
        { name: "Table Management", link: "/restaurant/tables", shortcut: "⌘T" },
        { name: "Create KOT", link: "/restaurant/kot", shortcut: "⌘K" },
        { name: "Billing & Payments", link: "/restaurant/billing", shortcut: "⌘B" },
        { name: "Menu Management", link: "/restaurant/menu", shortcut: "⌘E" },
        { name: "Daily Sales Report", link: "/restaurant/reports", shortcut: "⌘S" },
      ],
    },
    {
      title: "Cook & Inventory",
      desc: "Track food usage, request supplies, and send waste reports.",
      icon: ChefHat,
      options: [
        { name: "Inventory Dashboard", link: "/cook/inventory", shortcut: "⌘I" },
        { name: "Stock Requests", link: "/cook/requests", shortcut: "⌘Q" },
        { name: "Waste Management", link: "/cook/waste", shortcut: "⌘W" },
        { name: "Recipe Management", link: "/cook/recipes", shortcut: "⌘P" },
        { name: "Supply Orders", link: "/cook/orders", shortcut: "⌘D" },
      ],
    },
    {
      title: "Vendor & Admin Panel",
      desc: "Approve bills, monitor purchases, and settle pending invoices.",
      icon: FileCheck,
      options: [
        { name: "Vendor Management", link: "/superadmin/vendors", shortcut: "⌘V" },
        { name: "Invoice Approval", link: "/superadmin/invoices", shortcut: "⌘A" },
        { name: "Purchase Orders", link: "/superadmin/purchases", shortcut: "⌘U" },
        { name: "Payment Settlement", link: "/superadmin/payments", shortcut: "⌘Y" },
        { name: "Vendor Reports", link: "/superadmin/reports", shortcut: "⌘L" },
      ],
    },
    {
      title: "Revenue & Finance",
      desc: "View real-time resort revenue, cash flow, and expense tracking.",
      icon: DollarSign,
      options: [
        { name: "Revenue Dashboard", link: "/finance/revenue", shortcut: "⌘F" },
        { name: "Expense Tracking", link: "/finance/expenses", shortcut: "⌘X" },
        { name: "Cash Flow Analysis", link: "/finance/cashflow", shortcut: "⌘H" },
        { name: "Financial Reports", link: "/finance/reports", shortcut: "⌘G" },
        { name: "Tax & Compliance", link: "/finance/tax", shortcut: "⌘Z" },
      ],
    },
  ];

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Loading Screen */}
      {showLoading && (
        <div 
          ref={loadingRef}
          className="fixed inset-0 bg-white z-[200] flex items-center justify-center"
        >
          <div className="text-center">
            <div ref={logoRef} className="mb-8">
              <Hotel className="w-24 h-24 mx-auto text-black" strokeWidth={1} />
            </div>
            <div ref={textRef}>
              <h1 className="text-4xl font-light text-black tracking-widest mb-2">
                RESORT SUITE
              </h1>
              <p className="text-sm text-gray-500 tracking-wider">
                Management System
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Button - Highest Priority - Only show when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => {
            console.log("Menu clicked");
            setSidebarOpen(true);
          }}
          className="sidebar-trigger fixed top-4 sm:top-8 left-4 sm:left-8 p-4 bg-black text-white hover:bg-red-600 hover:scale-110 transition-all duration-300 z-[100] shadow-2xl rounded-xl border-2 border-white"
        >
          <Menu className="w-6 h-6" strokeWidth={2} />
        </button>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Right Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => {
          console.log("Closing sidebar");
          setSidebarOpen(false);
        }}
        sections={dashboardSections}
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        sectionsRef={sectionsRef}
      />

      {/* Debug Info */}
      <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-[70]">
        Sidebar: {sidebarOpen ? "OPEN" : "CLOSED"}
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-8 lg:p-16 relative z-10">
        <div className="max-w-6xl mx-auto mb-12 ml-0 sm:ml-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black tracking-tight mb-2">
                Resort Management
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm tracking-wide flex items-center space-x-2">
                <span>OPERATIONS DASHBOARD</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600">LIVE</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="flex items-center justify-start sm:justify-end space-x-2 text-black mb-1 group cursor-pointer">
                <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <p className="text-xs sm:text-sm font-light tracking-wide">
                  {formatDate(currentTime)}
                </p>
              </div>
              <div className="flex items-center justify-start sm:justify-end space-x-2 text-gray-500">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <p className="text-xs tracking-widest font-mono">
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  ref={(el) => {
                    statsRef.current[index] = el;
                  }}
                  onClick={() => setSelectedMetric(selectedMetric === index ? null : index)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl relative overflow-hidden group ${
                    selectedMetric === index ? 'ring-2 ring-black' : ''
                  }`}
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-light text-black mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 tracking-wide uppercase">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-widest text-gray-400">
                TODAY'S ACTIVITY LOG
              </h2>
              <button className="text-xs text-black hover:underline flex items-center space-x-1 group">
                <span>View All</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="space-y-2">
              {todaysUpdates.map((update, index) => {
                const Icon = update.icon;
                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredUpdate(index)}
                    onMouseLeave={() => setHoveredUpdate(null)}
                    className={`flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4 p-4 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      hoveredUpdate === index ? 'shadow-lg scale-[1.02]' : ''
                    }`}
                    style={{
                      background: hoveredUpdate === index 
                        ? "rgba(255, 255, 255, 0.9)" 
                        : "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center space-x-3 relative z-10">
                      <div className="p-2 rounded-lg bg-white/80 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 text-black" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs text-gray-400 font-mono min-w-[70px]">
                        {update.time}
                      </span>
                    </div>
                    <p className="text-sm text-black font-light flex-1 relative z-10">
                      {update.event}
                    </p>
                    <span className="text-xs text-gray-300 uppercase tracking-wider self-start sm:self-auto px-3 py-1 rounded-full bg-white/50 relative z-10">
                      {update.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-24 text-center text-gray-400 text-xs tracking-widest">
          <p className="hover:text-black transition-colors cursor-default">
            © 2025 RESORTSUITE — MIDHUN SM
          </p>
        </div>
      </div>
    </div>
  );
} 