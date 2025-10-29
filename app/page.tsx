"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

export default function ResortDashboard() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Line art loading animation
  useEffect(() => {
    if (!showAnimation) return;

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowAnimation(false), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 35);

    return () => clearInterval(progressInterval);
  }, [showAnimation]);

  // GSAP animations for dashboard
  useEffect(() => {
    if (showAnimation || typeof window === "undefined") return;

    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default || gsapModule;

      gsap.from(".date-section", {
        duration: 0.8,
        y: -40,
        opacity: 0,
        ease: "power2.out",
      });

      gsap.from(".updates-section", {
        duration: 0.8,
        y: 40,
        opacity: 0,
        ease: "power2.out",
        delay: 0.2,
      });

      gsap.from(".sidebar-trigger", {
        duration: 0.8,
        x: -40,
        opacity: 0,
        ease: "power2.out",
        delay: 0.3,
      });
    });
  }, [showAnimation]);

  if (showAnimation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white overflow-hidden relative">
        <div className="relative z-10">
          <svg width="320" height="320" viewBox="0 0 400 400" className="mb-12">
            <path
              d="M100 300 L100 150 L200 100 L300 150 L300 300 Z"
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
              strokeDasharray="800"
              strokeDashoffset={800 - loadingProgress * 8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M80 150 L200 80 L320 150"
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
              strokeDasharray="500"
              strokeDashoffset={500 - loadingProgress * 5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <rect
              x="130"
              y="170"
              width="35"
              height="35"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="140"
              strokeDashoffset={140 - loadingProgress * 1.4}
            />
            <line
              x1="147.5"
              y1="170"
              x2="147.5"
              y2="205"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />
            <line
              x1="130"
              y1="187.5"
              x2="165"
              y2="187.5"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />

            <rect
              x="235"
              y="170"
              width="35"
              height="35"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="140"
              strokeDashoffset={140 - loadingProgress * 1.4}
            />
            <line
              x1="252.5"
              y1="170"
              x2="252.5"
              y2="205"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />
            <line
              x1="235"
              y1="187.5"
              x2="270"
              y2="187.5"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />

            <rect
              x="130"
              y="240"
              width="35"
              height="35"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="140"
              strokeDashoffset={140 - loadingProgress * 1.4}
            />
            <line
              x1="147.5"
              y1="240"
              x2="147.5"
              y2="275"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />
            <line
              x1="130"
              y1="257.5"
              x2="165"
              y2="257.5"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />

            <rect
              x="235"
              y="240"
              width="35"
              height="35"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="140"
              strokeDashoffset={140 - loadingProgress * 1.4}
            />
            <line
              x1="252.5"
              y1="240"
              x2="252.5"
              y2="275"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />
            <line
              x1="235"
              y1="257.5"
              x2="270"
              y2="257.5"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="35"
              strokeDashoffset={35 - loadingProgress * 0.35}
            />

            <path
              d="M185 300 L185 245 L215 245 L215 300"
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
              strokeDasharray="180"
              strokeDashoffset={180 - loadingProgress * 1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="210"
              cy="272"
              r="2"
              fill="#000000"
              opacity={loadingProgress > 50 ? 1 : 0}
            />
          </svg>

          <div className="text-center">
            <p className="text-sm font-light text-black tracking-widest mb-6">
              ACCESSING RESORT SYSTEM
            </p>

            <div className="w-64 h-px bg-gray-200 mx-auto relative">
              <div
                className="h-full bg-black transition-all duration-300 ease-out absolute left-0"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todaysUpdates = [
    {
      time: "09:15 AM",
      event: "12 new guest check-ins processed",
      type: "booking",
    },
    {
      time: "10:30 AM",
      event: "Kitchen inventory restocked - 15 items",
      type: "inventory",
    },
    { time: "11:45 AM", event: "Restaurant revenue: ₹45,200", type: "revenue" },
    { time: "02:20 PM", event: "3 vendor invoices approved", type: "vendor" },
    {
      time: "04:15 PM",
      event: "Room 204 & 305 maintenance completed",
      type: "maintenance",
    },
    {
      time: "05:30 PM",
      event: "Evening occupancy: 85% (34/40 rooms)",
      type: "occupancy",
    },
  ];

  interface DashboardSection {
    title: string;
    desc: string;
    icon: React.ComponentType<any>;
    link: string;
    options: Array<{
      name: string;
      link: string;
      shortcut: string;
    }>;
  }

  const dashboardSections: DashboardSection[] = [
    {
      title: "Room Booking & Status",
      desc: "Manage all resort rooms, check occupancy, and book new guests.",
      icon: Hotel,
      link: "/rooms",
      options: [
        { name: "View All Rooms", link: "/rooms/view-all", shortcut: "⌘R" },
        { name: "New Booking", link: "/rooms/new-booking", shortcut: "⌘N" },
        {
          name: "Check-In / Check-Out",
          link: "/rooms/checkin-out",
          shortcut: "⌘C",
        },
        {
          name: "Room Status & Maintenance",
          link: "/rooms/status",
          shortcut: "⌘M",
        },
        { name: "Occupancy Reports", link: "/rooms/reports", shortcut: "⌘O" },
      ],
    },
    {
      title: "Restaurant Management",
      desc: "Handle table orders, create KOTs, and manage food billing types.",
      icon: UtensilsCrossed,
      link: "/restaurant",
      options: [
        {
          name: "Table Management",
          link: "/restaurant/tables",
          shortcut: "⌘T",
        },
        { name: "Create KOT", link: "/restaurant/kot", shortcut: "⌘K" },
        {
          name: "Billing & Payments",
          link: "/restaurant/billing",
          shortcut: "⌘B",
        },
        { name: "Menu Management", link: "/restaurant/menu", shortcut: "⌘E" },
        {
          name: "Daily Sales Report",
          link: "/restaurant/reports",
          shortcut: "⌘S",
        },
      ],
    },
    {
      title: "Cook & Inventory",
      desc: "Track food usage, request supplies, and send waste reports.",
      icon: ChefHat,
      link: "/cook",
      options: [
        {
          name: "Inventory Dashboard",
          link: "/cook/inventory",
          shortcut: "⌘I",
        },
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
      link: "/superadmin",
      options: [
        {
          name: "Vendor Management",
          link: "/superadmin/vendors",
          shortcut: "⌘V",
        },
        {
          name: "Invoice Approval",
          link: "/superadmin/invoices",
          shortcut: "⌘A",
        },
        {
          name: "Purchase Orders",
          link: "/superadmin/purchases",
          shortcut: "⌘U",
        },
        {
          name: "Payment Settlement",
          link: "/superadmin/payments",
          shortcut: "⌘Y",
        },
        { name: "Vendor Reports", link: "/superadmin/reports", shortcut: "⌘L" },
      ],
    },
    {
      title: "Revenue & Finance",
      desc: "View real-time resort revenue, cash flow, and expense tracking.",
      icon: DollarSign,
      link: "/finance",
      options: [
        { name: "Revenue Dashboard", link: "/finance/revenue", shortcut: "⌘F" },
        { name: "Expense Tracking", link: "/finance/expenses", shortcut: "⌘X" },
        {
          name: "Cash Flow Analysis",
          link: "/finance/cashflow",
          shortcut: "⌘H",
        },
        { name: "Financial Reports", link: "/finance/reports", shortcut: "⌘G" },
        { name: "Tax & Compliance", link: "/finance/tax", shortcut: "⌘Z" },
      ],
    },
  ];

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm tracking-widest text-black">MODULES</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {dashboardSections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === index;

            return (
              <div key={index} className="border-b border-gray-100">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                    <span className="text-sm font-light text-black">
                      {section.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-black transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="bg-gray-50">
                    {section.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        className="w-full text-left py-3 px-4 pl-12 hover:bg-white transition-colors duration-200 group"
                        onClick={() => {
                          console.log(`Navigate to ${option.link}`);
                          setSidebarOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-light text-gray-700 group-hover:text-black">
                            {option.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {option.shortcut}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="p-8 md:p-16">
        {/* Menu Button - Fixed and Always Visible */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="sidebar-trigger fixed top-8 left-8 p-3 border border-gray-200 bg-white hover:bg-black hover:text-white hover:border-black transition-all duration-200 z-30"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Date and Time Section */}
        <div className="date-section max-w-6xl mx-auto mb-16 ml-20">
          <div className="flex items-center justify-between mb-2 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-black tracking-tight">
                Resort Management
              </h1>
              <p className="text-gray-500 text-sm tracking-wide mt-2">
                OPERATIONS DASHBOARD
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 text-black mb-1">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <p className="text-sm font-light tracking-wide">
                  {formatDate(currentTime)}
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2 text-gray-500">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <p className="text-xs tracking-widest">
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Updates */}
          <div className="updates-section mt-8">
            <h2 className="text-xs tracking-widest text-gray-400 mb-4">
              TODAY'S ACTIVITY LOG
            </h2>
            <div className="space-y-3">
              {todaysUpdates.map((update, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-200 px-2 -mx-2"
                >
                  <span className="text-xs text-gray-400 font-mono min-w-[70px] pt-0.5">
                    {update.time}
                  </span>
                  <p className="text-sm text-black font-light flex-1">
                    {update.event}
                  </p>
                  <span className="text-xs text-gray-300 uppercase tracking-wider">
                    {update.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 text-center text-gray-400 text-xs tracking-widest">
          <p>© 2025 RESORTSUITE — MIDHUN SM</p>
        </div>
      </div>
    </div>
  );
}