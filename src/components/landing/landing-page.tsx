'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, CheckCircle2, ArrowRight, Sparkles, Users, IndianRupee,
  Phone, Globe, Building2, Lock, ChevronRight, Fingerprint,
  Zap, HeartHandshake, Eye, Award, FileText, HelpCircle,
  TrendingUp, Layers, Check, ExternalLink, QrCode, ShieldCheck,
  Printer, Search, AlertCircle, Volume2, Pause, Play, RefreshCw,
  Clock, MapPin, CheckCircle, Baby, GraduationCap, Coins,
  ArrowUpRight, Activity, SlidersHorizontal, HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useAccessibility } from '@/lib/accessibility-context';
import { DigitalCardModal } from './digital-card-modal';
import { SpotlightCard } from '@/components/effects/spotlight-card';
import { ShinyText } from '@/components/effects/shiny-text';
import { BorderBeam } from '@/components/effects/border-beam';
import { AnimatedCounter } from '@/components/effects/animated-counter';
import { AuroraGlow } from '@/components/effects/aurora-glow';

// ============================================================
// Comprehensive Trilingual Content Dictionary
// ============================================================
const content = {
  en: {
    topGovIndia: 'भारत सरकार · Government of India',
    topGovGujarat: 'ગુજરાત સરકાર · Government of Gujarat',
    deptTitle: 'Department of Food, Civil Supplies & Consumer Affairs',
    portalSub: 'Government of Gujarat Civic Welfare Technology Initiative',
    helpline: 'Toll-Free Helpline: 1800-233-5500',
    skipToMain: 'Skip to main content',
    accessibility: 'Accessibility:',
    portalName: 'GUJARAT FAMILY ID',
    rationBadge: 'DIGITAL RATION 2.0',
    headerSlogan: 'One Family, One Identity, Complete Welfare',
    voiceAssistant: 'Voice Assistant',
    officerPortal: 'Talati Officer Portal',
    citizenSignIn: 'Citizen Sign In',
    viewCard: 'View Digital Family Card',
    sampleCardBtn: 'View Sample Digital Family Card',

    // Ticker
    tickerLabel: 'OFFICIAL CIVIC STREAM:',
    tickerText: '📢 Automatic Welfare Integration Live: Childbirth and 60th birthday milestones are now automatically mapped to NFSA foodgrains & PM-JAY Ayushman Bharat coverage across all 33 districts of Gujarat. No physical visits to Talati office required.',

    // Gateway
    gatewayTitle: 'Citizen & Panchayat Quick Access',
    gatewaySub: 'Instant access to Gujarat Family ID records, live life event simulations, and official audits',
    btnPatel: 'Citizen Household (Rameshbhai Patel)',
    btnOfficer: 'Talati Panchayat Officer (Bhupendrabhai)',
    btnVoice: 'Trilingual Voice Guide (Assistant)',

    // Hero
    heroBadge: 'Sovereign Digital Infrastructure · Gujarat Family ID Mission',
    heroTitlePart1: 'Beyond Traditional Paper Ration Cards.',
    heroTitlePart2: 'A Living Family Identity That Delivers Welfare Automatically.',
    heroDescription: "Gujarat's proactive welfare operating system permanently connects households to 20 flagship state and central programs. When a child is born, a senior turns 60, or income fluctuates, entitlements trigger automatically — zero repeated paperwork, zero queues, zero missed rations.",
    openPortalBtn: 'Open My Citizen Household Portal',
    trySandboxBtn: 'Test Live Proactive Sandbox',
    zeroForms: 'Zero Manual Forms',
    zeroFormsDesc: 'Event-driven automatic entitlement deltas',
    antiGhost: 'Algorithmic Integrity',
    antiGhostDesc: 'Soundex & Jaro-Winkler AI protects treasury',
    trilingual: 'Inclusive Access',
    trilingualDesc: 'Native Gujarati, Hindi & English TTS audio',

    // Card preview
    cardId: 'Live Household ID: 240100000001',
    cardVerified: 'Verified Gujarat Household',
    cardEntitlements: 'Active Programs',
    cardEntitlementsVal: '5 Schemes Mapped',
    cardNfsa: 'NFSA Digital Grain Quota',
    cardNfsaVal: '25 kg Wheat/Rice /mo',
    cardClickPrompt: 'Click to open official printable smart card',

    // Sandbox
    sandboxBadge: 'Interactive Citizen Playground',
    sandboxTitle: 'Experience Gujarat\'s Proactive Life-Event Engine',
    sandboxSub: 'Click the life events below to see how our event-driven declarative engine instantly recalibrates welfare entitlements with zero manual paperwork.',
    sandBirthBtn: 'Baby Girl Born (+1 Member)',
    sandSeniorBtn: 'Grandmother Turns 60',
    sandPassBtn: 'Daughter Passes 10th (78%)',
    sandIncomeBtn: 'Household Income Drops',
    sandResetBtn: 'Reset to Baseline (Patel Household)',
    sandDeltaTitle: 'Calculated Entitlement Delta',
    sandPaperwork: 'Paperwork Required',
    sandPaperworkVal: '0 Pages (Instant Auto-Trigger)',
    sandLatency: 'Average System Latency',
    sandLatencyVal: '0.84 seconds',

    // Tracker
    trackerBadge: 'Instant Citizen Verification Portal',
    trackerTitle: 'Track Your Gujarat Family ID & Ration Quota',
    trackerSub: 'Enter your 12-digit Family ID to view live PDS fair price shop allotment, active health cover, and biometric verification status.',
    trackerPlaceholder: 'Enter 12-digit Family ID (e.g. 240100000001)...',
    verifyBtn: 'Verify Records',
    tryDemoBtn: 'Try Demo Patel Family',
    verifiedNotice: '✓ RECORD VERIFIED IN GUJARAT STATE REGISTRY',
    pdsShopLabel: 'PDS Ration Allocation',
    pmjayLabel: 'PM-JAY Ayushman Bharat',
    ekycLabel: 'Biometric Status',
    activeSchemesLabel: 'Active Mapped Welfare Programs',

    // Stats
    statCitizens: 'Citizens Monitored',
    statFamilies: 'Households Connected',
    statDistricts: 'Gujarat Districts',
    statSchemes: 'State & Central Schemes',
    statDisbursed: 'Proactive Disbursals',

    // Comparison
    compBadge: 'Ration Card 2.0 Transformation',
    compTitle: 'Why Traditional Paper Cards Failed & How Family ID Solves It',
    compSub: 'Transforming static paper booklets into an intelligent, dynamic civic operating system.',
    oldTitle: 'The Traditional Paper Ration Card',
    oldSub: 'Static booklet issued years ago',
    old1: 'Static & Stale: When a child is born or an elder turns 60, benefits are missed unless the family queues for weeks at the Mamlatdar office.',
    old2: 'Siloed Systems: Separate cards for Ration (NFSA), Health (Maa Card/PMJAY), Scholarships, and Widow pensions. Citizens get lost in bureaucracy.',
    old3: 'Vulnerable to Ghost Rations: Minor spelling variations in Gujarati and shared mobile numbers enable duplicate registrations that bleed public funds.',
    newTitle: 'Gujarat Family ID Copilot',
    newSub: 'Proactive life-event intelligence',
    new1: 'Proactive Life-Event Engine: The moment a birth, marriage, or 60th milestone is registered, entitlements are updated automatically.',
    new2: 'One Unified Household Identity: Single 12-digit number maps food rations, health coverage (Ayushman), education scholarships, and pensions.',
    new3: 'Probabilistic Deduplication: Soundex, Jaro-Winkler & Levenshtein matching flags ghost claimants and protects public treasury.',

    // Districts Hub
    districtBadge: 'Statewide Digital Grid',
    districtTitle: 'Real-Time Civic Health Across Gujarat\'s 33 Districts',
    districtSub: 'Explore connected households, active Fair Price Shops (FPS), and automated delivery fulfillment rates across districts.',

    // Calculator
    calcBadge: 'Interactive Welfare Calculator',
    calcTitle: 'Estimate Your Family\'s Gujarat Welfare Entitlements',
    calcSub: 'Adjust your household parameters below to preview how Family ID matches your family to state programs.',
    incomeLabel: 'Household Annual Income:',
    casteLabel: 'Caste Category:',
    anyCat: 'Any Category',
    hasGirl: 'Has Daughter / Girl Child',
    hasGirlDesc: 'Unlocks Vahli Dikri & Kanya Kelavani',
    hasElder: 'Has Senior Citizen (60+ yrs)',
    hasElderDesc: 'Unlocks Vridh Sahay & IGNOAPS Pension',
    calcEstMatch: 'Estimated Welfare Match:',
    calcProgramsAvail: 'Gujarat Welfare Programs Available',
    calcIncludes: 'Includes NFSA Food Ration, PMJAY-MAA Health (₹10 Lakhs/yr), and lifecycle cash grants.',
    claimBtn: 'Claim via Family ID',

    // Architecture
    archBadge: 'System Architecture',
    archTitle: 'The 3 Civic Pillars Powering Gujarat Family ID',
    archSub: 'Built strictly to state digital governance standards with live database sync.',
    mod1Title: 'Proactive Life-Event Engine',
    mod1Desc: 'Notice transitions like childbirth, 18th/60th birthdays, widowhood, or income drops. Calculates instant before/after eligibility deltas with zero manual forms.',
    mod1Link: '20 Real Gujarat Schemes Tracked',
    mod2Title: 'Registry Deduplication Audit',
    mod2Desc: 'Probabilistic cross-family matching with phonetic Soundex, Jaro-Winkler head name proximity, DOB clustering, and phone overlap to eliminate ghost beneficiaries.',
    mod2Link: 'Officer Audit & Weight Tuning',
    mod3Title: 'Trilingual Voice Assistant',
    mod3Desc: 'Dynamic conversational welfare discovery in native Gujarati, Hindi, and English. Employs browser Web Speech synthesis for inclusive, illiterate-friendly access.',
    mod3Link: 'Gujarati / Hindi / English TTS',

    // Footer
    govName: 'Government of Gujarat',
    deptAddress: 'Department of Food, Civil Supplies and Consumer Affairs. Block No. 14, New Sachivalaya, Gandhinagar, Gujarat 382010.',
    servicesTitle: 'Citizen Services',
    officerTitle: 'Officer Audit',
    helplineTitle: 'Helpline & Support',
    helplineHours: 'Available Monday to Saturday, 9:00 AM to 6:00 PM',
    copyright: '© 2026 Government of Gujarat. Designed for Gujarat Family ID Scheme & PDS Digital Welfare.',
    standards: 'Compliant with Guidelines for Indian Government Websites (GIGW) & Digital India Standards.',
  },

  gu: {
    topGovIndia: 'ભારત સરકાર · Government of India',
    topGovGujarat: 'ગુજરાત સરકાર · Government of Gujarat',
    deptTitle: 'ખોરાક, નાગરિક પુરવઠો અને ગ્રાહક બાબતોનો વિભાગ',
    portalSub: 'ગુજરાત સરકાર નાગરિક કલ્યાણ ટેકનોલોજી પહેલ',
    helpline: 'ટોલ-ફ્રી હેલ્પલાઇન: 1800-233-5500',
    skipToMain: 'મુખ્ય વિષયવસ્તુ પર જાઓ',
    accessibility: 'સુગમતા:',
    portalName: 'ગુજરાત પરિવાર આઈડી',
    rationBadge: 'ડિજિટલ રેશન ૨.૦',
    headerSlogan: 'એક કુટુંબ, એક ઓળખ, સંપૂર્ણ કલ્યાણ',
    voiceAssistant: 'અવાજ સહાયક',
    officerPortal: 'તલાટી અધિકારી પોર્ટલ',
    citizenSignIn: 'નાગરિક લોગિન',
    viewCard: 'ડિજિટલ કુટુંબ કાર્ડ જુઓ',
    sampleCardBtn: 'નમૂના ડિજિટલ પરિવાર કાર્ડ જુઓ',

    // Ticker
    tickerLabel: 'સત્તાવાર નાગરિક લાઈવ પ્રવાહ:',
    tickerText: '📢 આપોઆપ કલ્યાણ જોડાણ શરૂ: ગુજરાતના તમામ 33 જિલ્લાઓમાં બાળકીના જન્મ અને 60 વર્ષ પૂર્ણ થવા પર રાષ્ટ્રીય ખાદ્ય સુરક્ષા (NFSA) અનાજ અને પ્રધાનમંત્રી જન આરોગ્ય યોજના (PM-JAY) આપોઆપ લિંક થઈ રહી છે. તલાટી કચેરીએ જવાની જરૂર નથી.',

    // Gateway
    gatewayTitle: 'નાગરિક અને પંચાયત ત્વરિત ઍક્સેસ',
    gatewaySub: 'ગુજરાત પરિવાર આઈડી રેકોર્ડ્સ, જીવન ઘટના સિમ્યુલેશન અને સત્તાવાર ઓડિટની તાત્કાલિક ઍક્સેસ',
    btnPatel: 'નાગરિક કુટુંબ (રમેશભાઈ પટેલ)',
    btnOfficer: 'તલાટી પંચાયત અધિકારી (ભૂપેન્દ્રભાઈ)',
    btnVoice: 'ત્રિભાષી વૉઇસ સહાયક (આસિસ્ટન્ટ)',

    // Hero
    heroBadge: 'સાર્વભૌમ ડિજિટલ માળખું · ગુજરાત પરિવાર આઈડી મિશન',
    heroTitlePart1: 'પરંપરાગત કાગળ રેશન કાર્ડથી આગળ.',
    heroTitlePart2: 'એક સક્રિય પારિવારિક ઓળખ જે આપોઆપ કલ્યાણ પહોંચાડે છે.',
    heroDescription: 'ગુજરાતનું સક્રિય કલ્યાણ પ્લેટફોર્મ દરેક પરિવારને 20 મુખ્ય રાજ્ય અને કેન્દ્રીય યોજનાઓ સાથે જોડે છે. જ્યારે બાળકનો જન્મ થાય, વડીલ 60 વર્ષના થાય, અથવા આવક બદલાય, ત્યારે ફેમિલી આઈડી આપોઆપ સહાય ચાલુ કરે છે — શૂન્ય કાગળકામ, શૂન્ય લાઈનો, શૂન્ય છૂટી ગયેલ રેશન.',
    openPortalBtn: 'મારું નાગરિક પરિવાર પોર્ટલ ખોલો',
    trySandboxBtn: 'સક્રિય જીવન ઘટના સેન્ડબોક્સ અજમાવો',
    zeroForms: 'શૂન્ય કાગળ ફોર્મ',
    zeroFormsDesc: 'ઘટના-આધારિત તાત્કાલિક પાત્રતા ફેરફાર',
    antiGhost: 'બોગસ રેશન નિવારણ',
    antiGhostDesc: 'સાઉન્ડએક્સ AI સરકારી તિજોરીની સુરક્ષા કરે છે',
    trilingual: 'સર્વસમાવેશક સુવિધા',
    trilingualDesc: 'ગુજરાતી, હિન્દી અને અંગ્રેજી બોલતો સહાયક',

    // Card preview
    cardId: 'પરિવાર આઈડી: 240100000001',
    cardVerified: 'પ્રમાણિત ગુજરાત કુટુંબ',
    cardEntitlements: 'સક્રિય યોજનાઓ',
    cardEntitlementsVal: '૫ યોજનાઓ લિંક થયેલ',
    cardNfsa: 'NFSA ડિજિટલ રેશન ક્વોટા',
    cardNfsaVal: '૨૫ કિલો ઘઉં/ચોખા /માસ',
    cardClickPrompt: 'સત્તાવાર પ્રિન્ટેબલ સ્માર્ટ કાર્ડ ખોલવા માટે ક્લિક કરો',

    // Sandbox
    sandboxBadge: 'ઇન્ટરેક્ટિવ નાગરિક સેન્ડબોક્સ',
    sandboxTitle: 'ગુજરાત પ્રોએક્ટિવ લાઇફ-ઇવેન્ટ એન્જિન અજમાવો',
    sandboxSub: 'નીચે આપેલ જીવન ઘટના બટન પર ક્લિક કરો અને જુઓ કે શૂન્ય કાગળકામે આપોઆપ કેવી રીતે યોજનાઓ સક્રિય થાય છે.',
    sandBirthBtn: 'દીકરીનો જન્મ થયો (+૧ સભ્ય)',
    sandSeniorBtn: 'દાદીમા ૬૦ વર્ષના થયા',
    sandPassBtn: 'દીકરીએ ધોરણ ૧૦ પાસ કર્યું (૭૮%)',
    sandIncomeBtn: 'પરિવારની આવકમાં ઘટાડો થયો',
    sandResetBtn: 'મૂળ સ્થિતિમાં રીસેટ કરો (પટેલ કુટુંબ)',
    sandDeltaTitle: 'તાત્કાલિક સક્રિય થયેલ કલ્યાણકારી લાભો',
    sandPaperwork: 'જરૂરી કાગળિયાં / ફોર્મ્સ',
    sandPaperworkVal: '૦ પાનાં (આપોઆપ મંજૂરી)',
    sandLatency: 'સરેરાશ સિસ્ટમ સમય',
    sandLatencyVal: '૦.૮૪ સેકન્ડ',

    // Tracker
    trackerBadge: 'તાત્કાલિક નાગરિક ચકાસણી પોર્ટલ',
    trackerTitle: 'તમારું ગુજરાત પરિવાર આઈડી અને રેશન ક્વોટા તપાસો',
    trackerSub: 'વાજબી ભાવની દુકાનની ફાળવણી, સક્રિય આરોગ્ય કવચ અને બાયોમેટ્રિક ચકાસણી સ્થિતિ જોવા માટે તમારો 12-અંકનો પરિવાર આઈડી દાખલ કરો.',
    trackerPlaceholder: '12-અંકનો પરિવાર આઈડી દાખલ કરો (દા.ત. 240100000001)...',
    verifyBtn: 'રેકોર્ડ તપાસો',
    tryDemoBtn: 'પટેલ પરિવાર ડેમો તપાસો',
    verifiedNotice: '✓ ગુજરાત રાજ્ય રજિસ્ટ્રીમાં રેકોર્ડ પ્રમાણિત થયેલ છે',
    pdsShopLabel: 'PDS રેશન ફાળવણી',
    pmjayLabel: 'આયુષ્માન ભારત PM-JAY',
    ekycLabel: 'બાયોમેટ્રિક સ્થિતિ',
    activeSchemesLabel: 'સક્રિય રીતે જોડાયેલ કલ્યાણકારી યોજનાઓ',

    // Stats
    statCitizens: 'નાગરિકો આવરી લેવાયેલ',
    statFamilies: 'પરિવારો જોડાયેલા',
    statDistricts: 'ગુજરાતના જિલ્લાઓ',
    statSchemes: 'રાજ્ય અને કેન્દ્રીય યોજનાઓ',
    statDisbursed: 'સક્રિય નાણાકીય સહાય',

    // Comparison
    compBadge: 'રેશન કાર્ડ ૨.૦ પરિવર્તન',
    compTitle: 'શા માટે જૂના રેશન કાર્ડ અસફળ રહ્યા અને ફેમિલી આઈડી કેવી રીતે ઉકેલે છે',
    compSub: 'કાગળની પુસ્તિકામાંથી ડિજિટલ સક્રિય સિસ્ટમમાં પરિવર્તન.',
    oldTitle: 'પરંપરાગત કાગળ રેશન કાર્ડ',
    oldSub: 'વર્ષો પહેલાં જારી કરાયેલ સ્થિર પુસ્તિકા',
    old1: 'સ્થિર અને જૂનું: જ્યારે બાળક જન્મે અથવા વડીલ 60 ના થાય, ત્યારે મામલતદાર કચેરીએ અઠવાડિયા સુધી લાઈનમાં ઊભા ન રહો તો યોજના છૂટી જાય છે.',
    old2: 'અલગ-અલગ કાર્ડ્સ: રેશન (NFSA), આરોગ્ય (મા અમૃતમ/PMJAY), શિષ્યવૃત્તિ અને વિધવા પેન્શન માટે અલગ કાર્ડ્સ. નાગરિક હેરાન થાય છે.',
    old3: 'બોગસ રેશનની સંભાવના: ગુજરાતી નામોમાં જોડણીની નાની ભૂલ કે મોબાઈલ નંબરના આધારે ડુપ્લિકેટ કાર્ડ બની જાય છે જેથી સરકારી નાણાં વેડફાય છે.',
    newTitle: 'ગુજરાત પરિવાર આઈડી કોપાયલોટ',
    newSub: 'સક્રિય જીવન-ઘટના આધારિત બુદ્ધિમત્તા',
    new1: 'સક્રિય જીવન-ઘટના એન્જિન: જન્મ, લગ્ન કે 60 વર્ષ થતાંની સાથે જ રેશન અને પેન્શન આપોઆપ ચાલુ થઈ જાય છે.',
    new2: 'એક જ પારિવારિક ઓળખ: એક જ 12-અંકનો નંબર રેશન, આયુષ્માન ભારત આરોગ્ય કવચ, કન્યા કેળવણી અને પેન્શન બધું જોડે છે.',
    new3: 'AI ડુપ્લિકેશન નિવારણ: સાઉન્ડેક્સ અને લેવેનશટેઈન મેચિંગ બોગસ અરજદારોને પકડી પાડે છે અને સરકારી તિજોરી બચાવે છે.',

    // Districts Hub
    districtBadge: 'રાજ્યવ્યાપી ડિજિટલ નેટવર્ક',
    districtTitle: 'ગુજરાતના ૩૩ જિલ્લાઓમાં લાઇવ ડિજિટલ વિતરણ',
    districtSub: 'જિલ્લાવાર જોડાયેલા પરિવારો, સક્રિય વાજબી ભાવની દુકાનો અને અનાજ વિતરણ ટકાવારી તપાસો.',

    // Calculator
    calcBadge: 'ઇન્ટરેક્ટિવ કલ્યાણ કેલ્ક્યુલેટર',
    calcTitle: 'તમારા પરિવાર માટે ગુજરાત યોજનાઓની ગણતરી કરો',
    calcSub: 'તમારા પરિવારને કેટલી યોજનાઓ મળી શકે છે તે જોવા માટે નીચેના માપદંડો પસંદ કરો.',
    incomeLabel: 'પરિવારની વાર્ષિક આવક:',
    casteLabel: 'જ્ઞાતિ કેટેગરી:',
    anyCat: 'કોઈપણ કેટેગરી',
    hasGirl: 'દીકરી / કન્યા સંતાન છે',
    hasGirlDesc: 'વહાલી દીકરી અને કન્યા કેળવણી સહાય મળે',
    hasElder: 'વરિષ્ઠ નાગરિક (60+ વર્ષ) છે',
    hasElderDesc: 'વૃદ્ધ સહાય અને પેન્શન યોજનાઓ મળે',
    calcEstMatch: 'અંદાજિત યોજના મેળ:',
    calcProgramsAvail: 'ગુજરાત સરકારી યોજનાઓ ઉપલબ્ધ',
    calcIncludes: 'NFSA રેશન અનાજ, PMJAY ₹10 લાખ સ્વાસ્થ્ય કવચ, અને રોકડ અનુદાન સામેલ છે.',
    claimBtn: 'પરિવાર ID વડે મેળવો',

    // Architecture
    archBadge: 'સિસ્ટમ આર્કિટેક્ચર',
    archTitle: 'ગુજરાત પરિવાર ID ના ૩ મુખ્ય સ્તંભો',
    archSub: 'લાઇવ ડેટાબેઝ સિંક્રનાઇઝેશન સાથે રાજ્ય ડિજિટલ ગવર્નન્સ ધોરણો અનુસાર નિર્મિત.',
    mod1Title: 'સક્રિય જીવન-ઘટના એન્જિન',
    mod1Desc: 'બાળકનો જન્મ, 18 કે 60 વર્ષની ઉંમર, વિધવાપણું કે આવકમાં ફેરફાર થતાં જ આપોઆપ લાભોની ગણતરી કરે છે.',
    mod1Link: '૨૦ સત્તાવાર ગુજરાત યોજનાઓ',
    mod2Title: 'રજિસ્ટ્રી અખંડિતતા ઓડિટ',
    mod2Desc: 'સાઉન્ડેક્સ, નામ સમાનતા, જન્મ તારીખ અને ફોન ઓવરલેપ દ્વારા બોગસ રેશન કાર્ડ નાબૂદ કરે છે.',
    mod2Link: 'તલાટી ઓડિટ અને થ્રેશોલ્ડ કંટ્રોલ',
    mod3Title: 'ત્રિભાષી વૉઇસ સહાયક',
    mod3Desc: 'ગુજરાતી, હિન્દી અને અંગ્રેજીમાં બોલતો ડિજિટલ સહાયક જે ગ્રામીણ નાગરિકો માટે સરળ છે.',
    mod3Link: 'ગુજરાતી / હિન્દી / અંગ્રેજી TTS',

    // Footer
    govName: 'ગુજરાત સરકાર',
    deptAddress: 'ખોરાક, નાગરિક પુરવઠો અને ગ્રાહક બાબતોનો વિભાગ. બ્લોક નં. ૧૪, નવું સચિવાલય, ગાંધીનગર, ગુજરાત ૩૮૨૦૧૦.',
    servicesTitle: 'નાગરિક સેવાઓ',
    officerTitle: 'અધિકારી ઓડિટ',
    helplineTitle: 'હેલ્પલાઇન અને સહાય',
    helplineHours: 'સોમવારથી શનિવાર, સવારે ૯:૦૦ થી સાંજે ૬:૦૦',
    copyright: '© ૨૦૨૬ ગુજરાત સરકાર. ગુજરાત પરિવાર આઈડી યોજના અને ડિજિટલ કલ્યાણ હેઠળ નિર્મિત.',
    standards: 'GIGW (ભારતીય સરકારી વેબસાઇટ્સ માર્ગદર્શિકા) સુસંગત.',
  },

  hi: {
    topGovIndia: 'भारत सरकार · Government of India',
    topGovGujarat: 'गुजरात सरकार · Government of Gujarat',
    deptTitle: 'खाद्य, नागरिक आपूर्ति एवं उपभोक्ता मामले विभाग',
    portalSub: 'गुजरात सरकार नागरिक कल्याण प्रौद्योगिकी पहल',
    helpline: 'टोल-फ्री हेल्पलाइन: 1800-233-5500',
    skipToMain: 'मुख्य विषयवस्तु पर जाएं',
    accessibility: 'सुगमता:',
    portalName: 'गुजरात परिवार आईडी',
    rationBadge: 'डिजिटल राशन २.०',
    headerSlogan: 'एक परिवार, एक पहचान, सम्पूर्ण कल्याण',
    voiceAssistant: 'आवाज सहायक',
    officerPortal: 'तलाटी अधिकारी पोर्टल',
    citizenSignIn: 'नागरिक लॉगिन',
    viewCard: 'डिजिटल परिवार कार्ड देखें',
    sampleCardBtn: 'नमूना डिजिटल परिवार कार्ड देखें',

    // Ticker
    tickerLabel: 'आधिकारिक नागरिक लाइव प्रवाह:',
    tickerText: '📢 स्वचालित कल्याण एकीकरण लाइव: गुजरात के सभी 33 जिलों में बच्ची के जन्म और 60 वर्ष पूर्ण होने पर राष्ट्रीय खाद्य सुरक्षा (NFSA) खाद्यान्न एवं आयुष्मान भारत (PM-JAY) स्वतः मैप हो रहे हैं। तलाटी कार्यालय जाने की आवश्यकता नहीं है।',

    // Gateway
    gatewayTitle: 'नागरिक एवं पंचायत त्वरित एक्सेस',
    gatewaySub: 'गुजरात परिवार आईडी रिकॉर्ड्स, जीवन घटना सिमुलेशन एवं आधिकारिक ऑडिट तक तुरंत पहुंचें',
    btnPatel: 'नागरिक परिवार (रमेशभाई पटेल)',
    btnOfficer: 'तलाटी पंचायत अधिकारी (भूपेंद्रभाई)',
    btnVoice: 'त्रिभाषी वॉइस गाइड (असिस्टेंट)',

    // Hero
    heroBadge: 'संप्रभु डिजिटल अवसंरचना · गुजरात परिवार आईडी मिशन',
    heroTitlePart1: 'पारंपरिक कागजी राशन कार्ड से परे।',
    heroTitlePart2: 'एक सक्रिय पारिवारिक पहचान जो आपका कल्याण स्वतः याद रखती है।',
    heroDescription: 'गुजरात का प्रोएक्टिव कल्याण नेटवर्क हर नागरिक को 20 प्रमुख राज्य व केंद्रीय योजनाओं से जोड़ता है। जब बच्चे का जन्म हो, बुजुर्ग 60 वर्ष के हों, या आय बदले — फैमिली आईडी बिना किसी फॉर्म, कतार या दफ्तर के चक्कर के स्वतः लाभ सक्रिय करती है।',
    openPortalBtn: 'मेरा नागरिक परिवार पोर्टल खोलें',
    trySandboxBtn: 'सक्रिय जीवन घटना सैंडबॉक्स आज़माएं',
    zeroForms: 'शून्य कागजी फॉर्म',
    zeroFormsDesc: 'घटना-आधारित स्वचालित पात्रता वृद्धि',
    antiGhost: 'एल्गोरिद्मिक सत्यनिष्ठा',
    antiGhostDesc: 'साउंडेक्स AI बोगस राशन कार्ड रोकता है',
    trilingual: 'समावेशी पहुंच',
    trilingualDesc: 'गुजराती, हिन्दी व अंग्रेजी वॉइस TTS',

    // Card preview
    cardId: 'परिवार आईडी: 240100000001',
    cardVerified: 'सत्यापित गुजरात परिवार',
    cardEntitlements: 'सक्रिय योजनाएं',
    cardEntitlementsVal: '5 योजनाएं मैप की गईं',
    cardNfsa: 'NFSA डिजिटल राशन कोटा',
    cardNfsaVal: '25 किग्रा गेहूं/चावल /माह',
    cardClickPrompt: 'आधिकारिक प्रिंटेबल स्मार्ट कार्ड खोलने हेतु क्लिक करें',

    // Sandbox
    sandboxBadge: 'इंटरैक्टिव नागरिक सैंडबॉक्स',
    sandboxTitle: 'गुजरात प्रोएक्टिव लाइफ-इवेंट इंजन आज़माएं',
    sandboxSub: 'नीचे दिए गए जीवन घटना बटनों पर क्लिक करें और देखें कि बिना किसी कागजी प्रक्रिया के स्वतः योजनाएं कैसे सक्रिय होती हैं।',
    sandBirthBtn: 'बेटी का जन्म (+1 सदस्य)',
    sandSeniorBtn: 'दादीजी 60 वर्ष की हुईं',
    sandPassBtn: 'बेटी ने 10वीं पास की (78%)',
    sandIncomeBtn: 'पारिवारिक आय में कमी',
    sandResetBtn: 'मूल स्थिति में रीसेट करें (पटेल परिवार)',
    sandDeltaTitle: 'स्वचालित सक्रिय कल्याणकारी लाभ',
    sandPaperwork: 'आवश्यक कागजी प्रक्रिया',
    sandPaperworkVal: '0 पृष्ठ (स्वचालित सक्रियण)',
    sandLatency: 'औसत सिस्टम समय',
    sandLatencyVal: '0.84 सेकंड',

    // Tracker
    trackerBadge: 'त्वरित नागरिक सत्यापन पोर्टल',
    trackerTitle: 'अपना गुजरात परिवार आईडी एवं राशन कोटा जांचें',
    trackerSub: 'उचित मूल्य दुकान आवंटन, सक्रिय स्वास्थ्य कवर और बायोमेट्रिक सत्यापन स्थिति देखने हेतु 12-अंकीय परिवार आईडी दर्ज करें।',
    trackerPlaceholder: '12-अंकीय परिवार आईडी दर्ज करें (उदा. 240100000001)...',
    verifyBtn: 'रिकॉर्ड जांचें',
    tryDemoBtn: 'पटेल परिवार डेमो जांचें',
    verifiedNotice: '✓ गुजरात राज्य पंजीयन में रिकॉर्ड सत्यापित है',
    pdsShopLabel: 'PDS राशन आवंटन',
    pmjayLabel: 'आयुष्मान भारत PM-JAY',
    ekycLabel: 'बायोमेट्रिक स्थिति',
    activeSchemesLabel: 'सक्रिय संबद्ध कल्याणकारी योजनाएं',

    // Stats
    statCitizens: 'नागरिक पंजीकृत',
    statFamilies: 'परिवार जुड़े हुए',
    statDistricts: 'गुजरात के जिले',
    statSchemes: 'राज्य व केंद्रीय योजनाएं',
    statDisbursed: 'सक्रिय वित्तीय वितरण',

    // Comparison
    compBadge: 'राशन कार्ड 2.0 रूपांतरण',
    compTitle: 'पारंपरिक राशन कार्ड क्यों असफल रहे और फैमिली आईडी इसे कैसे हल करती है',
    compSub: 'कागजी पुस्तिका से आधुनिक सक्रिय डिजिटल तंत्र में रूपांतरण।',
    oldTitle: 'पारंपरिक कागजी राशन कार्ड',
    oldSub: 'वर्षों पहले जारी की गई स्थिर पुस्तिका',
    old1: 'स्थिर एवं पुराना: बच्चे के जन्म या बुजुर्ग के 60 वर्ष का होने पर जब तक मामलतदार दफ्तर में हफ्तों कतार न लगे, लाभ छूट जाते हैं।',
    old2: 'अलग-अलग कार्ड: राशन (NFSA), स्वास्थ्य (मां कार्ड/PMJAY), छात्रवृत्ति और पेंशन के अलग कार्ड। नागरिक परेशान होता है।',
    old3: 'फर्जी राशन का खतरा: गुजराती नामों की वर्तनी या एक ही मोबाइल नंबर से फर्जी कार्ड बनकर सरकारी खजाना लुटता है।',
    newTitle: 'गुजरात परिवार आईडी कोपायलट',
    newSub: 'सक्रिय जीवन-घटना आधारित बुद्धिमत्ता',
    new1: 'प्रोएक्टिव लाइफ-इवेंट इंजन: जन्म, विवाह या 60 वर्ष पूरे होते ही राशन और पेंशन स्वतः सक्रिय हो जाते हैं।',
    new2: 'एकल पारिवारिक पहचान: एक 12-अंकीय नंबर राशन, आयुष्मान भारत, कन्या शिक्षा और पेंशन सबको एक साथ जोड़ता है।',
    new3: 'AI डुप्लीकेशन रोकथाम: साउंडेक्स और लेवेनश्टाइन मिलान फर्जी दावों को पकड़कर राजकोष की रक्षा करता है।',

    // Districts Hub
    districtBadge: 'राज्यव्यापी डिजिटल नेटवर्क',
    districtTitle: 'गुजरात के 33 जिलों में लाइव डिजिटल वितरण',
    districtSub: 'जिलेवार जुड़े परिवार, सक्रिय उचित मूल्य दुकानें और खाद्यान्न वितरण प्रतिशत की जांच करें।',

    // Calculator
    calcBadge: 'इंटरैक्टिव कल्याण कैलकुलेटर',
    calcTitle: 'अपने परिवार हेतु गुजरात योजनाओं का अनुमान लगाएं',
    calcSub: 'आपका परिवार किन योजनाओं के पात्र है, यह देखने हेतु नीचे दिए गए विकल्पों को बदलें।',
    incomeLabel: 'पारिवारिक वार्षिक आय:',
    casteLabel: 'जाति वर्ग:',
    anyCat: 'कोई भी वर्ग',
    hasGirl: 'बेटी / कन्या संतान है',
    hasGirlDesc: 'व्हाली डिकरी और कन्या केळवणी योजना सक्रिय',
    hasElder: 'वरिष्ठ नागरिक (60+ वर्ष) हैं',
    hasElderDesc: 'वृद्ध सहायता एवं पेंशन योजनाएं सक्रिय',
    calcEstMatch: 'अनुमानित योजना मिलान:',
    calcProgramsAvail: 'गुजरात सरकारी योजनाएं उपलब्ध',
    calcIncludes: 'NFSA राशन, PMJAY ₹10 लाख स्वास्थ्य कवर और अनुदान शामिल हैं।',
    claimBtn: 'परिवार ID से प्राप्त करें',

    // Architecture
    archBadge: 'सिस्टम आर्किटेक्चर',
    archTitle: 'गुजरात परिवार ID के 3 मुख्य आधार',
    archSub: 'लाइव डेटाबेस सिंक्रनाइज़ेशन के साथ राज्य डिजिटल गवर्नेंस मानकों पर निर्मित।',
    mod1Title: 'सक्रिय जीवन-घटना इंजन',
    mod1Desc: 'शिशु जन्म, 18/60 वर्ष की आयु या आय में बदलाव होने पर स्वतः पात्रता डेल्टा की गणना करता है।',
    mod1Link: '20 वास्तविक गुजरात योजनाएं',
    mod2Title: 'पंजीयन सत्यनिष्ठा ऑडिट',
    mod2Desc: 'साउंडेक्स, नाम निकटता, जन्मतिथि और फोन क्लस्टरिंग द्वारा बोगस रिकॉर्ड्स को समाप्त करता है।',
    mod2Link: 'तलाटी ऑडिट एवं थ्रेशोल्ड नियंत्रण',
    mod3Title: 'त्रिभाषी आवाज सहायक',
    mod3Desc: 'गुजराती, हिन्दी और अंग्रेजी में बोलने वाला सहायक जो ग्रामीण नागरिकों हेतु सुगम है।',
    mod3Link: 'गुजराती / हिन्दी / अंग्रेजी TTS',

    // Footer
    govName: 'गुजरात सरकार',
    deptAddress: 'खाद्य, नागरिक आपूर्ति एवं उपभोक्ता मामले विभाग। ब्लॉक नं. 14, नया सचिवालय, गांधीनगर, गुजरात 382010.',
    servicesTitle: 'नागरिक सेवाएं',
    officerTitle: 'अधिकारी ऑडिट',
    helplineTitle: 'हेल्पलाइन एवं सहायता',
    helplineHours: 'सोमवार से शनिवार, सुबह 9:00 से शाम 6:00 तक',
    copyright: '© 2026 गुजरात सरकार। गुजरात परिवार आईडी योजना एवं डिजिटल कल्याण हेतु निर्मित।',
    standards: 'GIGW (भारतीय सरकारी वेबसाइट दिशा-निर्देश) अनुरूप।',
  }
};

