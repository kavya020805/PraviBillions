'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, CheckCircle2, QrCode, Shield, Sparkles, Building2, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import type { Family } from '@/lib/types';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  family?: Family | null;
}

export function DigitalCardModal({ isOpen, onClose, family }: DigitalCardModalProps) {
  const { language } = useLanguage();

  // Default to Patel family if none passed
  const fam = family || {
    family_id: '240100000001',
    district: 'Ahmedabad',
    household_income_annual: 110000,
    income_band: 'lig',
    caste_category: 'obc',
    land_owned_acres: 1.5,
    house_type: 'kutcha',
    phone_number: '9876543210',
    address: '42, Mahatma Gandhi Road, Navrangpura',
    pincode: '380009',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      { member_id: 'MEM001', family_id: '240100000001', name: 'Rameshbhai Patel', relation_to_head: 'head', dob: '1969-09-20', gender: 'male', marital_status: 'married', occupation: 'shopkeeper', disability_status: false, education_level: 'secondary', is_bpl: false, is_alive: true },
      { member_id: 'MEM002', family_id: '240100000001', name: 'Savitaben Patel', relation_to_head: 'spouse', dob: '1972-09-20', gender: 'female', marital_status: 'married', occupation: 'homemaker', disability_status: false, education_level: 'primary', is_bpl: false, is_alive: true },
      { member_id: 'MEM003', family_id: '240100000001', name: 'Vikram Patel', relation_to_head: 'child', dob: '2009-09-20', gender: 'male', marital_status: 'single', occupation: 'student', disability_status: false, education_level: 'secondary', is_bpl: false, is_alive: true },
      { member_id: 'MEM004', family_id: '240100000001', name: 'Priya Patel', relation_to_head: 'child', dob: '2012-09-20', gender: 'female', marital_status: 'single', occupation: 'student', disability_status: false, education_level: 'secondary', is_bpl: false, is_alive: true },
      { member_id: 'MEM005', family_id: '240100000001', name: 'Kantaben Patel', relation_to_head: 'parent', dob: '1948-09-20', gender: 'female', marital_status: 'widowed', occupation: 'none', disability_status: false, education_level: 'none', is_bpl: false, is_alive: true },
    ]
  };

  const head = fam.members.find(m => m.relation_to_head === 'head' && m.is_alive) || fam.members[0];

  const handlePrint = () => {
    window.print();
  };

  const formatRelation = (rel: string) => {
    switch (rel) {
      case 'head': return language === 'gu' ? 'વડા (મોભી)' : language === 'hi' ? 'मुखिया' : 'Head';
      case 'spouse': return language === 'gu' ? 'પત્ની / પતિ' : language === 'hi' ? 'जीवनसाथी' : 'Spouse';
      case 'child': return language === 'gu' ? 'સંતાન' : language === 'hi' ? 'संतान' : 'Child';
      case 'parent': return language === 'gu' ? 'વડીલ માતા/પિતા' : language === 'hi' ? 'माता/पिता' : 'Parent';
      default: return rel;
    }
  };

  const formatGender = (gender: string) => {
    if (gender === 'male') return language === 'gu' ? 'પુરુષ' : language === 'hi' ? 'पुरुष' : 'Male';
    if (gender === 'female') return language === 'gu' ? 'સ્ત્રી' : language === 'hi' ? 'महिला' : 'Female';
    return gender;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white text-slate-900 border-2 border-amber-500 shadow-2xl print:border-none print:shadow-none print:max-w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden !important; }
            #printable-family-card, #printable-family-card * { visibility: visible !important; }
            #printable-family-card {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              background: white !important;
              box-shadow: none !important;
            }
          }
        `}} />
        <DialogHeader className="sr-only">
          <DialogTitle>Gujarat Digital Family ID Smart Card</DialogTitle>
          <DialogDescription>Official printable digital family identity card for Gujarat citizens</DialogDescription>
        </DialogHeader>

        {/* Printable Card Container */}
        <div id="printable-family-card" className="p-6 sm:p-8 space-y-5 bg-gradient-to-b from-amber-50/40 via-white to-orange-50/30">
          {/* Card Top Border Ribbon */}
          <div className="h-2 -mt-6 -mx-6 sm:-mt-8 sm:-mx-8 flex">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

          {/* Official Gov Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-600/30 pb-4">
            <div className="flex items-center gap-3">
              {/* Ashoka Emblem Vector representation */}
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-lg shadow-2xs">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-950 uppercase tracking-tight">
                    ગુજરાત સરકાર · GOVERNMENT OF GUJARAT
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  ખોરાક, નાગરિક પુરવઠો અને ગ્રાહક બાબતોનો વિભાગ
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  DIGITAL FAMILY ID &amp; RATION CARD 2.0 (NFSA PHH)
                </p>
              </div>
            </div>

            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-mono text-[10px]">
                AADHAAR e-KYC VERIFIED
              </Badge>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                SECURE TOKEN #GJ-{fam.family_id.substring(6)}
              </p>
            </div>
          </div>

          {/* Family ID Primary Number Display */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                12-Digit Gujarat Family ID (પરિવાર આઈડી)
              </p>
              <p className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white">
                {fam.family_id.replace(/(\d{4})/g, '$1 ').trim()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold font-mono">
                {fam.caste_category.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold font-mono">
                {fam.income_band.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Household Head & Location Details */}
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Head of Household (પરિવારના વડા)</p>
              <p className="font-bold text-slate-900 text-sm">{head?.name}</p>
              <p className="text-[11px] text-slate-600">Male · Shopkeeper</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Fair Price Shop (વાજબી ભાવની દુકાન)</p>
              <p className="font-bold text-slate-900">FPS-AHM-042</p>
              <p className="text-[11px] text-slate-600">{fam.district} · Ward 4</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Foodgrain Quota (માસિક અનાજ)</p>
              <p className="font-bold text-emerald-700 text-sm">25 kg Wheat &amp; Rice</p>
              <p className="text-[11px] text-slate-600">₹2/kg Subsidized Rate</p>
            </div>
          </div>

          {/* Members Table */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>
                {language === 'gu'
                  ? `નોંધાયેલા કુટુંબ સભ્યો (${fam.members.length})`
                  : language === 'hi'
                  ? `पंजीकृत परिवार के सदस्य (${fam.members.length})`
                  : `Registered Household Members (${fam.members.length})`}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {language === 'gu' ? 'તમામ સભ્યો સિંગલ ફેમિલી ID સાથે જોડાયેલા છે' : language === 'hi' ? 'सभी सदस्य एकल परिवार आईडी से जुड़े हैं' : 'All mapped to single Family ID'}
              </span>
            </p>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="p-2">{language === 'gu' ? 'સભ્ય ID' : language === 'hi' ? 'सदस्य ID' : 'Member ID'}</th>
                    <th className="p-2">{language === 'gu' ? 'સંપૂર્ણ નામ' : language === 'hi' ? 'पूरा नाम' : 'Full Name'}</th>
                    <th className="p-2">{language === 'gu' ? 'સંબંધ' : language === 'hi' ? 'संबंध' : 'Relation'}</th>
                    <th className="p-2">{language === 'gu' ? 'જાતિ' : language === 'hi' ? 'लिंग' : 'Gender'}</th>
                    <th className="p-2">{language === 'gu' ? 'ઉંમર' : language === 'hi' ? 'आयु' : 'Age'}</th>
                    <th className="p-2">{language === 'gu' ? 'સ્થિતિ' : language === 'hi' ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {fam.members.map((m) => {
                    const birthYear = new Date(m.dob).getFullYear();
                    const age = Math.max(0, 2026 - birthYear);
                    return (
                      <tr key={m.member_id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-500">{m.member_id}</td>
                        <td className="p-2 font-bold text-slate-900">{m.name}</td>
                        <td className="p-2 text-slate-700">{formatRelation(m.relation_to_head)}</td>
                        <td className="p-2 text-slate-700">{formatGender(m.gender)}</td>
                        <td className="p-2 text-slate-700">
                          {age} {language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'yrs'}
                        </td>
                        <td className="p-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {language === 'gu' ? 'સક્રિય' : language === 'hi' ? 'सक्रिय' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Features & QR Stamp */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-300 p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 text-[11px]">
                  {language === 'gu' ? 'સત્તાવાર ગુજરાત પીડીએસ બાયોમેટ્રિક ક્યુઆર કોડ' : language === 'hi' ? 'आधिकारिक गुजरात पीडीएस बायोमेट्रिक क्यूआर कोड' : 'Official Gujarat PDS Biometric QR Code'}
                </p>
                <p className="text-[10px] text-slate-600">
                  {language === 'gu'
                    ? 'ત્વરિત પેપરલેસ ચકાસણી માટે કોઈપણ વાજબી ભાવની દુકાન અથવા મામલતદાર ઈ-ગ્રામ કેન્દ્ર પર સ્કેન કરો.'
                    : language === 'hi'
                    ? 'त्वरित पेपरलेस सत्यापन हेतु किसी भी उचित मूल्य की दुकान या ई-ग्राम केंद्र पर स्कैन करें।'
                    : 'Scan at any Fair Price Shop or Mamlatdar e-Gram Center for instant paperless benefit verification.'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                {language === 'gu' ? 'ગુજરાત સરકાર' : language === 'hi' ? 'गुजरात सरकार' : 'GOVT OF GUJARAT'}
              </Badge>
              <p className="text-[9px] font-mono text-slate-400 mt-0.5">ISSUED: 2026</p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between print:hidden">
          <p className="text-xs text-slate-600">
            {language === 'gu'
              ? 'સમગ્ર ગુજરાતમાં કાનૂની માન્યતા ધરાવતો સત્તાવાર નાગરિક ઈ-દસ્તાવેજ.'
              : language === 'hi'
              ? 'संपूर्ण गुजरात में कानूनी मान्यता प्राप्त आधिकारिक नागरिक ई-दस्तावेज़।'
              : 'Official civic e-Document legally recognized across Gujarat.'}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              {language === 'gu' ? 'બંધ કરો' : language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
            <Button size="sm" onClick={handlePrint} className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              {language === 'gu' ? 'પ્રિન્ટ / પીડીએફ સાચવો' : language === 'hi' ? 'प्रिंट / पीडीएफ सेव करें' : 'Print / Save PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
