'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Crown, Heart, Baby, GraduationCap, Users, User,
  CheckCircle2, Sparkles, ShieldCheck, HeartHandshake,
  Zap, Clock, Award, Briefcase, BookOpen, AlertCircle,
  ExternalLink, ArrowDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { calculateAge, formatCurrency, getSchemeCategoryColor } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import type { Family, FamilyMember, SchemeRule } from '@/lib/types';

interface FamilyTreeProps {
  family: Family;
  eligibleSchemes?: (SchemeRule & {
    eligible_members?: { member_id?: string; member_name?: string }[];
  })[];
  onSelectMemberForSimulation?: (memberId: string, eventType?: string) => void;
}

export function FamilyTree({ family, eligibleSchemes = [], onSelectMemberForSimulation }: FamilyTreeProps) {
  const { language } = useLanguage();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Group members by generational hierarchy
  const elders = family.members.filter(m => m.relation_to_head === 'parent');
  const head = family.members.find(m => m.relation_to_head === 'head') || family.members[0];
  const spouse = family.members.find(m => m.relation_to_head === 'spouse');
  const children = family.members
    .filter(m => m.relation_to_head === 'child')
    .sort((a, b) => {
      const yearA = parseInt(a.dob.match(/^(\d{4})/)?.[1] || '0', 10);
      const yearB = parseInt(b.dob.match(/^(\d{4})/)?.[1] || '0', 10);
      return yearA - yearB;
    });
  const others = family.members.filter(m => m.relation_to_head === 'other');

  // Compute targeted welfare schemes for a given member
  const getSchemesForMember = (member: FamilyMember) => {
    return eligibleSchemes.filter(s => {
      // Direct member match
      if (s.eligible_members?.some(em => em.member_id === member.member_id || em.member_name === member.name)) {
        return true;
      }
      // Senior specific
      const age = calculateAge(member.dob);
      if (age >= 60 && (s.category === 'pension' || s.id.includes('senior') || s.id.includes('vridh'))) {
        return true;
      }
      // Girl child specific
      if (member.gender === 'female' && member.relation_to_head === 'child' && (s.id.includes('dikri') || s.id.includes('kanya'))) {
        return true;
      }
      // Farmer head specific
      if (member.relation_to_head === 'head' && member.occupation === 'farmer' && (s.id.includes('kisan') || s.category === 'employment')) {
        return true;
      }
      return false;
    });
  };

  // Helper to render member card
  const renderMemberNode = (m: FamilyMember, roleLabel: string, roleColor: string, isHead = false) => {
    const age = calculateAge(m.dob);
    const memberSchemes = getSchemesForMember(m);
    const isSelected = selectedMemberId === m.member_id;

    return (
      <motion.div
        key={m.member_id}
        whileHover={{ y: -4, transition: { duration: 0.15 } }}
        onClick={() => setSelectedMemberId(isSelected ? null : m.member_id)}
        className={`relative w-72 sm:w-80 cursor-pointer rounded-2xl border-2 transition-all duration-200 bg-white text-left shadow-sm hover:shadow-md ${
          isSelected
            ? 'border-indigo-600 ring-4 ring-indigo-500/15'
            : isHead
            ? 'border-amber-400/90 shadow-amber-500/5'
            : 'border-slate-200/90 hover:border-slate-300'
        } ${!m.is_alive ? 'opacity-60 bg-slate-50' : ''}`}
      >
        {/* Node Top Banner */}
        <div className={`px-4 py-2.5 rounded-t-xl border-b flex items-center justify-between text-xs ${roleColor}`}>
          <div className="flex items-center gap-1.5 font-bold">
            {isHead ? (
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
            ) : m.relation_to_head === 'parent' ? (
              <HeartHandshake className="w-4 h-4 text-indigo-700" />
            ) : m.relation_to_head === 'spouse' ? (
              <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />
            ) : (
              <Baby className="w-4 h-4 text-emerald-700" />
            )}
            <span>{roleLabel}</span>
          </div>

          <span className="font-mono text-[10px] font-bold opacity-80">
            #{m.member_id}
          </span>
        </div>

        {/* Node Details Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-900 leading-snug">
                {m.name}
              </h4>
              <Badge variant="outline" className="text-[10px] font-semibold capitalize bg-slate-50 border-slate-200 text-slate-700">
                {m.gender}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {age} {language === 'gu' ? 'વર્ષ' : language === 'hi' ? 'वर्ष' : 'years old'} · {m.dob?.includes('*') ? `${language === 'gu' ? 'જન્મ વર્ષ' : language === 'hi' ? 'जन्म वर्ष' : 'Born'} ${m.dob.substring(0, 4)} (${language === 'gu' ? 'ગોપનીય સુરક્ષિત' : language === 'hi' ? 'गोपनीय' : 'Protected'})` : `${language === 'gu' ? 'જન્મ' : language === 'hi' ? 'जन्म' : 'Born'} ${m.dob}`}
            </p>
          </div>

          {/* Attributes Pills */}
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium capitalize flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-500" />
              {m.occupation}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium capitalize flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-500" />
              {m.education_level}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium capitalize">
              {m.marital_status}
            </span>

            {m.disability_status && (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                ♿ Disability ({m.disability_percentage || 40}%)
              </span>
            )}
            {m.is_pregnant && (
              <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 font-bold border border-pink-200">
                🤰 Pregnant Mother
              </span>
            )}
            {age >= 60 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-200">
                👵 Senior Citizen
              </span>
            )}
            {m.gender === 'female' && m.relation_to_head === 'child' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                👧 Girl Child
              </span>
            )}
            {!m.is_alive && (
              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold">
                Deceased
              </span>
            )}
          </div>

          {/* Mapped Schemes for this member */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-600 uppercase tracking-wider">
                {language === 'gu' ? 'સીધા લાભો:' : language === 'hi' ? 'प्रत्यक्ष लाभ:' : 'Direct Schemes:'}
              </span>
              <span className="font-bold text-indigo-700 font-mono">
                {memberSchemes.length} {language === 'gu' ? 'સક્રિય' : language === 'hi' ? 'सक्रिय' : 'Active'}
              </span>
            </div>

            {memberSchemes.length > 0 ? (
              <div className="space-y-1">
                {memberSchemes.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    className="p-1.5 rounded-md bg-slate-50 border border-slate-200/80 text-[10px] flex items-center justify-between gap-1"
                  >
                    <span className="font-medium text-slate-800 truncate">
                      {language === 'gu' && s.name_gu ? s.name_gu : language === 'hi' && s.name_hi ? s.name_hi : s.name}
                    </span>
                    <span className="font-bold text-emerald-700 shrink-0">
                      {language === 'gu' && s.benefit_gu ? s.benefit_gu.split(';')[0] : language === 'hi' && s.benefit_hi ? s.benefit_hi.split(';')[0] : s.benefit.split(';')[0]}
                    </span>
                  </div>
                ))}
                {memberSchemes.length > 2 && (
                  <p className="text-[9px] text-slate-500 font-medium text-right">
                    +{memberSchemes.length - 2} {language === 'gu' ? 'વધુ યોજનાઓ જોડાયેલ' : language === 'hi' ? 'अन्य योजनाएं जुड़ी हैं' : 'more programs linked'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">
                {language === 'gu' ? 'NFSA રેશન ક્વોટા હેઠળ લાભાર્થી' : language === 'hi' ? 'NFSA राशन कोटा अंतर्गत लाभार्थी' : 'Indirect beneficiary via household NFSA ration'}
              </p>
            )}
          </div>

          {/* 1-Click Simulation Trigger for this Member */}
          {onSelectMemberForSimulation && m.is_alive && (
            <div className="pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMemberForSimulation(m.member_id);
                }}
                className="w-full text-[11px] h-7 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-950 font-semibold"
              >
                <Zap className="w-3 h-3 mr-1 text-amber-600" />
                {language === 'gu' ? `${m.name.split(' ')[0]} માટે જીવન ઘટના સિમ્યુલેટ કરો` : language === 'hi' ? `${m.name.split(' ')[0]} के लिए जीवन घटना सिमुलेट करें` : `Simulate Event for ${m.name.split(' ')[0]}`}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-white via-[#FAF7F0] to-[#F5EFE4] border border-[#E8E3DA] space-y-10 shadow-sm overflow-x-auto">
      {/* Legend & Tree Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3DA] pb-4">
        <div>
          <h3 className="text-base font-black text-[#133B42] flex items-center gap-2">
            <span className="text-lg">🌳</span>
            {language === 'gu' ? 'ગુજરાત કુટુંબ વંશાવળી વૃક્ષ' : language === 'hi' ? 'गुजरात परिवार वंशावली वृक्ष' : 'Gujarat Household Genealogical Tree'}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {language === 'gu'
              ? 'વડીલોથી માંડી નવજાત શિશુ સુધી સરકારી કલ્યાણકારી હકોનું વંશાનુગત મોડલ.'
              : language === 'hi'
              ? 'वरिष्ठ बुजुर्गों से लेकर नवजात शिशु तक सरकारी कल्याणकारी अधिकारों का पदानुक्रमित मॉडल।'
              : 'Generational welfare hierarchy modeling how entitlements flow from seniors down to newborn children.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold">
            <HeartHandshake className="w-3 h-3 text-indigo-700" /> {language === 'gu' ? 'વડીલો (પેઢી ૧)' : language === 'hi' ? 'बुजुर्ग (पीढ़ी 1)' : 'Elders (Gen I)'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            <Crown className="w-3 h-3 text-amber-600" /> {language === 'gu' ? 'વડા અને જીવનસાથી (પેઢી ૨)' : language === 'hi' ? 'मुखिया एवं जीवनसाथी (पीढ़ी 2)' : 'Head & Spouse (Gen II)'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
            <Baby className="w-3 h-3 text-emerald-700" /> {language === 'gu' ? 'બાળકો / વારસદારો (પેઢી ૩)' : language === 'hi' ? 'संतान / वारिस (पीढ़ी 3)' : 'Children (Gen III)'}
          </span>
        </div>
      </div>

      <div className="min-w-[700px] flex flex-col items-center space-y-8">
        {/* ============================================================ */}
        {/* GENERATION 1: ELDERS / GRANDPARENTS (IF ANY) */}
        {/* ============================================================ */}
        {elders.length > 0 && (
          <div className="flex flex-col items-center space-y-4">
            <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 text-[11px] font-bold tracking-wide uppercase shadow-2xs">
              {language === 'gu' ? 'પેઢી ૧ · વડીલો / દાદા-દાદી' : language === 'hi' ? 'पीढ़ी 1 · वरिष्ठ बुजुर्ग / दादा-दादी' : 'Generation I · Elders & Grandparents'}
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {elders.map((elder) =>
                renderMemberNode(
                  elder,
                  elder.gender === 'male'
                    ? (language === 'gu' ? 'દાદા · પિતા / વડીલ' : language === 'hi' ? 'दादा · पिता / वरिष्ठ' : 'Grandfather · Elder Father')
                    : (language === 'gu' ? 'દાદી · માતા / વડીલ' : language === 'hi' ? 'दादी · माता / वरिष्ठ' : 'Grandmother · Elder Mother'),
                  'bg-indigo-50/90 text-indigo-950 border-indigo-200'
                )
              )}
            </div>

            {/* Vertical Connector down to Gen 2 */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 -mt-1" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* GENERATION 2: HEAD OF HOUSEHOLD & SPOUSE */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold tracking-wide uppercase shadow-2xs">
            {language === 'gu' ? 'પેઢી ૨ · સંયુક્ત કુટુંબ વડા અને જીવનસાથી' : language === 'hi' ? 'पीढ़ी 2 · संयुक्त परिवार मुखिया एवं जीवनसाथी' : 'Generation II · Household Head & Spouse'}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 relative">
            {/* Head of Household */}
            {head &&
              renderMemberNode(
                head,
                language === 'gu' ? 'કુટુંબના વડા (મુખ્ય સંચાલક)' : language === 'hi' ? 'परिवार के मुखिया (मुख्य संचालक)' : 'Head of Household',
                'bg-amber-100/90 text-amber-950 border-amber-300',
                true
              )}

            {/* Marriage Joint Node / Connector */}
            {spouse && (
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-300 shadow-sm z-10">
                <span className="text-base">💍</span>
                <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-tighter mt-0.5">
                  {language === 'gu' ? 'લગ્ન' : language === 'hi' ? 'विवाह' : 'Married'}
                </span>
                <span className="text-[8px] text-slate-500 font-medium">
                  {language === 'gu' ? 'સંયુક્ત વડા' : language === 'hi' ? 'संयुक्त मुखिया' : 'Joint Union'}
                </span>
              </div>
            )}

            {/* Spouse Node */}
            {spouse &&
              renderMemberNode(
                spouse,
                spouse.gender === 'female'
                  ? (language === 'gu' ? 'પત્ની · સંયુક્ત વડા' : language === 'hi' ? 'पत्नी · संयुक्त मुखिया' : 'Spouse · Joint Head')
                  : (language === 'gu' ? 'પતિ · સંયુક્ત વડા' : language === 'hi' ? 'पति · संयुक्त मुखिया' : 'Spouse · Joint Head'),
                'bg-rose-50/90 text-rose-950 border-rose-200'
              )}
          </div>

          {/* Vertical Stem down to Children (Gen 3) */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 -mt-1" />
          </div>
        </div>

        {/* ============================================================ */}
        {/* GENERATION 3: CHILDREN / DEPENDENTS */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-[11px] font-bold tracking-wide uppercase shadow-2xs">
            {language === 'gu' ? 'પેઢી ૩ · વારસદારો / બાળકો' : language === 'hi' ? 'पीढ़ी 3 · संतान / बच्चे' : 'Generation III · Descendants & Children'}
          </div>

          {children.length > 0 ? (
            <div className="w-full flex flex-col items-center">
              {/* Horizontal Bus Line spanning children */}
              {children.length > 1 && (
                <div
                  className="h-0.5 bg-slate-300 hidden md:block"
                  style={{
                    width: `${Math.min(children.length * 320 - 100, 960)}px`,
                  }}
                />
              )}

              {/* Children Nodes Grid */}
              <div className="flex flex-wrap justify-center gap-6 pt-2">
                {children.map((child, idx) => (
                  <div key={child.member_id} className="flex flex-col items-center">
                    {/* Vertical drop line from bus line */}
                    {children.length > 1 && (
                      <div className="w-0.5 h-4 bg-slate-300 hidden md:block" />
                    )}

                    {renderMemberNode(
                      child,
                      child.gender === 'female'
                        ? (language === 'gu' ? `દીકરી (#${idx + 1})` : language === 'hi' ? `पुत्री (#${idx + 1})` : `Daughter (#${idx + 1})`)
                        : (language === 'gu' ? `દીકરો (#${idx + 1})` : language === 'hi' ? `पुत्र (#${idx + 1})` : `Son (#${idx + 1})`),
                      'bg-emerald-50/90 text-emerald-950 border-emerald-200'
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-2 max-w-md">
              <Baby className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                {language === 'gu' ? 'આ કુટુંબમાં કોઈ બાળકો નોંધાયેલ નથી' : language === 'hi' ? 'इस परिवार में कोई संतान पंजीकृत नहीं है' : 'No Children Registered in this Household'}
              </p>
              <p className="text-[11px] text-slate-500">
                {language === 'gu' ? 'નવજાત બાળકના જન્મનું સિમ્યુલેશન કરવા ઉપર આપેલ જીવન ઘટના સિમ્યુલેટર ટેબનો ઉપયોગ કરો.' : language === 'hi' ? 'नवजात शिशु जन्म का सिमुलेशन करने के लिए ऊपर दिए जीवन घटना सिमुलेटर टैब का उपयोग करें।' : 'You can use the Life-Event Simulator tab above to model newborn childbirth or child adoption.'}
              </p>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* OTHER RELATIVES (IF ANY) */}
        {/* ============================================================ */}
        {others.length > 0 && (
          <div className="flex flex-col items-center space-y-4 pt-4 border-t border-slate-200 w-full">
            <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-bold tracking-wide uppercase">
              Collateral &amp; Extended Family Members
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {others.map((rel) =>
                renderMemberNode(
                  rel,
                  'Relative · અન્ય સભ્ય',
                  'bg-slate-100 text-slate-900 border-slate-300'
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