// 10 Key Gujarat Districts for the Statewide Civic Grid
const GUJARAT_DISTRICT_HUBS = [
  { id: 'ahmedabad', name: 'Ahmedabad', name_gu: 'અમદાવાદ', name_hi: 'अहमदाबाद', households: '18.4 Lakh+', fps: 1420, fulfill: '99.6%', ekyc: '99.1%' },
  { id: 'surat', name: 'Surat', name_gu: 'સુરત', name_hi: 'सूरत', households: '14.2 Lakh+', fps: 1180, fulfill: '99.4%', ekyc: '98.8%' },
  { id: 'vadodara', name: 'Vadodara', name_gu: 'વડોદરા', name_hi: 'वडोदरा', households: '8.6 Lakh+', fps: 740, fulfill: '99.5%', ekyc: '99.0%' },
  { id: 'rajkot', name: 'Rajkot', name_gu: 'રાજકોટ', name_hi: 'राजकोट', households: '7.9 Lakh+', fps: 690, fulfill: '99.3%', ekyc: '98.7%' },
  { id: 'bhavnagar', name: 'Bhavnagar', name_gu: 'ભાવનગર', name_hi: 'भावनगर', households: '5.4 Lakh+', fps: 480, fulfill: '99.2%', ekyc: '98.5%' },
  { id: 'gandhinagar', name: 'Gandhinagar', name_gu: 'ગાંધીનગર', name_hi: 'गांधीनगर', households: '3.9 Lakh+', fps: 320, fulfill: '99.8%', ekyc: '99.4%' },
  { id: 'kutch', name: 'Kutch', name_gu: 'કચ્છ', name_hi: 'कच्छ', households: '4.6 Lakh+', fps: 490, fulfill: '98.9%', ekyc: '98.1%' },
  { id: 'mehsana', name: 'Mehsana', name_gu: 'મહેસાણા', name_hi: 'मेहसाणा', households: '5.1 Lakh+', fps: 460, fulfill: '99.4%', ekyc: '98.9%' },
];

