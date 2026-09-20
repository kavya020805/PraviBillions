'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Users, Home, IndianRupee, MapPin, Phone,
  Calendar, ShieldAlert, Sparkles, TrendingUp, TrendingDown,
  UserCheck, HeartHandshake, Eye, Play, Plus, Minus,
  RotateCcw, Info, ArrowRight, Clock, Heart, Zap, ChevronRight,
  AlertCircle, Lock, FileText, ExternalLink, ShieldCheck, Baby, GraduationCap, Check,
  QrCode, TreePine, LayoutGrid, Award, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { lifeEvents, getEligibleMembersForEvent } from '@/lib/life-events';
import { calculateAge, formatCurrency, formatDate, getSchemeCategoryColor } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { FamilyTree } from '@/components/families/family-tree';
import { DigitalCardModal } from '@/components/landing/digital-card-modal';
import { SpotlightCard } from '@/components/effects/spotlight-card';
import { BorderBeam } from '@/components/effects/border-beam';
import { ShinyText } from '@/components/effects/shiny-text';
import type { Family, SchemeRule, LifeEventLogEntry, Gender } from '@/lib/types';

interface FamilyDetailResponse {
  family: Family & { is_masked?: boolean; mask_reason?: string };
  eligible_schemes: (SchemeRule & {
    eligible_members?: { member_id?: string; member_name?: string }[];
  })[];
  eligible_count: number;
  event_history: LifeEventLogEntry[];
}

interface SimulationResult {
  event_type: string;
  event_label: string;
  family_before: Family;
  family_after: Family;
  diff: {
    gained: {
      scheme_id: string;
      scheme_name: string;
      scheme_name_hi?: string;
      scheme_name_gu?: string;
      category: string;
      benefit: string;
      description: string;
      member_name?: string;
    }[];
    lost: {
      scheme_id: string;
      scheme_name: string;
      scheme_name_hi?: string;
      scheme_name_gu?: string;
      category: string;
      benefit: string;
      description: string;
      member_name?: string;
    }[];
    unchanged_count: number;
  };
  applied: boolean;
}

