'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'gu' | 'hi';

interface CommonTranslations {
  govIndia: string;
  govGujarat: string;
  deptName: string;
  helpline: string;
  tollFree: string;
  signIn: string;
  signOut: string;
  myHousehold: string;
  familyRegistry: string;
  registryIntegrity: string;
  welfareAssistant: string;
  dashboard: string;
  adminRole: string;
  citizenRole: string;
  languageSelect: string;
  search: string;
  reset: string;
  all: string;
  simulate: string;
  viewCard: string;
  print: string;
  treeView: string;
  rosterView: string;
  members: string;
  schemes: string;
  annualIncome: string;
  district: string;
  category: string;
  rationQuota: string;
  food: string;
  health: string;
  pension: string;
  education: string;
  housing: string;
  employment: string;
  social: string;
}

const commonTranslations: Record<Language, CommonTranslations> = {
  en: {
    govIndia: 'Government of India',
    govGujarat: 'Government of Gujarat',
    deptName: 'Department of Food, Civil Supplies & Consumer Affairs',
    helpline: 'Helpline: 1800-233-5500',
    tollFree: 'Toll-Free',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    myHousehold: 'My Household',
    familyRegistry: 'Family Registry',
    registryIntegrity: 'Registry Integrity',
    welfareAssistant: 'Welfare Assistant',
    dashboard: 'Dashboard',
    adminRole: 'Panchayat Officer',
    citizenRole: 'Citizen Beneficiary',
    languageSelect: 'Language',
    search: 'Search',
    reset: 'Reset to Baseline',
    all: 'All',
    simulate: 'Simulate Life Event',
    viewCard: 'View Official Digital Smart Card',
    print: 'Print Card',
    treeView: 'Family Tree View',
    rosterView: 'Roster Table View',
    members: 'Members',
    schemes: 'Active Schemes',
    annualIncome: 'Annual Income',
    district: 'District',
    category: 'Category',
    rationQuota: 'Monthly Ration Quota',
    food: 'Food & Ration',
    health: 'Healthcare',
    pension: 'Pension',
    education: 'Education',
    housing: 'Housing & Infra',
    employment: 'Employment',
    social: 'Social Welfare',
  },
  gu: {
    govIndia: 'ભારત સરકાર',
    govGujarat: 'ગુજરાત સરકાર',
    deptName: 'ખોરાક, નાગરિક પુરવઠો અને ગ્રાહક બાબતોનો વિભાગ',
    helpline: 'હેલ્પલાઇન: 1800-233-5500',
    tollFree: 'ટોલ-ફ્રી',
    signIn: 'પ્રવેશ / લોગિન',
    signOut: 'બહાર નીકળો',
    myHousehold: 'મારું કુટુંબ',
    familyRegistry: 'પરિવાર રજિસ્ટ્રી',
    registryIntegrity: 'રેકોર્ડ શુદ્ધતા ઓડિટ',
    welfareAssistant: 'યોજના સહાયક',
    dashboard: 'ડેશબોર્ડ',
    adminRole: 'પંચાયત તલાટી અધિકારી',
    citizenRole: 'નાગરિક લાભાર્થી',
    languageSelect: 'ભાષા',
    search: 'શોધો',
    reset: 'મૂળ સ્થિતિ પુનઃસ્થાપિત કરો',
    all: 'બધા',
    simulate: 'જીવન ઘટના સિમ્યુલેટ કરો',
    viewCard: 'ડિજિટલ સ્માર્ટ કાર્ડ જુઓ',
    print: 'પ્રિન્ટ કરો',
    treeView: 'કુટુંબ વંશાવળી દૃશ્ય',
    rosterView: 'યાદી કોષ્ટક દૃશ્ય',
    members: 'કુલ સભ્યો',
    schemes: 'સક્રિય યોજનાઓ',
    annualIncome: 'વાર્ષિક આવક',
    district: 'જિલ્લો',
    category: 'કેટેગરી',
    rationQuota: 'માસિક રાશન જથ્થો',
    food: 'અનાજ અને રાશન',
    health: 'આરોગ્ય કવચ',
    pension: 'પેન્શન',
    education: 'શિક્ષણ સહાય',
    housing: 'આવાસ અને સુવિધા',
    employment: 'રોજગાર',
    social: 'સામાજિક કલ્યાણ',
  },
  hi: {
    govIndia: 'भारत सरकार',
    govGujarat: 'गुजरात सरकार',
    deptName: 'खाद्य, नागरिक आपूर्ति एवं उपभोक्ता मामले विभाग',
    helpline: 'हेल्पलाइन: 1800-233-5500',
    tollFree: 'टोल-फ्री',
    signIn: 'साइन इन / लॉगिन',
    signOut: 'लॉग आउट',
    myHousehold: 'मेरा परिवार',
    familyRegistry: 'परिवार पंजीयन',
    registryIntegrity: 'पंजीकरण शुद्धता ऑडिट',
    welfareAssistant: 'कल्याणकारी सहायक',
    dashboard: 'डैशबोर्ड',
    adminRole: 'पंचायत तलाटी अधिकारी',
    citizenRole: 'नागरिक लाभार्थी',
    languageSelect: 'भाषा',
    search: 'खोजें',
    reset: 'मूल स्थिति में रीसेट करें',
    all: 'सभी',
    simulate: 'जीवन घटना सिमुलेट करें',
    viewCard: 'डिजिटल स्मार्ट कार्ड देखें',
    print: 'प्रिंट करें',
    treeView: 'परिवार वंशावली दृश्य',
    rosterView: 'सूची तालिका दृश्य',
    members: 'कुल सदस्य',
    schemes: 'सक्रिय योजनाएं',
    annualIncome: 'वार्षिक आय',
    district: 'जिला',
    category: 'श्रेणी',
    rationQuota: 'मासिक राशन कोटा',
    food: 'खाद्यान्न एवं राशन',
    health: 'स्वास्थ्य सुरक्षा',
    pension: 'पेंशन',
    education: 'शिक्षा सहायता',
    housing: 'आवास एवं अवसंरचना',
    employment: 'रोजगार',
    social: 'सामाजिक कल्याण',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  tCommon: CommonTranslations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  tCommon: commonTranslations.en,
});

const STORAGE_KEY = 'gujarat_portal_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && (saved === 'en' || saved === 'gu' || saved === 'hi')) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        tCommon: commonTranslations[language] || commonTranslations.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