export function LandingPage() {
  const { loginAsDemo } = useAuth();
  const { language: globalLang, setLanguage: setGlobalLang } = useLanguage();
  const { fontScale, setFontScale } = useAccessibility();
  const [lang, setLang] = useState<'en' | 'gu' | 'hi'>(globalLang || 'en');
  const [isTickerPlaying, setIsTickerPlaying] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(GUJARAT_DISTRICT_HUBS[0]);

  // Live Database Stats query
  const { data: dbStats } = useQuery({
    queryKey: ['state-metrics-landing'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    staleTime: 30000,
  });

  // Digital Smart Card Modal
  const [showCardModal, setShowCardModal] = useState(false);

  // Tracker state
  const [trackerInput, setTrackerInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<{
    family_id: string;
    head_name: string;
    district: string;
    ration_quota: string;
    pmjay_status: string;
    ekyc_status: string;
    schemes: string[];
  } | null>(null);

  // Calculator State
  const [estIncome, setEstIncome] = useState<number>(110000);
  const [estCaste, setEstCaste] = useState<'all' | 'sc' | 'st' | 'obc' | 'general'>('all');
  const [estHasGirl, setEstHasGirl] = useState<boolean>(true);
  const [estHasElder, setEstHasElder] = useState<boolean>(true);
  const [estMembersCount, setEstMembersCount] = useState<number>(5);

  // ============================================================
  // Proactive Life-Event Live Sandbox State
  // ============================================================
  const [sandboxEvents, setSandboxEvents] = useState({
    babyBorn: false,
    elderTurned60: false,
    daughter10thPass: false,
    incomeReduced: false,
  });
  const [lastSandboxAction, setLastSandboxAction] = useState<string | null>(null);

  const t = content[lang];

  // Keep local and global languages synced
  useEffect(() => {
    if (globalLang && globalLang !== lang) {
      setLang(globalLang);
    }
  }, [globalLang]);

  const handleSetLang = (l: 'en' | 'gu' | 'hi') => {
    setLang(l);
    setGlobalLang(l);
  };

  // Audio Speech Synthesis Player
  const toggleSpeechAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speechText = lang === 'gu'
      ? 'ગુજરાત ડિજિટલ પરિવાર આઈડી પોર્ટલમાં આપનું સ્વાગત છે. અહીં ૨૦ સરકારી યોજનાઓ, રેશન અનાજ ક્વોટા અને જીવન ઘટનાઓ આપમેળે સક્રિય થાય છે — શૂન્ય કાગળકામ, શૂન્ય લાઈનો.'
      : lang === 'hi'
      ? 'गुजरात डिजिटल परिवार आईडी पोर्टल में आपका स्वागत है। यहां 20 सरकारी योजनाएं, राशन कोटा और जीवन परिवर्तन स्वतः सक्रिय होते हैं — शून्य कागजी प्रक्रिया, शून्य कतार।'
      : 'Welcome to the Gujarat Digital Family ID Portal. An event-driven civic welfare operating system linking households to 20 flagship state programs with zero manual paperwork.';

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Estimate Available Programs logic
  const calculateEstimatedSchemes = () => {
    let count = 3; // NFSA, PMJAY, Mukhyamantri Amrutam
    if (estIncome <= 120000) count += 3; // BPL Sahay, Antyodaya, Housing
    if (estIncome <= 200000) count += 2;
    if (estHasGirl) count += 3; // Vahli Dikri, Kanya Kelavani, Saraswati Sadhana
    if (estHasElder) count += 2; // Vridh Sahay, IGNOAPS Pension
    if (estCaste === 'sc' || estCaste === 'st') count += 3;
    if (estCaste === 'obc') count += 2;
    return Math.min(count, 20);
  };

  const calculateAnnualProtectionValue = () => {
    let val = 1000000; // PM-JAY ₹10 Lakhs health safety net
    val += (estMembersCount * 5 * 12 * 35); // NFSA grain value per year
    if (estHasGirl) val += 110000; // Vahli Dikri grant
    if (estHasElder) val += (1250 * 12); // Senior citizen annual pension
    if (estIncome <= 120000) val += 120000; // PMAY Housing Sahay
    return val;
  };

  // Tracker Logic
  const handleTrackFamily = (overrideId?: string) => {
    const id = overrideId || trackerInput.trim();
    if (!id) return;

    if (id === '240100000001') {
      setTrackedResult({
        family_id: '240100000001',
        head_name: 'Rameshbhai Patel (રમેશભાઈ પટેલ)',
        district: 'Ahmedabad (અમદાવાદ)',
        ration_quota: '25 kg Wheat & Rice / Month',
        pmjay_status: 'Active (₹10,00,000 / Year)',
        ekyc_status: '100% Aadhaar Verified',
        schemes: [
          'NFSA PDS Digital Ration',
          'PM-JAY Ayushman Bharat',
          'Vahli Dikri Yojana (Priya Patel)',
          'Vridh Pension Sahay (Kantaben Patel)',
          'Saraswati Sadhana Coaching',
        ],
      });
    } else {
      setTrackedResult({
        family_id: id,
        head_name: 'Suresh Parmar (સુરેશ પરમાર)',
        district: 'Surat (સુરત)',
        ration_quota: '20 kg Foodgrains / Month',
        pmjay_status: 'Active (₹10,00,000 / Year)',
        ekyc_status: '100% Aadhaar Verified',
        schemes: [
          'NFSA PDS Digital Ration',
          'PM-JAY Ayushman Bharat',
          'Kanya Kelavani Sahay',
        ],
      });
    }
  };

  // Sandbox Live Calculations
  const sandboxMembersCount = 5 + (sandboxEvents.babyBorn ? 1 : 0);
  const sandboxGrainQuota = (sandboxEvents.incomeReduced ? 35 : (sandboxMembersCount * 5));
  const sandboxActiveSchemes = [
    'NFSA PDS Digital Ration',
    'PM-JAY Ayushman Bharat',
    ...(sandboxEvents.babyBorn ? ['Vahli Dikri Yojana (Newborn Girl)'] : []),
    ...(sandboxEvents.elderTurned60 ? ['Vridh Sahay Pension (Senior 60+)'] : []),
    ...(sandboxEvents.daughter10thPass ? ['Saraswati Sadhana Bicycle Sahay'] : []),
    ...(sandboxEvents.incomeReduced ? ['Antyodaya Anna Yojana (AAY Maximum Grains)'] : ['Mukhyamantri Amrutam']),
  ];

  return (
    <div className={`min-h-screen bg-[#FBF9F5] text-slate-800 flex flex-col selection:bg-[#D46E38] selection:text-white ${fontScale === 'large' ? 'text-base' : fontScale === 'larger' ? 'text-lg' : 'text-sm'}`}>
      
      {/* ── Top Government Header Ribbon (Subtle Somnath Teal) ── */}
      <div className="bg-[#133B42] border-b border-[#1A4B54] text-[11px] text-slate-200 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Dual Sovereign Government Labels */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-medium">
              {/* National Flag Tiranga */}
              <div className="flex h-3.5 w-5 overflow-hidden rounded-2xs border border-white/40 shadow-xs">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#000080]" />
                </div>
                <div className="w-1/3 bg-[#138808]" />
              </div>
              <span className="text-white font-bold">{t.topGovIndia}</span>
              <span className="text-slate-400">|</span>
              <span className="text-amber-300 font-bold">{t.topGovGujarat}</span>
            </div>
            <span className="text-slate-400 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-slate-300 text-[10px]">
              {t.deptTitle}
            </span>
          </div>

          {/* GIGW Accessibility & Language Toolbar */}
          <div className="flex items-center gap-3 text-[11px]">
            <a href="#main-content" className="sr-only focus:not-sr-only text-amber-300 font-bold underline">
              {t.skipToMain}
            </a>

            {/* Audio Voice Guide Button */}
            <button
              onClick={toggleSpeechAudio}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-[#1A4B54] text-amber-200 border-[#235863] hover:bg-[#205763]'
              }`}
              title="Listen to official audio overview"
            >
              <Volume2 className="w-3 h-3" />
              <span>{isSpeaking ? (lang === 'gu' ? 'અવાજ બંધ કરો' : 'Stop Audio') : (lang === 'gu' ? 'ઓડિયો સાંભળો' : lang === 'hi' ? 'ऑडियो सुनें' : 'Audio Guide')}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] text-slate-400">{t.accessibility}</span>
              <button
                onClick={() => setFontScale('normal')}
                className={`px-1.5 py-0.2 rounded border border-[#2A5964] font-mono text-[10px] ${fontScale === 'normal' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-[#1A4B54]'}`}
                title="Default Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontScale('large')}
                className={`px-1.5 py-0.2 rounded border border-[#2A5964] font-mono text-[10px] ${fontScale === 'large' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-[#1A4B54]'}`}
                title="Larger Font Size"
              >
                A+
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1 text-amber-300 font-mono text-[10px]">
              <Phone className="w-3 h-3" />
              <span>{t.helpline}</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#1A4B54] border border-[#235863] px-2 py-0.5 rounded text-[10px] shadow-2xs">
              <Globe className="w-2.5 h-2.5 text-amber-300" />
              <button
                onClick={() => handleSetLang('en')}
                className={`px-1 rounded transition-colors ${lang === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:text-white'}`}
              >
                English
              </button>
              <span className="text-slate-500">|</span>
              <button
                onClick={() => handleSetLang('gu')}
                className={`px-1 rounded transition-colors ${lang === 'gu' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:text-white'}`}
              >
                ગુજરાતી
              </button>
              <span className="text-slate-500">|</span>
              <button
                onClick={() => handleSetLang('hi')}
                className={`px-1 rounded transition-colors ${lang === 'hi' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Official Indian Government Header (Pristine Light Theme) ── */}
      <header className="bg-white border-b-2 border-amber-500 py-3.5 px-4 sm:px-8 shadow-xs sticky top-0 z-50 backdrop-blur-xs bg-white/95">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#FAF7F0] to-[#F5EFE4] border border-[#E8E3DA] p-1.5 flex flex-col items-center justify-center shrink-0 shadow-xs">
              <div className="text-xl">🏛️</div>
              <span className="text-[7px] font-bold text-amber-950 uppercase tracking-tighter mt-0.5">સત્યમેવ જયતે</span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-[#133B42] tracking-tight">
                  {t.portalName}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D46E38] text-white uppercase font-mono shadow-2xs">
                  {t.rationBadge}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">
                {t.deptTitle}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {t.headerSlogan}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2.5 self-end md:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCardModal(true)}
              className="text-xs border-[#D46E38]/40 bg-[#FAF4EC] text-[#9A4215] hover:bg-[#F5EAE0] font-semibold"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#D46E38]" />
              {t.viewCard}
            </Button>

            <Link href="/assistant">
              <Button size="sm" variant="outline" className="text-xs border-[#E8E3DA] bg-white text-slate-700 hover:bg-[#FAF7F0] hidden sm:inline-flex">
                <Globe className="w-3.5 h-3.5 mr-1.5 text-[#28604A]" />
                {t.voiceAssistant}
              </Button>
            </Link>

            <Link href="/login">
              <Button size="sm" variant="outline" className="text-xs border-[#E8E3DA] bg-white text-slate-800 hover:bg-[#FAF7F0] font-medium">
                {t.officerPortal}
              </Button>
            </Link>

            <Link href="/login">
              <Button size="sm" className="text-xs bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold shadow-xs">
                {t.citizenSignIn}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Official Government Marquee / Live Civic Event Stream ── */}
      <div className="bg-[#FAF7F0] border-y border-[#E8E3DA] py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#9A4215] shrink-0 bg-[#FBF4EC] px-2.5 py-0.5 rounded border border-[#EBD6C8] text-[11px]">
            <Activity className="w-3.5 h-3.5 text-[#D46E38] animate-pulse" />
            <span>{t.tickerLabel}</span>
          </div>

          <div className="overflow-hidden flex-1 relative whitespace-nowrap text-[11px] text-slate-800 font-medium">
            <motion.div
              animate={{ x: isTickerPlaying ? ['0%', '-50%'] : '0%' }}
              transition={{ repeat: Infinity, duration: 26, ease: 'linear' }}
              className="inline-block"
            >
              <span>{t.tickerText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {t.tickerText}</span>
            </motion.div>
          </div>

          <button
            onClick={() => setIsTickerPlaying(!isTickerPlaying)}
            className="text-slate-600 hover:text-slate-900 p-0.5 rounded shrink-0"
            title={isTickerPlaying ? 'Pause Ticker' : 'Play Ticker'}
          >
            {isTickerPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Quick Access Gateway Bar ── */}
      <div className="bg-white border-b border-[#E8E3DA] py-2.5 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#133B42]" />
            <span className="font-extrabold text-[#133B42] tracking-tight">
              {t.gatewayTitle}:
            </span>
            <span className="text-slate-600 hidden lg:inline">
              {t.gatewaySub}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loginAsDemo('citizen')}
              className="px-3 py-1 rounded-lg bg-[#FAF4EC] hover:bg-[#F5EAE0] text-[#9A4215] border border-[#EBD6C8] font-bold transition-all shadow-2xs flex items-center gap-1.5 text-xs"
            >
              <Fingerprint className="w-3.5 h-3.5 text-[#D46E38]" /> {t.btnPatel}
            </button>
            <button
              onClick={() => loginAsDemo('admin')}
              className="px-3 py-1 rounded-lg bg-[#EAF3EE] hover:bg-[#DEF0E5] text-[#163F30] border border-[#C3DEC9] font-bold transition-all shadow-2xs flex items-center gap-1.5 text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#28604A]" /> {t.btnOfficer}
            </button>
            <Link href="/assistant">
              <button className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold transition-all shadow-2xs flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-slate-600" /> {t.btnVoice}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hero Section (Subtle Sandstone Alabaster Architectural Canvas) ── */}
      <section id="main-content" className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E8E3DA] bg-gradient-to-b from-[#FBF9F5] via-[#FAF7F0] to-[#F5EFE4]">
        {/* ReactBits Ambient Organic Aurora Bloom */}
        <AuroraGlow intensity="subtle" />

        {/* Subtle Architectural Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#133B4208_1px,transparent_1px),linear-gradient(to_bottom,#133B4208_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FBF4EC] text-[#9A4215] border border-[#EBD6C8] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D46E38]" />
                <ShinyText text={t.heroBadge} shimmerColor="rgba(212, 110, 56, 0.9)" />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4.5xl lg:text-5.5xl font-black tracking-tight leading-[1.12] text-[#133B42]">
                  {t.heroTitlePart1}
                  <br />
                  <span className="bg-gradient-to-r from-[#D46E38] via-[#B85623] to-[#8C3A0F] bg-clip-text text-transparent">
                    {t.heroTitlePart2}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-normal">
                  {t.heroDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/login">
                  <Button size="lg" className="text-sm h-12 px-6 bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold shadow-md">
                    <Fingerprint className="w-4 h-4 mr-2 text-amber-400" />
                    {t.openPortalBtn}
                  </Button>
                </Link>

                <a href="#proactive-sandbox">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-sm h-12 px-6 border-[#D46E38]/50 bg-[#FAF4EC] text-[#9A4215] hover:bg-[#F5EAE0] font-bold shadow-xs"
                  >
                    <Zap className="w-4 h-4 mr-2 text-[#D46E38] fill-[#D46E38]" />
                    {t.trySandboxBtn}
                  </Button>
                </a>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowCardModal(true)}
                  className="text-sm h-12 px-5 border-[#E8E3DA] bg-white text-slate-800 hover:bg-[#FAF7F0] font-semibold"
                >
                  <QrCode className="w-4 h-4 mr-2 text-[#133B42]" />
                  {t.sampleCardBtn}
                </Button>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8E3DA] text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28604A]" /> {t.zeroForms}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-snug">{t.zeroFormsDesc}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#133B42]" /> {t.antiGhost}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-snug">{t.antiGhostDesc}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#D46E38]" /> {t.trilingual}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-snug">{t.trilingualDesc}</p>
                </div>
              </div>
            </div>

            {/* Right: Photorealistic Smart Card Mockup with Interactive Glow */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-full max-w-md cursor-pointer" onClick={() => setShowCardModal(true)}>
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D46E38]/30 via-[#E5B568]/25 to-[#28604A]/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition duration-500" />

                <div className="relative rounded-2xl overflow-hidden border border-[#E8E3DA] bg-white shadow-xl">
                  {/* ReactBits Dynamic Light Beam */}
                  <BorderBeam size={280} duration={10} colorFrom="#D46E38" colorTo="#E5B568" />

                  {/* Generated Smart Card Asset */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <Image
                      src="/images/gujarat_family_smart_card.jpg"
                      alt="Official Gujarat Digital Family ID Smart Card"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>

                  {/* Card Highlights Footer */}
                  <div className="p-4 bg-white border-t border-[#E8E3DA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-900 font-mono">{t.cardId}</span>
                      </div>
                      <Badge className="bg-[#EAF3EE] text-[#163F30] border-[#C3DEC9] text-[10px] font-bold">
                        {t.cardVerified}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-[#FAF7F0] border border-[#E8E3DA]">
                        <p className="text-slate-500 text-[10px] uppercase font-bold">{t.cardEntitlements}</p>
                        <p className="font-bold text-[#133B42] mt-0.5">{t.cardEntitlementsVal}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#EAF3EE] border border-[#C3DEC9]">
                        <p className="text-slate-600 text-[10px] uppercase font-bold">{t.cardNfsa}</p>
                        <p className="font-bold text-[#163F30] mt-0.5">{t.cardNfsaVal}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#D46E38] font-bold pt-1">
                      <span>{t.cardClickPrompt}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WORLD-CLASS FEATURE: Live Proactive Life-Event Engine Sandbox ── */}
      <section id="proactive-sandbox" className="py-16 px-4 sm:px-8 border-b border-[#E8E3DA] bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#FBF4EC] text-[#9A4215] border-[#EBD6C8] text-xs font-bold">
              {t.sandboxBadge}
            </Badge>
            <h2 className="text-2xl sm:text-3.5xl font-black text-[#133B42] tracking-tight">
              {t.sandboxTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.sandboxSub}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Life Event Triggers */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Simulate Real Life Transitions:
              </h3>

              <div className="space-y-3">
                {/* 1. Birth of Daughter */}
                <button
                  onClick={() => {
                    setSandboxEvents(prev => ({ ...prev, babyBorn: !prev.babyBorn }));
                    setLastSandboxAction('Childbirth Registered: New Daughter added to Patel Household');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between shadow-2xs ${
                    sandboxEvents.babyBorn
                      ? 'bg-[#FBF4EC] border-[#D46E38] text-[#9A4215] ring-2 ring-[#D46E38]/30'
                      : 'bg-[#FAF7F0] border-[#E8E3DA] text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#D46E38]/10 flex items-center justify-center text-[#D46E38]">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t.sandBirthBtn}</p>
                      <p className="text-[11px] text-slate-500">Auto-triggers Vahli Dikri ₹1,10,000 + 5kg grain</p>
                    </div>
                  </div>
                  <Badge variant={sandboxEvents.babyBorn ? 'default' : 'outline'} className={`text-[10px] ${sandboxEvents.babyBorn ? 'bg-[#D46E38] text-white' : ''}`}>
                    {sandboxEvents.babyBorn ? 'Active' : 'Click to test'}
                  </Badge>
                </button>

                {/* 2. Elder Turns 60 */}
                <button
                  onClick={() => {
                    setSandboxEvents(prev => ({ ...prev, elderTurned60: !prev.elderTurned60 }));
                    setLastSandboxAction('Senior Milestone: Kantaben turned 60 years');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between shadow-2xs ${
                    sandboxEvents.elderTurned60
                      ? 'bg-[#EAF3EE] border-[#28604A] text-[#163F30] ring-2 ring-[#28604A]/30'
                      : 'bg-[#FAF7F0] border-[#E8E3DA] text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#28604A]/10 flex items-center justify-center text-[#28604A]">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t.sandSeniorBtn}</p>
                      <p className="text-[11px] text-slate-500">Auto-initiates Vridh Sahay ₹1,250/mo DBT</p>
                    </div>
                  </div>
                  <Badge variant={sandboxEvents.elderTurned60 ? 'default' : 'outline'} className={`text-[10px] ${sandboxEvents.elderTurned60 ? 'bg-[#28604A] text-white' : ''}`}>
                    {sandboxEvents.elderTurned60 ? 'Active' : 'Click to test'}
                  </Badge>
                </button>

                {/* 3. Daughter 10th Pass */}
                <button
                  onClick={() => {
                    setSandboxEvents(prev => ({ ...prev, daughter10thPass: !prev.daughter10thPass }));
                    setLastSandboxAction('Academic Achievement: Priya Patel passed Class 10');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between shadow-2xs ${
                    sandboxEvents.daughter10thPass
                      ? 'bg-[#FBF4EC] border-[#D46E38] text-[#9A4215] ring-2 ring-[#D46E38]/30'
                      : 'bg-[#FAF7F0] border-[#E8E3DA] text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t.sandPassBtn}</p>
                      <p className="text-[11px] text-slate-500">Auto-unlocks Saraswati Sadhana grant</p>
                    </div>
                  </div>
                  <Badge variant={sandboxEvents.daughter10thPass ? 'default' : 'outline'} className={`text-[10px] ${sandboxEvents.daughter10thPass ? 'bg-[#D46E38] text-white' : ''}`}>
                    {sandboxEvents.daughter10thPass ? 'Active' : 'Click to test'}
                  </Badge>
                </button>

                {/* 4. Income Reduction */}
                <button
                  onClick={() => {
                    setSandboxEvents(prev => ({ ...prev, incomeReduced: !prev.incomeReduced }));
                    setLastSandboxAction('Economic Shift: Annual income updated below ₹1,20,000 threshold');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between shadow-2xs ${
                    sandboxEvents.incomeReduced
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200'
                      : 'bg-[#FAF7F0] border-[#E8E3DA] text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t.sandIncomeBtn}</p>
                      <p className="text-[11px] text-slate-500">Upgrades grain quota to 35kg Antyodaya (AAY)</p>
                    </div>
                  </div>
                  <Badge variant={sandboxEvents.incomeReduced ? 'default' : 'outline'} className={`text-[10px] ${sandboxEvents.incomeReduced ? 'bg-rose-600 text-white' : ''}`}>
                    {sandboxEvents.incomeReduced ? 'Active' : 'Click to test'}
                  </Badge>
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSandboxEvents({ babyBorn: false, elderTurned60: false, daughter10thPass: false, incomeReduced: false });
                  setLastSandboxAction(null);
                }}
                className="w-full text-xs text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                {t.sandResetBtn}
              </Button>
            </div>

            {/* Right: Live Responsive Entitlement Delta Display */}
            <div className="lg:col-span-7">
              <Card className="relative border border-[#E8E3DA] bg-[#FAF7F0] shadow-md overflow-hidden">
                {/* ReactBits Subtle Light Beam */}
                <BorderBeam size={320} duration={14} colorFrom="#133B42" colorTo="#28604A" />

                <div className="p-6 border-b border-[#E8E3DA] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="font-bold text-sm text-[#133B42]">
                        GJ-240100000001 (Rameshbhai Patel Household)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Navrangpura, Ahmedabad · Total Members: <strong className="text-slate-900">{sandboxMembersCount}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#EAF3EE] text-[#163F30] border border-[#C3DEC9] font-bold text-xs">
                      {sandboxActiveSchemes.length} Programs Mapped
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Live KPI Grid for Simulated Household */}
                  <div className="grid sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-[#E8E3DA] shadow-2xs">
                      <p className="text-[10px] uppercase font-bold text-slate-500">PDS Digital Grains</p>
                      <p className="text-xl font-black text-emerald-800 mt-0.5">{sandboxGrainQuota} kg/mo</p>
                      <p className="text-[10px] text-slate-500">NFSA Wheat & Rice</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#E8E3DA] shadow-2xs">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Direct Grants</p>
                      <p className="text-xl font-black text-[#D46E38] mt-0.5">
                        {sandboxEvents.babyBorn ? '₹1,10,000+' : sandboxEvents.daughter10thPass ? '₹25,000' : '₹0'}
                      </p>
                      <p className="text-[10px] text-slate-500">Vahli Dikri / Scholarship</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#E8E3DA] shadow-2xs">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Monthly Pension</p>
                      <p className="text-xl font-black text-[#133B42] mt-0.5">
                        {sandboxEvents.elderTurned60 ? '₹1,250/mo' : '₹0/mo'}
                      </p>
                      <p className="text-[10px] text-slate-500">Aadhaar Bank DBT</p>
                    </div>
                  </div>

                  {/* Active Mapped Programs List */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800">
                      {t.sandDeltaTitle}:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {sandboxActiveSchemes.map((scheme, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#E8E3DA] flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#28604A] shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{scheme}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Delta Verification */}
                  <div className="p-3.5 rounded-xl bg-[#EAF3EE] border border-[#C3DEC9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#28604A]" />
                      <div>
                        <span className="font-bold text-[#163F30]">{t.sandPaperwork}:</span>
                        <span className="text-slate-700 ml-1">{t.sandPaperworkVal}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#28604A] font-mono font-semibold">
                      {t.sandLatency}: {t.sandLatencyVal}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* ── State Metrics Ticker Bar (Somnath Royal Teal Gradient - Live Synchronized) ── */}
      <section className="bg-gradient-to-r from-[#11353B] via-[#16424A] to-[#1D4E57] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1 border-r border-white/20 last:border-0">
            <p className="text-2xl sm:text-3.5xl font-black text-amber-300">
              {dbStats?.state_metrics?.citizens_monitored || '6.5 Cr+'}
            </p>
            <p className="text-xs text-slate-200 font-medium">{t.statCitizens}</p>
          </div>
          <div className="space-y-1 border-r border-white/20 last:border-0">
            <p className="text-2xl sm:text-3.5xl font-black text-white">
              {dbStats?.state_metrics?.households_connected || '1.4 Cr+'}
            </p>
            <p className="text-xs text-slate-200 font-medium">{t.statFamilies}</p>
          </div>
          <div className="space-y-1 border-r border-white/20 last:border-0">
            <p className="text-2xl sm:text-3.5xl font-black text-emerald-300">
              {dbStats?.state_metrics?.gujarat_districts || '33'}
            </p>
            <p className="text-xs text-slate-200 font-medium">{t.statDistricts}</p>
          </div>
          <div className="space-y-1 border-r border-white/20 last:border-0">
            <p className="text-2xl sm:text-3.5xl font-black text-blue-300">
              {dbStats?.state_metrics?.state_schemes || '20'}
            </p>
            <p className="text-xs text-slate-200 font-medium">{t.statSchemes}</p>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <p className="text-2xl sm:text-3.5xl font-black text-orange-300">
              {dbStats?.state_metrics?.proactive_disbursals || '₹1,200 Cr+'}
            </p>
            <p className="text-xs text-slate-200 font-medium">{t.statDisbursed}</p>
          </div>
        </div>

        {/* Live Database Sync Bar */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">
              {lang === 'gu'
                ? 'લાઇવ સ્ટેટ ડેટાબેઝ સિંક્રનાઇઝેશન સક્રિય (PostgreSQL)'
                : lang === 'hi'
                ? 'लाइव राज्य डेटाबेस सिंक्रनाइज़ेशन सक्रिय (PostgreSQL)'
                : 'Live State Database Synchronization Active (PostgreSQL)'}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-slate-300 text-[10px]">
            <span>
              {lang === 'gu' ? 'નોંધાયેલા પરિવારો:' : lang === 'hi' ? 'पंजीकृत परिवार:' : 'Registered Households:'} <strong className="text-white">{dbStats?.total_families ?? 53}</strong>
            </span>
            <span>·</span>
            <span>
              {lang === 'gu' ? 'નાગરિકો:' : lang === 'hi' ? 'नागरिक:' : 'Citizens Enrolled:'} <strong className="text-white">{dbStats?.total_members ?? 191}</strong>
            </span>
            <span>·</span>
            <span>
              {lang === 'gu' ? 'સક્રિય યોજનાઓ:' : lang === 'hi' ? 'सक्रिय योजनाएं:' : 'Active Schemes:'} <strong className="text-emerald-300">{dbStats?.total_schemes_tracked ?? 20}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── Ration Card Evolution: Before vs After (Light Cards) ── */}
      <section className="py-16 px-4 sm:px-8 border-b border-[#E8E3DA] bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-[#FBF4EC] text-[#9A4215] border-[#EBD6C8] text-xs font-bold">
              {t.compBadge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#133B42]">
              {t.compTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.compSub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Old Way */}
            <Card className="border-rose-300 bg-white shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-rose-950">{t.oldTitle}</h3>
                    <p className="text-xs text-rose-700">{t.oldSub}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{t.old1}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{t.old2}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{t.old3}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Family ID Copilot Way */}
            <Card className="border-[#28604A]/40 bg-white shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF3EE] text-[#163F30] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#163F30]">{t.newTitle}</h3>
                    <p className="text-xs text-[#28604A] font-medium">{t.newSub}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#28604A] font-bold">✓</span>
                    <span>{t.new1}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#28604A] font-bold">✓</span>
                    <span>{t.new2}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#28604A] font-bold">✓</span>
                    <span>{t.new3}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Interactive 33 Gujarat Districts Civic Health Hub ── */}
      <section className="py-16 px-4 sm:px-8 border-b border-[#E8E3DA] bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-[#FAF7F0] text-[#133B42] border-[#E8E3DA] text-xs font-bold">
              {t.districtBadge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#133B42]">
              {t.districtTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.districtSub}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* District Selector Buttons */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
              {GUJARAT_DISTRICT_HUBS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistrict(d)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDistrict.id === d.id
                      ? 'bg-[#133B42] text-white border-[#133B42] shadow-sm'
                      : 'bg-[#FAF7F0] text-slate-800 border-[#E8E3DA] hover:bg-white'
                  }`}
                >
                  <p className="font-bold text-xs">
                    {lang === 'gu' ? d.name_gu : lang === 'hi' ? d.name_hi : d.name}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${selectedDistrict.id === d.id ? 'text-amber-200' : 'text-slate-500'}`}>
                    {d.households} Households
                  </p>
                </button>
              ))}
            </div>

            {/* Selected District Real-Time Status Card */}
            <div className="lg:col-span-7">
              <Card className="border border-[#E8E3DA] bg-[#FAF7F0] shadow-md p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E3DA] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D46E38]" />
                      <h3 className="text-xl font-black text-[#133B42]">
                        {lang === 'gu' ? selectedDistrict.name_gu : lang === 'hi' ? selectedDistrict.name_hi : selectedDistrict.name} District
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct Panchayat Integration · Gujarat Family ID District Registry
                    </p>
                  </div>
                  <Badge className="bg-[#EAF3EE] text-[#163F30] border-[#C3DEC9] font-bold self-start sm:self-auto">
                    {selectedDistrict.fulfill} NFSA Fulfillment Rate
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-[#E8E3DA]">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Connected Families</p>
                    <p className="text-xl font-black text-[#133B42] mt-0.5">{selectedDistrict.households}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E8E3DA]">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Fair Price Shops</p>
                    <p className="text-xl font-black text-[#D46E38] mt-0.5">{selectedDistrict.fps}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E8E3DA]">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Biometric e-KYC</p>
                    <p className="text-xl font-black text-emerald-800 mt-0.5">{selectedDistrict.ekyc}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E8E3DA] text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>District Registry Status:</span>
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Talati Offices Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Automated births, marriages, and senior citizen milestones reported by local Gram Panchayats in {selectedDistrict.name} are synchronized with zero lag.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Citizen Family ID & Ration Card Tracker Tool ── */}
      <section className="py-16 px-4 sm:px-8 border-b border-[#E8E3DA] bg-[#FAF7F0]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-[#FBF4EC] text-[#9A4215] border-[#EBD6C8] text-xs font-bold">
              {t.trackerBadge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#133B42]">
              {t.trackerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {t.trackerSub}
            </p>
          </div>

          <Card className="border border-[#E8E3DA] bg-white shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder={t.trackerPlaceholder}
                    value={trackerInput}
                    onChange={(e) => setTrackerInput(e.target.value)}
                    className="pl-10 h-11 text-xs bg-[#FBF9F5] border-[#E8E3DA] text-slate-900 font-mono placeholder:text-slate-400"
                  />
                </div>
                <Button
                  onClick={() => handleTrackFamily()}
                  className="h-11 px-6 bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold text-xs shrink-0"
                >
                  {t.verifyBtn}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTrackerInput('240100000001');
                    handleTrackFamily('240100000001');
                  }}
                  className="h-11 text-xs border-[#D46E38]/40 bg-[#FAF4EC] text-[#9A4215] hover:bg-[#F5EAE0] font-semibold shrink-0"
                >
                  {t.tryDemoBtn}
                </Button>
              </div>

              {/* Live Tracked Result Card */}
              <AnimatePresence>
                {trackedResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-5 rounded-xl bg-[#FAF7F0] border-2 border-emerald-500 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E3DA] pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold tracking-wider">
                          {t.verifiedNotice}
                        </span>
                        <h3 className="text-base font-bold text-[#133B42] mt-0.5">
                          {trackedResult.head_name} · ID: <span className="font-mono text-[#D46E38]">{trackedResult.family_id}</span>
                        </h3>
                        <p className="text-xs text-slate-600">{trackedResult.district}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowCardModal(true)}
                        className="text-xs bg-[#28604A] hover:bg-[#1e4a38] text-white shrink-0 font-semibold shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5" /> {t.viewCard}
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-[#E8E3DA]">
                        <p className="text-slate-500 text-[10px] uppercase font-semibold">{t.pdsShopLabel}</p>
                        <p className="font-bold text-emerald-800 mt-1">{trackedResult.ration_quota}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[#E8E3DA]">
                        <p className="text-slate-500 text-[10px] uppercase font-semibold">{t.pmjayLabel}</p>
                        <p className="font-bold text-[#133B42] mt-1">{trackedResult.pmjay_status}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-[#E8E3DA]">
                        <p className="text-slate-500 text-[10px] uppercase font-semibold">{t.ekycLabel}</p>
                        <p className="font-bold text-[#D46E38] mt-1">{trackedResult.ekyc_status}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        {t.activeSchemesLabel} ({trackedResult.schemes.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trackedResult.schemes.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs bg-white border-[#E8E3DA] text-slate-800 font-medium">
                            ✓ {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Interactive Welfare Eligibility Estimator with Protection Gauge ── */}
      <section className="py-16 px-4 sm:px-8 border-b border-[#E8E3DA] bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <Badge className="bg-[#FAF7F0] text-[#133B42] border-[#E8E3DA] text-xs font-bold">
              {t.calcBadge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#133B42]">
              {t.calcTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.calcSub}
            </p>
          </div>

          <Card className="border border-[#E8E3DA] bg-[#FAF7F0] shadow-md">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Income Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{t.incomeLabel}</span>
                  <span className="font-mono font-bold text-[#D46E38] text-sm">{formatCurrency(estIncome)}</span>
                </div>
                <Slider
                  value={[estIncome]}
                  onValueChange={([v]) => setEstIncome(v)}
                  min={15000}
                  max={400000}
                  step={5000}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>Antyodaya (₹15,000)</span>
                  <span>BPL Ceiling (₹1,20,000)</span>
                  <span>Middle Class (₹4,00,000)</span>
                </div>
              </div>

              {/* Social Category Pills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-800">{t.casteLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'sc', 'st', 'obc', 'general'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setEstCaste(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${estCaste === c ? 'bg-[#133B42] text-white shadow-xs' : 'bg-white text-slate-700 border border-[#E8E3DA] hover:bg-[#FAF7F0]'}`}
                    >
                      {c === 'all' ? t.anyCat : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Milestones */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E8E3DA] cursor-pointer hover:bg-[#FAF7F0] shadow-2xs">
                  <input
                    type="checkbox"
                    checked={estHasGirl}
                    onChange={(e) => setEstHasGirl(e.target.checked)}
                    className="w-4 h-4 accent-[#D46E38] rounded"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{t.hasGirl}</p>
                    <p className="text-[11px] text-slate-600">{t.hasGirlDesc}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E8E3DA] cursor-pointer hover:bg-[#FAF7F0] shadow-2xs">
                  <input
                    type="checkbox"
                    checked={estHasElder}
                    onChange={(e) => setEstHasElder(e.target.checked)}
                    className="w-4 h-4 accent-[#D46E38] rounded"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{t.hasElder}</p>
                    <p className="text-[11px] text-slate-600">{t.hasElderDesc}</p>
                  </div>
                </label>
              </div>

              {/* Calculator Output Result */}
              <div className="p-5 rounded-xl bg-white border border-[#E8E3DA] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xs">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">{t.calcEstMatch}</span>
                    <Badge className="bg-[#EAF3EE] text-[#163F30] border-[#C3DEC9] text-[10px] font-bold">
                      Estimated State Protection
                    </Badge>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-[#133B42]">
                    {calculateEstimatedSchemes()} {t.calcProgramsAvail}
                  </p>
                  <p className="text-xs text-slate-600">
                    Annual Welfare Cushion Value: <strong className="text-[#D46E38] font-mono">{formatCurrency(calculateAnnualProtectionValue())} / Year</strong>
                  </p>
                </div>

                <Link href="/login">
                  <Button className="bg-[#133B42] hover:bg-[#1A4B54] text-white font-bold text-xs shrink-0 shadow-sm h-11 px-6">
                    {t.claimBtn}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 3 Functional Modules Section ── */}
      <section className="py-16 px-4 sm:px-8 border-b border-[#E8E3DA] bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-[#FBF4EC] text-[#9A4215] border-[#EBD6C8] text-xs font-bold">
              {t.archBadge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#133B42]">
              {t.archTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.archSub}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Proactive Life-Event Engine */}
            <SpotlightCard
              spotlightColor="rgba(212, 110, 56, 0.08)"
              className="border border-[#E8E3DA] bg-white hover:border-[#D46E38]/60 hover:shadow-md transition-all shadow-xs"
            >
              <div className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4EC] text-[#D46E38] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-[#D46E38]" />
                </div>
                <div className="space-y-1">
                  <Badge className="bg-[#FAF4EC] text-[#9A4215] border-[#EBD6C8] text-[10px] font-bold">Proactive Life Events</Badge>
                  <h3 className="font-bold text-base text-slate-900">{t.mod1Title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.mod1Desc}
                </p>
                <div className="pt-2 text-xs font-bold text-[#D46E38] flex items-center gap-1">
                  {t.mod1Link} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </SpotlightCard>

            {/* Registry Deduplication Audit */}
            <SpotlightCard
              spotlightColor="rgba(225, 29, 72, 0.08)"
              className="border border-[#E8E3DA] bg-white hover:border-rose-400 hover:shadow-md transition-all shadow-xs"
            >
              <div className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-rose-700" />
                </div>
                <div className="space-y-1">
                  <Badge className="bg-rose-100 text-rose-900 border-rose-300 text-[10px] font-bold">Registry Integrity</Badge>
                  <h3 className="font-bold text-base text-slate-900">{t.mod2Title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.mod2Desc}
                </p>
                <div className="pt-2 text-xs font-bold text-rose-800 flex items-center gap-1">
                  {t.mod2Link} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </SpotlightCard>

            {/* Trilingual Voice Assistant */}
            <SpotlightCard
              spotlightColor="rgba(40, 96, 74, 0.08)"
              className="border border-[#E8E3DA] bg-white hover:border-[#28604A]/60 hover:shadow-md transition-all shadow-xs"
            >
              <div className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3EE] text-[#163F30] flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5 text-[#28604A]" />
                </div>
                <div className="space-y-1">
                  <Badge className="bg-[#EAF3EE] text-[#163F30] border-[#C3DEC9] text-[10px] font-bold">Citizen Voice</Badge>
                  <h3 className="font-bold text-base text-slate-900">{t.mod3Title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.mod3Desc}
                </p>
                <div className="pt-2 text-xs font-bold text-[#28604A] flex items-center gap-1">
                  {t.mod3Link} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ── Official Indian Government Standard Civic Footer ── */}
      <footer className="bg-[#11353B] text-white text-xs py-12 px-4 sm:px-8 mt-auto border-t-2 border-[#D46E38]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/20 pb-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D46E38] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🏛️
                </div>
                <p className="font-bold text-white text-sm">{t.govName}</p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                {t.deptAddress}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">{t.servicesTitle}</p>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li><Link href="/families/240100000001" className="hover:text-white transition-colors">Digital Family Smart Card</Link></li>
                <li><Link href="/families/240100000001" className="hover:text-white transition-colors">NFSA Ration Distribution</Link></li>
                <li><Link href="/assistant" className="hover:text-white transition-colors">Trilingual Voice Assistant</Link></li>
                <li><Link href="/#schemes-directory" className="hover:text-white transition-colors">20 Flagship State Schemes</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">{t.officerTitle}</p>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li><Link href="/integrity" className="hover:text-white transition-colors">Panchayat Talati Portal</Link></li>
                <li><Link href="/integrity" className="hover:text-white transition-colors">Probabilistic Deduplication</Link></li>
                <li><Link href="/integrity" className="hover:text-white transition-colors">Soundex & Fuzzy Audit</Link></li>
                <li><Link href="/integrity" className="hover:text-white transition-colors">Ghost Ration Mitigation</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">{t.helplineTitle}</p>
              <p className="text-amber-300 font-mono font-bold text-sm">1800-233-5500</p>
              <p className="text-[11px] text-slate-300">{t.helplineHours}</p>
              <p className="text-[11px] text-slate-400">PDS Support: pds-support@gujarat.gov.in</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>{t.copyright}</p>
            <p>{t.standards}</p>
          </div>
        </div>
      </footer>

      {/* ── Official Digital Smart Card Modal ── */}
      <DigitalCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
      />

    </div>
  );
}
