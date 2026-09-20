'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircleQuestion, ArrowRight, ArrowLeft, Volume2, VolumeX,
  Languages, CheckCircle2, Sparkles, Home, Users, IndianRupee,
  Accessibility, Heart, BookOpen, MapPin, Tractor, Plus, Trash2,
  Printer, RotateCcw, ShieldCheck, GraduationCap, Building2, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getSchemeCategoryColor, formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { SpotlightCard } from '@/components/effects/spotlight-card';
import { BorderBeam } from '@/components/effects/border-beam';
import { ShinyText } from '@/components/effects/shiny-text';
import type {
  Language, Gender, CasteCategory, HouseType, MaritalStatus,
  Family, FamilyMember, RelationToHead, EducationLevel
} from '@/lib/types';

// All 33 districts of Gujarat
const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
  'Bhavnagar', 'Botad', 'Chhota Udepur', 'Dahod', 'Dangs', 'Devbhumi Dwarka',
  'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
  'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
  'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
  'Tapi', 'Vadodara', 'Valsad'
];

interface MemberInputState {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  relation: RelationToHead;
  occupation: string;
  education: EducationLevel;
  hasDisability: boolean;
  disabilityPct: number;
}

interface SchemeResult {
  id: string;
  name: string;
  name_hi: string;
  name_gu: string;
  description: string;
  description_hi: string;
  description_gu: string;
  benefit: string;
  benefit_hi: string;
  benefit_gu: string;
  category: string;
  next_steps: string;
  next_steps_hi: string;
  next_steps_gu: string;
  eligible_members?: { member_name?: string }[];
}