export default function FamilyDetailPage({ params }: { params: Promise<{ familyId: string }> }) {
  const { familyId } = use(params);
  const queryClient = useQueryClient();
  const { language, tCommon } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAdmin, loginAsDemo, isLoading: isAuthLoading } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string>('new_child_born');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [childGender, setChildGender] = useState<Gender>('female');
  const [childName, setChildName] = useState<string>('Ananya');
  const [simulatedIncome, setSimulatedIncome] = useState<number>(60000);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [inspectedScheme, setInspectedScheme] = useState<SchemeRule | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [memberView, setMemberView] = useState<'tree' | 'roster'>('tree');
  const [showSmartCard, setShowSmartCard] = useState(false);
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<string>('all');

  const handleSelectMemberForSimulation = (memberId: string, eventType?: string) => {
    setActiveTab('simulator');
    if (eventType) {
      setSelectedEvent(eventType);
    }
    setSelectedMember(memberId);
  };

  const { data, isLoading } = useQuery<FamilyDetailResponse>({
    queryKey: ['family', familyId],
    queryFn: async () => {
      const res = await fetch(`/api/families/${familyId}`);
      if (!res.ok) throw new Error('Failed to fetch family');
      return res.json();
    },
    enabled: Boolean(user), // Only fetch when authenticated
  });

  const simulateMutation = useMutation({
    mutationFn: async ({ apply }: { apply: boolean }) => {
      // Build dynamic params depending on event type
      const eventParams: Record<string, unknown> = {};
      if (selectedMember) {
        eventParams.member_id = selectedMember;
      }
      if (selectedEvent === 'new_child_born') {
        eventParams.child_gender = childGender;
        eventParams.child_name = childName.trim() || (childGender === 'female' ? 'Baby Girl' : 'Baby Boy');
      }
      if (selectedEvent === 'income_decreased' || selectedEvent === 'income_increased') {
        eventParams.new_income = simulatedIncome;
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_id: familyId,
          event_type: selectedEvent,
          params: eventParams,
          apply,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Simulation failed');
      }
      return resData as SimulationResult;
    },
    onSuccess: (result, { apply }) => {
      setSimResult(result);
      setSimError(null);
      if (apply) {
        queryClient.invalidateQueries({ queryKey: ['family', familyId] });
        queryClient.invalidateQueries({ queryKey: ['families'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        if (selectedEvent === 'new_child_born') {
          const namesPool = ['Diya', 'Aarav', 'Pooja', 'Krishna', 'Isha', 'Dev', 'Mira', 'Rohan', 'Tanvi', 'Neil'];
          const available = namesPool.find(n => !family.members.some(m => m.name.toLowerCase() === n.toLowerCase()) && n.toLowerCase() !== childName.trim().toLowerCase()) || '';
          setChildName(available);
        }
      }
    },
    onError: (err: Error) => {
      setSimError(err.message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/families/${familyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset family');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setSimResult(null);
      setResetNotice('Family restored to initial synthetic baseline.');
      setTimeout(() => setResetNotice(null), 3500);
    },
    onError: (err: Error) => {
      setSimError(err.message);
    },
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Verifying credentials...
      </div>
    );
  }

  // Authentication Gate: visitors must login to view household details
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-amber-300 bg-amber-50/90 p-6 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <Badge className="bg-amber-200/80 text-amber-900 border-amber-300 text-xs">
              Confidential Household Record
            </Badge>
            <h2 className="text-xl font-extrabold text-amber-950">Authentication Required</h2>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Under Gujarat Family ID privacy guidelines, full household records, member lists, and welfare entitlements are protected. Please sign in as a registered Citizen or Talati Officer to view details.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/login">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs">
                Sign In to Gujarat Portal
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsDemo('citizen')}
                className="flex-1 text-[11px] bg-white border-amber-300 text-amber-950 hover:bg-amber-100"
              >
                Demo Citizen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsDemo('admin')}
                className="flex-1 text-[11px] bg-white border-amber-300 text-amber-950 hover:bg-amber-100"
              >
                Demo Officer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-44 bg-slate-100 rounded-xl" />
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const { family, eligible_schemes, event_history } = data;
  const head = family.members.find(m => m.relation_to_head === 'head' && m.is_alive) || family.members[0];
  const aliveMembers = family.members.filter(m => m.is_alive);
  const selectedEventDef = lifeEvents.find(e => e.type === selectedEvent);

  // Compute future predictive milestones
  const upcomingMilestones = family.members
    .filter(m => m.is_alive)
    .flatMap(m => {
      const currentAge = calculateAge(m.dob);
      const items = [];
      if (currentAge < 18) {
        items.push({
          yearsAway: 18 - currentAge,
          targetAge: 18,
          member: m,
          label: `${m.name} turns 18`,
          benefitNote: 'Unlocks adult eligibility (Higher Education, Skill Training, Employment schemes)',
        });
      }
      if (currentAge < 60) {
        items.push({
          yearsAway: 60 - currentAge,
          targetAge: 60,
          member: m,
          label: `${m.name} turns 60`,
          benefitNote: 'Unlocks old-age pensions (Vridh Sahay, IGNOAPS, Niramaya)',
        });
      }
      return items;
    })
    .sort((a, b) => a.yearsAway - b.yearsAway)
    .slice(0, 4);

  // Filter members eligible for selected life event
  const eligibleMembers = getEligibleMembersForEvent(family, selectedEvent);

  // Check duplicate newborn name in real time
  const isChildNameDuplicate = selectedEvent === 'new_child_born' && Boolean(childName.trim()) && family.members.some(m => {
    const mNorm = m.name.trim().toLowerCase();
    const iNorm = childName.trim().toLowerCase();
    const mFirst = mNorm.split(/\s+/)[0];
    const iFirst = iNorm.split(/\s+/)[0];
    return mNorm === iNorm || (mFirst.length > 2 && mFirst === iFirst);
  });
  const isNewbornInvalid = selectedEvent === 'new_child_born' && (!childName.trim() || isChildNameDuplicate);
  const isMemberInvalid = Boolean(selectedEventDef?.requires_member_selection && (!selectedMember || !eligibleMembers.some(m => m.member_id === selectedMember)));
  const isHouseholdOwner = isAdmin || (user?.role === 'citizen' && user?.family_id === familyId);
  const isActionDisabled = simulateMutation.isPending || isNewbornInvalid || isMemberInvalid;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Ownership Banner */}
      {!user && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Preview & Exploration Mode:</strong> You are exploring this Gujarat household as a guest. You can simulate life events in real time. To commit changes to the live registry or reset records, please sign in.
            </span>
          </div>
          <Link href="/login">
            <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {user && !isHouseholdOwner && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Public Reference Mode:</strong> You are viewing another citizen&apos;s registered household. You can test life-event previews, but registry commits and resets are strictly restricted to this household&apos;s verified head or Talati administrators.
            </span>
          </div>
          {user?.family_id && (
            <Link href={`/families/${user.family_id}`}>
              <Button size="sm" variant="outline" className="text-xs h-7 border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0">
                Go to My Household
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/families" className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> {language === 'gu' ? 'રજિસ્ટ્રી' : language === 'hi' ? 'पंजीयन' : 'Registry'}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-slate-500">{family.family_id}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-foreground">
            {head?.name} {language === 'gu' ? 'પરિવાર' : language === 'hi' ? 'परिवार' : 'Family'}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending || !isHouseholdOwner}
          title={!isHouseholdOwner ? 'Only verified household head or administrators can reset this household' : 'Reset family data to synthetic baseline'}
          className="text-xs h-8 border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-50"
        >
          <RotateCcw className={`w-3 h-3 mr-1.5 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
          {language === 'gu' ? 'મૂળ સ્થિતિ પુનઃસ્થાપિત કરો' : language === 'hi' ? 'मूल स्थिति में रीसेट करें' : 'Reset to Baseline'}
        </Button>
      </div>

      {/* Reset Confirmation Notice */}
      <AnimatePresence>
        {resetNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{resetNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Gujarat Family Identity Hero Card */}
      <Card className="relative border border-[#E8E3DA] shadow-md bg-white overflow-hidden">
        {/* ReactBits Dynamic Light Beam */}
        <BorderBeam size={280} duration={12} colorFrom="#133B42" colorTo="#D46E38" />

        {/* Tricolor Ribbon */}
        <div className="h-1.5 flex w-full">
          <div className="w-1/3 bg-[#D46E38]" />
          <div className="w-1/3 bg-[#FAF8F2]" />
          <div className="w-1/3 bg-[#28604A]" />
        </div>

        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FAF7F0] to-[#F5EFE4] border border-[#E8E3DA] flex items-center justify-center text-xl shadow-2xs shrink-0">
                  🏛️
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#133B42]">
                      {head?.name} {language === 'gu' ? 'પરિવાર' : language === 'hi' ? 'परिवार' : 'Family'}
                    </h1>
                    <Badge variant="outline" className="font-mono text-xs bg-amber-50 text-amber-950 border-amber-300 font-bold">
                      GJ-{family.family_id}
                    </Badge>
                    <Badge className={`text-xs font-bold ${(family as any).is_masked ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-blue-100 text-blue-900 border-blue-300'}`}>
                      {(family as any).caste_display || `${family.caste_category.toUpperCase()} ${language === 'gu' ? 'કેટેગરી' : language === 'hi' ? 'श्रेणी' : 'Category'}`}
                    </Badge>
                    <Badge variant="outline" className={`text-xs font-bold ${family.income_band === 'bpl' || family.income_band === 'aay' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-800'}`}>
                      {family.income_band.toUpperCase()} {language === 'gu' ? 'આવક જૂથ' : language === 'hi' ? 'आय वर्ग' : 'Income Band'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {language === 'gu'
                      ? 'ગુજરાત સરકાર · સત્તાવાર ડિજિટલ પરિવાર ઓળખ અને PDS રેશન પ્રોફાઇલ'
                      : language === 'hi'
                      ? 'गुजरात सरकार · आधिकारिक डिजिटल परिवार पहचान एवं PDS राशन प्रोफाइल'
                      : 'ગુજરાત સરકાર · Official Digital Family ID & PDS Digital Ration Profile'}
                  </p>
                </div>
              </div>

              {/* DPDP Act 2023 Privacy Notice Banner */}
              {(family as any).is_masked && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-950 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong className="font-bold">{language === 'gu' ? 'DPDP એક્ટ ૨૦૨૩ ગોપનીયતા સુરક્ષા:' : language === 'hi' ? 'DPDP अधिनियम 2023 गोपनीयता संरक्षण:' : 'DPDP Act 2023 Privacy Redaction:'}</strong>{' '}
                    {language === 'gu'
                      ? 'વહીવટી અને અધિકારી દૃશ્ય માટે નાગરિક ફોન નંબર, સરનામું, જન્મતારીખ, વાર્ષિક આવક, જ્ઞાતિ અને તબીબી વિગતો છુપાવેલ છે.'
                      : language === 'hi'
                      ? 'प्रशासनिक एवं अधिकारी अवलोकन हेतु नागरिक फोन नंबर, पता, जन्मतिथि, वार्षिक आय, जाति और चिकित्सा विवरण छिपाए गए हैं।'
                      : 'Citizen phone number, street address, exact DOB, annual income figures, caste classification, and medical records are redacted for administrative oversight.'}
                  </span>
                </div>
              )}

              {user?.family_id === family.family_id && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="font-bold">{language === 'gu' ? 'તમારો અધિકૃત પારિવારિક રેકોર્ડ:' : language === 'hi' ? 'आपका प्राधिकृत पारिवारिक रिकॉर्ड:' : 'Your Authorized Household Record:'}</strong>{' '}
                    {language === 'gu'
                      ? 'તમે તમારા પરિવારના નોંધાયેલા સભ્ય હોવાથી સંપૂર્ણ માહિતી જોઈ શકો છો.'
                      : language === 'hi'
                      ? 'आप अपने परिवार के पंजीकृत सदस्य होने के नाते संपूर्ण असंशोधित विवरण देख सकते हैं।'
                      : 'Full unredacted personal identifiers are visible to you as the authenticated household owner.'}
                  </span>
                </div>
              )}

              {/* Geographic & Civic Metadata */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {family.address}, {family.district} ({family.pincode})
                  {(family as any).is_masked && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-amber-100/70 text-amber-900 border-amber-300 font-mono font-bold">
                      <Lock className="w-2.5 h-2.5 mr-0.5 inline" /> REDACTED
                    </Badge>
                  )}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {family.phone_number.startsWith('+91') ? family.phone_number : `+91 ${family.phone_number}`}
                  {(family as any).is_masked && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-amber-100/70 text-amber-900 border-amber-300 font-mono font-bold">
                      <Lock className="w-2.5 h-2.5 mr-0.5 inline" /> MASKED
                    </Badge>
                  )}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  {language === 'gu' ? 'વિસ્તાર:' : language === 'hi' ? 'क्षेत्र:' : 'Area:'} {family.area_type === 'rural' ? (language === 'gu' ? '🌾 ગ્રામીણ' : language === 'hi' ? '🌾 ग्रामीण' : '🌾 Rural (Gramin)') : (language === 'gu' ? '🏙️ શહેરી' : language === 'hi' ? '🏙️ शहरी' : '🏙️ Urban')}
                </span>
              </div>

              {/* Civic Quota & Biometric Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {language === 'gu' ? 'આધાર e-KYC ૧૦૦% પૂર્ણ' : language === 'hi' ? 'आधार e-KYC 100% पूर्ण' : 'Aadhaar e-KYC 100% Linked'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-950 border border-amber-300 font-semibold shadow-2xs">
                  🌾 {language === 'gu' ? 'NFSA રેશન જથ્થો:' : language === 'hi' ? 'NFSA राशन कोटा:' : 'NFSA Ration Quota:'} <strong>{aliveMembers.length * 5} {language === 'gu' ? 'કિલો / માસ' : language === 'hi' ? 'किग्रा / माह' : 'kg / Month'}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium shadow-2xs">
                  🏪 {language === 'gu' ? 'વાજબી ભાવ દુકાન' : language === 'hi' ? 'उचित मूल्य दुकान' : 'FPS Shop'} #{family.pincode}-FPS
                </span>
              </div>
            </div>

            {/* Quick Metrics & Smart Card Action */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <Button
                onClick={() => setShowSmartCard(true)}
                className="w-full sm:w-auto text-xs h-10 px-5 bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold shadow-sm card-hover-lift rounded-xl"
              >
                <QrCode className="w-4 h-4 mr-2 text-amber-400" />
                {language === 'gu' ? 'સત્તાવાર ડિજિટલ સ્માર્ટ કાર્ડ જુઓ' : language === 'hi' ? 'आधिकारिक डिजिटल स्मार्ट कार्ड देखें' : 'View Official Digital Smart Card'}
              </Button>

              <div className="grid grid-cols-3 gap-2.5 w-full">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">{language === 'gu' ? 'કુલ સભ્યો' : language === 'hi' ? 'कुल सदस्य' : 'Members'}</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{aliveMembers.length}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">{language === 'gu' ? 'વાર્ષિક આવક' : language === 'hi' ? 'वार्षिक आय' : 'Annual Income'}</p>
                  <p className={`font-black text-emerald-800 mt-0.5 ${(family as any).is_masked ? 'text-xs' : 'text-lg'}`}>
                    {(family as any).income_display || formatCurrency(family.household_income_annual)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs text-center min-w-[90px]">
                  <p className="text-[10px] uppercase font-bold text-slate-500">{language === 'gu' ? 'સક્રિય યોજનાઓ' : language === 'hi' ? 'सक्रिय योजनाएं' : 'Active Schemes'}</p>
                  <p className="text-xl font-black text-indigo-900 mt-0.5">{data.eligible_count}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="overview" className="text-xs px-4">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            {language === 'gu' ? `પાત્ર યોજનાઓ (${eligible_schemes.length})` : language === 'hi' ? `पात्र योजनाएं (${eligible_schemes.length})` : `Eligible Schemes (${eligible_schemes.length})`}
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs px-4">
            <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            {language === 'gu' ? `પરિવાર સભ્યો (${aliveMembers.length})` : language === 'hi' ? `परिवार के सदस्य (${aliveMembers.length})` : `Family Members (${aliveMembers.length})`}
          </TabsTrigger>
          <TabsTrigger value="simulator" className="text-xs px-4 font-semibold text-amber-900 hover:text-amber-950 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-950">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-600 fill-amber-500" />
            {language === 'gu' ? 'જીવન ઘટના સિમ્યુલેટર' : language === 'hi' ? 'जीवन घटना सिमुलेटर' : 'Life-Event Simulator'}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs px-4">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            {language === 'gu' ? `ઓડિટ સમયરેખા (${event_history.length})` : language === 'hi' ? `ऑडिट टाइमलाइन (${event_history.length})` : `Audit Timeline (${event_history.length})`}
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB: Active Schemes */}
        <TabsContent value="overview" className="space-y-6">
          {/* Household Welfare Entitlement Banner */}
          <div className="grid sm:grid-cols-3 gap-3">
            <SpotlightCard
              spotlightColor="rgba(37, 99, 235, 0.08)"
              className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  {language === 'gu' ? 'આરોગ્ય સુરક્ષા' : language === 'hi' ? 'स्वास्थ्य सुरक्षा' : 'Health Protection'}
                </span>
                <span className="text-lg">🏥</span>
              </div>
              <p className="text-xl font-black text-blue-950 mt-1">
                {language === 'gu' ? '₹૧૦ લાખ / વર્ષ' : language === 'hi' ? '₹10 लाख / वर्ष' : '₹10 Lakhs / Year'}
              </p>
              <p className="text-[11px] text-blue-700/90 mt-0.5 font-medium">
                {language === 'gu'
                  ? 'PM-JAY મા અમૃતમ કેશલેસ ઇનપેશન્ટ હોસ્પિટલ કવચ'
                  : language === 'hi'
                  ? 'PM-JAY मां अमृतम कैशलेस इनपेशेंट अस्पताल सुरक्षा'
                  : 'PM-JAY MAA Amrutam cashless inpatient hospital coverage'}
              </p>
            </SpotlightCard>
            <SpotlightCard
              spotlightColor="rgba(212, 110, 56, 0.08)"
              className="p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  {language === 'gu' ? 'અન્ન સુરક્ષા (NFSA)' : language === 'hi' ? 'खाद्य सुरक्षा (NFSA)' : 'Food Security (NFSA)'}
                </span>
                <span className="text-lg">🌾</span>
              </div>
              <p className="text-xl font-black text-amber-950 mt-1">
                {aliveMembers.length * 5} {language === 'gu' ? 'કિલો / માસ' : language === 'hi' ? 'किग्रा / माह' : 'kg / Month'}
              </p>
              <p className="text-[11px] text-amber-800/90 mt-0.5 font-medium">
                {language === 'gu'
                  ? `વાજબી ભાવ દુકાન #${family.pincode}-FPS પરથી સબસિડીવાળું અનાજ`
                  : language === 'hi'
                  ? `उचित मूल्य दुकान #${family.pincode}-FPS से रियायती खाद्यान्न`
                  : `Subsidized wheat & rice from Fair Price Shop #${family.pincode}-FPS`}
              </p>
            </SpotlightCard>
            <SpotlightCard
              spotlightColor="rgba(40, 96, 74, 0.08)"
              className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  {language === 'gu' ? 'સીધા બેંક ખાતામાં (DBT)' : language === 'hi' ? 'प्रत्यक्ष लाभ अंतरण (DBT)' : 'Direct Benefit (DBT)'}
                </span>
                <span className="text-lg">💰</span>
              </div>
              <p className="text-xl font-black text-emerald-950 mt-1">
                {language === 'gu' ? 'સીધો બેંક ટ્રાન્સફર' : language === 'hi' ? 'प्रत्यक्ष बैंक ट्रांसफर' : 'Direct Bank Credit'}
              </p>
              <p className="text-[11px] text-emerald-800/90 mt-0.5 font-medium">
                {language === 'gu'
                  ? 'પેન્શન અને શિષ્યવૃત્તિ માટે આધાર-જોડાયેલ જન ધન ખાતામાં સીધા નાણાં'
                  : language === 'hi'
                  ? 'पेंशन एवं छात्रवृत्ति हेतु आधार-लिंक्ड जन धन खाते में सीधी राशि'
                  : 'Aadhaar-seeded Jan Dhan bank transfer for pensions & scholarships'}
              </p>
            </SpotlightCard>
          </div>

          {/* Scheme Category Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: language === 'gu' ? 'તમામ યોજનાઓ' : language === 'hi' ? 'सभी योजनाएं' : 'All Schemes', count: eligible_schemes.length },
                { id: 'food', label: language === 'gu' ? '🌾 અનાજ અને રાશન' : language === 'hi' ? '🌾 अन्न एवं राशन' : '🌾 Food & Ration', count: eligible_schemes.filter(s => s.category === 'food').length },
                { id: 'health', label: language === 'gu' ? '🏥 આરોગ્ય' : language === 'hi' ? '🏥 स्वास्थ्य' : '🏥 Healthcare', count: eligible_schemes.filter(s => s.category === 'health').length },
                { id: 'pension', label: language === 'gu' ? '👵 પેન્શન' : language === 'hi' ? '👵 पेंशन' : '👵 Pension', count: eligible_schemes.filter(s => s.category === 'pension').length },
                { id: 'scholarship', label: language === 'gu' ? '🎓 શિક્ષણ' : language === 'hi' ? '🎓 शिक्षा' : '🎓 Education', count: eligible_schemes.filter(s => s.category === 'scholarship').length },
                { id: 'housing', label: language === 'gu' ? '🏠 આવાસ' : language === 'hi' ? '🏠 आवास' : '🏠 Housing & Infra', count: eligible_schemes.filter(s => s.category === 'housing').length },
                { id: 'employment', label: language === 'gu' ? '💼 રોજગાર' : language === 'hi' ? '💼 रोजगार' : '💼 Employment', count: eligible_schemes.filter(s => s.category === 'employment').length },
                { id: 'social', label: language === 'gu' ? '🤝 સામાજિક કલ્યાણ' : language === 'hi' ? '🤝 सामाजिक कल्याण' : '🤝 Social Welfare', count: eligible_schemes.filter(s => s.category === 'social').length },
              ]
                .filter(c => c.id === 'all' || c.count > 0)
                .map(cat => (
                  <Button
                    key={cat.id}
                    type="button"
                    size="sm"
                    variant={schemeCategoryFilter === cat.id ? 'default' : 'outline'}
                    onClick={() => setSchemeCategoryFilter(cat.id)}
                    className={`text-xs h-7 px-3 rounded-full font-semibold transition-all ${
                      schemeCategoryFilter === cat.id
                        ? 'bg-[#133B42] text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-[#FAF7F0] border-[#E8E3DA]'
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </Button>
                ))}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {eligible_schemes.filter(s => schemeCategoryFilter === 'all' || s.category === schemeCategoryFilter).length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                {language === 'gu' ? 'આ કેટેગરીમાં કોઈ યોજનાઓ ઉપલબ્ધ નથી' : language === 'hi' ? 'इस श्रेणी में कोई योजना उपलब्ध नहीं है' : 'No schemes found in this category'}
              </p>
              <Button size="sm" variant="outline" onClick={() => setSchemeCategoryFilter('all')} className="text-xs h-7">
                {language === 'gu' ? 'તમામ યોજનાઓ જુઓ' : language === 'hi' ? 'सभी योजनाएं देखें' : 'Show All Schemes'}
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligible_schemes
                .filter(s => schemeCategoryFilter === 'all' || s.category === schemeCategoryFilter)
                .map((scheme) => (
                <Card
                  key={scheme.id}
                  className="border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className={`text-[10px] ${getSchemeCategoryColor(scheme.category)} border-0 capitalize`}>
                        {scheme.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {scheme.scope}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground mt-2 line-clamp-1">
                      {language === 'gu' && scheme.name_gu ? scheme.name_gu : language === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {language === 'gu' && scheme.description_gu ? scheme.description_gu : language === 'hi' && scheme.description_hi ? scheme.description_hi : scheme.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100">
                      <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wide">
                        {language === 'gu' ? 'નાગરિક લાભ' : language === 'hi' ? 'नागरिक लाभ' : 'Citizen Benefit'}
                      </p>
                      <p className="text-xs font-bold text-emerald-950 mt-0.5">
                        {language === 'gu' && scheme.benefit_gu ? scheme.benefit_gu : language === 'hi' && scheme.benefit_hi ? scheme.benefit_hi : scheme.benefit}
                      </p>
                    </div>

                    {scheme.eligible_members && scheme.eligible_members.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{language === 'gu' ? 'લાભાર્થી:' : language === 'hi' ? 'लाभार्थी:' : 'For:'}</span>
                        {scheme.eligible_members.map(m => (
                          <span key={m.member_id || m.member_name} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {m.member_name}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-7 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
                      onClick={() => setInspectedScheme(scheme)}
                    >
                      <Eye className="w-3 h-3 mr-1" /> {language === 'gu' ? 'યોજનાના નિયમો અને દસ્તાવેજ યાદી જુઓ' : language === 'hi' ? 'योजना नियम एवं दस्तावेज सूची देखें' : 'View Scheme Rules & Checklist'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 2. MEMBERS TAB */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Gujarat Family Composition &amp; Genealogical Hierarchy
              </h3>
              <p className="text-xs text-slate-600">
                Multi-generational lineage structure modeling how welfare entitlements flow across seniors, parents, and children.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-[#E8E3DA] shadow-2xs self-start sm:self-auto">
              <Button
                type="button"
                size="sm"
                variant={memberView === 'tree' ? 'default' : 'ghost'}
                className={`text-xs h-7 px-3 font-semibold ${memberView === 'tree' ? 'bg-[#133B42] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-950'}`}
                onClick={() => setMemberView('tree')}
              >
                <TreePine className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Family Tree View
              </Button>
              <Button
                type="button"
                size="sm"
                variant={memberView === 'roster' ? 'default' : 'ghost'}
                className={`text-xs h-7 px-3 font-semibold ${memberView === 'roster' ? 'bg-[#133B42] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-950'}`}
                onClick={() => setMemberView('roster')}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Roster Table View
              </Button>
            </div>
          </div>

          {memberView === 'tree' ? (
            <FamilyTree
              family={family}
              eligibleSchemes={eligible_schemes}
              onSelectMemberForSimulation={handleSelectMemberForSimulation}
            />
          ) : (
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b border-border bg-slate-50/50">
                <CardTitle className="text-sm font-semibold">Household Member Roster</CardTitle>
                <CardDescription className="text-xs">Individual demographic attributes evaluated by the rules engine.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Member</TableHead>
                      <TableHead className="text-xs font-semibold">Relation</TableHead>
                      <TableHead className="text-xs font-semibold">Age &amp; Gender</TableHead>
                      <TableHead className="text-xs font-semibold">Marital Status</TableHead>
                      <TableHead className="text-xs font-semibold">Occupation &amp; Education</TableHead>
                      <TableHead className="text-xs font-semibold">Special Attributes</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Quick Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {family.members.map((m) => (
                      <TableRow key={m.member_id} className={!m.is_alive ? 'opacity-50 bg-slate-50' : ''}>
                        <TableCell>
                          <p className="font-semibold text-xs text-foreground">{m.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{m.member_id}</p>
                        </TableCell>
                        <TableCell className="text-xs capitalize font-medium">
                          {m.relation_to_head}
                        </TableCell>
                        <TableCell className="text-xs">
                          {calculateAge(m.dob)} yrs · {m.gender}
                          <span className="block text-[10px] text-muted-foreground">
                            {m.dob?.includes('*') ? `Born ${m.dob.substring(0, 4)} (Masked)` : `DOB: ${m.dob}`}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs capitalize">
                          {m.marital_status}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="capitalize">{m.occupation}</span> · <span className="text-muted-foreground">{m.education_level}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {m.disability_status && (
                              <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 font-bold">
                                {(family as any).is_masked ? 'Specially Abled (Certified)' : `Disability (${m.disability_percentage || 40}%)`}
                              </Badge>
                            )}
                            {m.is_pregnant && (
                              <Badge variant="outline" className="text-[10px] bg-pink-50 text-pink-700 border-pink-200 font-bold">
                                {(family as any).is_masked ? 'Maternal Welfare (Protected)' : 'Pregnant'}
                              </Badge>
                            )}
                            {!m.is_alive && (
                              <Badge variant="outline" className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">
                                Deceased
                              </Badge>
                            )}
                            {m.is_alive && !m.disability_status && !m.is_pregnant && (
                              <span className="text-[11px] text-muted-foreground">Standard</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {m.is_alive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[11px] h-7 text-amber-800 hover:text-amber-950 hover:bg-amber-50 font-semibold"
                              onClick={() => handleSelectMemberForSimulation(m.member_id)}
                            >
                              <Zap className="w-3 h-3 mr-1 text-amber-600" /> Simulate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 3. SIMULATOR TAB */}
        <TabsContent value="simulator" className="space-y-6">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left Controls Card */}
            <Card className="lg:col-span-2 border border-amber-200/80 shadow-xs bg-gradient-to-b from-white to-amber-50/20">
              <CardHeader className="pb-3 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500 text-white">
                    <Zap className="w-4 h-4 fill-white" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Life-Event Simulation Sandbox
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Simulate life events in memory to detect proactive welfare changes.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* 1-Click Fast Presets */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>⚡ {language === 'gu' ? 'ઝડપી જીવન ઘટના પ્રીસેટ્સ:' : language === 'hi' ? 'त्वरित जीवन घटना प्रीसेट्स:' : 'Quick Life-Event Presets:'}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {language === 'gu' ? '૧-ક્લિક ડેમો' : language === 'hi' ? '1-क्लिक डेमो' : '1-Click Proactive Demo'}
                    </span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent('new_child_born');
                        setChildGender('female');
                        setChildName('Ananya');
                        setSimResult(null);
                        setSimError(null);
                      }}
                      className="p-2 rounded-lg border border-pink-200 bg-pink-50/70 hover:bg-pink-100/80 text-left transition-colors text-xs font-medium text-pink-950 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Baby className="w-4 h-4 text-pink-600 shrink-0" />
                      <span className="truncate">
                        {language === 'gu' ? '👶 દીકરીનો જન્મ' : language === 'hi' ? '👶 पुत्री जन्म' : '👶 Daughter Born'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent('member_turns_60');
                        const elders = getEligibleMembersForEvent(family, 'member_turns_60');
                        if (elders.length > 0) setSelectedMember(elders[0].member_id);
                        setSimResult(null);
                        setSimError(null);
                      }}
                      className="p-2 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-left transition-colors text-xs font-medium text-amber-950 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Users className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {language === 'gu' ? '👵 વડીલ ૬૦ વર્ષના થયા' : language === 'hi' ? '👵 बुजुर्ग 60 वर्ष के हुए' : '👵 Elder Turns 60'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent('member_turns_18');
                        const youths = getEligibleMembersForEvent(family, 'member_turns_18');
                        if (youths.length > 0) setSelectedMember(youths[0].member_id);
                        setSimResult(null);
                        setSimError(null);
                      }}
                      className="p-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-colors text-xs font-medium text-blue-950 flex items-center gap-1.5 shadow-2xs"
                    >
                      <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {language === 'gu' ? '🎓 યુવાન ૧૮ વર્ષનો થયો' : language === 'hi' ? '🎓 युवा 18 वर्ष का हुआ' : '🎓 Youth Turns 18'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent('income_decreased');
                        setSimulatedIncome(45000);
                        setSimResult(null);
                        setSimError(null);
                      }}
                      className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-colors text-xs font-medium text-emerald-950 flex items-center gap-1.5 shadow-2xs"
                    >
                      <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {language === 'gu' ? '📉 આવક BPLમાં ઘટી' : language === 'hi' ? '📉 आय BPL स्तर पर घटी' : '📉 Income Drops to BPL'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Event Selector */}
                <div>
                  <Label className="text-xs font-semibold text-slate-800 mb-1.5 block">
                    {language === 'gu' ? 'ટ્રિગર કરવા માટે જીવન ઘટના પસંદ કરો:' : language === 'hi' ? 'सिमुलेशन हेतु जीवन घटना चुनें:' : 'Choose Life Event to Trigger:'}
                  </Label>
                  <Select
                    value={selectedEvent}
                    onValueChange={(val) => {
                      setSelectedEvent(val);
                      setSimResult(null);
                      setSimError(null);
                      const nextEligible = getEligibleMembersForEvent(family, val);
                      setSelectedMember(nextEligible.length > 0 ? nextEligible[0].member_id : '');
                    }}
                  >
                    <SelectTrigger className="text-xs h-9 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lifeEvents.map(event => (
                        <SelectItem key={event.type} value={event.type} className="text-xs">
                          {language === 'gu' && event.label_gu ? event.label_gu : language === 'hi' && event.label_hi ? event.label_hi : event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEventDef && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                      {selectedEventDef.description}
                    </p>
                  )}
                </div>

                {/* Contextual Parameter Inputs with Eligible Filter */}
                {selectedEventDef?.requires_member_selection && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-800 mb-1.5 block">
                      {language === 'gu' ? 'લાગુ સભ્ય પસંદ કરો:' : language === 'hi' ? 'लागू सदस्य चुनें:' : 'Select Target Family Member:'}
                    </Label>
                    {eligibleMembers.length === 0 ? (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        ⚠️ {language === 'gu' ? 'આ કુટુંબમાં આ ઘટના માટે કોઈ સભ્ય પાત્ર નથી.' : language === 'hi' ? 'इस परिवार में इस घटना हेतु कोई सदस्य पात्र नहीं है।' : 'No members in this household qualify for this event.'}
                      </div>
                    ) : (
                      <Select value={selectedMember} onValueChange={setSelectedMember}>
                        <SelectTrigger className="text-xs h-9 bg-white border-slate-300">
                          <SelectValue placeholder={language === 'gu' ? 'પાત્ર સભ્ય પસંદ કરો...' : language === 'hi' ? 'पात्र सदस्य चुनें...' : 'Choose a qualified member...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibleMembers.map(m => (
                            <SelectItem key={m.member_id} value={m.member_id} className="text-xs">
                              {m.name} ({calculateAge(m.dob)} yrs, {m.relation_to_head})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Specific controls for New Child Born */}
                {selectedEvent === 'new_child_born' && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-3">
                    <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                      {language === 'gu' ? 'નવજાત બાળકની વિગતો' : language === 'hi' ? 'नवजात शिशु विवरण' : 'Newborn Details'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">{language === 'gu' ? 'જાતિ' : language === 'hi' ? 'लिंग' : 'Child Gender'}</Label>
                        <Select value={childGender} onValueChange={(val: Gender) => setChildGender(val)}>
                          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">{language === 'gu' ? 'દીકરી (Dikri)' : language === 'hi' ? 'बालिका (पुत्री)' : 'Girl Child (Dikri)'}</SelectItem>
                            <SelectItem value="male">{language === 'gu' ? 'દીકરો' : language === 'hi' ? 'बालक (पुत्र)' : 'Boy Child'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">{language === 'gu' ? 'નામ' : language === 'hi' ? 'नाम' : 'Given Name'}</Label>
                        <Input
                          value={childName}
                          onChange={(e) => {
                            setChildName(e.target.value);
                            setSimError(null);
                          }}
                          placeholder="e.g. Ananya"
                          className={`text-xs h-8 ${isChildNameDuplicate ? 'border-rose-500' : ''}`}
                        />
                      </div>
                    </div>
                    {isChildNameDuplicate && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        {language === 'gu'
                          ? `"${childName}" નામવાળા સભ્ય પહેલેથી જ આ પરિવારમાં નોંધાયેલ છે.`
                          : language === 'hi'
                          ? `"${childName}" नाम के सदस्य इस परिवार में पहले से पंजीकृत हैं।`
                          : `A family member named "${childName}" already exists in this household. Please use a distinct name.`}
                      </p>
                    )}
                  </div>
                )}

                {/* Specific controls for Income changes */}
                {(selectedEvent === 'income_decreased' || selectedEvent === 'income_increased') && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-[11px] font-semibold text-slate-700">
                        {language === 'gu' ? 'સિમ્યુલેટેડ વાર્ષિક આવક' : language === 'hi' ? 'सिमुलेटेड वार्षिक आय' : 'Simulated Annual Income'}
                      </Label>
                      <span className="font-mono font-bold text-indigo-700">{formatCurrency(simulatedIncome)}</span>
                    </div>
                    <Slider
                      value={[simulatedIncome]}
                      onValueChange={([v]) => {
                        setSimulatedIncome(v);
                        setSimError(null);
                      }}
                      min={10000}
                      max={400000}
                      step={10000}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>BPL limit: ₹1,20,000</span>
                      <span>Target Band: {simulatedIncome <= 100000 ? 'BPL' : simulatedIncome <= 300000 ? 'LIG' : 'MIG'}</span>
                    </div>
                  </div>
                )}

                {/* Simulation Error Alert */}
                {simError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{simError}</span>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                    disabled={isActionDisabled}
                    onClick={() => simulateMutation.mutate({ apply: false })}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {language === 'gu' ? 'તફાવત સિમ્યુલેટ કરો' : language === 'hi' ? 'अंतर सिमुलेट करें' : 'Simulate Diff'}
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-amber-600 hover:bg-amber-700 text-white hover:text-white"
                    disabled={isActionDisabled || !isHouseholdOwner}
                    title={!isHouseholdOwner ? 'Only verified household head or administrators can commit changes' : undefined}
                    onClick={() => simulateMutation.mutate({ apply: true })}
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    {isHouseholdOwner
                      ? (language === 'gu' ? 'ઘટના લાગુ કરો' : language === 'hi' ? 'घटना लागू करें' : 'Commit Event')
                      : (language === 'gu' ? 'નોંધણી (માલિક માત્ર)' : language === 'hi' ? 'पंजीकरण (केवल स्वामी)' : 'Commit (Owner Only)')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Diff Presentation Card */}
            <Card className="lg:col-span-3 border border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-border bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {language === 'gu' ? 'પાત્રતા પરિવર્તન તફાવત (Eligibility Delta)' : language === 'hi' ? 'पात्रता परिवर्तन अंतर (Eligibility Delta)' : 'Eligibility Differential Delta'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'gu' ? 'જીવન ઘટના પહેલા અને પછીના લાભોની સરખામણી' : language === 'hi' ? 'जीवन घटना पूर्व एवं पश्चात लाभों की स्वचालित तुलना' : 'Automated state comparison between Family(t0) and Family(t1)'}
                    </CardDescription>
                  </div>
                  {simResult && (
                    <Badge variant="outline" className={`text-xs ${simResult.applied ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-blue-50 text-blue-700 border-blue-300'}`}>
                      {simResult.applied
                        ? (language === 'gu' ? 'રજિસ્ટ્રીમાં સત્તાવાર નોંધાયેલ' : language === 'hi' ? 'पंजीयन में आधिकारिक दर्ज' : 'Committed to Registry')
                        : (language === 'gu' ? 'પૂર્વાવલોકન સિમ્યુલેશન મોડ' : language === 'hi' ? 'पूर्वावलोकन सिमुलेशन मोड' : 'Preview Simulation Mode')}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {!simResult ? (
                  <div className="py-16 text-center text-muted-foreground space-y-3">
                    <Zap className="w-10 h-10 mx-auto text-amber-400 stroke-1" />
                    <p className="text-sm font-medium text-slate-700">
                      {language === 'gu' ? 'હાલ કોઈ સિમ્યુલેશન સક્રિય નથી' : language === 'hi' ? 'कोई सिमुलेशन सक्रिय नहीं है' : 'No simulation active'}
                    </p>
                    <p className="text-xs max-w-sm mx-auto text-muted-foreground">
                      {language === 'gu'
                        ? 'ડાબી બાજુએ કોઈ ઘટના પસંદ કરો (દા.ત. "દીકરીનો જન્મ" અથવા "વડીલ ૬૦ વર્ષના થયા") અને "તફાવત સિમ્યુલેટ કરો" પર ક્લિક કરો.'
                        : language === 'hi'
                        ? 'बाईं ओर कोई घटना चुनें (उदा. "पुत्री जन्म" या "बुजुर्ग 60 वर्ष के हुए") और "अंतर सिमुलेट करें" पर क्लिक करें।'
                        : 'Select an event on the left (e.g. "New Child Born" or "Member Turns 60") and click "Simulate Diff" to inspect proactive benefit changes.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Diff Header Summary */}
                    <div className="flex items-center gap-6 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-emerald-800">
                          +{simResult.diff.gained.length} {language === 'gu' ? 'નવી પાત્ર યોજનાઓ' : language === 'hi' ? 'नए पात्र लाभ' : 'Gained Schemes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="text-xs font-bold text-rose-800">
                          −{simResult.diff.lost.length} {language === 'gu' ? 'સમાપ્ત થયેલ યોજનાઓ' : language === 'hi' ? 'समाप्त योजनाएं' : 'Lost Schemes'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-auto">
                        {simResult.diff.unchanged_count} {language === 'gu' ? 'યથાવત રહેલી યોજનાઓ' : language === 'hi' ? 'यथावत योजनाएं' : 'Retained Untouched'}
                      </div>
                    </div>

                    {/* Gained Schemes */}
                    {simResult.diff.gained.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-emerald-600" /> {language === 'gu' ? 'સક્રિય રીતે અનલૉક થયેલા લાભો:' : language === 'hi' ? 'सक्रिय रूप से अनलॉक हुए लाभ:' : 'Proactively Unlocked Benefits:'}
                        </h4>
                        <div className="space-y-2">
                          {simResult.diff.gained.map((g, idx) => (
                            <motion.div
                              key={`${g.scheme_id}-${g.member_name || idx}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-emerald-950">
                                    {language === 'gu' && g.scheme_name_gu ? g.scheme_name_gu : language === 'hi' && g.scheme_name_hi ? g.scheme_name_hi : g.scheme_name}
                                  </p>
                                  <p className="text-xs text-emerald-800/80 mt-0.5">{g.description}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-200 text-emerald-900 shrink-0">
                                  {g.benefit}
                                </span>
                              </div>
                              {g.member_name && (
                                <p className="text-[11px] font-medium text-emerald-700">
                                  {language === 'gu' ? 'લાભાર્થી:' : language === 'hi' ? 'लाभार्थी:' : 'Beneficiary:'} {g.member_name}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lost Schemes */}
                    {simResult.diff.lost.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Minus className="w-4 h-4 text-rose-600" /> {language === 'gu' ? 'સમાપ્ત થયેલ યોજનાઓ:' : language === 'hi' ? 'समाप्त योजनाएं:' : 'Discontinued / Phase-Out Schemes:'}
                        </h4>
                        <div className="space-y-2">
                          {simResult.diff.lost.map((l, idx) => (
                            <motion.div
                              key={`${l.scheme_id}-${l.member_name || idx}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-rose-950">
                                    {language === 'gu' && l.scheme_name_gu ? l.scheme_name_gu : language === 'hi' && l.scheme_name_hi ? l.scheme_name_hi : l.scheme_name}
                                  </p>
                                  <p className="text-xs text-rose-800/80 mt-0.5">{l.description}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-200 text-rose-900 shrink-0">
                                  {l.benefit}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {simResult.diff.gained.length === 0 && simResult.diff.lost.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4 bg-slate-50 rounded-lg">
                        {language === 'gu'
                          ? 'આ ચોક્કસ ઘટનાથી કુટુંબના વર્તમાન પરિમાણો હેઠળ કોઈ પાત્રતા ફેરફાર થયો નથી.'
                          : language === 'hi'
                          ? 'इस विशेष घटना से परिवार के वर्तमान मापदंडों में कोई पात्रता परिवर्तन नहीं हुआ।'
                          : 'This specific event produced no eligibility delta under current family demographic and financial parameters.'}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. TIMELINE TAB */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Historical Audit Trail */}
            <Card className="border shadow-xs">
              <CardHeader className="p-4 border-b border-border bg-slate-50/50">
                <CardTitle className="text-sm font-semibold">
                  {language === 'gu' ? 'ઐતિહાસિક ઘટના ઓડિટ ટ્રાયલ' : language === 'hi' ? 'ऐतिहासिक घटना ऑडिट ट्रेल' : 'Historical Event Audit Trail'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {language === 'gu' ? 'આ કુટુંબ ID પર પ્રમાણિત કરાયેલ પાછલી જીવન ઘટનાઓ' : language === 'hi' ? 'इस परिवार आईडी पर दर्ज सत्यापित जीवन घटनाएं' : 'Past verified life events committed to this Family ID'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {event_history.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    {language === 'gu'
                      ? 'હજુ સુધી કોઈ ઐતિહાસિક ઘટનાઓ નોંધાયેલી નથી. ઓડિટ એન્ટ્રી નોંધવા માટે સિમ્યુલેટેડ ઇવેન્ટ લાગુ કરો.'
                      : language === 'hi'
                      ? 'अभी तक कोई ऐतिहासिक घटना दर्ज नहीं है। ऑडिट प्रविष्टि दर्ज करने के लिए सिमुलेशन लागू करें।'
                      : 'No historical events recorded yet. Commit a simulated event to log an audit entry.'}
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {event_history.map(evt => (
                      <div key={evt.id} className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
                        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-800">{evt.event_label}</span>
                            <span className="text-[10px] text-muted-foreground">{formatDate(evt.applied_at)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {evt.eligibility_changes.gained.map((g, gIdx) => (
                              <span key={`${g}-${gIdx}`} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                                + {g}
                              </span>
                            ))}
                            {evt.eligibility_changes.lost.map((l, lIdx) => (
                              <span key={`${l}-${lIdx}`} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-medium">
                                − {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Predictive Milestones */}
            <Card className="border shadow-xs">
              <CardHeader className="p-4 border-b border-border bg-slate-50/50">
                <CardTitle className="text-sm font-semibold">
                  {language === 'gu' ? 'આગામી જીવન સંક્રમણો (પ્રિડિક્ટિવ)' : language === 'hi' ? 'आगामी जीवन पड़ाव (पूर्वानुमान)' : 'Predictive Life Milestones'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {language === 'gu' ? 'સિસ્ટમ દ્વારા સુનિશ્ચિત ભવિષ્યના આપમેળે સંક્રમણો' : language === 'hi' ? 'प्रणाली द्वारा स्वचालित भावी संक्रमण' : 'Automated future transitions scheduled by the system'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {upcomingMilestones.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    {language === 'gu' ? 'કોઈ આગામી વય સંક્રમણો બાકી નથી.' : language === 'hi' ? 'कोई आगामी आयु संक्रमण शेष नहीं है।' : 'No upcoming age transitions.'}
                  </p>
                ) : (
                  upcomingMilestones.map((milestone, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/30 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-indigo-950">{milestone.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                            {language === 'gu' ? `${milestone.yearsAway} વર્ષમાં` : language === 'hi' ? `${milestone.yearsAway} वर्ष में` : `In ${milestone.yearsAway} year${milestone.yearsAway > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-800/80">{milestone.benefitNote}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[11px] h-7 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
                        onClick={() => {
                          setSelectedEvent(milestone.targetAge === 18 ? 'member_turns_18' : 'member_turns_60');
                          setSelectedMember(milestone.member.member_id);
                          setActiveTab('simulator');
                        }}
                      >
                        {language === 'gu' ? 'ચકાસો' : language === 'hi' ? 'जांचें' : 'Fast-Forward'}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Scheme Detail Inspection Modal */}
      <Dialog open={!!inspectedScheme} onOpenChange={(open) => !open && setInspectedScheme(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inspectedScheme ? getSchemeCategoryColor(inspectedScheme.category) : ''}`}>
                {inspectedScheme?.category}
              </span>
              <DialogTitle className="text-base font-bold text-foreground">
                {inspectedScheme && (language === 'gu' && inspectedScheme.name_gu ? inspectedScheme.name_gu : language === 'hi' && inspectedScheme.name_hi ? inspectedScheme.name_hi : inspectedScheme.name)}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {language === 'gu' ? 'સત્તાવાર ગુજરાત અને કેન્દ્રીય કલ્યાણ યોજનાના માપદંડ' : language === 'hi' ? 'आधिकारिक गुजरात और केंद्रीय कल्याण योजना मापदंड' : 'Official Gujarat & Central Welfare Scheme Criteria'}
            </DialogDescription>
          </DialogHeader>

          {inspectedScheme && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-emerald-800">
                  {language === 'gu' ? 'લાભ વિગતો' : language === 'hi' ? 'लाभ विवरण' : 'Benefit Specification'}
                </p>
                <p className="text-sm font-extrabold text-emerald-950 mt-0.5">
                  {language === 'gu' && inspectedScheme.benefit_gu ? inspectedScheme.benefit_gu : language === 'hi' && inspectedScheme.benefit_hi ? inspectedScheme.benefit_hi : inspectedScheme.benefit}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-1">
                  {language === 'gu' ? 'યોજના ઝાંખી' : language === 'hi' ? 'योजना सारांश' : 'Scheme Overview'}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'gu' && inspectedScheme.description_gu ? inspectedScheme.description_gu : language === 'hi' && inspectedScheme.description_hi ? inspectedScheme.description_hi : inspectedScheme.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {language === 'gu' ? 'મૂલ્યાંકન સ્તર' : language === 'hi' ? 'मूल्यांकन स्तर' : 'Evaluation Scope'}
                  </p>
                  <p className="font-semibold capitalize text-slate-800">{inspectedScheme.scope}-level predicate</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {language === 'gu' ? 'મુખ્ય ફિલ્ડ્સ' : language === 'hi' ? 'मुख्य कारक फ़ीલ્ડ्स' : 'Key Trigger Fields'}
                  </p>
                  <p className="font-mono text-[11px] text-slate-800">{inspectedScheme.triggering_fields.join(', ')}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="font-semibold text-slate-800">
                  {language === 'gu' ? 'આગળનાં પગલાં અને અરજી પ્રક્રિયા' : language === 'hi' ? 'अगले कदम एवं आवेदन प्रक्रिया' : 'Next Steps & Application Procedure'}
                </p>
                <p className="text-muted-foreground leading-relaxed p-2.5 rounded-lg border bg-white">
                  {inspectedScheme.next_steps}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Official Digital Smart Card Modal */}
      <DigitalCardModal
        isOpen={showSmartCard}
        onClose={() => setShowSmartCard(false)}
        family={family}
      />
    </div>
  );
}
