'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Users, MapPin, IndianRupee, ArrowRight, Filter, Sparkles, Building2, ShieldCheck, Home, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatCasteCategory } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import type { Family } from '@/lib/types';
import { SpotlightCard } from '@/components/effects/spotlight-card';
import { BorderBeam } from '@/components/effects/border-beam';
import { ShinyText } from '@/components/effects/shiny-text';

const ALL_DISTRICTS = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
  'Bhavnagar', 'Botad', 'Chhota Udepur', 'Dahod', 'Dangs', 'Devbhumi Dwarka',
  'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
  'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
  'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
  'Tapi', 'Vadodara', 'Valsad'
];

interface FamilyWithMeta extends Family {
  eligible_scheme_count: number;
  head_name: string;
  member_count: number;
}

export default function FamiliesPage() {
  const { user, loginAsDemo, isLoading: isAuthLoading } = useAuth();
  const { language, tCommon } = useLanguage();
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('all');
  const [caste, setCaste] = useState('all');
  const [incomeBand, setIncomeBand] = useState('all');

  const { data: families = [], isLoading } = useQuery<FamilyWithMeta[]>({
    queryKey: ['families', search, district, caste, incomeBand],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (district && district !== 'all') params.set('district', district);
      if (caste && caste !== 'all') params.set('caste', caste);
      if (incomeBand && incomeBand !== 'all') params.set('income_band', incomeBand);
      const res = await fetch(`/api/families?${params}`);
      return res.json();
    },
    enabled: Boolean(user), // Only fetch when authenticated
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Verifying credentials...
      </div>
    );
  }

  // Authentication Gate: visitors must login to view registry details
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-amber-300 bg-amber-50/90 p-6 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <Badge className="bg-amber-200/80 text-amber-900 border-amber-300 text-xs">
              {language === 'gu' ? 'ગુજરાત નાગરિક પ્રમાણીકરણ જરૂરી' : language === 'hi' ? 'गुजरात नागरिक प्रमाणीकरण आवश्यक' : 'Gujarat Civic Authentication Required'}
            </Badge>
            <h2 className="text-xl font-extrabold text-amber-950">
              {language === 'gu' ? 'કુટુંબ રજીસ્ટ્રી પ્રવેશ દ્વાર' : language === 'hi' ? 'परिवार पंजीयन प्रवेश द्वार' : 'Family Registry Access Gate'}
            </h2>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {language === 'gu'
                ? 'ગુજરાત ફેમિલી ID ગોપનીયતા માર્ગદર્શિકા હેઠળ પારિવારિક ડેટા સુરક્ષિત છે. પરિવારોના રેકોર્ડ જોવા કૃપા કરીને નોંધાયેલા નાગરિક અથવા તલાટી તરીકે લૉગિન કરો.'
                : language === 'hi'
                ? 'गुजरात परिवार आईडी गोपनीयता दिशानिर्देशों के तहत पारिवारिक डेटा सुरक्षित है। परिवारों के रिकॉर्ड देखने हेतु कृपया पंजीकृत नागरिक या तलाटी के रूप में लॉगिन करें।'
                : 'Under Gujarat Family ID privacy guidelines, detailed household registry data is protected. Please sign in as a registered Citizen or Talati Officer to access family records.'}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/login">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs">
                {language === 'gu' ? 'ગુજરાત પોર્ટલમાં લૉગિન કરો' : language === 'hi' ? 'गुजरात पोर्टल में लॉगिन करें' : 'Sign In to Gujarat Portal'}
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsDemo('citizen')}
                className="flex-1 text-[11px] bg-white border-amber-300 text-amber-950 hover:bg-amber-100"
              >
                {language === 'gu' ? 'ડેમો નાગરિક' : language === 'hi' ? 'डेमो नागरिक' : 'Demo Citizen'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginAsDemo('admin')}
                className="flex-1 text-[11px] bg-white border-amber-300 text-amber-950 hover:bg-amber-100"
              >
                {language === 'gu' ? 'ડેમો અધિકારી' : language === 'hi' ? 'डेमो अधिकारी' : 'Demo Officer'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Citizen Household Shortcut Banner */}
      {user && user.role === 'citizen' && user.family_id && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user.full_name?.[0] || 'C'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {language === 'gu'
                  ? `સ્વાગત છે, ${user.full_name} · તમારું કુટુંબ (પરિવાર ID: ${user.family_id})`
                  : language === 'hi'
                  ? `स्वागत है, ${user.full_name} · आपका परिवार (परिवार ID: ${user.family_id})`
                  : `Welcome, ${user.full_name} · Your Household (Family ID: ${user.family_id})`}
              </p>
              <p className="text-xs text-slate-600">
                {language === 'gu'
                  ? 'તમારી પાસે જીવન ઘટનાઓ સિમ્યુલેટ કરવાની અને અનલૉક થયેલા લાભો તપાસવાની સંપૂર્ણ નાગરિક માલિકી છે.'
                  : language === 'hi'
                  ? 'आपके पास जीवन घटनाओं का अनुकरण करने एवं अनलॉक हुए लाभों की जांच करने का पूर्ण नागरिक अधिकार है।'
                  : 'You have full citizen ownership to simulate life events, commit transitions, and inspect unlocked benefits.'}
              </p>
            </div>
          </div>
          <Link href={`/families/${user.family_id}`}>
            <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-xs">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              {language === 'gu' ? 'મારું કુટુંબ રેકોર્ડ ખોલો' : language === 'hi' ? 'मेरा परिवार रिकॉर्ड खोलें' : 'Open My Family Record'}
            </Button>
          </Link>
        </div>
      )}

      {/* Official Civic Registry Header */}
      <Card className="relative border border-[#E8E3DA] shadow-sm bg-white overflow-hidden">
        {/* ReactBits Dynamic Light Beam */}
        <BorderBeam size={240} duration={12} colorFrom="#133B42" colorTo="#D46E38" />

        <div className="h-1.5 flex w-full">
          <div className="w-1/3 bg-[#D46E38]" />
          <div className="w-1/3 bg-[#FAF8F2]" />
          <div className="w-1/3 bg-[#28604A]" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF7F0] to-[#F5EFE4] border border-[#E8E3DA] flex items-center justify-center text-lg shadow-2xs shrink-0">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-[#133B42]">
                      {language === 'gu' ? 'ગુજરાત પરિવાર રજિસ્ટ્રી' : language === 'hi' ? 'गुजरात परिवार पंजीयन' : 'Gujarat Family Registry'}
                    </h1>
                    <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[11px] font-bold">
                      {language === 'gu' ? '૩૩ જિલ્લાઓ' : language === 'hi' ? '33 जिले' : '33 Districts'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'gu'
                      ? 'ગુજરાત સરકાર · સત્તાવાર રાજ્ય પરિવાર ડેટાબેઝ અને સ્વચાલિત કલ્યાણ વિતરણ'
                      : language === 'hi'
                      ? 'गुजरात सरकार · आधिकारिक राज्य परिवार डेटाबेस एवं स्वचालित कल्याण वितरण'
                      : 'ગુજરાત સરકાર · Official State Household Database & Automated Welfare Delivery Registry'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl pt-1">
                {language === 'gu'
                  ? 'ગ્રામીણ અને શહેરી ગુજરાતના નોંધાયેલા પરિવારોની તપાસ કરો. કોઈપણ કુટુંબ કાર્ડ પર ક્લિક કરી ઇન્ટરેક્ટિવ પરિવાર વંશાવળી જુઓ, જીવન ઘટના સિમ્યુલેટ કરો અને પ્રિન્ટેબલ ડિજિટલ સ્માર્ટ કાર્ડ મેળવો.'
                  : language === 'hi'
                  ? 'ग्रामीण एवं शहरी गुजरात के पंजीकृत परिवारों की जांच करें। किसी भी परिवार कार्ड पर क्लिक करके इंटरैक्टिव परिवार वंशावली देखें, जीवन घटना सिमुलेट करें और प्रिंटेबल डिजिटल स्मार्ट कार्ड प्राप्त करें।'
                  : 'Explore registered households across rural and urban Gujarat. Click any family card to inspect the interactive Family Genealogical Tree, simulate proactive life events, and view the printable Digital Smart Card.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/families/240100000001">
                <Button size="sm" className="text-xs h-9 bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  {language === 'gu' ? 'પટેલ પરિવાર જુઓ (અમદાવાદ)' : language === 'hi' ? 'पटेल परिवार देखें (अहमदाबाद)' : 'Explore Patel Family (Ahmedabad)'}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E3DA] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                language === 'gu'
                  ? 'પરિવાર ID (GJ-...), વડાનું નામ, અથવા સરનામું શોધો...'
                  : language === 'hi'
                  ? 'परिवार ID (GJ-...), मुखिया का नाम, या पता खोजें...'
                  : 'Search by head name, 12-digit Family ID, or address...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-white border-[#E8E3DA]"
            />
          </div>

          {/* District Dropdown (Fixed bug: retains all districts permanently) */}
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-[170px] h-9 text-xs bg-white border-[#E8E3DA]">
              <SelectValue placeholder={language === 'gu' ? 'તમામ જિલ્લાઓ' : language === 'hi' ? 'सभी जिले' : 'All Districts'} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all" className="text-xs">{language === 'gu' ? 'તમામ જિલ્લાઓ' : language === 'hi' ? 'सभी जिले' : 'All Districts'}</SelectItem>
              {ALL_DISTRICTS.map(d => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Caste Dropdown */}
          <Select value={caste} onValueChange={setCaste}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-white border-slate-300">
              <SelectValue placeholder={language === 'gu' ? 'કેટેગરી' : language === 'hi' ? 'श्रेणी' : 'Category'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">{language === 'gu' ? 'બધી કેટેગરી' : language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</SelectItem>
              <SelectItem value="general" className="text-xs">General</SelectItem>
              <SelectItem value="obc" className="text-xs">OBC / SEBC</SelectItem>
              <SelectItem value="sc" className="text-xs">SC</SelectItem>
              <SelectItem value="st" className="text-xs">ST</SelectItem>
              <SelectItem value="ews" className="text-xs">EWS</SelectItem>
            </SelectContent>
          </Select>

          {/* Income Band Dropdown */}
          <Select value={incomeBand} onValueChange={setIncomeBand}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-white border-slate-300">
              <SelectValue placeholder={language === 'gu' ? 'આવક જૂથ' : language === 'hi' ? 'आय वर्ग' : 'Income Band'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">{language === 'gu' ? 'તમામ જૂથ' : language === 'hi' ? 'सभी वर्ग' : 'All Bands'}</SelectItem>
              <SelectItem value="bpl" className="text-xs">BPL (&lt; ₹1L)</SelectItem>
              <SelectItem value="lig" className="text-xs">LIG (₹1L-3L)</SelectItem>
              <SelectItem value="mig" className="text-xs">MIG (₹3L-6L)</SelectItem>
              <SelectItem value="hig" className="text-xs">HIG (&gt; ₹6L)</SelectItem>
            </SelectContent>
          </Select>

          {(search || district !== 'all' || caste !== 'all' || incomeBand !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setDistrict('all');
                setCaste('all');
                setIncomeBand('all');
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              {language === 'gu' ? 'ફિલ્ટર રીસેટ' : language === 'hi' ? 'फिल्टर रीसेट' : 'Reset Filters'}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            {language === 'gu'
              ? <>કુલ <strong className="text-foreground">{families.length}</strong> પરિવારો દર્શાવેલ છે</>
              : language === 'hi'
              ? <>कुल <strong className="text-foreground">{families.length}</strong> परिवार प्रदर्शित हैं</>
              : <>Showing <strong className="text-foreground">{families.length}</strong> households</>}
          </span>
          <span>
            {language === 'gu'
              ? 'લાભો જોવા અને સિમ્યુલેશન કરવા કાર્ડ પર ક્લિક કરો'
              : language === 'hi'
              ? 'लाभ देखने एवं सिमुलेशन के लिए कार्ड पर क्लिक करें'
              : 'Click any card to inspect active benefits & test life events'}
          </span>
        </div>
      </div>

      {/* Family Cards Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse border">
              <CardContent className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : families.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
          <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">
            {language === 'gu' ? 'કોઈ મેળ ખાતા પરિવારો મળ્યા નથી.' : language === 'hi' ? 'कोई मेल खाते परिवार नहीं मिले।' : 'No matching families found.'}
          </p>
          <p className="text-xs">
            {language === 'gu'
              ? 'શોધ શબ્દો બદલો અથવા "તમામ જિલ્લાઓ" પસંદ કરો.'
              : language === 'hi'
              ? 'खोज शब्द बदलें या "सभी जिले" चुनें।'
              : 'Try relaxing search terms or selecting "All Districts".'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((fam) => (
            <Link key={fam.family_id} href={`/families/${fam.family_id}`} className="group">
              <SpotlightCard
                spotlightColor="rgba(19, 59, 66, 0.08)"
                className="card-hover-lift rounded-xl border border-[#E8E3DA] shadow-2xs hover:shadow-md hover:border-[#133B42]/50 transition-all duration-200 h-full flex flex-col justify-between overflow-hidden bg-white"
              >
                {/* Card Top Tricolor Accent */}
                <div className="h-1 flex w-full opacity-75 group-hover:opacity-100 transition-opacity">
                  <div className="w-1/3 bg-[#D46E38]" />
                  <div className="w-1/3 bg-[#FAF8F2]" />
                  <div className="w-1/3 bg-[#28604A]" />
                </div>

                <div className="p-5 space-y-3">
                  {/* Top Row: Name & ID */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-[#133B42] transition-colors">
                        {language === 'gu' ? `${fam.head_name} પરિવાર` : language === 'hi' ? `${fam.head_name} परिवार` : `${fam.head_name} Family`}
                      </h3>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        GJ-{fam.family_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {user?.family_id === fam.family_id && (
                        <Badge className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border-emerald-300">
                          {language === 'gu' ? 'તમારું કુટુંબ' : language === 'hi' ? 'आपका परिवार' : 'Your Household'}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-slate-50">
                        {fam.caste_category}
                      </Badge>
                    </div>
                  </div>

                  {/* Location & Housing */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {fam.district} · {fam.area_type === 'rural' ? (language === 'gu' ? 'ગ્રામીણ' : language === 'hi' ? 'ग्रामीण' : 'Rural (Gramin)') : (language === 'gu' ? 'શહેરી' : language === 'hi' ? 'शहरी' : 'Urban')}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {fam.house_type === 'kutcha' ? (language === 'gu' ? 'કાચું મકાન' : language === 'hi' ? 'कच्चा मकान' : 'Kutcha Dwelling') : (language === 'gu' ? 'પાકું મકાન' : language === 'hi' ? 'पक्का मकान' : 'Pucca Dwelling')} · {fam.land_owned_acres > 0 ? (language === 'gu' ? `${fam.land_owned_acres} એકર જમીન` : language === 'hi' ? `${fam.land_owned_acres} एकड़ भूमि` : `${fam.land_owned_acres} Acres Land`) : (language === 'gu' ? 'જમીનવિહોણા' : language === 'hi' ? 'भूमिहीन' : 'Landless')}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{fam.member_count} {language === 'gu' ? 'સભ્યો' : language === 'hi' ? 'सदस्य' : 'members'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium text-slate-700">{formatCurrency(fam.household_income_annual)}</span>
                    </div>
                  </div>

                  {/* Eligible Benefit Badge Bar */}
                  <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-950">
                        {fam.eligible_scheme_count} {language === 'gu' ? 'યોજનાઓ ઉપલબ્ધ' : language === 'hi' ? 'योजनाएं उपलब्ध' : 'Schemes Ready'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                      {language === 'gu' ? 'વંશાવળી અને કાર્ડ' : language === 'hi' ? 'वंशावली एवं कार्ड' : 'Family Tree & Card'} <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