// Translations
const t = {
  en: {
    title: 'Proactive Welfare Assistant',
    subtitle: 'Answer a few simple questions to dynamically evaluate all 20 Gujarat welfare schemes.',
    step0_title: 'Select Your Language',
    step0_desc: 'You can switch between English, Hindi, and Gujarati at any point.',
    step1_title: 'Location & Geography',
    step1_desc: 'Where does your household live in Gujarat?',
    step2_title: 'Household Members Roster',
    step2_desc: 'Add each person living in your home and their status.',
    step3_title: 'Economic & Social Classification',
    step3_desc: 'Annual income bracket and caste/social category.',
    step4_title: 'Landholding & Housing Conditions',
    step4_desc: 'Agricultural land and dwelling structure type.',
    step5_title: 'Results & Entitlement Card',
    next: 'Continue',
    back: 'Back',
    findSchemes: 'Calculate My Schemes',
    results: 'Official Gujarat Welfare Entitlements',
    district: 'District',
    areaType: 'Area Type',
    rural: 'Rural (Gram Panchayat)',
    urban: 'Urban (Municipality / Nagar Palika)',
    pincode: 'Pincode',
    houseType: 'Housing Condition',
    kutcha: 'Kutcha (Clay / Thatched / Asbestos)',
    pucca: 'Pucca (Permanent Concrete / Brick)',
    annualIncome: 'Approximate Annual Household Income',
    socialCategory: 'Community / Social Category',
    general: 'General',
    obc: 'OBC / SEBC (Backward Class)',
    sc: 'SC (Scheduled Caste)',
    st: 'ST (Scheduled Tribe)',
    landOwned: 'Agricultural Land Owned',
    acres: 'Acres',
    landless: 'Landless (0 acres)',
    marginal: 'Marginal (< 2.5 acres)',
    small: 'Small (2.5 - 5.0 acres)',
    large: 'Medium / Large (> 5.0 acres)',
    addMember: 'Add Family Member',
    memberPresets: 'Quick Household Presets:',
    preset_nuclear: 'Nuclear Family (2 Adults + 2 Kids)',
    preset_farming: 'Rural Farming Family (with Land)',
    preset_widow: 'Single Mother / Widow Household',
    preset_senior: 'Senior Citizen Couple',
    readAloud: 'Read Aloud (Speech)',
    stopReading: 'Stop Audio',
    startOver: 'Start New Evaluation',
    printReport: 'Print Entitlement Card',
    benefitValue: 'Total Estimated Annual Value',
    whatYouGet: 'Entitlement Benefit',
    nextSteps: 'How & Where to Claim',
  },
  hi: {
    title: 'सक्रिय कल्याणकारी सहायक',
    subtitle: 'गुजरात सरकार की सभी 20 कल्याणकारी योजनाओं का सटीक मूल्यांकन करने के लिए कुछ सरल प्रश्नों के उत्तर दें।',
    step0_title: 'अपनी पसंदीदा भाषा चुनें',
    step0_desc: 'आप किसी भी समय अंग्रेजी, हिंदी और गुजराती के बीच स्विच कर सकते हैं।',
    step1_title: 'स्थान एवं आवास क्षेत्र',
    step1_desc: 'गुजरात में आपका परिवार कहाँ निवास करता है?',
    step2_title: 'परिवार के सदस्यों का विवरण',
    step2_desc: 'अपने घर में रहने वाले प्रत्येक व्यक्ति और उनकी स्थिति जोड़ें।',
    step3_title: 'आर्थिक एवं सामाजिक श्रेणी',
    step3_desc: 'वार्षिक पारिवारिक आय एवं सामाजिक वर्ग।',
    step4_title: 'कृषि भूमि एवं आवास प्रकार',
    step4_desc: 'कृषि योग्य भूमि और घर का निर्माण प्रकार।',
    step5_title: 'आपकी पात्र सरकारी योजनाएं',
    next: 'आगे बढ़ें',
    back: 'पीछे जाएं',
    findSchemes: 'मेरी योजनाएं खोजें',
    results: 'गुजरात सरकार की आधिकारिक योजनाएं',
    district: 'जिला',
    areaType: 'क्षेत्र का प्रकार',
    rural: 'ग्रामीण (ग्राम पंचायत)',
    urban: 'शहरी (नगर पालिका / महानगर पालिका)',
    pincode: 'पिनकोड',
    houseType: 'मकान का प्रकार',
    kutcha: 'कच्चा मकान (मिट्टी / घास-फूस)',
    pucca: 'पक्का मकान (कंक्रीट / ईंट)',
    annualIncome: 'लगभग वार्षिक पारिवारिक आय',
    socialCategory: 'सामाजिक वर्ग / जाति',
    general: 'सामान्य (General)',
    obc: 'ओबीसी / बक्षीपंच (SEBC)',
    sc: 'अनुसूचित जाति (SC)',
    st: 'अनुसूचित जनजाति (ST)',
    landOwned: 'स्वामित्व वाली कृषि भूमि',
    acres: 'एकड़',
    landless: 'भूमिहीन (0 एकड़)',
    marginal: 'सीमांत किसान (< 2.5 एकड़)',
    small: 'लघु किसान (2.5 - 5.0 एकड़)',
    large: 'बड़ा किसान (> 5.0 एकड़)',
    addMember: 'सदस्य जोड़ें',
    memberPresets: 'त्वरित परिवार टेम्पलेट:',
    preset_nuclear: 'छोटा परिवार (2 वयस्क + 2 बच्चे)',
    preset_farming: 'किसान परिवार (खेती की जमीन सहित)',
    preset_widow: 'एकल महिला / विधवा परिवार',
    preset_senior: 'वरिष्ठ नागरिक दंपत्ति',
    readAloud: 'बोलकर सुनाएं',
    stopReading: 'रोकें',
    startOver: 'पुनः नया मूल्यांकन करें',
    printReport: 'पात्रता पत्र प्रिंट करें',
    benefitValue: 'अनुमानित कुल वार्षिक सहायता',
    whatYouGet: 'योजना के अंतर्गत लाभ',
    nextSteps: 'आवेदन कहाँ और कैसे करें',
  },
  gu: {
    title: 'પ્રોએક્ટિવ યોજના સહાયક',
    subtitle: 'ગુજરાત સરકારની તમામ 20 કલ્યાણકારી યોજનાઓનું સચોટ મૂલ્યાંકન કરવા માટે થોડા સરળ પ્રશ્નોના જવાબ આપો.',
    step0_title: 'તમારી ભાષા પસંદ કરો',
    step0_desc: 'તમે કોઈપણ સમયે અંગ્રેજી, હિન્દી અને ગુજરાતી વચ્ચે બદલી શકો છો.',
    step1_title: 'રહેઠાણ અને વિસ્તાર',
    step1_desc: 'તમારું કુટુંબ ગુજરાતમાં ક્યાં વસવાટ કરે છે?',
    step2_title: 'કુટુંબના સભ્યોની વિગત',
    step2_desc: 'તમારા ઘરમાં રહેતા તમામ સભ્યો અને તેમની સ્થિતિ ઉમેરો.',
    step3_title: 'આર્થિક અને સામાજિક વર્ગ',
    step3_desc: 'વાર્ષિક કૌટુંબિક આવક અને સામાજિક શ્રેણી.',
    step4_title: 'ખેતીની જમીન અને મકાનનો પ્રકાર',
    step4_desc: 'ખેતીની જમીન અને રહેઠાણનું માળખું.',
    step5_title: 'તમારી પાત્ર સરકારી યોજનાઓ',
    next: 'આગળ વધો',
    back: 'પાછળ જાઓ',
    findSchemes: 'મારી યોજનાઓ શોધો',
    results: 'ગુજરાત સરકારની અધિકૃત યોજનાઓ',
    district: 'જિલ્લો',
    areaType: 'વિસ્તારનો પ્રકાર',
    rural: 'ગ્રામ્ય (ગ્રામ પંચાયત)',
    urban: 'શહેરી (નગરપાલિકા / મહાનગરપાલિકા)',
    pincode: 'પિનકોડ',
    houseType: 'મકાનનો પ્રકાર',
    kutcha: 'કાચું મકાન (માટી / નળિયાં / પતરાં)',
    pucca: 'પાકું મકાન (કોંક્રીટ / ઈંટ)',
    annualIncome: 'અંદાજિત વાર્ષિક કૌટુંબિક આવક',
    socialCategory: 'સામાજિક વર્ગ / જ્ઞાતિ',
    general: 'સામાન્ય (General)',
    obc: 'ઓબીસી / બક્ષીપંચ (SEBC)',
    sc: 'અનુસૂચિત જાતિ (SC)',
    st: 'અનુસૂચિત જનજાતિ (ST)',
    landOwned: 'ખેતીની જમીન',
    acres: 'એકર',
    landless: 'જમીનવિહોણા (0 એકર)',
    marginal: 'સીમાંત ખેડૂત (< 2.5 એકર)',
    small: 'નાના ખેડૂત (2.5 - 5.0 એકર)',
    large: 'મોટા ખેડૂત (> 5.0 એકર)',
    addMember: 'સભ્ય ઉમેરો',
    memberPresets: 'ઝડપી કુટુંબ ટેમ્પલેટ:',
    preset_nuclear: 'નાનું કુટુંબ (2 પુખ્ત + 2 બાળકો)',
    preset_farming: 'ખેડૂત કુટુંબ (ખેતીની જમીન સાથે)',
    preset_widow: 'એકલ વિધવા માતા કુટુંબ',
    preset_senior: 'વૃદ્ધ દંપતી કુટુંબ',
    readAloud: 'વાંચી સંભળાવો (Audio)',
    stopReading: 'બંધ કરો',
    startOver: 'નવું મૂલ્યાંકન કરો',
    printReport: 'પાત્રતા કાર્ડ પ્રિન્ટ કરો',
    benefitValue: 'અંદાજિત કુલ વાર્ષિક સહાય',
    whatYouGet: 'યોજના અંતર્ગત મળવાપાત્ર લાભ',
    nextSteps: 'અરજી ક્યાં અને કેવી રીતે કરવી',
  },
};

