'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  MessageCircleQuestion,
  Fingerprint,
  Info,
  LogOut,
  LogIn,
  Crown,
  User,
  Home,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isCitizen, loginAsDemo } = useAuth();
  const { language } = useLanguage();

  const citizenFamilyId = user?.family_id || '240100000001';

  // Dynamic Navigation depending on user role and language
  const navItems = isCitizen
    ? [
        {
          label: language === 'gu' ? 'મારું કુટુંબ' : language === 'hi' ? 'मेरा परिवार' : 'My Household',
          href: `/families/${citizenFamilyId}`,
          icon: Home,
          description: language === 'gu' ? 'જીવન ઘટનાઓ અને લાભો' : language === 'hi' ? 'जीवन घटना एवं लाभ' : 'Life Events & Benefits',
          badge: 'Family ID',
        },
        {
          label: language === 'gu' ? 'યોજના સહાયક' : language === 'hi' ? 'कल्याणकारी सहायक' : 'Welfare Voice Assistant',
          href: '/assistant',
          icon: MessageCircleQuestion,
          description: language === 'gu' ? 'ત્રિભાષી નાગરિક માર્ગદર્શક' : language === 'hi' ? 'त्रिभाषी नागरिक गाइड' : 'Trilingual Citizen Guide',
          badge: 'Voice TTS',
        },
        {
          label: language === 'gu' ? 'રાજ્ય યોજના ઝાંખી' : language === 'hi' ? 'राज्य योजना अवलोकन' : 'State Schemes Overview',
          href: '/',
          icon: LayoutDashboard,
          description: language === 'gu' ? '૨૦ ગુજરાત કલ્યાણકારી યોજનાઓ' : language === 'hi' ? '20 गुजरात कल्याणकारी योजनाएं' : '20 Gujarat Welfare Programs',
          badge: '20 Schemes',
        },
        {
          label: language === 'gu' ? 'રાજ્ય કુટુંબ ડિરેક્ટરી' : language === 'hi' ? 'राज्य परिवार निर्देशिका' : 'State Family Directory',
          href: '/families',
          icon: Users,
          description: language === 'gu' ? '૩૩ જિલ્લા પરિવારો' : language === 'hi' ? '33 जिला परिवार' : '33 Districts Directory',
          badge: '50 Records',
        },
      ]
    : [
        {
          label: language === 'gu' ? 'ડેશબોર્ડ' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
          description: language === 'gu' ? 'રાજ્ય વિહંગાવલોકન' : language === 'hi' ? 'राज्य अवलोकन' : 'Registry Overview',
          badge: 'Overview',
        },
        {
          label: language === 'gu' ? 'પરિવાર રજિસ્ટ્રી' : language === 'hi' ? 'परिवार पंजीयन' : 'Family Registry',
          href: '/families',
          icon: Users,
          description: language === 'gu' ? 'જીવન ઘટના સિમ્યુલેશન' : language === 'hi' ? 'जीवन घटना सिमुलेशन' : 'Life-Event Sandbox',
          badge: '50 Families',
        },
        {
          label: language === 'gu' ? 'રેકોર્ડ શુદ્ધતા ઓડિટ' : language === 'hi' ? 'पंजीकरण शुद्धता ऑडिट' : 'Registry Integrity',
          href: '/integrity',
          icon: ShieldAlert,
          description: language === 'gu' ? 'ડુપ્લિકેશન નિવારણ' : language === 'hi' ? 'डुप्लीकेशन निवारण' : 'Deduplication Audit',
          badge: 'Fuzzy Match',
        },
        {
          label: language === 'gu' ? 'યોજના સહાયક' : language === 'hi' ? 'कल्याणकारी सहायक' : 'Welfare Assistant',
          href: '/assistant',
          icon: MessageCircleQuestion,
          description: language === 'gu' ? 'નાગરિક શોધ અને અવાજ' : language === 'hi' ? 'नागरिक खोज एवं आवाज' : 'Citizen Discovery & Voice',
          badge: 'Voice TTS',
        },
      ];

  return (
    <aside className="w-[270px] flex-shrink-0 bg-[#FCFBF8] text-[#16242B] flex flex-col border-r border-[#E8E3DA] shadow-xs z-30">
      {/* Brand Header (Warm Sandstone Theme) */}
      <div className="px-5 py-4 border-b border-[#E8E3DA] bg-[#F7F4EC]/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#133B42] to-[#1E4E57] flex items-center justify-center shadow-md shadow-[#133B42]/10 ring-1 ring-[#133B42]/15 group-hover:scale-105 transition-transform text-white">
            <Fingerprint className="w-5 h-5 text-[#E5B568]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm leading-tight text-[#133B42] tracking-tight">Family ID</h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#D46E38] text-white uppercase tracking-wider">
                Copilot
              </span>
            </div>
            <p className="text-[10px] text-[#66777D] font-semibold leading-tight mt-0.5">
              ગુજરાત સરકાર · Gov of Gujarat
            </p>
          </div>
        </Link>
      </div>

      {/* Civic Verification Badge */}
      <div className="px-3 py-2 mx-3 mt-3 rounded-xl bg-[#EFF6F2] border border-[#D1E6DD] flex items-center justify-between text-[11px] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#28604A] animate-pulse" />
          <span className="text-[#163F30] font-bold text-[10px]">
            {language === 'gu' ? 'રાજ્ય ડેટા નેટવર્ક સક્રિય' : language === 'hi' ? 'राज्य डेटा नेटवर्क सक्रिय' : 'State Civic Network'}
          </span>
        </div>
        <span className="text-[10px] text-[#28604A] font-bold">
          {language === 'gu' ? '૩૩ જિલ્લા' : language === 'hi' ? '33 जिले' : '33 Districts'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        <div className="flex items-center justify-between px-3 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A90]">
            {isCitizen ? 'Citizen Services' : 'Administrative Services'}
          </p>
          {user && (
            <Badge
              variant="outline"
              className={`text-[9px] font-bold uppercase px-1.5 py-0 ${
                isAdmin
                  ? 'bg-[#FDF6F0] text-[#9A4215] border-[#F4DDD2]'
                  : 'bg-[#EFF6F2] text-[#1E5340] border-[#D1E6DD]'
              }`}
            >
              {isAdmin ? 'Talati / Admin' : 'Citizen'}
            </Badge>
          )}
        </div>

        {(() => {
          const hasExactMatch = navItems.some((n) => n.href === pathname);
          return navItems.map((item) => {
            const isActive = hasExactMatch
              ? pathname === item.href
              : item.href !== '/' && (pathname === item.href || pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150',
                isActive
                  ? 'bg-[#133B42] text-white font-bold shadow-xs'
                  : 'text-[#3E5259] hover:text-[#133B42] hover:bg-[#F2EFE8]'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-[#E5B568]' : 'text-[#7A8A90] group-hover:text-[#133B42]'
                )} />
                <div>
                  <span className="block leading-tight font-semibold">{item.label}</span>
                  {item.description && (
                    <span className={cn(
                      'block text-[10px] leading-tight mt-0.5',
                      isActive ? 'text-[#CDE1E3] font-normal' : 'text-[#7A8A90] group-hover:text-[#4A5E64]'
                    )}>
                      {item.description}
                    </span>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded font-mono',
                  isActive ? 'bg-white/20 text-white font-bold' : 'bg-[#F2EFE8] text-[#5C6B70] border border-[#E0DBD0]'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        });
      })()}
      </nav>

      {/* User Session & Role Card */}
      <div className="p-3 border-t border-[#E8E3DA] bg-[#F7F4EC]/60">
        {user ? (
          <div className="p-3 rounded-xl bg-white border border-[#E8E3DA] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                  isAdmin ? 'bg-[#FDF6F0] text-[#9A4215] border border-[#F4DDD2]' : 'bg-[#EFF6F2] text-[#1E5340] border border-[#D1E6DD]'
                }`}>
                  {isAdmin ? <Crown className="w-4 h-4 text-[#9A4215]" /> : <User className="w-4 h-4 text-[#28604A]" />}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#16242B] truncate">{user.full_name}</p>
                  <p className="text-[10px] text-[#66777D] truncate">{user.email}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                title="Sign Out"
                className="w-7 h-7 text-[#7A8A90] hover:text-[#9A4215] hover:bg-[#FDF6F0] shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>

            {user.family_id && (
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#F2EFE8] text-[#5C6B70]">
                <span>Family ID:</span>
                <span className="font-mono text-[#9A4215] font-bold">{user.family_id}</span>
              </div>
            )}

            {/* Quick Switch Persona Button */}
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsDemo(isAdmin ? 'citizen' : 'admin')}
                className="w-full text-[11px] font-semibold h-7 bg-[#FAF8F3] hover:bg-[#F2EFE8] text-[#3E5259] border-[#E0DBD0] shadow-2xs"
              >
                <Crown className="w-3 h-3 mr-1.5 text-[#C85D32]" />
                {isAdmin
                  ? (language === 'gu' ? 'નાગરિક વ્યુ પર બદલો' : language === 'hi' ? 'नागरिक व्यू पर बदलें' : 'Switch to Citizen View')
                  : (language === 'gu' ? 'તલાટી વ્યુ પર બદલો' : language === 'hi' ? 'तलाटी व्यू पर बदलें' : 'Switch to Talati View')}
              </Button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold h-9 bg-white border-[#DCD6CA] text-[#16242B] hover:bg-[#F2EFE8] shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5 text-[#133B42]" />
              Sign In / Switch Role
            </Button>
          </Link>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-[#E8E3DA] bg-white text-[10px] text-[#7A8A90] flex items-start gap-2">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#9EAAA8]" />
        <p className="leading-relaxed">
          Integrated with Gujarat Social Justice &amp; Empowerment parameters.
        </p>
      </div>
    </aside>
  );
}
