'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users, ShieldAlert, MessageCircleQuestion, Fingerprint,
  TrendingUp, CheckCircle2, AlertTriangle, MapPin, ArrowRight,
  Sparkles, Zap, ShieldCheck, HelpCircle, Activity, ChevronRight,
  Search, Award, FileText, Filter, IndianRupee, Building2, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { LandingPage } from '@/components/landing/landing-page';
import { schemeRules } from '@/lib/schemes';
import { SpotlightCard } from '@/components/effects/spotlight-card';
import { ShinyText } from '@/components/effects/shiny-text';
import { BorderBeam } from '@/components/effects/border-beam';
import { AnimatedCounter } from '@/components/effects/animated-counter';
import { AuroraGlow } from '@/components/effects/aurora-glow';

interface DashboardStats {
  total_families: number;
  total_members: number;
  total_schemes_tracked: number;
  total_eligible_benefits: number;
  flagged_duplicates: number;
  districts_covered: number;
  state_metrics?: {
    citizens_monitored: string;
    households_connected: string;
    gujarat_districts: string;
    state_schemes: string;
    proactive_disbursals: string;
  };
  data_source?: string;
}

export default function DashboardPage() {
  const { user, isCitizen, isAdmin, isLoading } = useAuth();
  const { language } = useLanguage();
  const [schemeSearch, setSchemeSearch] = useState('');
  const [selectedSchemeCategory, setSelectedSchemeCategory] = useState('all');
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
    enabled: Boolean(user), // Only fetch stats when authenticated
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] text-slate-600 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="font-semibold text-slate-700">
            {language === 'gu'
              ? 'ગુજરાત ડિજિટલ ઓળખ ચકાસણી...'
              : language === 'hi'
              ? 'गुजरात डिजिटल पहचान सत्यापन...'
              : 'Verifying Gujarat Digital Credentials...'}
          </span>
        </div>
      </div>
    );
  }

  // If visitor is not logged in, render the official Government of Gujarat Landing Portal!
  if (!user) {
    return <LandingPage />;
  }

  const statCards = [
    {
      label: language === 'gu' ? 'પરિવાર રજિસ્ટ્રી' : language === 'hi' ? 'परिवार पंजीयन' : 'Families in Registry',
      value: stats?.total_families ?? 50,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: language === 'gu' ? 'કુલ નાગરિકો' : language === 'hi' ? 'कुल नागरिक' : 'Individual Citizens',
      value: stats?.total_members ?? 192,
      icon: Fingerprint,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: language === 'gu' ? 'ગુજરાત યોજનાઓ' : language === 'hi' ? 'गुजरात योजनाएं' : 'Gujarat Schemes Tracked',
      value: stats?.total_schemes_tracked ?? 20,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: language === 'gu' ? 'સક્રિય પાત્ર લાભો' : language === 'hi' ? 'सक्रिय पात्र लाभ' : 'Active Eligible Benefits',
      value: stats?.total_eligible_benefits ?? 176,
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: language === 'gu' ? 'ડુપ્લિકેશન ચેતવણીઓ' : language === 'hi' ? 'डुप्लीकेशन अलर्ट' : 'Integrity Alerts Flagged',
      value: stats?.flagged_duplicates ?? 5,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: language === 'gu' ? 'મોનિટર થયેલ જિલ્લાઓ' : language === 'hi' ? 'निगरानी जिले' : 'Districts Monitored',
      value: stats?.districts_covered ?? 20,
      icon: MapPin,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  // Dynamic modules adapted specifically for Citizen vs Administrative Officer
  const modules = isCitizen
    ? [
        {
          title: language === 'gu' ? 'સક્રિય પાત્રતા અને જીવન ઘટનાઓ' : language === 'hi' ? 'सक्रिय पात्रता एवं जीवन घटनाएं' : 'Proactive Eligibility & Life Events',
          subtitle: language === 'gu' ? 'જીવન સંક્રમણો' : language === 'hi' ? 'जीवन संक्रमण' : 'Life Transitions',
          tag: language === 'gu' ? 'સ્વચાલિત લાભ' : language === 'hi' ? 'स्वचालित लाभ' : 'Auto-Benefits',
          description: language === 'gu'
            ? 'બાળકનો જન્મ, ૬૦મો જન્મદિવસ, વિધવા સહાય જેવી ઘટનાઓ નોંધાતા જ તમારા કુટુંબ માટે નવા સરકારી લાભો આપમેળે સક્રિય થાય છે.'
            : language === 'hi'
            ? 'शिशु जन्म, 60वां जन्मदिन, विधवा सहायता जैसी घटनाएं दर्ज होते ही आपके परिवार हेतु नए सरकारी लाभ स्वतः सक्रिय होते हैं।'
            : 'Childbirth, senior birthdays, and status transitions instantly trigger new government welfare entitlements for your household with zero queues.',
          href: `/families/${user?.family_id || '240100000001'}`,
          actionText: language === 'gu' ? 'મારા પરિવારનું પોર્ટલ ખોલો' : language === 'hi' ? 'मेरे परिवार का पोर्टल खोलें' : 'Open My Household Portal',
          icon: Zap,
          accent: 'border-amber-300 hover:border-amber-400',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
          bgGrad: 'from-amber-50/50 to-orange-50/20',
        },
        {
          title: language === 'gu' ? 'ડિજિટલ સ્માર્ટ કાર્ડ અને રેશન ક્વોટા' : language === 'hi' ? 'डिजिटल स्मार्ट कार्ड एवं राशन कोटा' : 'Digital Smart Card & Ration Quota',
          subtitle: language === 'gu' ? 'સ્માર્ટ રેશન કવચ' : language === 'hi' ? 'स्मार्ट राशन कवर' : 'Smart Ration Cover',
          tag: language === 'gu' ? 'QR e-KYC' : language === 'hi' ? 'QR e-KYC' : 'QR e-KYC',
          description: language === 'gu'
            ? 'તમારું સત્તાવાર ગુજરાત સ્માર્ટ ફેમિલી કાર્ડ જુઓ, ૧૦૦% આધાર e-KYC ચકાસણી અને માસિક NFSA અનાજ ક્વોટાની ખાતરી કરો.'
            : language === 'hi'
            ? 'अपना आधिकारिक गुजरात स्मार्ट परिवार कार्ड देखें, 100% आधार e-KYC सत्यापन एवं मासिक NFSA राशन कोटा जांचें।'
            : 'Inspect your official Gujarat Smart Family Card, verify 100% Aadhaar e-KYC linkage, and view your monthly subsidized NFSA foodgrains.',
          href: `/families/${user?.family_id || '240100000001'}`,
          actionText: language === 'gu' ? 'સ્માર્ટ કાર્ડ અને રેશન જુઓ' : language === 'hi' ? 'स्मार्ट कार्ड एवं राशन देखें' : 'View Smart Card & Quota',
          icon: ShieldCheck,
          accent: 'border-indigo-300 hover:border-indigo-400',
          badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          bgGrad: 'from-indigo-50/50 to-blue-50/20',
        },
        {
          title: language === 'gu' ? 'ત્રિભાષી નાગરિક સહાયક અને માર્ગદર્શક' : language === 'hi' ? 'त्रिभाषी नागरिक सहायक एवं गाइड' : 'Trilingual Citizen Discovery Assistant',
          subtitle: language === 'gu' ? 'અવાજ અને સુલભતા' : language === 'hi' ? 'ध्वनि एवं सुगमता' : 'Voice & Accessibility',
          tag: language === 'gu' ? 'ત્રિભાષી TTS' : language === 'hi' ? 'त्रिभाषी TTS' : 'Trilingual TTS',
          description: language === 'gu'
            ? 'ગુજરાતી, હિન્દી અને અંગ્રેજીમાં બોલતો ડિજિટલ સહાયક, જે સામાન્ય પ્રશ્નો પૂછી કુટુંબ માટે યોગ્ય ૨૦ યોજનાઓ શોધે છે.'
            : language === 'hi'
            ? 'गुजराती, हिन्दी और अंग्रेजी में बोलने वाला डिजिटल सहायक, जो सरल सवाल पूछकर परिवार के लिए 20 उपयुक्त योजनाएं खोजता है।'
            : 'Plain-language, 100% dynamic questionnaire in English, Hindi, and Gujarati with native Web Speech synthesis for inclusive citizen welfare discovery.',
          href: '/assistant',
          actionText: language === 'gu' ? 'માર્ગદર્શિત મૂલ્યાંકન શરૂ કરો' : language === 'hi' ? 'मार्गदर्शित मूल्यांकन शुरू करें' : 'Start Guided Assessment',
          icon: MessageCircleQuestion,
          accent: 'border-emerald-300 hover:border-emerald-400',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          bgGrad: 'from-emerald-50/50 to-teal-50/20',
        },
      ]
    : [
        {
          title: language === 'gu' ? 'સક્રિય પાત્રતા પરિવર્તન ડિટેક્ટર' : language === 'hi' ? 'સક્રિય पात्रता परिवर्तन डिटेक्टर' : 'Proactive Eligibility Change Detector',
          subtitle: language === 'gu' ? 'સક્રિય બુદ્ધિમત્તા' : language === 'hi' ? 'સક્રિય बुद्धिमत्ता' : 'Proactive Intelligence',
          tag: language === 'gu' ? 'જીવન સંક્રમણો' : language === 'hi' ? 'जीवन संक्रमण' : 'Life Transitions',
          description: language === 'gu'
            ? 'બાળકનો જન્મ, ૬૦મો જન્મદિવસ, વિધવા સહાય, આવક ઘટાડો જેવી ઘટનાઓ આપમેળે શોધી નવા સરકારી લાભો સક્રિય કરે છે.'
            : language === 'hi'
            ? 'शिशु जन्म, 60वां जन्मदिन, विधवा सहायता, आय में कमी जैसी घटनाओं को स्वचालित रूप से पहचान कर नए लाभ सक्रिय करता है।'
            : 'Notice life transitions (childbirth, 60th birthday, widowhood, income drops) and compute instant before/after eligibility deltas with zero manual citizen searching.',
          href: '/families/240100000001',
          actionText: language === 'gu' ? 'પટેલ પરિવાર લાઈવ સિમ્યુલેટર ખોલો' : language === 'hi' ? 'पटेल परिवार लाइव सिमुलेटर खोलें' : 'Launch Live Simulator (Patel Family)',
          icon: Zap,
          accent: 'border-amber-300 hover:border-amber-400',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
          bgGrad: 'from-amber-50/50 to-orange-50/20',
        },
        {
          title: language === 'gu' ? 'રજિસ્ટ્રી ડુપ્લિકેશન નિવારણ અને શુદ્ધતા' : language === 'hi' ? 'पंजीयन डुप्लीकेशन निवारण एवं शुद्धता' : 'Registry Deduplication & Integrity',
          subtitle: language === 'gu' ? 'શુદ્ધતા એન્જિન' : language === 'hi' ? 'સત્યનિષ્ઠા इंजन' : 'Integrity Engine',
          tag: language === 'gu' ? 'સંભાવનાત્મક મેચિંગ' : language === 'hi' ? 'संभाव्यता मिलान' : 'Probabilistic Matching',
          description: language === 'gu'
            ? 'ધ્વન્યાત્મક નામો, ફોન નંબર, જન્મ તારીખ અને સરનામાની મદદથી નકલી અથવા ડુપ્લિકેટ રેશન કાર્ડ રેકોર્ડ્સ પકડી પાડે છે.'
            : language === 'hi'
            ? 'ध्वन्यात्मक नाम, फोन नंबर, जन्म तिथि एवं पते के आधार पर फर्जी या डुप्लीकेट राशन कार्ड रिकॉर्ड की पहचान करता है।'
            : 'Detect duplicate family registrations across phonetic name variations, shared phone numbers, DOB clusters, and normalized street addresses.',
          href: '/integrity',
          actionText: language === 'gu' ? 'શંકાસ્પદ જોડીઓની તપાસ કરો' : language === 'hi' ? 'संदिग्ध प्रविष्टियों की जांच करें' : 'Investigate Flagged Pairs',
          icon: ShieldAlert,
          accent: 'border-rose-300 hover:border-rose-400',
          badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
          bgGrad: 'from-rose-50/50 to-pink-50/20',
        },
        {
          title: language === 'gu' ? 'ત્રિભાષી નાગરિક સહાયક અને માર્ગદર્શક' : language === 'hi' ? 'त्रिभाषी नागरिक सहायक एवं गाइड' : 'Trilingual Citizen Discovery Assistant',
          subtitle: language === 'gu' ? 'અવાજ અને સુલભતા' : language === 'hi' ? 'ध्वनि एवं सुगमता' : 'Voice & Accessibility',
          tag: language === 'gu' ? 'ત્રિભાષી TTS' : language === 'hi' ? 'त्रिभाषी TTS' : 'Trilingual TTS',
          description: language === 'gu'
            ? 'ગુજરાતી, હિન્દી અને અંગ્રેજીમાં બોલતો ડિજિટલ સહાયક, જે સામાન્ય પ્રશ્નો પૂછી કુટુંબ માટે યોગ્ય ૨૦ યોજનાઓ શોધે છે.'
            : language === 'hi'
            ? 'गुजराती, हिन्दी और अंग्रेजी में बोलने वाला डिजिटल सहायक, जो सरल सवाल पूछकर परिवार के लिए 20 उपयुक्त योजनाएं खोजता है।'
            : 'Plain-language, 100% dynamic questionnaire in English, Hindi, and Gujarati with native Web Speech synthesis for inclusive citizen welfare discovery.',
          href: '/assistant',
          actionText: language === 'gu' ? 'માર્ગદર્શિત મૂલ્યાંકન શરૂ કરો' : language === 'hi' ? 'मार्गदर्शित मूल्यांकन शुरू करें' : 'Start Guided Assessment',
          icon: MessageCircleQuestion,
          accent: 'border-emerald-300 hover:border-emerald-400',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          bgGrad: 'from-emerald-50/50 to-teal-50/20',
        },
      ];

  // Filter schemes for the Schemes Directory
  const filteredSchemes = schemeRules.filter((scheme) => {
    const matchesCategory = selectedSchemeCategory === 'all' || scheme.category === selectedSchemeCategory;
    const query = schemeSearch.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesName =
      scheme.name.toLowerCase().includes(query) ||
      (scheme.name_hi && scheme.name_hi.toLowerCase().includes(query)) ||
      (scheme.name_gu && scheme.name_gu.toLowerCase().includes(query)) ||
      scheme.id.toLowerCase().includes(query) ||
      scheme.description.toLowerCase().includes(query) ||
      scheme.benefit.toLowerCase().includes(query);

    return matchesCategory && matchesName;
  });

  const schemeCategories = [
    { id: 'all', label: language === 'gu' ? 'તમામ (૨૦)' : language === 'hi' ? 'सभी (20)' : 'All (20)' },
    { id: 'health', label: language === 'gu' ? 'આરોગ્ય' : language === 'hi' ? 'स्वास्थ्य' : 'Health' },
    { id: 'education', label: language === 'gu' ? 'શિક્ષણ' : language === 'hi' ? 'शिक्षा' : 'Education' },
    { id: 'pension', label: language === 'gu' ? 'પેન્શન' : language === 'hi' ? 'पेंशन' : 'Pensions' },
    { id: 'housing', label: language === 'gu' ? 'આવાસ' : language === 'hi' ? 'आवास' : 'Housing' },
    { id: 'nutrition', label: language === 'gu' ? 'અન્ન & રેશન' : language === 'hi' ? 'अन्न एवं राशन' : 'Food & PDS' },
    { id: 'agriculture', label: language === 'gu' ? 'કૃષિ' : language === 'hi' ? 'कृषि' : 'Agriculture' },
    { id: 'maternity', label: language === 'gu' ? 'માતૃત્વ' : language === 'hi' ? 'मातृत्व' : 'Maternity' },
    { id: 'disability', label: language === 'gu' ? 'દિવ્યાંગ' : language === 'hi' ? 'दिव्यांग' : 'Disability' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'gu' ? 'શુભ સવાર' : language === 'hi' ? 'शुभ प्रभात' : 'Good Morning';
    if (hour < 17) return language === 'gu' ? 'શુભ બપોર' : language === 'hi' ? 'शुभ दोपहर' : 'Good Afternoon';
    return language === 'gu' ? 'શુભ સંધ્યા' : language === 'hi' ? 'शुभ संध्या' : 'Good Evening';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner (Subtle Warm Sandstone Alabaster with Somnath Teal Accent) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#FAF7F0] to-[#F5EFE4] p-8 lg:p-10 text-slate-900 shadow-sm border border-[#E8E3DA]">
        {/* ReactBits Ambient Organic Aurora Glow */}
        <AuroraGlow intensity="subtle" />

        {/* ReactBits Dynamic Light Beam */}
        <BorderBeam size={280} duration={12} colorFrom="#133B42" colorTo="#D46E38" />

        {/* Decorative Tricolor Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D46E38] via-[#FAF8F2] to-[#28604A] opacity-90" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FBF4EC] text-[#9A4215] border border-[#EBD6C8] shadow-2xs">
              <Fingerprint className="w-3.5 h-3.5 text-amber-800" />
              {language === 'gu'
                ? 'ગુજરાત ડિજિટલ પરિવાર પોર્ટલ · જન કલ્યાણ મિશન'
                : language === 'hi'
                ? 'गुजरात डिजिटल परिवार पोर्टल · जन कल्याण मिशन'
                : 'Gujarat Family Portal · Citizen Welfare Direct Mission'}
            </span>
            {user && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                isCitizen
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-amber-100 text-amber-950 border border-amber-300'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isCitizen
                  ? (language === 'gu' ? `નાગરિક કુટુંબ ID: ${user.family_id}` : language === 'hi' ? `नागरिक परिवार ID: ${user.family_id}` : `Citizen Household ID: ${user.family_id}`)
                  : (language === 'gu' ? 'અધિકૃત પંચાયત તલાટી અધિકારી' : language === 'hi' ? 'अधिकृत पंचायत तलाटी अधिकारी' : 'Verified Talati Officer')}
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-[#133B42]">
            {user ? (
              <>
                {getGreeting()},{' '}
                <ShinyText
                  text={user.full_name}
                  className="font-extrabold text-[#D46E38]"
                  shimmerColor="rgba(229, 181, 104, 0.9)"
                />
                .
                <br />
                <span className="text-slate-800 text-2xl lg:text-3xl font-bold">
                  {isCitizen
                    ? (language === 'gu' ? 'તમારા કુટુંબના તમામ સરકારી લાભો અને રેશન વિગતો.' : language === 'hi' ? 'आपके परिवार के सभी सरकारी लाभ एवं राशन विवरण।' : 'All Government Entitlements & Ration Quota for Your Household.')
                    : (language === 'gu' ? 'પંચાયત રજિસ્ટ્રી ઓડિટ અને સક્રિય કલ્યાણ સેવાઓ.' : language === 'hi' ? 'पंचायत पंजीयन ऑडिट एवं सक्रिय कल्याण सेवाएं।' : 'Panchayat Registry Oversight & Proactive Welfare Audit.')}
                </span>
              </>
            ) : (
              <>
                Gujarat Family ID
                <br />
                <span className="text-[#D46E38]">
                  One Family, One Identity, Complete Welfare for Every Household.
                </span>
              </>
            )}
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed max-w-2xl font-normal">
            {isCitizen
              ? (language === 'gu'
                ? 'તમે ગુજરાત ડિજિટલ પરિવાર પોર્ટલમાં પ્રવેશેલ છો. અહીં તમે તમામ ૨૦ કલ્યાણકારી યોજનાઓ, જીવન ઘટના સિમ્યુલેશન અને રેશન અનાજ જથ્થાની માહિતી મેળવી શકો છો.'
                : language === 'hi'
                ? 'आप गुजरात डिजिटल परिवार पोर्टल में लॉगिन हैं। यहां आप सभी 20 कल्याणकारी योजनाओं, जीवन घटना सिमुलेशन एवं राशन खाद्यान्न कोटा की जानकारी प्राप्त कर सकते हैं।'
                : 'Welcome to your verified Gujarat Family Portal. Track your 20 state welfare entitlements, simulate life transitions like childbirth and senior pensions, and download your official Gujarat Smart Family Card.')
              : (language === 'gu'
                ? 'ગુજરાતના પરિવારો માટે ૨૦ કલ્યાણકારી યોજનાઓનું સક્રિય ડિજિટલ વિતરણ નેટવર્ક. જીવન સંક્રમણો સાથે આપમેળે લાભો સક્રિય થાય છે — શૂન્ય કાગળકામ અને સંપૂર્ણ પારદર્શિતા.'
                : language === 'hi'
                ? 'गुजरात के परिवारों हेतु 20 कल्याणकारी योजनाओं का सक्रिय डिजिटल वितरण नेटवर्क। जीवन परिवर्तनों के साथ स्वतः लाभ सक्रिय होते हैं — शून्य कागजी प्रक्रिया एवं पूर्ण पारदर्शिता।'
                : "Gujarat's proactive citizen welfare delivery network linking households to 20 flagship state & central programs. When life transitions occur, welfare entitlements update automatically — zero paperwork, zero queues, complete civic transparency.")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isCitizen ? (
              <>
                <Link href={`/families/${user?.family_id || '240100000001'}`}>
                  <Button size="sm" className="bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl">
                    <Zap className="w-4 h-4 mr-1.5 fill-amber-400 text-amber-400" />
                    {language === 'gu' ? `મારું કુટુંબ પોર્ટલ (${user?.family_id || '240100000001'})` : language === 'hi' ? `मेरे परिवार का प्रबंधन (${user?.family_id || '240100000001'})` : `Manage My Household (${user?.family_id || '240100000001'})`}
                  </Button>
                </Link>
                <a href="#schemes-directory">
                  <Button size="sm" variant="outline" className="bg-white hover:bg-[#FAF7F0] text-slate-800 border-[#E8E3DA] text-xs h-10 px-5 font-semibold shadow-2xs rounded-xl">
                    <Award className="w-4 h-4 mr-1.5 text-[#D46E38]" />
                    {language === 'gu' ? '૨૦ રાજ્ય યોજનાઓ જુઓ' : language === 'hi' ? '20 राज्य योजनाएं देखें' : 'Browse 20 Welfare Programs'}
                  </Button>
                </a>
                <Link href="/assistant">
                  <Button size="sm" variant="outline" className="bg-white hover:bg-[#FAF7F0] text-slate-800 border-[#E8E3DA] text-xs h-10 px-5 font-semibold shadow-2xs rounded-xl">
                    <MessageCircleQuestion className="w-4 h-4 mr-1.5 text-[#28604A]" />
                    {language === 'gu' ? 'નાગરિક અવાજ સહાયક' : language === 'hi' ? 'नागरिक आवाज सहायक' : 'Citizen Voice Discovery'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/families/240100000001">
                  <Button size="sm" className="bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold text-xs h-10 px-5 shadow-sm rounded-xl">
                    <Zap className="w-4 h-4 mr-1.5 fill-amber-400 text-amber-400" />
                    {language === 'gu' ? 'પટેલ પરિવાર જીવન ઘટના સિમ્યુલેશન' : language === 'hi' ? 'पटेल परिवार जीवन घटना सिमुलेशन' : 'Simulate Patel Family Life Events'}
                  </Button>
                </Link>
                <Link href="/integrity">
                  <Button size="sm" variant="outline" className="bg-white hover:bg-[#FAF7F0] text-slate-800 border-[#E8E3DA] text-xs h-10 px-5 font-semibold shadow-2xs rounded-xl">
                    <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-600" />
                    {language === 'gu' ? 'ડુપ્લિકેશન ઓડિટ જુઓ' : language === 'hi' ? 'डुप्लीकेशन ऑडिट देखें' : 'Audit Registry Deduplication'}
                  </Button>
                </Link>
                <Link href="/assistant">
                  <Button size="sm" variant="outline" className="bg-white hover:bg-[#FAF7F0] text-slate-800 border-[#E8E3DA] text-xs h-10 px-5 font-semibold shadow-2xs rounded-xl">
                    <MessageCircleQuestion className="w-4 h-4 mr-1.5 text-[#28604A]" />
                    {language === 'gu' ? 'નાગરિક અવાજ સહાયક' : language === 'hi' ? 'नागरिक आवाज सहायक' : 'Citizen Voice Discovery'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((stat) => (
          <SpotlightCard
            key={stat.label}
            spotlightColor="rgba(19, 59, 66, 0.08)"
            spotlightSize={200}
            className="border border-[#E8E3DA] shadow-2xs hover:shadow-xs transition-all bg-white"
          >
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-md ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <Activity className="w-3 h-3 text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  <AnimatedCounter to={typeof stat.value === 'number' ? stat.value : parseInt(stat.value, 10)} />
                </p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* The 3 Core Civic Pillars */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {language === 'gu'
              ? 'ગુજરાત પરિવાર ID ના ૩ મુખ્ય સ્તંભો'
              : language === 'hi'
              ? 'गुजरात परिवार ID के 3 मुख्य स्तंभ'
              : 'The Three Core Pillars of Gujarat Family ID'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {language === 'gu'
              ? 'એકીકૃત ડેક્લેરેટિવ એન્જિન — સક્રિય જીવન સિમ્યુલેશન, ડુપ્લિકેશન નિવારણ અને નાગરિક શોધ વચ્ચે શૂન્ય કાગળકામ.'
              : language === 'hi'
              ? 'एकीकृत नीति इंजन — सक्रिय जीवन सिमुलेशन, डुप्लीकेशन रोकथाम और नागरिक खोज में शून्य कागजी प्रक्रिया।'
              : 'Architected around a shared declarative engine — zero paperwork across proactive simulations, deduplication, and citizen discovery.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <Card
              key={mod.title}
              className={`border ${mod.accent} shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden bg-gradient-to-b ${mod.bgGrad}`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${mod.badgeColor}`}>
                    {mod.tag}
                  </Badge>
                  <span className="text-[10px] font-mono font-semibold text-slate-500">{mod.subtitle}</span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                  {mod.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {mod.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <Link href={mod.href}>
                  <Button size="sm" className="w-full text-xs font-bold h-9 bg-[#133B42] text-white hover:bg-[#1A4B54] shadow-xs">
                    {mod.actionText}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Architectural Value Callout */}
      <Card className="border border-[#E8E3DA] bg-[#FAF7F0] shadow-xs">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#133B42]" />
            <CardTitle className="text-sm font-bold text-slate-900">
              {language === 'gu'
                ? 'પરંપરાગત સરકારી પોર્ટલ કરતાં આ કેમ અલગ છે?'
                : language === 'hi'
                ? 'पारंपरिक सरकारी पोर्टलों से यह भिन्न क्यों है?'
                : 'Why This Differs From Standard Government Portals'}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-600">
            {language === 'gu'
              ? 'સામાન્ય પોર્ટલમાં નાગરિકે જાતે યોજનાઓ શોધવી પડે છે. ફેમિલી આઈડી કોપાયલટ પ્રક્રિયાને આપમેળે નાગરિક સુધી પહોંચાડે છે:'
              : language === 'hi'
              ? 'पारंपरिक पोर्टलों में नागरिक को स्वयं योजनाएं खोजनी पड़ती हैं। फैमिली आईडी कोपायलट इस प्रक्रिया को स्वतः नागरिक तक पहुँचाता है:'
              : 'Current portals require citizens to actively search, understand complex eligibility legalese, and manually apply. Family ID Copilot reverses the paradigm:'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-1">
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E3DA] space-y-1">
              <span className="font-bold text-[#133B42] block">
                {language === 'gu' ? '૧. સક્રિય (પ્રોએક્ટિવ) સેવા' : language === 'hi' ? '1. सक्रिय (प्रोएक्टिव) सेवा' : '1. Proactive vs Passive'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {language === 'gu'
                  ? 'જન્મ નોંધણી કે ૬૦ વર્ષ પૂર્ણ થતાં જ ફેમિલી ID ડેટાબેઝ આપમેળે યોગ્ય કલ્યાણકારી લાભો કુટુંબને પહોંચાડે છે.'
                  : language === 'hi'
                  ? 'जन्म पंजीकरण या 60 वर्ष पूरे होते ही फैमिली आईडी डेटाबेस स्वतः उपयुक्त कल्याणकारी लाभ परिवार को सूचित करता है।'
                  : 'When a birth is registered or a member turns 60 in the Family ID database, Copilot immediately pushes recommended benefits to the family.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E3DA] space-y-1">
              <span className="font-bold text-[#133B42] block">
                {language === 'gu' ? '૨. અલ્ગોરિધમિક શુદ્ધતા' : language === 'hi' ? '2. एल्गोरिद्मिक सत्यनिष्ठा' : '2. Algorithmic Integrity'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {language === 'gu'
                  ? 'મલ્ટી-સિગ્નલ ફઝી મેચિંગ દ્વારા નકલી રેશન કાર્ડ અને બોગસ રેકોર્ડ્સ પકડી તલાટી સમીક્ષા માટે ફ્લેગ કરે છે.'
                  : language === 'hi'
                  ? 'मल्टी-सिग्नल फज़ी मिलान से फर्जी राशन कार्ड व बोगस रिकॉर्ड्स पकड़कर तलाटी समीक्षा हेतु फ्लैग करता है।'
                  : 'Multi-signal fuzzy matching catches duplicate ration cards and benefits fraud without human bias, flagging suspects for Talati review.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E3DA] space-y-1">
              <span className="font-bold text-[#133B42] block">
                {language === 'gu' ? '૩. માતૃભાષા અને અવાજ સહાય' : language === 'hi' ? '3. मातृभाषा एवं ऑडियो सहायता' : '3. Inclusive Language & Audio'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {language === 'gu'
                  ? 'ગુજરાતી અને હિન્દીમાં ટેક્સ્ટ તથા વોઇસ સ્પીચ દ્વારા ગ્રામીણ અને વંચિત નાગરિકોને પણ સમાન લાભ મળે છે.'
                  : language === 'hi'
                  ? 'गुजराती और हिन्दी में टेक्स्ट तथा वॉइस स्पीच से ग्रामीण व वंचित नागरिकों को भी समान लाभ सुनिश्चित होता है।'
                  : 'Trilingual text & speech in Gujarati and Hindi ensures illiterate or rural citizens are not excluded from constitutional welfare entitlements.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gujarat 20 Flagship Welfare Schemes Directory */}
      <div id="schemes-directory" className="space-y-5 pt-4 scroll-mt-6">
        {/* Official Civic Directory Header */}
        <Card className="border border-slate-300 shadow-sm bg-white overflow-hidden">
          <div className="h-1.5 flex w-full">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-300 flex items-center justify-center text-base shadow-2xs shrink-0">
                    🏛️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black tracking-tight text-[#133B42]">
                        {language === 'gu'
                          ? 'ગુજરાત સરકારની ૨૦ મુખ્ય કલ્યાણકારી યોજનાઓ'
                          : language === 'hi'
                          ? 'गुजरात सरकार की 20 प्रमुख कल्याणकारी योजनाएं'
                          : 'Gujarat 20 Flagship Welfare Programs'}
                      </h2>
                      <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[10px] font-bold">
                        {filteredSchemes.length} / 20 {language === 'gu' ? 'યોજનાઓ' : language === 'hi' ? 'योजनाएं' : 'Schemes'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'gu'
                        ? 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ · ખોરાક અને નાગરિક પુરવઠા · આરોગ્ય અને પરિવાર કલ્યાણ'
                        : language === 'hi'
                        ? 'सामाजिक न्याय एवं अधिकारिता विभाग · खाद्य एवं नागरिक आपूर्ति · स्वास्थ्य एवं परिवार कल्याण'
                        : 'Dept of Social Justice & Empowerment · Food & Civil Supplies · Health & Family Welfare'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl pt-1">
                  {language === 'gu'
                    ? 'ફેમિલી ID એન્જિન સાથે જોડાયેલી તમામ ૨૦ સત્તાવાર યોજનાઓ. આ યોજનાઓ જીવન પરિવર્તનો સાથે આપમેળે મૂલ્યાંકન થાય છે.'
                    : language === 'hi'
                    ? 'फैमिली आईडी इंजन से जुड़ी सभी 20 आधिकारिक योजनाएं। ये योजनाएं जीवन परिवर्तनों के साथ स्वतः मूल्यांकन की जाती हैं।'
                    : 'Explore all 20 public welfare schemes evaluated by the Gujarat Family ID engine. Each scheme is automatically triggered when lifecycle events occur in a household.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/assistant">
                  <Button size="sm" className="text-xs h-9 bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs">
                    <MessageCircleQuestion className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'gu' ? 'પાત્રતા ચકાસો (સહાયક)' : language === 'hi' ? 'पात्रता जांचें (सहायक)' : 'Check Eligibility (Assistant)'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="mt-5 pt-4 border-t border-[#E8E3DA] space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder={
                      language === 'gu'
                        ? 'યોજનાનું નામ, લાભ, અથવા કેટેગરી શોધો...'
                        : language === 'hi'
                        ? 'योजना का नाम, लाभ या वर्ग खोजें...'
                        : 'Search schemes by name, benefits, keywords...'
                    }
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-[#FBF9F5] border-[#E8E3DA]"
                  />
                </div>

                {schemeSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSchemeSearch('')}
                    className="text-xs text-slate-500 h-9"
                  >
                    Clear Search
                  </Button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {schemeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSchemeCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedSchemeCategory === cat.id
                        ? 'bg-[#133B42] text-white shadow-2xs'
                        : 'bg-[#FAF7F0] text-slate-700 hover:bg-[#F3EDE0] border border-[#E8E3DA]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchemes.map((scheme) => {
            const schemeName =
              language === 'gu' && scheme.name_gu
                ? scheme.name_gu
                : language === 'hi' && scheme.name_hi
                ? scheme.name_hi
                : scheme.name;

            const schemeDesc =
              language === 'gu' && scheme.description_gu
                ? scheme.description_gu
                : language === 'hi' && scheme.description_hi
                ? scheme.description_hi
                : scheme.description;

            const schemeBenefit =
              language === 'gu' && scheme.benefit_gu
                ? scheme.benefit_gu
                : language === 'hi' && scheme.benefit_hi
                ? scheme.benefit_hi
                : scheme.benefit;

            const schemeSteps =
              language === 'gu' && scheme.next_steps_gu
                ? scheme.next_steps_gu
                : language === 'hi' && scheme.next_steps_hi
                ? scheme.next_steps_hi
                : scheme.next_steps;

            return (
              <SpotlightCard
                key={scheme.id}
                spotlightColor="rgba(19, 59, 66, 0.06)"
                className="border border-[#E8E3DA] hover:border-[#133B42]/40 shadow-2xs hover:shadow-xs transition-all bg-white flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-300 shadow-2xs">
                        {scheme.id}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-700 bg-white">
                        {scheme.category}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {scheme.scope === 'family' ? '🏠 Family-Level' : '👤 Individual'}
                    </span>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold text-sm text-[#133B42] leading-snug">
                      {schemeName}
                    </h3>

                    {/* Benefit Highlight Box */}
                    <div className="p-2.5 rounded-lg bg-[#EAF3EE] border border-[#C3DEC9] text-[#163F30] space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#28604A] flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#28604A]" />
                        {language === 'gu' ? 'સરકારી સહાય / લાભ:' : language === 'hi' ? 'सरकारी लाभ:' : 'Civic Benefit:'}
                      </span>
                      <p className="text-xs font-semibold leading-relaxed">
                        {schemeBenefit}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {schemeDesc}
                    </p>

                    {schemeSteps && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-[#E8E3DA]">
                        <span className="font-semibold text-slate-700">
                          {language === 'gu' ? 'અમલીકરણ:' : language === 'hi' ? 'कार्यान्वयन:' : 'Fulfillment:'}
                        </span>{' '}
                        {schemeSteps}
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <Link href="/assistant" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs h-8 border-[#E8E3DA] hover:bg-[#FAF7F0] text-slate-700 font-semibold shadow-2xs">
                      {language === 'gu' ? 'પાત્રતા ચકાસો' : language === 'hi' ? 'पात्रता जांचें' : 'Evaluate'}
                    </Button>
                  </Link>
                  <Link href={`/families/${user?.family_id || '240100000001'}`} className="flex-1">
                    <Button size="sm" className="w-full text-xs h-8 bg-[#133B42] hover:bg-[#1A4B54] text-white font-semibold shadow-2xs">
                      {language === 'gu' ? 'કુટુંબમાં જુઓ' : language === 'hi' ? 'परिवार में देखें' : 'View in Family'}
                    </Button>
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
