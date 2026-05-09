"use client";

import Image from "next/image";
import { useState } from "react";

// Mock data for admin dashboard
const ADMIN_DATA = {
  metrics: {
    totalMRR: 428500,
    userGrowth: 2480,
    activeListings: 15602,
    platformUptime: 99.8,
  },
  pendingApprovals: [
    {
      id: 1,
      title: "Skyline Business Center",
      submittedBy: "Urban Genesis Group",
      timeAgo: "2 hours ago",
      location: "New York, NY",
      price: "$4,500/mo",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEsceWUctYjZflsGjrKdlHYqPLwtmACwolEeLblBvNLbrd7gv4v7rYCj2un8TyJjM2rHjAkSb8mC7qDh1APrdBtH5RpofdHiIrQcIEHix_OuZCyrmQC6-aAQQdgZ2L06QpLH4fCNdrgDF3qWQsV7bNnZfgH_jag-VacmFMwI1n8W4t-3odSn32n7cSIh_MPuYUskImXwblyZwAGtoWg5PKSeSryx9r2Z4kQ03oEzR0kVzBC5zGgrTqakJ3D4vEGJUSWtUfbqu784M",
    },
    {
      id: 2,
      title: "The Loft Collective",
      submittedBy: "Sarah Jenkins",
      timeAgo: "5 hours ago",
      location: "Austin, TX",
      price: "$2,200/mo",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmsLvPNmjeh6Tvaib67LXlQKY74H11kYx__RhXHe4GkfCtbA9bh90QfQ07TEeM97oFg5grITf5uSRtwh2c9apmEW-LcHoHELQETFjAo69lu8JZQz-ehU2Cb_yU7qyMz_sJaTcyHfTEH_u0n6gS6QErzcOeSwoCLs4V9kE-Ayq6gZiDDsaZb4MlxHyFvspy4TJhRJq2CPal4OFWh4qiAMr8EYdrObglazobeu1PwOFdzk0nkyxUYAgs8iTtrmUL4-viyKWKAfKSjZY",
    },
  ],
  alerts: [
    {
      id: 1,
      title: "Suspicious Price Drop",
      description: "Listing #8821 in Miami dropped by 75% suddenly. Potential scam or account breach.",
      timeAgo: "12m ago",
      type: "error",
    },
    {
      id: 2,
      title: "Flagged Message",
      description: "External payment link detected in chat between Agent ID: 902 and Tenant ID: 551.",
      timeAgo: "45m ago",
      type: "warning",
    },
    {
      id: 3,
      title: "Identity Check Fail",
      description: "KYC verification failed for User 'GlobalLease'. Document mismatch.",
      timeAgo: "1h ago",
      type: "warning",
    },
  ],
  systemEvents: [
    { id: 1, description: "Payout of $12,400 processed to Urban Genesis", time: "Today, 2:45 PM", type: "success" },
    { id: 2, description: "New Agent onboarded: Prime Realty", time: "Today, 11:20 AM", type: "primary" },
    { id: 3, description: "System Backup completed successfully", time: "Yesterday, 3:00 AM", type: "neutral" },
    { id: 4, description: "Policy Update: Terms of Service v2.4", time: "Aug 24, 2023", type: "primary" },
  ],
};

// Navigation items for sidebar
const sideNavItems = [
  { icon: "dashboard", label: "Dashboard", active: true, href: "#" },
  { icon: "domain", label: "Properties", active: false, href: "#" },
  { icon: "space_dashboard", label: "Spaces", active: false, href: "#" },
  { icon: "forum", label: "Messages", active: false, href: "#" },
  { icon: "leaderboard", label: "Analytics", active: false, href: "#" },
  { icon: "settings", label: "Settings", active: false, href: "#" },
];

const bottomNavItems = [
  { icon: "home", label: "Home", active: true },
  { icon: "search", label: "Search", active: false },
  { icon: "chat", label: "Chat", active: false },
  { icon: "person", label: "Profile", active: false },
];

const financialMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const financialHeights = [32, 40, 48, 36, 52, 60, 44, 56];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      {/* SideNavBar Component */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-gray-50 border-r border-gray-200 py-4 gap-2 z-50">
        <div className="px-6 mb-8">
          <div className="text-xl font-bold tracking-tight text-primary">PropRent</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mt-1">
            Enterprise Portal
          </div>
        </div>
        <nav className="flex-grow flex flex-col gap-1">
          {sideNavItems.map((item) => (
            <a
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all ${
                item.active
                  ? "bg-white text-primary shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              href={item.href}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-bold">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-200 pt-4 flex flex-col gap-1">
          <a
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-bold">Help Center</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-bold">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen w-[calc(100%-16rem)]">
        {/* TopAppBar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 flex justify-between items-center h-16 px-xxl w-full">
          <div className="flex items-center gap-md">
            <h1 className="font-headline-md text-primary">Platform Overview</h1>
            <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant px-md py-1.5 rounded-full">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-sm w-64"
                placeholder="Search accounts, listings..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
            <div className="flex items-center gap-sm pl-md border-l border-gray-200">
              <div className="text-right">
                <p className="font-label-bold leading-none">Super Admin</p>
                <p className="text-caption text-outline">System Access</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-xxl space-y-xl max-w-[1600px] mx-auto">
          {/* Platform Health Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <div className="bg-white p-lg rounded-xl border border-gray-200 hover:shadow-[0_4px_20px_rgba(30,58,138,0.08)] transition-all">
              <div className="flex items-center justify-between mb-md">
                <span className="p-2 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined">payments</span>
                </span>
                <span className="text-secondary font-label-bold text-caption flex items-center gap-1">
                  +12.5% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                </span>
              </div>
              <p className="text-caption text-outline uppercase tracking-wider">Total MRR</p>
              <h3 className="font-headline-md text-primary">
                ${ADMIN_DATA.metrics.totalMRR.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-lg rounded-xl border border-gray-200 hover:shadow-[0_4px_20px_rgba(30,58,138,0.08)] transition-all">
              <div className="flex items-center justify-between mb-md">
                <span className="p-2 bg-secondary/10 text-secondary rounded-lg">
                  <span className="material-symbols-outlined">group</span>
                </span>
                <span className="text-secondary font-label-bold text-caption flex items-center gap-1">
                  +8.2% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                </span>
              </div>
              <p className="text-caption text-outline uppercase tracking-wider">User Growth</p>
              <h3 className="font-headline-md text-primary">
                {ADMIN_DATA.metrics.userGrowth.toLocaleString()}{" "}
                <span className="text-body-sm font-normal text-outline">Agents/Tenants</span>
              </h3>
            </div>
            <div className="bg-white p-lg rounded-xl border border-gray-200 hover:shadow-[0_4px_20px_rgba(30,58,138,0.08)] transition-all">
              <div className="flex items-center justify-between mb-md">
                <span className="p-2 bg-tertiary-container/10 text-on-tertiary-container rounded-lg">
                  <span className="material-symbols-outlined">list_alt</span>
                </span>
                <span className="text-outline font-label-bold text-caption flex items-center gap-1">
                  0.0% <span className="material-symbols-outlined text-[14px]">remove</span>
                </span>
              </div>
              <p className="text-caption text-outline uppercase tracking-wider">Active Listings</p>
              <h3 className="font-headline-md text-primary">
                {ADMIN_DATA.metrics.activeListings.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-lg rounded-xl border border-gray-200 hover:shadow-[0_4px_20px_rgba(30,58,138,0.08)] transition-all">
              <div className="flex items-center justify-between mb-md">
                <span className="p-2 bg-error/10 text-error rounded-lg">
                  <span className="material-symbols-outlined">security</span>
                </span>
                <span className="text-error font-label-bold text-caption flex items-center gap-1">
                  +2 flagged <span className="material-symbols-outlined text-[14px]">warning</span>
                </span>
              </div>
              <p className="text-caption text-outline uppercase tracking-wider">Platform Integrity</p>
              <h3 className="font-headline-md text-primary">
                {ADMIN_DATA.metrics.platformUptime}%{" "}
                <span className="text-body-sm font-normal text-outline">Uptime</span>
              </h3>
            </div>
          </section>

          {/* Main Dashboard Layout: 2/3 and 1/3 split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            {/* Financial Trends Chart Area */}
            <div className="lg:col-span-2 space-y-xl">
              <section className="bg-white p-xl rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-xl">
                  <div>
                    <h2 className="font-headline-md text-primary">Financial Trends</h2>
                    <p className="text-body-sm text-outline">
                      Revenue performance over the last 12 months
                    </p>
                  </div>
                  <div className="flex items-center gap-sm bg-gray-50 p-md rounded-lg border border-gray-200">
                    <button className="px-md py-1 bg-white shadow-sm border border-gray-200 rounded text-caption font-label-bold text-primary">
                      Revenue
                    </button>
                    <button className="px-md py-1 text-caption font-label-bold text-outline hover:text-primary">
                      Net Profit
                    </button>
                  </div>
                </div>
                <div className="h-64 w-full relative flex items-end justify-between px-md border-b border-l border-gray-100">
                  <div className="w-full absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-[120px]">show_chart</span>
                  </div>
                  {financialMonths.map((month, idx) => {
                    const isPeak = month === "JUN";
                    return (
                      <div key={month} className="flex flex-col items-center gap-2 group">
                        <div
                          className={`w-12 rounded-t-sm transition-all group-hover:bg-primary ${
                            isPeak
                              ? "bg-primary h-60 shadow-lg"
                              : "bg-primary/20"
                          }`}
                          style={{ height: `${financialHeights[idx]}px` }}
                        ></div>
                        <span
                          className={`text-caption ${
                            isPeak ? "text-primary font-bold" : "text-outline"
                          }`}
                        >
                          {month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Space Approval Queue */}
              <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-xl border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-headline-md text-primary">Space Approval Queue</h2>
                    <p className="text-body-sm text-outline">
                      {ADMIN_DATA.pendingApprovals.length} pending review requests from agents
                    </p>
                  </div>
                  <button className="text-primary font-label-bold hover:underline flex items-center gap-1">
                    View all{" "}
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {ADMIN_DATA.pendingApprovals.map((item) => (
                    <div
                      key={item.id}
                      className="p-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-lg">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <Image
                            className="w-full h-full object-cover"
                            src={item.image}
                            alt={item.title}
                            width={64}
                            height={64}
                          />
                        </div>
                        <div>
                          <h4 className="font-label-bold text-body-md text-primary">{item.title}</h4>
                          <p className="text-body-sm text-outline">
                            Submitted by <span className="text-on-surface font-medium">{item.submittedBy}</span> • {item.timeAgo}
                          </p>
                          <div className="flex flex-wrap gap-md mt-1">
                            <span className="text-caption text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                location_on
                              </span>{" "}
                              {item.location}
                            </span>
                            <span className="text-caption text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                payments
                              </span>{" "}
                              {item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-md">
                        <button className="px-lg py-2 border border-gray-200 text-on-surface-variant font-label-bold rounded-lg hover:bg-gray-100 transition-colors">
                          Reject
                        </button>
                        <button className="px-lg py-2 bg-secondary text-white font-label-bold rounded-lg hover:bg-secondary/90 transition-colors">
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Side Panels: Moderation and Activity */}
            <div className="space-y-xl">
              {/* Safety Monitoring */}
              <section className="bg-white rounded-xl border border-gray-200 flex flex-col h-fit">
                <div className="p-lg border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-label-bold text-body-lg text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-error">shield</span>
                    Moderation Feed
                  </h2>
                  <span className="px-2 py-0.5 bg-error/10 text-error rounded text-caption font-bold">
                    {ADMIN_DATA.alerts.length} ALERTS
                  </span>
                </div>
                <div className="p-lg space-y-md">
                  {ADMIN_DATA.alerts.map((alert) => {
                    const colorMap = {
                      success: "bg-secondary",
                      primary: "bg-primary",
                      neutral: "bg-outline",
                    };
                    const dotColor = colorMap[alert.type as keyof typeof colorMap] || "bg-primary";
                    return (
                      <div
                        key={alert.id}
                        className={`p-md rounded-lg border-l-4 ${
                          alert.type === "error"
                            ? "bg-error-container/20 border-error"
                            : "bg-surface-container border-primary"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-label-bold text-body-sm text-on-error-container">
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-outline">{alert.timeAgo}</span>
                        </div>
                        <p className="text-caption text-on-surface-variant mb-md">
                          {alert.description}
                        </p>
                        <div className="flex gap-sm">
                          <button className="text-caption font-bold hover:underline">
                            {alert.type === "error" ? "Investigate" : "Review"}
                          </button>
                          <button className="text-caption font-bold text-outline hover:underline">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Recent Activity Log */}
              <section className="bg-white rounded-xl border border-gray-200 flex flex-col h-fit">
                <div className="p-lg border-b border-gray-100">
                  <h2 className="font-label-bold text-body-lg text-primary">System Events</h2>
                </div>
                <div className="p-lg relative">
                  <div className="absolute left-[31px] top-[30px] bottom-[30px] w-px bg-gray-100"></div>
                  <div className="space-y-lg">
                    {ADMIN_DATA.systemEvents.map((event) => {
                      const colorMap = {
                        success: "bg-secondary",
                        primary: "bg-primary",
                        neutral: "bg-outline",
                      };
                      const dotColor = colorMap[event.type as keyof typeof colorMap] || "bg-primary";
                      return (
                        <div
                          key={event.id}
                          className="relative flex items-start gap-md"
                        >
                          <div
                            className={`w-4 h-4 rounded-full ring-4 ring-white z-10 mt-1.5 shrink-0 ${dotColor}`}
                          ></div>
                          <div>
                            <p className="text-body-sm text-on-surface">{event.description}</p>
                            <p className="text-caption text-outline">{event.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-lg right-lg z-50">
          <button className="bg-primary text-white p-lg rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-md">
            <span className="material-symbols-outlined">add</span>
            <span className="font-label-bold hidden md:inline">New Platform Action</span>
          </button>
        </div>
      </main>

      {/* BottomNavBar for Mobile Viewports */}
      <nav className="md:hidden flex justify-around items-center h-20 px-4 bg-white/95 backdrop-blur-lg fixed bottom-0 w-full z-50 rounded-t-2xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(30,58,138,0.08)]">
        {bottomNavItems.map((item) => (
          <a
            key={item.label}
            className={`flex flex-col items-center justify-center ${
              item.active ? "text-primary scale-110" : "text-gray-400"
            }`}
            href="#"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
