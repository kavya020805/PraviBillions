'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, Search, Settings2, Eye, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  Sliders, Filter, Check, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Crown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { SpotlightCard } from '@/components/effects/spotlight-card';
import { BorderBeam } from '@/components/effects/border-beam';
import { AnimatedCounter } from '@/components/effects/animated-counter';
import type { DuplicatePair } from '@/lib/types';

interface DuplicatesResponse {
  total_pairs: number;
  pending: number;
  confirmed: number;
  false_positives: number;
  pairs: DuplicatePair[];
}

export default function IntegrityPage() {
  const queryClient = useQueryClient();
  const { user, isCitizen, isAdmin, loginAsDemo, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();
  const [threshold, setThreshold] = useState(50);
  const [nameWeight, setNameWeight] = useState(20);
  const [addressWeight, setAddressWeight] = useState(10);
  const [dobWeight, setDobWeight] = useState(30);
  const [phoneWeight, setPhoneWeight] = useState(40);
  const [showConfig, setShowConfig] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'false_positive'>('all');
  const [selectedPair, setSelectedPair] = useState<DuplicatePair | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery<DuplicatesResponse>({
    queryKey: ['duplicates', threshold, nameWeight, addressWeight, dobWeight, phoneWeight, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        threshold: String(threshold),
        name_weight: String(nameWeight),
        address_weight: String(addressWeight),
        dob_weight: String(dobWeight),
        phone_weight: String(phoneWeight),
        status: statusFilter,
      });
      const res = await fetch(`/api/duplicates?${params}`);
      return res.json();
    },
    enabled: Boolean(isAdmin), // Only fetch when authenticated as admin
  });

  const rescanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan',
          weights: {
            name_weight: nameWeight,
            address_weight: addressWeight,
            dob_weight: dobWeight,
            phone_weight: phoneWeight,
            threshold,
          },
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicates'] });
      setActionNotice(language === 'gu' ? 'નવા વેઇટ્સ સાથે રજીસ્ટ્રી રી-સ્કેન પૂર્ણ થયું.' : language === 'hi' ? 'नवीन वेट्स के साथ रजिस्ट्री पुनः स्कैन पूर्ण हुई।' : 'Registry rescan complete with latest weights.');
      setTimeout(() => setActionNotice(null), 3000);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ pairId, status }: { pairId: string; status: 'confirmed' | 'false_positive' | 'pending' }) => {
      const res = await fetch('/api/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', pair_id: pairId, status }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update audit determination');
      }
      return result;
    },
    onMutate: async ({ pairId, status }) => {
      // Optimistic cache update
      queryClient.setQueriesData<DuplicatesResponse>(
        { queryKey: ['duplicates', threshold, nameWeight, addressWeight, dobWeight, phoneWeight, statusFilter] },
        (old) => {
          if (!old) return old;
          const updatedPairs = old.pairs.map(p =>
            p.id === pairId
              ? {
                  ...p,
                  status,
                  reviewed_at: status === 'pending' ? undefined : new Date().toISOString(),
                }
              : p
          );
          return {
            ...old,
            pairs: updatedPairs,
            pending: updatedPairs.filter(p => p.status === 'pending').length,
            confirmed: updatedPairs.filter(p => p.status === 'confirmed').length,
            false_positives: updatedPairs.filter(p => p.status === 'false_positive').length,
          };
        }
      );
    },
    onSuccess: (_, { pairId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['duplicates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      setSelectedPair(prev => {
        if (!prev || prev.id !== pairId) return prev;
        return {
          ...prev,
          status,
          reviewed_at: status === 'pending' ? undefined : new Date().toISOString(),
        };
      });

      setActionNotice(
        status === 'confirmed'
          ? (language === 'gu' ? 'જોડીને પુષ્ટિ થયેલ ડુપ્લિકેટ તરીકે ચિહ્નિત કરી.' : language === 'hi' ? 'जोड़ी को पुष्ट डुप्लीकेट चिह्नित किया गया।' : 'Pair marked as Confirmed Duplicate.')
          : status === 'false_positive'
          ? (language === 'gu' ? 'જોડીને સાચા કુટુંબ (ખોટા અલાર્મ) તરીકે માન્ય કરી.' : language === 'hi' ? 'जोड़ी को वास्तविक परिवार के रूप में मंजूरी दी गई।' : 'Pair marked as False Positive.')
          : (language === 'gu' ? 'ઓડિટ સ્થિતિ ફરીથી સમીક્ષા બાકીમાં સેટ કરી.' : language === 'hi' ? 'ऑडिट स्थिति पुनः समीक्षा लंबित पर सेट की गई।' : 'Audit status reset to Pending Review.')
      );
      setTimeout(() => setActionNotice(null), 3500);
    },
    onError: (err: any) => {
      setActionNotice(err.message || 'Failed to update status');
      setTimeout(() => setActionNotice(null), 4000);
    },
  });

  const pairs = data?.pairs ?? [];

  const getConfidenceBadge = (score: number) => {
    if (score >= 80) {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs font-bold">
          {score}% {language === 'gu' ? 'ઉચ્ચ જોખમ' : language === 'hi' ? 'उच्च जोखिम' : 'High Risk'}
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-bold">
          {score}% {language === 'gu' ? 'મધ્યમ સંભાવના' : language === 'hi' ? 'मध्यम संभावना' : 'Moderate'}
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-bold">
        {score}% {language === 'gu' ? 'નીચી સંભાવના' : language === 'hi' ? 'कम संभावना' : 'Low Probability'}
      </Badge>
    );
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-rose-500';
    if (score >= 60) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-blue-500';
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        {language === 'gu' ? 'વહીવટી ઓળખ ચકાસાઈ રહી છે...' : language === 'hi' ? 'प्रशासनिक क्रेडेंशियल्स की जांच हो रही है...' : 'Verifying administrative credentials...'}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-rose-300 bg-rose-50/90 p-6 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-700 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <Badge className="bg-rose-200/80 text-rose-900 border-rose-300 text-xs">
              {language === 'gu' ? 'અધિકારી પ્રવેશ જરૂરી' : language === 'hi' ? 'अधिकारी क्रेडेंशियल्स आवश्यक' : 'Officer Credentials Required'}
            </Badge>
            <h2 className="text-xl font-extrabold text-rose-950">
              {language === 'gu' ? 'વહીવટી અખંડિતતા ઓડિટ દ્વાર' : language === 'hi' ? 'प्रशासनिक सत्यनिष्ठा ऑडिट द्वार' : 'Administrative Integrity Gate'}
            </h2>
            <p className="text-xs text-rose-800/90 leading-relaxed">
              {language === 'gu'
                ? 'સંભાવિત ડુપ્લિકેટ શોધો, સાઉન્ડેક્સ ચકાસણી અને બોગસ રેકોર્ડ નિવારણ માટે અધિકૃત તલાટી/અધિકારી લૉગિન જરૂરી છે.'
                : language === 'hi'
                ? 'संभावित डुप्लीकेशन ऑडिट, फजी साउंडेक्स तुलना एवं बोगस रिकॉर्ड्स निवारण हेतु सत्यापित तलाटी अधिकारी क्रेडेंशियल्स आवश्यक हैं।'
                : 'Cross-household probabilistic deduplication audits, fuzzy soundex comparisons, and ghost record detection require verified Talati officer credentials.'}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/login">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs">
                {language === 'gu' ? 'વહીવટી અધિકારી તરીકે સાઇન ઇન કરો' : language === 'hi' ? 'प्रशासनिक अधिकारी के रूप में साइन इन करें' : 'Sign In as Administrative Officer'}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loginAsDemo('admin')}
              className="text-[11px] bg-white border-rose-300 text-rose-950 hover:bg-rose-100"
            >
              <Crown className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              {language === 'gu' ? '૧-ક્લિક ડેમો અધિકારી (તલાટી પટેલ)' : language === 'hi' ? '१-क्लिक डेमो अधिकारी (तलाटी पटेल)' : '1-Click Demo Officer (Bhupendrabhai Patel)'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isCitizen) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <Card className="border-amber-300 bg-amber-50/80 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <Badge className="bg-amber-200/80 text-amber-900 border-amber-300 text-xs">
              {language === 'gu' ? 'અધિકારી ઓડિટ અધિકાર જરૂરી' : language === 'hi' ? 'अधिकारी ऑडिट विशेषाधिकार आवश्यक' : 'Officer Audit Privileges Required'}
            </Badge>
            <h2 className="text-xl font-extrabold text-amber-950">
              {language === 'gu' ? 'વહીવટી ઓડિટ પ્રતિબંધિત' : language === 'hi' ? 'प्रशासनिक ऑडिट प्रतिबंधित' : 'Administrative Audit Restricted'}
            </h2>
            <p className="text-xs text-amber-800/90 max-w-lg mx-auto leading-relaxed">
              {language === 'gu'
                ? 'રાજ્યવ્યાપી ડુપ્લિકેશન નિવારણ અને અલ્ગોરિધમ થ્રેશોલ્ડ ટ્યુનિંગ ફક્ત અધિકૃત તલાટીઓ અને જિલ્લા વહીવટકર્તાઓ પૂરતું મર્યાદિત છે.'
                : language === 'hi'
                ? 'राज्यव्यापी डुप्लीकेशन निवारण और एल्गोरिथ्म थ्रेशोल्ड ट्यूनिंग केवल अधिकृत तलाटी और जिला प्रशासकों तक सीमित है।'
                : 'Cross-household probabilistic deduplication, fuzzy record matching, and threshold tuning are restricted to verified Talati Officers and District Administrators.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link href={`/families/${user?.family_id || '240100000001'}`}>
              <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                {language === 'gu' ? 'મારું કુટુંબ રેકોર્ડ જુઓ' : language === 'hi' ? 'मेरा परिवार रिकॉर्ड देखें' : 'View My Household Record'}
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loginAsDemo('admin')}
              className="text-xs border-amber-400 bg-white text-amber-900 hover:bg-amber-100"
            >
              <Crown className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              {language === 'gu' ? 'તલાટી / એડમિન પ્રોફાઇલમાં સ્વિચ કરો' : language === 'hi' ? 'तलाटी / व्यवस्थापक में बदलें' : 'Switch to Talati / Admin Persona'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E3DA] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              {language === 'gu' ? 'રજીસ્ટ્રી અખંડિતતા' : language === 'hi' ? 'रजिस्ट्री सत्यनिष्ठा' : 'Registry Integrity'}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#133B42]">
              {language === 'gu' ? 'રજીસ્ટ્રી અખંડિતતા અને ડુપ્લિકેશન નિવારણ' : language === 'hi' ? 'रजिस्ट्री सत्यनिष्ठा एवं डुप्लीकेशन निवारण' : 'Registry Integrity & Deduplication'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {language === 'gu'
              ? 'ફઝી નેમ મેચિંગ, ફોન ક્લસ્ટરિંગ, જન્મ તારીખ નિકટતા અને સરનામું સામાન્યીકરણ દ્વારા ગુજરાત ફેમિલી આઈડી ડેટાબેઝમાં સંભવિત ડુપ્લિકેટ્સનું સક્રિય નિવારણ.'
              : language === 'hi'
              ? 'फज़ी नाम मिलान, फोन क्लस्टरिंग, जन्मतिथि निकटता और पता मानकीकरण का उपयोग करके गुजरात परिवार आईडी में संभावित डुप्लीकेट्स का सक्रिय निवारण।'
              : 'Proactive probabilistic deduplication across the Gujarat Family ID database using fuzzy name matching, phone clustering, DOB proximity, and address normalization.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs h-9 border-[#E8E3DA] bg-white hover:bg-[#FAF7F0] text-slate-800"
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            {showConfig
              ? (language === 'gu' ? 'થ્રેશોલ્ડ છુપાવો' : language === 'hi' ? 'थ्रेशोल्ड छिपाएं' : 'Hide Thresholds')
              : (language === 'gu' ? 'વેઇટ્સ અને થ્રેશોલ્ડ ગોઠવો' : language === 'hi' ? 'वेट्स एवं थ्रेशोल्ड ट्यून करें' : 'Tune Weights & Threshold')}
          </Button>

          <Button
            size="sm"
            onClick={() => rescanMutation.mutate()}
            disabled={rescanMutation.isPending || isFetching}
            className="text-xs h-9 bg-[#133B42] text-white hover:bg-[#1A4B54] shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${rescanMutation.isPending || isFetching ? 'animate-spin' : ''}`} />
            {language === 'gu' ? 'સંપૂર્ણ સ્કેન ચલાવો' : language === 'hi' ? 'पूर्ण स्कैन चलाएं' : 'Run Full Scan'}
          </Button>
        </div>
      </div>

      {/* Action Toast / Feedback */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard
          spotlightColor="rgba(19, 59, 66, 0.08)"
          className="border shadow-xs hover:border-slate-300 transition-colors bg-white"
        >
          <div className="p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
              <span>{language === 'gu' ? 'કુલ ચિહ્નિત જોડીઓ' : language === 'hi' ? 'कुल चिह्नित जोड़ियां' : 'Total Flagged Pairs'}</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-foreground">
              <AnimatedCounter to={data?.total_pairs ?? 0} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {language === 'gu' ? 'રજીસ્ટ્રીમાં ક્રોસ-વિશ્લેષિત' : language === 'hi' ? 'रजिस्ट्री में क्रॉस-विश्लेषित' : 'Cross-analyzed in registry'}
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(217, 119, 6, 0.08)"
          className="border border-amber-200/80 bg-amber-50/40 shadow-xs hover:border-amber-300 transition-colors"
        >
          <div className="p-4">
            <div className="flex items-center justify-between text-amber-800 text-xs font-medium mb-1">
              <span>{language === 'gu' ? 'બાકી સમીક્ષા' : language === 'hi' ? 'समीक्षा लंबित' : 'Pending Review'}</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-3xl font-extrabold text-amber-900">
              <AnimatedCounter to={data?.pending ?? 0} />
            </p>
            <p className="text-[11px] text-amber-700/80 mt-1">
              {language === 'gu' ? 'અધિકારી ચકાસણી જરૂરી' : language === 'hi' ? 'अधिकारी सत्यापन आवश्यक' : 'Requiring human verification'}
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(225, 29, 72, 0.08)"
          className="border border-rose-200/80 bg-rose-50/40 shadow-xs hover:border-rose-300 transition-colors"
        >
          <div className="p-4">
            <div className="flex items-center justify-between text-rose-800 text-xs font-medium mb-1">
              <span>{language === 'gu' ? 'પુષ્ટિ થયેલ ડુપ્લિકેટ' : language === 'hi' ? 'पुष्ट डुप्लीकेट' : 'Confirmed Duplicates'}</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-extrabold text-rose-900">
              <AnimatedCounter to={data?.confirmed ?? 0} />
            </p>
            <p className="text-[11px] text-rose-700/80 mt-1">
              {language === 'gu' ? 'ડુપ્લિકેશન માટે ચિહ્નિત' : language === 'hi' ? 'डुप्लीकेशन हेतु चिह्नित' : 'Flagged for deduplication'}
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(40, 96, 74, 0.08)"
          className="border border-emerald-200/80 bg-emerald-50/40 shadow-xs hover:border-emerald-300 transition-colors"
        >
          <div className="p-4">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-medium mb-1">
              <span>{language === 'gu' ? 'સાચા પરિવારો (ક્લિયર)' : language === 'hi' ? 'वास्तविक परिवार (सत्यापित)' : 'False Positives'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-900">
              <AnimatedCounter to={data?.false_positives ?? 0} />
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              {language === 'gu' ? 'સ્વતંત્ર કુટુંબો મંજૂર' : language === 'hi' ? 'स्वतंत्र परिवार स्वीकृत' : 'Cleared independent families'}
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* Collapsible Threshold Tuning */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="relative border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 shadow-xs overflow-hidden">
              <BorderBeam size={260} duration={12} colorFrom="#133B42" colorTo="#E5B568" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {language === 'gu' ? 'ડિટેક્શન સિગ્નલ વેઇટ્સ અને નીતિ' : language === 'hi' ? 'डिटेक्शन सिग्नल वेट्स एवं नीति' : 'Detection Signal Weights & Decision Policy'}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white">
                    {language === 'gu' ? 'સંવેદનશીલતા:' : language === 'hi' ? 'संवेदनशीलता:' : 'Policy Sensitivity:'}{' '}
                    {threshold >= 70
                      ? (language === 'gu' ? 'રૂઢિચુસ્ત (ઓછા એલાર્મ)' : language === 'hi' ? 'रूढ़िवादी (कम अलर्ट)' : 'Conservative (Fewer Alerts)')
                      : threshold >= 45
                      ? (language === 'gu' ? 'સંતુલિત (ભલામણ કરેલ)' : language === 'hi' ? 'संतुलित (अनुशंसित)' : 'Balanced (Recommended)')
                      : (language === 'gu' ? 'આક્રમક (વ્યાપક તપાસ)' : language === 'hi' ? 'आक्रामक (व्यापक खोज)' : 'Aggressive (Broad Capture)')}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-600">
                  {language === 'gu'
                    ? 'આ વેઇટ્સ બદલવાથી તમામ ૫૦ પરિવારોમાં સંભાવના સ્કોર આપમેળે પુનઃ ગણતરી થાય છે.'
                    : language === 'hi'
                    ? 'इन वेट्स को समायोजित करने से सभी ५० परिवारों में स्कोर का पुनः परिकलन होता है।'
                    : 'Adjusting these weights recalculates probabilistic confidence scores dynamically across all 50 families.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-1">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Phone Weight */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">
                        {language === 'gu' ? 'ફોન નંબર સરખો' : language === 'hi' ? 'सटीक फोन मिलान' : 'Phone Exact Match'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{phoneWeight} pts</span>
                    </div>
                    <Slider value={[phoneWeight]} onValueChange={([v]) => setPhoneWeight(v)} min={10} max={50} step={5} />
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'gu' ? 'સામાન્ય સંપર્ક નંબરનો મજબૂત સંકેત.' : language === 'hi' ? 'साझा संपर्क का सर्वाधिक सशक्त संकेत।' : 'Strongest singular indicator of shared household contact.'}
                    </p>
                  </div>

                  {/* DOB Weight */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">
                        {language === 'gu' ? 'મોભી જન્મ તારીખ સરખી' : language === 'hi' ? 'मुखिया जन्मतिथि मिलान' : 'Head DOB Match'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{dobWeight} pts</span>
                    </div>
                    <Slider value={[dobWeight]} onValueChange={([v]) => setDobWeight(v)} min={10} max={40} step={5} />
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'gu' ? 'સમાન જન્મ તારીખ અથવા ટાઇપો તફાવત.' : language === 'hi' ? 'सटीक जन्मतिथि अथवा टाइपो भिन्नता।' : 'Matches exact date of birth or single-digit typo variance.'}
                    </p>
                  </div>

                  {/* Name Weight */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">
                        {language === 'gu' ? 'નામ સમાનતા (લેવેનસ્ટીન)' : language === 'hi' ? 'नाम समानता (लेवेनश्टाइन)' : 'Name Fuzzy Similarity'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{nameWeight} pts</span>
                    </div>
                    <Slider value={[nameWeight]} onValueChange={([v]) => setNameWeight(v)} min={10} max={40} step={5} />
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'gu' ? 'ગુજરાતી નામો પર લેવેનસ્ટીન અને સાઉન્ડેક્સ મેચિંગ.' : language === 'hi' ? 'गुजराती नामों पर लेवेनश्टाइन व साउंडेक्स मिलान।' : 'Levenshtein + Dice coefficient on transliterated Gujarati names.'}
                    </p>
                  </div>

                  {/* Address Weight */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">
                        {language === 'gu' ? 'સરનામું સમાનતા' : language === 'hi' ? 'पता समानता' : 'Address Similarity'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{addressWeight} pts</span>
                    </div>
                    <Slider value={[addressWeight]} onValueChange={([v]) => setAddressWeight(v)} min={5} max={30} step={5} />
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'gu' ? 'સમાન પિનકોડમાં સોસાયટી/શેરીની સરખામણી.' : language === 'hi' ? 'समान पिनकोड में मोहल्ला/सोसायटी मिलान।' : 'Normalized street/society similarity within the same pincode.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex-1 max-w-md space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {language === 'gu' ? 'ન્યૂનતમ ફ્લેગિંગ થ્રેશોલ્ડ' : language === 'hi' ? 'न्यूनतम फ्लैगिंग थ्रेशोल्ड' : 'Minimum Flagging Threshold'}
                      </span>
                      <span className="font-mono font-bold text-indigo-700">{threshold} / 100</span>
                    </div>
                    <Slider value={[threshold]} onValueChange={([v]) => setThreshold(v)} min={25} max={90} step={5} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        setNameWeight(20);
                        setAddressWeight(10);
                        setDobWeight(30);
                        setPhoneWeight(40);
                        setThreshold(50);
                      }}
                    >
                      {language === 'gu' ? 'ડિફૉલ્ટ રીસેટ' : language === 'hi' ? 'डिफ़ॉल्ट रीसेट' : 'Reset Defaults'}
                    </Button>
                    <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => rescanMutation.mutate()}>
                      {language === 'gu' ? 'લાગુ કરો અને પુનઃવિશ્લેષણ' : language === 'hi' ? 'लागू करें और पुनः विश्लेषण' : 'Apply & Re-analyze'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Container */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                {language === 'gu' ? 'ચિહ્નિત સંભવિત ડુપ્લિકેટ નોંધણીઓ' : language === 'hi' ? 'चिह्नित संभावित डुप्लीकेट पंजीकरण' : 'Flagged Potential Duplicate Registrations'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {language === 'gu'
                  ? `વર્તમાન મોડેલ આધારે મૂલ્યાંકન (${threshold}+ સંભાવના સ્કોર)`
                  : language === 'hi'
                  ? `वर्तमान मॉडल अनुसार मूल्यांकन (${threshold}+ संभावना स्कोर)`
                  : `Evaluated against current scoring model (${threshold}+ confidence score)`}
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as any)}
              className="w-auto"
            >
              <TabsList className="h-8 bg-white border border-slate-200 p-0.5">
                <TabsTrigger value="all" className="text-xs px-3 h-7">
                  {language === 'gu' ? `બધા (${data?.total_pairs ?? 0})` : language === 'hi' ? `सभी (${data?.total_pairs ?? 0})` : `All (${data?.total_pairs ?? 0})`}
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs px-3 h-7">
                  {language === 'gu' ? `બાકી (${data?.pending ?? 0})` : language === 'hi' ? `लंबित (${data?.pending ?? 0})` : `Pending (${data?.pending ?? 0})`}
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="text-xs px-3 h-7">
                  {language === 'gu' ? `પુષ્ટિ થયેલ (${data?.confirmed ?? 0})` : language === 'hi' ? `पुष्ट (${data?.confirmed ?? 0})` : `Confirmed (${data?.confirmed ?? 0})`}
                </TabsTrigger>
                <TabsTrigger value="false_positive" className="text-xs px-3 h-7">
                  {language === 'gu' ? `સાચા પરિવારો (${data?.false_positives ?? 0})` : language === 'hi' ? `वास्तविक (${data?.false_positives ?? 0})` : `False Positives (${data?.false_positives ?? 0})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
              <span>
                {language === 'gu' ? 'રજીસ્ટ્રી જોડીઓ સ્કેન થઈ રહી છે...' : language === 'hi' ? 'रजिस्ट्री जोड़ियां स्कैन की जा रही हैं...' : 'Scanning registry pairs...'}
              </span>
            </div>
          ) : pairs.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-700">
                {language === 'gu' ? 'આ માપદંડ સાથે મેળ ખાતી કોઈ ડુપ્લિકેટ જોડી મળી નથી.' : language === 'hi' ? 'इस मानदंड से मेल खाती कोई डुप्लीकेट जोड़ी नहीं मिली।' : 'No duplicate registrations found matching criteria.'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'gu' ? 'થ્રેશોલ્ડ સ્લાઇડર ઓછું કરવાનો પ્રયાસ કરો.' : language === 'hi' ? 'थ्रेशोल्ड स्लाइडर कम करने का प्रयास करें।' : 'Try lowering the detection threshold slider or adjusting signal weights.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="text-xs font-semibold w-12 text-center">#</TableHead>
                    <TableHead className="text-xs font-semibold">
                      {language === 'gu' ? 'પ્રાથમિક કુટુંબ (A)' : language === 'hi' ? 'प्राथमिक परिवार (A)' : 'Primary Household (A)'}
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      {language === 'gu' ? 'શંકાસ્પદ કુટુંબ (B)' : language === 'hi' ? 'संदिग्ध परिवार (B)' : 'Suspect Household (B)'}
                    </TableHead>
                    <TableHead className="text-xs font-semibold w-48">
                      {language === 'gu' ? 'સંભાવના સ્કોર' : language === 'hi' ? 'संभावना स्कोर' : 'Confidence Score'}
                    </TableHead>
                    <TableHead className="text-xs font-semibold w-32">
                      {language === 'gu' ? 'ઓડિટ સ્થિતિ' : language === 'hi' ? 'ऑडिट स्थिति' : 'Review Status'}
                    </TableHead>
                    <TableHead className="text-xs font-semibold w-28 text-right">
                      {language === 'gu' ? 'તપાસ' : language === 'hi' ? 'जांच' : 'Investigation'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pairs.map((pair, idx) => (
                    <TableRow key={pair.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-xs font-mono text-center text-muted-foreground">
                        {idx + 1}
                      </TableCell>

                      {/* Family A */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-foreground">{pair.family_a_head_name}</span>
                            <Link
                              href={`/families/${pair.family_a_id}`}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary"
                              title="Open family profile"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground">{pair.family_a_id}</p>
                        </div>
                      </TableCell>

                      {/* Family B */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-foreground">{pair.family_b_head_name}</span>
                            <Link
                              href={`/families/${pair.family_b_id}`}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary"
                              title="Open family profile"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground">{pair.family_b_id}</p>
                        </div>
                      </TableCell>

                      {/* Confidence Score Bar */}
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            {getConfidenceBadge(pair.confidence_score)}
                          </div>
                          <Progress
                            value={pair.confidence_score}
                            className={`h-1.5 ${getProgressColor(pair.confidence_score)}`}
                          />
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-semibold border ${
                              pair.status === 'confirmed'
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : pair.status === 'false_positive'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            {pair.status === 'confirmed' ? (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1 text-rose-600 inline" />
                                {language === 'gu' ? 'પુષ્ટિ થયેલ ડુપ્લિકેટ' : language === 'hi' ? 'पुष्ट डुप्लीकेट' : 'Confirmed Duplicate'}
                              </>
                            ) : pair.status === 'false_positive' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 inline" />
                                {language === 'gu' ? 'સાચું કુટુંબ (ક્લિયર)' : language === 'hi' ? 'वास्तविक परिवार' : 'Cleared (False+)'}
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block animate-pulse" />
                                {language === 'gu' ? 'સમીક્ષા બાકી' : language === 'hi' ? 'समीक्षा लंबित' : 'Pending Review'}
                              </>
                            )}
                          </Badge>
                          {pair.reviewed_at && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {new Date(pair.reviewed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold hover:bg-slate-100 border-slate-300 shadow-2xs"
                          onClick={() => setSelectedPair(pair)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                          {language === 'gu' ? 'તપાસ & નિર્ણય' : language === 'hi' ? 'जांच एवं निर्णय' : 'Investigate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Side-by-Side Review Dialog (Lifted Outside Table for Clean DOM) */}
      <Dialog open={!!selectedPair} onOpenChange={(open) => !open && setSelectedPair(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-rose-100 text-rose-800">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {language === 'gu' ? 'ડુપ્લિકેટ જોડી તપાસ' : language === 'hi' ? 'डुप्लीकेट जोड़ी जांच' : 'Duplicate Pair Investigation'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {language === 'gu'
                      ? `કેસ #${selectedPair?.id} · સ્વચાલિત સંભાવના આધારિત સરખામણી`
                      : language === 'hi'
                      ? `केस #${selectedPair?.id} · स्वचालित संभाव्यता आधारित तुलना`
                      : `Case #${selectedPair?.id} · Automated Probabilistic Match Comparison`}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {selectedPair && getConfidenceBadge(selectedPair.confidence_score)}
                {selectedPair && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold border ${
                      selectedPair.status === 'confirmed'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : selectedPair.status === 'false_positive'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {selectedPair.status === 'confirmed' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600 inline" />
                        {language === 'gu' ? 'પુષ્ટિ થયેલ ડુપ્લિકેટ' : language === 'hi' ? 'पुष्ट डुप्लीकेट' : 'Confirmed Duplicate'}
                      </>
                    ) : selectedPair.status === 'false_positive' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                        {language === 'gu' ? 'સાચું કુટુંબ (ક્લિયર)' : language === 'hi' ? 'वास्तविक परिवार' : 'Cleared (False+)'}
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 inline-block animate-pulse" />
                        {language === 'gu' ? 'સમીક્ષા બાકી' : language === 'hi' ? 'समीक्षा लंबित' : 'Pending Review'}
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedPair && (
            <div className="space-y-6 pt-2">
              {/* Signal Contribution Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  {language === 'gu' ? 'અલ્ગોરિધમ સ્કોર યોગદાન' : language === 'hi' ? 'एल्गोरिद्म स्कोर योगदान' : 'Algorithm Score Attribution'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {language === 'gu' ? 'ફોન મેળ' : language === 'hi' ? 'फोन मिलान' : 'Phone Exact Match'}
                    </p>
                    <p className="text-xl font-extrabold text-foreground mt-0.5">
                      {selectedPair.signals.phone_score}
                      <span className="text-xs font-normal text-muted-foreground"> / {phoneWeight}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {language === 'gu' ? 'જન્મ તારીખ મેળ' : language === 'hi' ? 'जन्मतिथि मिलान' : 'DOB Match'}
                    </p>
                    <p className="text-xl font-extrabold text-foreground mt-0.5">
                      {selectedPair.signals.dob_score}
                      <span className="text-xs font-normal text-muted-foreground"> / {dobWeight}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {language === 'gu' ? 'નામ સમાનતા' : language === 'hi' ? 'नाम समानता' : 'Name Similarity'}
                    </p>
                    <p className="text-xl font-extrabold text-foreground mt-0.5">
                      {selectedPair.signals.name_score}
                      <span className="text-xs font-normal text-muted-foreground"> / {nameWeight}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {language === 'gu' ? 'સરનામું મેળ' : language === 'hi' ? 'पता मिलान' : 'Address Match'}
                    </p>
                    <p className="text-xl font-extrabold text-foreground mt-0.5">
                      {selectedPair.signals.address_score}
                      <span className="text-xs font-normal text-muted-foreground"> / {addressWeight}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Field Table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {language === 'gu' ? 'ફીલ્ડ-દર-ફીલ્ડ તુલના મેટ્રિક્સ' : language === 'hi' ? 'फ़ील्ड-दर-फ़ील्ड तुलना मैट्रिक्स' : 'Field-by-Field Discrepancy Matrix'}
                  </h4>
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-900 border-amber-300 font-medium">
                    <Lock className="w-2.5 h-2.5 mr-1 text-amber-600 inline" />
                    DPDP Act 2023 Masked
                  </Badge>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-semibold w-32">
                          {language === 'gu' ? 'વિગત' : language === 'hi' ? 'फ़ील्ड' : 'Attribute'}
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          {language === 'gu' ? `કુટુંબ A (${selectedPair.family_a_id})` : language === 'hi' ? `परिवार A (${selectedPair.family_a_id})` : `Household A (${selectedPair.family_a_id})`}
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          {language === 'gu' ? `કુટુંબ B (${selectedPair.family_b_id})` : language === 'hi' ? `परिवार B (${selectedPair.family_b_id})` : `Household B (${selectedPair.family_b_id})`}
                        </TableHead>
                        <TableHead className="text-xs font-semibold w-24 text-center">
                          {language === 'gu' ? 'સ્થિતિ' : language === 'hi' ? 'स्थिति' : 'Status'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPair.field_comparison.map((fc) => (
                        <TableRow key={fc.field_name} className="hover:bg-slate-50/50">
                          <TableCell className="text-xs font-medium text-slate-700">
                            {fc.field_name}
                          </TableCell>
                          <TableCell className="text-xs text-foreground font-mono">
                            {fc.value_a}
                          </TableCell>
                          <TableCell className="text-xs text-foreground font-mono">
                            {fc.value_b}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                fc.match_level === 'exact'
                                  ? 'bg-rose-100 text-rose-800'
                                  : fc.match_level === 'near'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {fc.match_level === 'exact'
                                ? (language === 'gu' ? 'સંપૂર્ણ મેળ' : language === 'hi' ? 'सटीक मिलान' : 'Exact Match')
                                : fc.match_level === 'near'
                                ? (language === 'gu' ? `${fc.similarity}% નજીક` : language === 'hi' ? `${fc.similarity}% निकट` : `${fc.similarity}% Near`)
                                : (language === 'gu' ? 'અલગ' : language === 'hi' ? 'भिन्न' : 'Different')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Review Actions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-slate-800 font-bold uppercase tracking-wider">
                    {language === 'gu' ? 'વહીવટી ઓડિટ નિર્ણય:' : language === 'hi' ? 'પ્રશાસનિક ઓડિટ નિર્ણય:' : 'Administrative Audit Determination:'}
                  </p>
                  {selectedPair.reviewed_at && (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {language === 'gu' ? 'છેલ્લો નિર્ણય:' : language === 'hi' ? 'अंतिम निर्णय:' : 'Last Reviewed:'}{' '}
                      {new Date(selectedPair.reviewed_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Current status alert box */}
                {selectedPair.status === 'confirmed' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">
                        {language === 'gu' ? 'સ્થિતિ: પુષ્ટિ થયેલ ડુપ્લિકેટ' : language === 'hi' ? 'स्थिति: पुष्ट डुप्लीकेट' : 'Current Status: Confirmed Duplicate'}
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        {language === 'gu'
                          ? 'આ કુટુંબ જોડી તલાટી કક્ષાએ ભૌતિક સ્થળ ચકાસણી માટે ફ્લેગ થયેલ છે. નિયમ મુજબ કોઈપણ નાગરિક લાભો આપમેળે અટક્યા નથી.'
                          : language === 'hi'
                          ? 'यह परिवार जोड़ी तलाटी स्तर पर भौतिक स्थल सत्यापन हेतु चिह्नित है। नियमानुसार कोई भी नागरिक लाभ स्वतः नहीं रुका है।'
                          : 'This household pair has been flagged for in-person Talati physical verification. In compliance with governance rules, citizen benefits remain active.'}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPair.status === 'false_positive' && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">
                        {language === 'gu' ? 'સ્થિતિ: સાચા પરિવારો (ખોટું એલાર્મ)' : language === 'hi' ? 'स्थिति: वास्तविक परिवार (क्लियर)' : 'Current Status: Cleared as False Positive'}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {language === 'gu'
                          ? 'ઓડિટે ચકાસ્યું છે કે આ બંને સંપૂર્ણપણે સ્વતંત્ર અને સાચા પરિવારો છે. વિસંગતતા ફ્લેગ હટાવવામાં આવ્યો છે.'
                          : language === 'hi'
                          ? 'ऑडिट ने सत्यापित किया है कि ये दोनों पूर्णतः स्वतंत्र वास्तविक परिवार हैं। विसंगति अलर्ट हटा दिया गया है।'
                          : 'Audit has verified that these are genuine, independent households. Anomaly flag cleared from registry.'}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPair.status === 'pending' && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-bold">
                        {language === 'gu' ? 'સ્થિતિ: અધિકારી નિર્ણય બાકી' : language === 'hi' ? 'स्थिति: अधिकारी निर्णय लंबित' : 'Current Status: Pending Investigation'}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        {language === 'gu'
                          ? 'કૃપા કરીને ઉપરોક્ત ફીલ્ડ તુલના મેટ્રિક્સની સમીક્ષા કરો અને નીચેથી યોગ્ય નિર્ણય પસંદ કરો.'
                          : language === 'hi'
                          ? 'कृपया उपरोक्त फ़ील्ड तुलना मैट्रिक्स की समीक्षा करें और नीचे से उचित निर्णय चुनें।'
                          : 'Please review the field-by-field discrepancy matrix above and record the appropriate audit action below.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button
                    size="sm"
                    className={`flex-1 text-xs font-semibold ${
                      selectedPair.status === 'confirmed'
                        ? 'bg-rose-700 hover:bg-rose-800 text-white ring-2 ring-rose-400 ring-offset-1 shadow-xs'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                    disabled={updateStatusMutation.isPending}
                    onClick={() => {
                      updateStatusMutation.mutate({ pairId: selectedPair.id, status: 'confirmed' });
                    }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                    {selectedPair.status === 'confirmed'
                      ? (language === 'gu' ? '✓ પુષ્ટિ થયેલ ડુપ્લિકેટ છે' : language === 'hi' ? '✓ पुष्ट डुप्लीकेट (सक्रिय)' : '✓ Confirmed as Duplicate (Active)')
                      : (language === 'gu' ? 'ડુપ્લિકેટ તરીકે પુષ્ટિ કરો (તલાટી ફ્લેગ)' : language === 'hi' ? 'डुप्लीकेट के रूप में चिह्नित करें (तलाटी फ्लैग)' : 'Confirm as Duplicate (Flag for Talati)')}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 text-xs font-semibold ${
                      selectedPair.status === 'false_positive'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400 ring-offset-1 font-bold shadow-xs'
                        : 'border-emerald-300 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
                    }`}
                    disabled={updateStatusMutation.isPending}
                    onClick={() => {
                      updateStatusMutation.mutate({ pairId: selectedPair.id, status: 'false_positive' });
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    {selectedPair.status === 'false_positive'
                      ? (language === 'gu' ? '✓ સાચા કુટુંબો તરીકે માન્ય છે' : language === 'hi' ? '✓ वास्तविक परिवार (मान्य)' : '✓ Marked False Positive (Cleared)')
                      : (language === 'gu' ? 'સાચા કુટુંબો તરીકે માન્ય કરો' : language === 'hi' ? 'वास्तविक अलग परिवार मानें' : 'Mark False Positive (Clear Pair)')}
                  </Button>

                  {selectedPair.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => {
                        updateStatusMutation.mutate({ pairId: selectedPair.id, status: 'pending' });
                      }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1 text-slate-500" />
                      {language === 'gu' ? 'ફરીથી બાકી કરો' : language === 'hi' ? 'पुनः लंबित करें' : 'Reset to Pending'}
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {language === 'gu'
                    ? 'સૂચના: ડિજિટલ ગવર્નન્સ નિયમો અનુસાર, ફ્લેગિંગથી નાગરિક લાભો આપમેળે અટકતા નથી. તે વ્યક્તિગત તલાટી ચકાસણી શેડ્યૂલ કરે છે.'
                    : language === 'hi'
                    ? 'सूचना: डिजिटल शासन नियमों के अनुसार, फ्लैगिंग से नागरिक लाभ कभी स्वतः नहीं रुकते। यह केवल प्रत्यक्ष तलाटी सत्यापन तय करता है।'
                    : 'Notice: In compliance with digital governance rules, flagging never halts existing citizen benefits automatically. It schedules in-person Talati verification.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
