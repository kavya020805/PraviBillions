'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone, Globe, Shield, Fingerprint, LogOut, User, Crown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useAccessibility } from '@/lib/accessibility-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isAdmin, isCitizen } = useAuth();
  const { language, setLanguage, tCommon } = useLanguage();
  const { fontScale, setFontScale } = useAccessibility();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isPublicLanding = pathname === '/' && !user;

  // On auth pages or unauthenticated landing page, render full screen without the internal app sidebar
  if (isAuthPage || isPublicLanding) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#16242B] flex flex-col">
        {children}
      </div>
    );
  }

  // Authenticated application view with responsive sidebar, civic topbar and main viewport
  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F5] text-[#16242B]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Civic Government Top Navigation Bar (GIGW 3.0 Standard) */}
        <header className="bg-white/95 backdrop-blur-xs border-b border-[#E8E3DA] flex flex-col shadow-2xs z-20 shrink-0">
          {/* National Tricolor Top Accent Strip */}
          <div className="tricolor-strip w-full shrink-0" />

          <div className="py-2.5 px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Official Gujarat Emblem Representation */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FBF6ED] to-[#F5EFE3] border border-[#E5D7BE] flex items-center justify-center shrink-0 shadow-2xs group hover:border-[#D46E38] transition-colors">
                <svg className="w-5 h-5 text-[#9A4215]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4 7v10l8 5 8-5V7z" />
                  <path d="M12 22V12" />
                  <path d="M12 12l8-5" />
                  <path d="M12 12L4 7" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#133B42] tracking-tight uppercase">
                    {tCommon.govGujarat}
                  </span>
                  <span className="text-[#C8C3BA]">|</span>
                  <span className="text-[11px] text-[#3E5259] font-semibold hidden md:inline">
                    {tCommon.deptName}
                  </span>
                </div>
                <p className="text-[10px] text-[#9A4215] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="text-[#9A4215]">ગુજરાત ડિજિટલ પરિવાર પોર્ટલ</span>
                  <span className="text-[#C8C3BA]">·</span>
                  <span className="text-[#5C6B70] font-medium">Citizen Welfare Direct Delivery System</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* GIGW Accessibility Font Size Adjuster */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#3E5259] bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg px-2 py-0.5">
                <span className="text-[10px] font-semibold text-[#7A8A90] mr-0.5">Font:</span>
                <button
                  type="button"
                  onClick={() => setFontScale('normal')}
                  title="Standard Font Size"
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-colors text-xs font-bold font-mono",
                    fontScale === 'normal'
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "hover:text-[#133B42] hover:bg-[#EAE5DA] text-slate-700"
                  )}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale('large')}
                  title="Larger Font Size"
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-colors text-xs font-bold font-mono",
                    fontScale === 'large' || fontScale === 'larger'
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "hover:text-[#133B42] hover:bg-[#EAE5DA] text-slate-700"
                  )}
                >
                  A+
                </button>
              </div>

              {/* Citizen Helpline */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#1E5340] font-semibold px-3 py-1 rounded-lg bg-[#EFF6F2] border border-[#D1E6DD]">
                <Phone className="w-3.5 h-3.5 text-[#28604A]" />
                <span className="font-mono font-bold text-[#163F30]">1800-233-5500</span>
                <span className="text-[10px] text-[#28604A] font-normal">({tCommon.tollFree})</span>
              </div>

              {/* Persistent Global Trilingual Language Switcher */}
              <div className="flex items-center gap-1 bg-[#F5F2EB] border border-[#E0DBD0] p-0.5 rounded-lg text-xs shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#9A4215] ml-1.5 mr-0.5" />
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    language === 'en'
                      ? 'bg-[#133B42] text-white shadow-2xs'
                      : 'text-[#3E5259] hover:text-[#133B42] hover:bg-[#EAE5DA]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('gu')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    language === 'gu'
                      ? 'bg-[#133B42] text-white shadow-2xs'
                      : 'text-[#3E5259] hover:text-[#133B42] hover:bg-[#EAE5DA]'
                  }`}
                >
                  ગુજરાતી
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    language === 'hi'
                      ? 'bg-[#133B42] text-white shadow-2xs'
                      : 'text-[#3E5259] hover:text-[#133B42] hover:bg-[#EAE5DA]'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* User Persona Profile Tag */}
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-[#E8E3DA] text-xs">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#E8E3DA]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-white shadow-2xs ${
                      isAdmin ? 'bg-[#C85D32]' : 'bg-[#28604A]'
                    }`}>
                      {user.full_name?.[0] || (isAdmin ? 'A' : 'C')}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-[11px] font-bold text-[#16242B] leading-none">
                        {user.full_name}
                      </p>
                      <p className="text-[9px] font-semibold text-[#66777D] mt-0.5">
                        {isAdmin ? tCommon.adminRole : (user.family_id ? `ID: ${user.family_id}` : tCommon.citizenRole)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-[#FBF9F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
