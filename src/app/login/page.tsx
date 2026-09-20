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
import { Badge } from '@/components/ui/badge';
import {
  Fingerprint,
  ShieldCheck,
  User,
  Crown,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Phone,
  Globe,
} from 'lucide-react';
import { AuroraGlow } from '@/components/effects/aurora-glow';
import { BorderBeam } from '@/components/effects/border-beam';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || (language === 'gu' ? 'લૉગિન નિષ્ફળ રહ્યું' : language === 'hi' ? 'लॉगिन विफल रहा' : 'Failed to sign in'));
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#FBF9F5] via-[#FAF7F0] to-[#F3EDE0] text-slate-900 overflow-hidden">
      {/* ReactBits Ambient Organic Aurora Glow */}
      <AuroraGlow intensity="subtle" />

      <div className="relative z-10 w-full max-w-md space-y-6">
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

        {/* Emblem & Official Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E3DA] text-[#133B42] text-xs font-bold shadow-2xs">
            <span className="text-base">🏛️</span>
            {language === 'gu' ? 'ગુજરાત સરકાર' : language === 'hi' ? 'गुजरात सरकार' : 'Government of Gujarat'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#133B42] tracking-tight">
            {language === 'gu' ? 'ગુજરાત ફેમિલી આઈડી પોર્ટલ' : language === 'hi' ? 'गुजरात परिवार आईडी पोर्टल' : 'Gujarat Family ID Portal'}
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {language === 'gu'
              ? 'નાગરિક પરિવારો અને પંચાયત કલ્યાણ અધિકારીઓ માટે સત્તાવાર સુરક્ષિત સિંગલ સાઇન-ઓન'
              : language === 'hi'
              ? 'नागरिक परिवारों और पंचायत कल्याण अधिकारियों हेतु सुरक्षित सिंगल साइन-ऑन'
              : 'Secure Single Sign-On for Citizen Households & Panchayat Welfare Officers'}
          </p>
        </div>

        {/* 1-Click Fast-Switch Role Box (Subtle Warm Civic Theme) */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E3DA] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D46E38]" />
              {language === 'gu' ? 'ચકાસાયેલ નાગરિક ભૂમિકાઓ' : language === 'hi' ? 'सत्यापित नागरिक प्रोफाइल' : 'Verified Civic Personas'}
            </span>
            <Badge variant="outline" className="text-[10px] bg-[#FAF7F0] text-slate-700 border-[#E8E3DA] font-semibold">
              {language === 'gu' ? 'ત્વરિત પ્રવેશ' : language === 'hi' ? 'त्वरित प्रवेश' : 'Instant Access'}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            {language === 'gu'
              ? 'કલ્યાણકારી યોજનાઓ અથવા પંચાયત વહીવટી સમીક્ષા માટે 1-ક્લિક વડે લૉગિન કરો:'
              : language === 'hi'
              ? 'कल्याणकारी योजनाओं अथवा पंचायत प्रशासन समीक्षा हेतु 1-क्लिक से लॉगिन करें:'
              : 'Sign in instantly with a verified persona to inspect civic entitlements or officer administration:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loginAsDemo('admin')}
              className="h-auto py-2.5 px-3 bg-blue-50/80 border-blue-300 text-blue-950 hover:bg-blue-100 flex flex-col items-start gap-0.5 text-left group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 w-full justify-between">
                <span className="font-bold text-xs flex items-center gap-1 text-blue-900">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  {language === 'gu' ? 'તલાટી / એડમિન' : language === 'hi' ? 'तलाटी / व्यवस्थापक' : 'Talati / Admin'}
                </span>
                <ArrowRight className="w-3 h-3 text-blue-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[10px] text-slate-600">
                {language === 'gu' ? 'સંપૂર્ણ રજીસ્ટ્રી અને ડુપ્લિકેશન ઓડિટ' : language === 'hi' ? 'संपूर्ण रजिस्ट्री एवं डुप्लीकेशन ऑडिट' : 'Full registry & deduplication audit'}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loginAsDemo('citizen')}
              className="h-auto py-2.5 px-3 bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100 flex flex-col items-start gap-0.5 text-left group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 w-full justify-between">
                <span className="font-bold text-xs flex items-center gap-1 text-amber-950">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'gu' ? 'નાગરિક (પટેલ કુટુંબ)' : language === 'hi' ? 'नागरिक (पटेल परिवार)' : 'Citizen (Patel)'}
                </span>
                <ArrowRight className="w-3 h-3 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[10px] text-slate-600">
                {language === 'gu' ? 'પટેલ કુટુંબના હકદાર લાભાર્થી' : language === 'hi' ? 'पटेल परिवार के हकदार लाभार्थी' : 'Patel household beneficiary'}
              </span>
            </Button>
          </div>
        </div>

        {/* Standard Email/Password Form        {/* Card (Light Theme) */}
        <Card className="relative border border-[#E8E3DA] bg-white text-slate-900 shadow-xl overflow-hidden">
          {/* ReactBits Dynamic Light Beam */}
          <BorderBeam size={260} duration={12} colorFrom="#133B42" colorTo="#D46E38" />

          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {language === 'gu' ? 'સત્તાવાર નાગરિક લૉગિન' : language === 'hi' ? 'आधिकारिक नागरिक लॉगिन' : 'Official Citizen Sign In'}
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              {language === 'gu'
                ? 'તમારા નોંધાયેલા ઇમેઇલ અને પાસવર્ડ સાથે લૉગિન કરો'
                : language === 'hi'
                ? 'अपने पंजीकृत ईमेल और क्रेडेंशियल्स के साथ लॉगिन करें'
                : 'Sign in with your registered email and credentials'}
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
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800">
                  {language === 'gu' ? 'સત્તાવાર / નાગરિક ઇમેઇલ' : language === 'hi' ? 'आधिकारिक / नागरिक ईमेल' : 'Official / Citizen Email'}
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. citizen@gujarat.gov.in"
                    className="pl-9 text-xs bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-800">
                    {language === 'gu' ? 'પાસવર્ડ' : language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </Label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {language === 'gu' ? 'ડિફૉલ્ટ:' : language === 'hi' ? 'डिफ़ॉल्ट:' : 'Default:'} Citizen@12345
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-xs font-bold h-10 bg-[#133B42] hover:bg-[#1A4B54] text-white shadow-sm"
              >
                {loading
                  ? (language === 'gu' ? 'પ્રમાણીકરણ થઈ રહ્યું છે...' : language === 'hi' ? 'प्रमाणीकरण हो रहा है...' : 'Authenticating...')
                  : (language === 'gu' ? 'ફેમિલી પોર્ટલમાં લૉગિન કરો' : language === 'hi' ? 'परिवार पोर्टल में लॉगिन करें' : 'Sign In to Family Portal')}
              </Button>
            </form>

            <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100">
              {language === 'gu' ? 'નવું કુટુંબ ખાતું બનાવવું છે?' : language === 'hi' ? 'क्या आपका खाता नहीं है?' : "Don't have an account or new household?"}{' '}
              <Link href="/signup" className="text-[#133B42] hover:text-[#1A4B54] font-bold underline">
                {language === 'gu' ? 'અહીં નોંધણી કરો' : language === 'hi' ? 'यहाँ पंजीकरण करें' : 'Register Here'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Helpline Footer info */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {language === 'gu' ? 'ટોલ-ફ્રી નાગરિક હેલ્પલાઇન:' : language === 'hi' ? 'टोल-फ्री नागरिक हेल्पलाइन:' : 'Toll-Free Civic Support:'}{' '}
            <strong>1800-233-5500</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