export default function AssistantPage() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [step, setStep] = useState(0);

  // Form State — 100% dynamic, no hardcoding
  const [district, setDistrict] = useState('Ahmedabad');
  const [areaType, setAreaType] = useState<'rural' | 'urban'>('rural');
  const [pincode, setPincode] = useState('382481');
  const [houseType, setHouseType] = useState<HouseType>('kutcha');
  const [householdIncome, setHouseholdIncome] = useState<number>(85000);
  const [casteCategory, setCasteCategory] = useState<CasteCategory>('obc');
  const [landOwnedAcres, setLandOwnedAcres] = useState<number>(1.5);

  const [members, setMembers] = useState<MemberInputState[]>([
    {
      id: '1',
      name: 'Rameshbhai',
      age: 46,
      gender: 'male',
      relation: 'head',
      occupation: 'farmer',
      education: 'secondary',
      hasDisability: false,
      disabilityPct: 0,
    },
    {
      id: '2',
      name: 'Gitaben',
      age: 42,
      gender: 'female',
      relation: 'spouse',
      occupation: 'homemaker',
      education: 'primary',
      hasDisability: false,
      disabilityPct: 0,
    },
    {
      id: '3',
      name: 'Pooja',
      age: 14,
      gender: 'female',
      relation: 'child',
      occupation: 'student',
      education: 'secondary',
      hasDisability: false,
      disabilityPct: 0,
    },
    {
      id: '4',
      name: 'Ketan',
      age: 11,
      gender: 'male',
      relation: 'child',
      occupation: 'student',
      education: 'primary',
      hasDisability: false,
      disabilityPct: 0,
    },
  ]);

  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>([40, 60, 30, 80, 50]);

  const txt = t[lang];

  // Presets loader
  const applyPreset = (preset: 'nuclear' | 'farming' | 'widow' | 'senior') => {
    if (preset === 'farming') {
      setAreaType('rural');
      setHouseholdIncome(75000);
      setLandOwnedAcres(2.0);
      setHouseType('kutcha');
      setCasteCategory('obc');
      setMembers([
        { id: '1', name: 'Bhaveshbhai', age: 48, gender: 'male', relation: 'head', occupation: 'farmer', education: 'primary', hasDisability: false, disabilityPct: 0 },
        { id: '2', name: 'Shilpaben', age: 44, gender: 'female', relation: 'spouse', occupation: 'homemaker', education: 'primary', hasDisability: false, disabilityPct: 0 },
        { id: '3', name: 'Kavita', age: 15, gender: 'female', relation: 'child', occupation: 'student', education: 'secondary', hasDisability: false, disabilityPct: 0 },
      ]);
    } else if (preset === 'widow') {
      setAreaType('rural');
      setHouseholdIncome(40000);
      setLandOwnedAcres(0);
      setHouseType('kutcha');
      setCasteCategory('sc');
      setMembers([
        { id: '1', name: 'Kantaben', age: 52, gender: 'female', relation: 'head', occupation: 'daily wage', education: 'none', hasDisability: false, disabilityPct: 0 },
        { id: '2', name: 'Rekha', age: 13, gender: 'female', relation: 'child', occupation: 'student', education: 'secondary', hasDisability: false, disabilityPct: 0 },
      ]);
    } else if (preset === 'senior') {
      setAreaType('urban');
      setHouseholdIncome(90000);
      setLandOwnedAcres(0);
      setHouseType('pucca');
      setCasteCategory('general');
      setMembers([
        { id: '1', name: 'Tribhovandas', age: 68, gender: 'male', relation: 'head', occupation: 'none', education: 'secondary', hasDisability: false, disabilityPct: 0 },
        { id: '2', name: 'Jasodaben', age: 65, gender: 'female', relation: 'spouse', occupation: 'none', education: 'none', hasDisability: false, disabilityPct: 0 },
      ]);
    } else {
      setAreaType('urban');
      setHouseholdIncome(150000);
      setLandOwnedAcres(0);
      setHouseType('pucca');
      setCasteCategory('general');
      setMembers([
        { id: '1', name: 'Sanjay', age: 39, gender: 'male', relation: 'head', occupation: 'shopkeeper', education: 'graduate', hasDisability: false, disabilityPct: 0 },
        { id: '2', name: 'Priti', age: 36, gender: 'female', relation: 'spouse', occupation: 'homemaker', education: 'graduate', hasDisability: false, disabilityPct: 0 },
        { id: '3', name: 'Aryan', age: 10, gender: 'male', relation: 'child', occupation: 'student', education: 'primary', hasDisability: false, disabilityPct: 0 },
        { id: '4', name: 'Diya', age: 6, gender: 'female', relation: 'child', occupation: 'student', education: 'primary', hasDisability: false, disabilityPct: 0 },
      ]);
    }
  };

  const addMember = () => {
    setMembers(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Member ${prev.length + 1}`,
        age: 18,
        gender: 'female',
        relation: 'child',
        occupation: 'student',
        education: 'secondary',
        hasDisability: false,
        disabilityPct: 0,
      }
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateMember = (id: string, field: keyof MemberInputState, val: any) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  // Evaluate eligibility using the SHARED engine
  const checkEligibility = useMutation({
    mutationFn: async () => {
      const incomeBand = householdIncome <= 15000 ? 'aay' as const
        : householdIncome <= 100000 ? 'bpl' as const
        : householdIncome <= 300000 ? 'lig' as const
        : householdIncome <= 600000 ? 'mig' as const
        : 'hig' as const;

      const familyMembers: FamilyMember[] = members.map((m, idx) => ({
        member_id: `ASST-${idx + 1}`,
        family_id: 'ASSISTANT_SESSION',
        name: m.name,
        relation_to_head: m.relation,
        dob: new Date(new Date().setFullYear(new Date().getFullYear() - m.age)).toISOString().split('T')[0],
        gender: m.gender,
        marital_status: m.relation === 'head' && members.some(x => x.relation === 'spouse') ? 'married'
          : m.relation === 'child' ? 'single'
          : m.relation === 'spouse' ? 'married'
          : 'single',
        occupation: m.occupation,
        education_level: m.education,
        disability_status: m.hasDisability,
        disability_percentage: m.hasDisability ? (m.disabilityPct || 60) : undefined,
        is_bpl: incomeBand === 'bpl' || incomeBand === 'aay',
        is_alive: true,
      }));

      const family: Family = {
        family_id: 'ASSISTANT_SESSION',
        district,
        area_type: areaType,
        household_income_annual: householdIncome,
        income_band: incomeBand,
        caste_category: casteCategory,
        land_owned_acres: landOwnedAcres,
        house_type: houseType,
        phone_number: '9876543210',
        address: `${district} Center`,
        pincode,
        last_updated: new Date().toISOString(),
        members: familyMembers,
      };

      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family }),
      });
      const data = await res.json();
      return data.eligible_schemes as SchemeResult[];
    },
    onSuccess: (data) => {
      setResults(data);
      setStep(5);
    },
  });

  // Text to speech (Web Speech API)
  const speakResults = useCallback(() => {
    if (!results || results.length === 0) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      return;
    }

    const langMap: Record<Language, string> = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' };
    const intro = lang === 'en'
      ? `You are eligible for ${results.length} Gujarat welfare schemes.`
      : lang === 'hi'
      ? `आप गुजरात सरकार की ${results.length} योजनाओं के पात्र हैं।`
      : `તમે ગુજરાત સરકારની ${results.length} યોજનાઓ માટે પાત્ર છો.`;

    const text = intro + ' ' + results.map(s => {
      const name = lang === 'hi' ? s.name_hi : lang === 'gu' ? s.name_gu : s.name;
      const benefit = lang === 'hi' ? s.benefit_hi : lang === 'gu' ? s.benefit_gu : s.benefit;
      return `${name}. ${benefit}.`;
    }).join(' ');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang];
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 80) + 20,
        ]);
      }, 150);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
  }, [results, isSpeaking, lang]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Official Civic Assistant Header */}
      <Card className="relative border border-[#E8E3DA] shadow-sm bg-white overflow-hidden">
        {/* ReactBits Dynamic Light Beam */}
        <BorderBeam size={240} duration={12} colorFrom="#133B42" colorTo="#28604A" />

        <div className="h-1.5 flex w-full">
          <div className="w-1/3 bg-[#D46E38]" />
          <div className="w-1/3 bg-[#FAF8F2]" />
          <div className="w-1/3 bg-[#28604A]" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FAF7F0] to-[#F5EFE4] border border-[#E8E3DA] flex items-center justify-center text-base shadow-2xs shrink-0">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-[#133B42]">
                      {txt.title}
                    </h1>
                    <Badge className="bg-[#EAF3EE] text-[#163F30] border-[#C3DEC9] text-[10px] font-bold">
                      {lang === 'gu' ? 'વોઇસ સહાયક' : lang === 'hi' ? 'आवाज सहायक' : 'Voice TTS'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'gu'
                      ? 'ગુજરાત સરકાર · ૨૦ કલ્યાણકારી યોજનાઓનું સક્રિય મૂલ્યાંકન'
                      : lang === 'hi'
                      ? 'गुजरात सरकार · 20 कल्याणकारी योजनाओं का सक्रिय मूल्यांकन'
                      : 'Government of Gujarat · Proactive Welfare Evaluation across 20 Schemes'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl pt-1">
                {txt.subtitle}
              </p>
            </div>

            {/* Language Toggle Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F0] rounded-lg border border-[#E8E3DA] shrink-0 self-start sm:self-center">
              <Button
                size="sm"
                variant={lang === 'en' ? 'default' : 'ghost'}
                className={`text-xs h-7 px-3 ${lang === 'en' ? 'bg-[#133B42] text-white shadow-2xs' : 'text-slate-600'}`}
                onClick={() => setLang('en')}
              >
                English
              </Button>
              <Button
                size="sm"
                variant={lang === 'hi' ? 'default' : 'ghost'}
                className={`text-xs h-7 px-3 ${lang === 'hi' ? 'bg-[#133B42] text-white shadow-2xs' : 'text-slate-600'}`}
                onClick={() => setLang('hi')}
              >
                हिंदी
              </Button>
              <Button
                size="sm"
                variant={lang === 'gu' ? 'default' : 'ghost'}
                className={`text-xs h-7 px-3 ${lang === 'gu' ? 'bg-[#133B42] text-white shadow-2xs' : 'text-slate-600'}`}
                onClick={() => setLang('gu')}
              >
                ગુજરાતી
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar (Steps 1 to 5) */}
      {step < 5 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Step {step + 1} of 5: {step === 0 ? txt.step0_title : step === 1 ? txt.step1_title : step === 2 ? txt.step2_title : step === 3 ? txt.step3_title : txt.step4_title}</span>
            <span>{Math.round(((step + 1) / 5) * 100)}%</span>
          </div>
          <Progress value={((step + 1) / 5) * 100} className="h-1.5 bg-slate-100" />
        </div>
      )}

      {/* Questionnaire Form Steps */}
      <AnimatePresence mode="wait">
        {/* STEP 0: Language & Intro */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="border shadow-xs">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  {txt.step0_title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {txt.step0_desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { code: 'en', title: 'English', desc: 'Default interface for administrative officers and citizens.' },
                    { code: 'hi', title: 'हिन्दी (Hindi)', desc: 'राष्ट्रीय मानक भाषा में सम्पूर्ण जानकारी।' },
                    { code: 'gu', title: 'ગુજરાતી (Gujarati)', desc: 'ગુજરાતના સ્થાનિક નાગરિકો માટે માતૃભાષામાં સેવા.' },
                  ].map((l) => (
                    <div
                      key={l.code}
                      onClick={() => setLang(l.code as Language)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        lang === l.code
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-foreground">{l.title}</span>
                        {lang === l.code && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{l.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Demographic Presets */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-800">{txt.memberPresets}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 bg-white"
                      onClick={() => applyPreset('farming')}
                    >
                      🌱 {txt.preset_farming}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 bg-white"
                      onClick={() => applyPreset('nuclear')}
                    >
                      👨‍👩‍👧‍👦 {txt.preset_nuclear}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 bg-white"
                      onClick={() => applyPreset('widow')}
                    >
                      👩‍👧 {txt.preset_widow}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 bg-white"
                      onClick={() => applyPreset('senior')}
                    >
                      👵 {txt.preset_senior}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(1)} className="text-xs px-6 bg-slate-900 text-white">
                    {txt.next} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 1: Location & Geography */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="border shadow-xs">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  {txt.step1_title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {txt.step1_desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* District Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-800">{txt.district}</Label>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger className="h-10 text-xs bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {GUJARAT_DISTRICTS.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Select your primary district in Gujarat.</p>
                  </div>

                  {/* Area Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-800">{txt.areaType}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setAreaType('rural')}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          areaType === 'rural' ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <p className="text-xs text-foreground">🌾 {txt.rural}</p>
                      </div>
                      <div
                        onClick={() => setAreaType('urban')}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          areaType === 'urban' ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <p className="text-xs text-foreground">🏙️ {txt.urban}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Schemes like MGNREGA and PMAY-G apply exclusively to rural households.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pincode */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-800">{txt.pincode}</Label>
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 380001"
                      className="h-10 text-xs"
                      maxLength={6}
                    />
                  </div>

                  {/* House Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-800">{txt.houseType}</Label>
                    <Select value={houseType} onValueChange={(val: HouseType) => setHouseType(val)}>
                      <SelectTrigger className="h-10 text-xs bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kutcha" className="text-xs">🏚️ {txt.kutcha}</SelectItem>
                        <SelectItem value="pucca" className="text-xs">🏠 {txt.pucca}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Kutcha homes unlock housing assistance like PMAY and Ambedkar Awas.</p>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(0)} className="text-xs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> {txt.back}
                  </Button>
                  <Button size="sm" onClick={() => setStep(2)} className="text-xs px-6 bg-slate-900 text-white">
                    {txt.next} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: Household Members */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="border shadow-xs">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {txt.step2_title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {txt.step2_desc}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addMember}
                    className="text-xs border-indigo-200 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> {txt.addMember}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {members.map((m, idx) => (
                    <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-xs text-foreground">
                            {m.name || `Member ${idx + 1}`}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize bg-white">
                            {m.relation}
                          </Badge>
                        </div>
                        {members.length > 1 && (
                          <button
                            onClick={() => removeMember(m.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {/* Name */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Name</Label>
                          <Input
                            value={m.name}
                            onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>

                        {/* Age */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Age (years)</Label>
                          <Input
                            type="number"
                            value={m.age}
                            onChange={(e) => updateMember(m.id, 'age', parseInt(e.target.value) || 0)}
                            className="h-8 text-xs bg-white"
                            min={0}
                            max={110}
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Gender</Label>
                          <Select
                            value={m.gender}
                            onValueChange={(val: Gender) => updateMember(m.id, 'gender', val)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male" className="text-xs">Male</SelectItem>
                              <SelectItem value="female" className="text-xs">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Relation */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Relation to Head</Label>
                          <Select
                            value={m.relation}
                            onValueChange={(val: RelationToHead) => updateMember(m.id, 'relation', val)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head" className="text-xs">Head</SelectItem>
                              <SelectItem value="spouse" className="text-xs">Spouse</SelectItem>
                              <SelectItem value="child" className="text-xs">Child</SelectItem>
                              <SelectItem value="parent" className="text-xs">Parent</SelectItem>
                              <SelectItem value="other" className="text-xs">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        {/* Occupation */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Occupation</Label>
                          <Select
                            value={m.occupation}
                            onValueChange={(val) => updateMember(m.id, 'occupation', val)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="farmer" className="text-xs">Farmer (ખેડૂત)</SelectItem>
                              <SelectItem value="daily wage" className="text-xs">Daily Wage Worker (મજૂર)</SelectItem>
                              <SelectItem value="shopkeeper" className="text-xs">Shopkeeper / Business</SelectItem>
                              <SelectItem value="student" className="text-xs">Student (વિદ્યાર્થી)</SelectItem>
                              <SelectItem value="homemaker" className="text-xs">Homemaker (ગૃહિણી)</SelectItem>
                              <SelectItem value="none" className="text-xs">None / Retired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Education */}
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Education Level</Label>
                          <Select
                            value={m.education}
                            onValueChange={(val: EducationLevel) => updateMember(m.id, 'education', val)}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-xs">None / Illiterate</SelectItem>
                              <SelectItem value="primary" className="text-xs">Primary (Class 1-8)</SelectItem>
                              <SelectItem value="secondary" className="text-xs">Secondary (Class 9-10)</SelectItem>
                              <SelectItem value="higher_secondary" className="text-xs">Higher Secondary (11-12)</SelectItem>
                              <SelectItem value="graduate" className="text-xs">College Graduate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Disability Check */}
                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id={`dis-${m.id}`}
                            checked={m.hasDisability}
                            onChange={(e) => updateMember(m.id, 'hasDisability', e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600"
                          />
                          <label htmlFor={`dis-${m.id}`} className="text-xs text-slate-700 cursor-pointer">
                            Certified Disability
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> {txt.back}
                  </Button>
                  <Button size="sm" onClick={() => setStep(3)} className="text-xs px-6 bg-slate-900 text-white">
                    {txt.next} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: Income & Social Classification */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="border shadow-xs">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  {txt.step3_title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {txt.step3_desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                {/* Income Slider */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-slate-800">{txt.annualIncome}</Label>
                    <span className="text-lg font-extrabold text-emerald-700 font-mono">
                      {formatCurrency(householdIncome)}
                    </span>
                  </div>
                  <Slider
                    value={[householdIncome]}
                    onValueChange={([v]) => setHouseholdIncome(v)}
                    min={12000}
                    max={600000}
                    step={10000}
                  />
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-muted-foreground pt-1">
                    <span className="p-1 rounded bg-amber-50 text-amber-800 font-medium">BPL: &lt; ₹1,00,000</span>
                    <span className="p-1 rounded bg-blue-50 text-blue-800 font-medium">LIG: ₹1L - 3L</span>
                    <span className="p-1 rounded bg-slate-100 text-slate-700 font-medium">MIG: ₹3L - 6L</span>
                    <span className="p-1 rounded bg-slate-100 text-slate-700 font-medium">HIG: &gt; ₹6L</span>
                  </div>
                </div>

                {/* Social Category */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-800">{txt.socialCategory}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'obc', label: txt.obc },
                      { key: 'sc', label: txt.sc },
                      { key: 'st', label: txt.st },
                      { key: 'general', label: txt.general },
                    ].map((c) => (
                      <div
                        key={c.key}
                        onClick={() => setCasteCategory(c.key as CasteCategory)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          casteCategory === c.key
                            ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-950'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <p className="text-xs">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(2)} className="text-xs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> {txt.back}
                  </Button>
                  <Button size="sm" onClick={() => setStep(4)} className="text-xs px-6 bg-slate-900 text-white">
                    {txt.next} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 4: Landholding & Final Calculation */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="border shadow-xs">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  {txt.step4_title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {txt.step4_desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                {/* Land Owned */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-slate-800">{txt.landOwned}</Label>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {landOwnedAcres} {txt.acres}
                    </span>
                  </div>
                  <Slider
                    value={[landOwnedAcres]}
                    onValueChange={([v]) => setLandOwnedAcres(v)}
                    min={0}
                    max={10}
                    step={0.5}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{txt.landless}</span>
                    <span>{txt.marginal}</span>
                    <span>{txt.small}</span>
                    <span>{txt.large}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Landholding &lt; 5 acres unlocks PM-KISAN (₹6,000/yr) and agricultural electricity subsidies.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-950">Ready for Rules Engine Evaluation</p>
                    <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                      Your household inputs will be piped directly into the Gujarat rules engine, matching against health, pension, education, and housing schemes simultaneously.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(3)} className="text-xs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> {txt.back}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => checkEligibility.mutate()}
                    disabled={checkEligibility.isPending}
                    className="text-xs px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {checkEligibility.isPending ? 'Evaluating 20 Schemes...' : txt.findSchemes}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 5: RESULTS PRESENTATION */}
        {step === 5 && results && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Celebration & Total Benefit Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Assessment Verified
                  </span>
                  <h2 className="text-2xl font-extrabold mt-2 tracking-tight">
                    {lang === 'hi' ? `बधाई हो! आप ${results.length} योजनाओं के पात्र हैं` : lang === 'gu' ? `અભિનંદન! તમે ${results.length} યોજનાઓ માટે પાત્ર છો` : `Congratulations! You Qualify for ${results.length} Schemes`}
                  </h2>
                  <p className="text-xs text-emerald-100 max-w-xl mt-1">
                    Based on your verified family criteria in {district} ({areaType === 'rural' ? 'Rural' : 'Urban'}).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* TTS Button with Animated Waveform */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={speakResults}
                    className="bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/30 text-xs h-9"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-1.5 text-rose-300" />
                        {txt.stopReading}
                        <div className="flex items-center gap-0.5 ml-2">
                          {audioLevel.map((h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h * 0.2}px` }}
                              className="w-1 bg-white rounded-full transition-all duration-150"
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-1.5" />
                        {txt.readAloud}
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/30 text-xs h-9"
                  >
                    <Printer className="w-4 h-4 mr-1.5" />
                    {txt.printReport}
                  </Button>
                </div>
              </div>
            </div>

            {/* Scheme Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((scheme, idx) => {
                const title = lang === 'hi' ? scheme.name_hi : lang === 'gu' ? scheme.name_gu : scheme.name;
                const desc = lang === 'hi' ? scheme.description_hi : lang === 'gu' ? scheme.description_gu : scheme.description;
                const benefit = lang === 'hi' ? scheme.benefit_hi : lang === 'gu' ? scheme.benefit_gu : scheme.benefit;
                const steps = lang === 'hi' ? scheme.next_steps_hi : lang === 'gu' ? scheme.next_steps_gu : scheme.next_steps;

                return (
                  <motion.div
                    key={scheme.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <SpotlightCard
                      spotlightColor="rgba(40, 96, 74, 0.08)"
                      className="border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow h-full flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={`text-[10px] ${getSchemeCategoryColor(scheme.category as any)} border-0 capitalize`}>
                            {scheme.category}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground"># {idx + 1}</span>
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground mt-2">
                          {title}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {desc}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-2 space-y-3">
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                          <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wide">
                            {txt.whatYouGet}
                          </p>
                          <p className="text-xs font-bold text-emerald-950 mt-0.5">
                            {benefit}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            {txt.nextSteps}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {steps}
                          </p>
                        </div>
                      </CardContent>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResults(null);
                  setStep(0);
                }}
                className="text-xs border-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                {txt.startOver}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
