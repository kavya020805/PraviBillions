'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Fingerprint,
  ShieldCheck,
  User,
  Crown,
  Lock,
  Mail,
  Phone,
  Building,
  AlertCircle,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { AuroraGlow } from '@/components/effects/aurora-glow';
import { BorderBeam } from '@/components/effects/border-beam';

const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
  'Jamnagar', 'Junagadh', 'Gandhinagar', 'Kutch', 'Mehsana',
  'Patan', 'Banaskantha', 'Sabarkantha', 'Kheda', 'Anand',
  'Bharuch', 'Narmada', 'Navsari', 'Valsad', 'Dangs',
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [householdMode, setHouseholdMode] = useState<'new' | 'link'>('new');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [district, setDistrict] = useState('Ahmedabad');
  const [areaType, setAreaType] = useState<'urban' | 'rural'>('urban');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signup({
      email,
      password,
      full_name: fullName,
      role,
      family_id: role === 'citizen' && householdMode === 'link' ? familyId : undefined,
      district: role === 'citizen' && householdMode === 'new' ? district : undefined,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || (language === 'gu' ? 'નોંધણી નિષ્ફળ રહી' : language === 'hi' ? 'पंजीकरण विफल रहा' : 'Registration failed'));
    } else {
      router.push(role === 'admin' ? '/' : `/families/${familyId || '240100000001'}`);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#FBF9F5] via-[#FAF7F0] to-[#F3EDE0] text-slate-900 overflow-hidden">
      {/* ReactBits Ambient Organic Aurora Glow */}
      <AuroraGlow intensity="subtle" />

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Language Switcher Bar */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E8E3DA] shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setLanguage('gu')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                language === 'gu' ? 'bg-[#D46E38] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              ગુજરાતી
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                language === 'hi' ? 'bg-[#133B42] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                language === 'en' ? 'bg-[#28604A] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Emblem & Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E3DA] text-[#133B42] text-xs font-bold shadow-2xs">
            <span className="text-base">🏛️</span>
            {language === 'gu' ? 'ગુજરાત સરકાર' : language === 'hi' ? 'गुजरात सरकार' : 'Government of Gujarat'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#133B42] tracking-tight">
            {language === 'gu' ? 'ગુજરાત કુટુંબ ખાતું બનાવો' : language === 'hi' ? 'गुजरात परिवार खाता बनाएं' : 'Create Gujarat Family Account'}
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {language === 'gu'
              ? 'રીઅલ-ટાઇમ કલ્યાણકારી લાભો મેળવવા કુટુંબની નોંધણી કરો અથવા પંચાયત ચકાસણી અધિકારી તરીકે નોંધણી કરો'
              : language === 'hi'
              ? 'वास्तविक समय के लाभों हेतु परिवार पंजीकृत करें अथवा पंचायत सत्यापन अधिकारी के रूप में जुड़ें'
              : 'Enroll your household to track real-time benefits, or register as a panchayat verification officer'}
          </p>
        </div>

        {/* Card (Light Theme) */}
        <Card className="relative border border-[#E8E3DA] bg-white text-slate-900 shadow-xl overflow-hidden">
          {/* ReactBits Dynamic Light Beam */}
          <BorderBeam size={280} duration={12} colorFrom="#133B42" colorTo="#D46E38" />

          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {language === 'gu' ? 'નોંધણી વિગતો' : language === 'hi' ? 'पंजीकरण विवरण' : 'Registration Details'}
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              {language === 'gu'
                ? 'તમારી ભૂમિકા પસંદ કરો અને નાગરિક ઓળખ માહિતી દાખલ કરો'
                : language === 'hi'
                ? 'अपनी भूमिका चुनें और नागरिक पहचान जानकारी दर्ज करें'
                : 'Select your role and provide your civic identity information'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800">
                  {language === 'gu' ? 'ખાતાની ભૂમિકા' : language === 'hi' ? 'खाता भूमिका' : 'Account Role'}
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setRole('citizen')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      role === 'citizen'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <User className={`w-4 h-4 ${role === 'citizen' ? 'text-amber-700' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        {language === 'gu' ? 'નાગરિક લાભાર્થી' : language === 'hi' ? 'नागरिक लाभार्थी' : 'Citizen Beneficiary'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {language === 'gu' ? 'કુટુંબ કલ્યાણ સંચાલન' : language === 'hi' ? 'पारिवारिक लाभ प्रबंधन' : 'Household management'}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      role === 'admin'
                        ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Crown className={`w-4 h-4 ${role === 'admin' ? 'text-blue-700' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        {language === 'gu' ? 'તલાટી / અધિકારી' : language === 'hi' ? 'तलाटी / अधिकारी' : 'Talati / Officer'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {language === 'gu' ? 'રજીસ્ટ્રી વહીવટ' : language === 'hi' ? 'रजिस्ट्री प्रशासन' : 'Registry administration'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Household Linking */}
              {role === 'citizen' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <Label className="text-xs font-semibold text-slate-800">
                    {language === 'gu' ? 'કુટુંબ રૂપરેખાંકન' : language === 'hi' ? 'परिवार विन्यास' : 'Household Configuration'}
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={householdMode === 'new'}
                        onChange={() => setHouseholdMode('new')}
                        className="accent-[#133B42]"
                      />
                      <span>
                        {language === 'gu' ? 'નવા કુટુંબની નોંધણી કરો' : language === 'hi' ? 'नया परिवार पंजीकृत करें' : 'Register New Household'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={householdMode === 'link'}
                        onChange={() => setHouseholdMode('link')}
                        className="accent-[#133B42]"
                      />
                      <span>
                        {language === 'gu' ? 'હાલની ફેમિલી ID જોડો' : language === 'hi' ? 'मौजूदा परिवार आईडी लिंक करें' : 'Link Existing Family ID'}
                      </span>
                    </label>
                  </div>

                  {householdMode === 'new' ? (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          {language === 'gu' ? 'જિલ્લો' : language === 'hi' ? 'ज़िला' : 'District'}
                        </Label>
                        <Select value={district} onValueChange={setDistrict}>
                          <SelectTrigger className="text-xs bg-white border-slate-300 text-slate-900 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {GUJARAT_DISTRICTS.map((d) => (
                              <SelectItem key={d} value={d} className="text-xs">
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-600 font-semibold">
                          {language === 'gu' ? 'વિસ્તાર વર્ગીકરણ' : language === 'hi' ? 'क्षेत्र वर्गीकरण' : 'Area Classification'}
                        </Label>
                        <Select value={areaType} onValueChange={(v: 'urban' | 'rural') => setAreaType(v)}>
                          <SelectTrigger className="text-xs bg-white border-slate-300 text-slate-900 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urban" className="text-xs">
                              {language === 'gu' ? 'શહેરી (નગરપાલિકા)' : language === 'hi' ? 'शहरी (नगरपालिका)' : 'Urban (Municipal)'}
                            </SelectItem>
                            <SelectItem value="rural" className="text-xs">
                              {language === 'gu' ? 'ગ્રામીણ (ગ્રામ પંચાયત)' : language === 'hi' ? 'ग्रामीण (ग्राम पंचायत)' : 'Rural (Gram Panchayat)'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Label className="text-[10px] text-slate-600 font-semibold">
                        {language === 'gu' ? '૧૨-અંક ગુજરાત ફેમિલી ID' : language === 'hi' ? '१२-अंकीय गुजरात परिवार आईडी' : '12-Digit Gujarat Family ID'}
                      </Label>
                      <Input
                        value={familyId}
                        onChange={(e) => setFamilyId(e.target.value)}
                        placeholder="e.g. 240100000001"
                        className="text-xs bg-white border-slate-300 text-slate-900 font-mono h-8"
                        required={householdMode === 'link'}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-800">
                    {language === 'gu' ? 'સંપૂર્ણ નામ' : language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                  </Label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'gu' ? 'દા.ત. રમેશભાઈ પટેલ' : language === 'hi' ? 'उदा. रमेशभाई पटेल' : 'e.g. Rameshbhai Patel'}
                    className="text-xs bg-white border-slate-300 text-slate-900 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-800">
                    {language === 'gu' ? 'મોબાઇલ નંબર' : language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="pl-9 text-xs bg-white border-slate-300 text-slate-900 h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-800">
                    {language === 'gu' ? 'ઇમેઇલ સરનામું' : language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="pl-9 text-xs bg-white border-slate-300 text-slate-900 h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-800">
                    {language === 'gu' ? 'પાસવર્ડ' : language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 text-xs bg-white border-slate-300 text-slate-900 h-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-xs font-bold h-10 bg-[#133B42] hover:bg-[#1A4B54] text-white shadow-sm"
              >
                {loading
                  ? (language === 'gu' ? 'કુટુંબ રેકોર્ડ બની રહ્યો છે...' : language === 'hi' ? 'परिवार रिकॉर्ड बनाया जा रहा है...' : 'Creating Household Record...')
                  : (language === 'gu' ? 'નોંધણી પૂર્ણ કરો' : language === 'hi' ? 'पंजीकरण पूर्ण करें' : 'Complete Registration')}
              </Button>
            </form>

            <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100">
              {language === 'gu' ? 'પહેલેથી જ ખાતું છે?' : language === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
              <Link href="/login" className="text-[#133B42] hover:text-[#1A4B54] font-bold underline">
                {language === 'gu' ? 'લૉગિન કરો' : language === 'hi' ? 'साइन इन करें' : 'Sign In'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
