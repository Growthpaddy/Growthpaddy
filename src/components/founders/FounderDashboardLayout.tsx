import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PlaySquare, 
  Calendar, 
  ShieldCheck, 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { FounderProfile, logoutFounder } from '../../lib/founderAuth';
import { PageType } from '../../types';

interface FounderDashboardLayoutProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onSignOut: () => void;
  profile: FounderProfile;
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenEditProfile?: () => void;
  onOpenPublicProfile?: () => void;
}

export const FounderDashboardLayout: React.FC<FounderDashboardLayoutProps> = ({
  currentPage,
  onNavigate,
  onSignOut,
  profile,
  children,
  searchQuery = '',
  onSearchChange,
  onOpenEditProfile,
  onOpenPublicProfile
}) => {
  // Sidebar collapsed state stored in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dc_founder_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dc_founder_sidebar_collapsed', String(isCollapsed));
    } catch (_) {}
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  const navItems = [
    { id: 'founder-overview' as PageType, label: 'Overview', icon: LayoutDashboard },
    { id: 'founder-articles' as PageType, label: 'Articles', icon: FileText },
    { id: 'founder-podcasts' as PageType, label: 'Podcasts', icon: PlaySquare },
    { id: 'founder-planner' as PageType, label: 'Planner', icon: Calendar },
    { id: 'founder-distractions' as PageType, label: 'Distractions', icon: ShieldCheck },
    { id: 'founder-appointments' as PageType, label: 'Appointments', icon: CalendarClock }
  ];

  const handleSignOutClick = async () => {
    try {
      await logoutFounder();
      onSignOut();
    } catch (error) {
      console.error('Founder sign-out failed:', error);
    }
  };

  const displayName = profile.full_name || 'Founder';
  const displayTitle = profile.headline || (profile.business_name ? `Founder at ${profile.business_name}` : 'Founder');
  const avatarUrl = profile.avatar_url;

  // Determine subpage title for breadcrumbs
  const getSubpageLabel = () => {
    switch (currentPage) {
      case 'founder-articles': return 'Articles';
      case 'founder-podcasts': return 'Podcasts';
      case 'founder-planner': return 'Planner';
      case 'founder-distractions': return 'Distractions';
      case 'founder-appointments': return 'Appointments';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F3] flex text-slate-800 antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* FIXED COLLAPSIBLE LEFT SIDEBAR */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-[#031A14] text-white transition-all duration-300 ease-in-out border-r border-[#0A3025] ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Subtle decorative bottom glow matching approved aesthetic */}
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BRANDING & COLLAPSE HEADER */}
        <div className="p-4 border-b border-[#0A3025]/80">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div 
                onClick={() => onNavigate('founder-overview')}
                className="cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-slate-100 transition">
                    Digital
                  </span>
                  <span className="font-extrabold text-xl tracking-tight text-[#10B981]">
                    Campux
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  FOUNDER WORKSPACE
                </p>
              </div>
            ) : (
              <div 
                onClick={() => onNavigate('founder-overview')}
                className="mx-auto cursor-pointer select-none"
                title="Digital Campux"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-black text-white text-base shadow-sm">
                  DC
                </div>
              </div>
            )}

            {/* Desktop collapse toggle button */}
            <button
              onClick={toggleCollapsed}
              className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-[#0B3328] hover:bg-[#124235] text-slate-300 hover:text-white border border-[#144A3A] transition cursor-pointer ${
                isCollapsed ? 'mx-auto mt-2' : ''
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || (item.id === 'founder-overview' && currentPage === 'founder-dashboard');
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM FOUNDER PROFILE & SIGN OUT */}
        <div className="p-3 border-t border-[#0A3025]/80 space-y-2 relative">
          
          {/* Founder Profile Capsule */}
          <div 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer select-none ${
              isCollapsed ? 'justify-center p-1' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-emerald-500/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-700/60 text-emerald-200 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                    Founder
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>

          {/* Quick Dropdown Actions */}
          {isProfileDropdownOpen && !isCollapsed && (
            <div className="absolute bottom-16 left-3 right-3 bg-[#05241C] border border-[#0D4435] rounded-xl p-2 shadow-2xl space-y-1 z-30">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  if (onOpenPublicProfile) onOpenPublicProfile();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-left cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  if (onOpenEditProfile) onOpenEditProfile();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-left cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOutClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        
        {/* AUTHORITATIVE TOP BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Mobile trigger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none">
              <span 
                onClick={() => onNavigate('home')}
                className="hover:text-slate-900 cursor-pointer flex items-center gap-1"
              >
                Home
              </span>
              <span className="text-slate-300">/</span>
              <span 
                onClick={() => onNavigate('founder-overview')}
                className="hover:text-slate-900 cursor-pointer"
              >
                Founders
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">
                {getSubpageLabel()}
              </span>
            </div>
          </div>

          {/* Right: Search Bar, Notifications, Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Input Bar */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search your workspace..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition shadow-2xs"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition relative cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <p className="text-xs text-slate-500 mt-3">No notifications yet.</p>
                </div>
              )}
            </div>

            {/* Top Right Avatar Circle */}
            <div 
              onClick={onOpenEditProfile}
              className="cursor-pointer group flex items-center"
              title="Edit Profile"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

          </div>

        </header>

        {/* WORKSPACE VIEW CHILDREN */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
};
