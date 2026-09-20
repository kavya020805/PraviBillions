// ============================================================
// Family ID Copilot — Utility Functions
// ============================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx support.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an income band as a human-readable string.
 */
export function formatIncomeBand(band: string): string {
  const map: Record<string, string> = {
    aay: 'AAY (Antyodaya)',
    bpl: 'BPL (Below Poverty Line)',
    lig: 'LIG (Low Income)',
    mig: 'MIG (Middle Income)',
    hig: 'HIG (High Income)',
  };
  return map[band] || band.toUpperCase();
}

/**
 * Format a caste category.
 */
export function formatCasteCategory(category: string): string {
  const map: Record<string, string> = {
    general: 'General',
    obc: 'OBC',
    sc: 'SC',
    st: 'ST',
  };
  return map[category] || category.toUpperCase();
}

/**
 * Generate a 12-digit family ID.
 */
export function generateFamilyId(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

/**
 * Generate a member ID.
 */
export function generateMemberId(): string {
  return 'MEM' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Calculate age from DOB string.
 */
export function calculateAge(dob: string): number {
  if (!dob) return 0;
  // If masked like '1984-**-**'
  const yearMatch = dob.match(/^(\d{4})/);
  if (dob.includes('*') && yearMatch) {
    const birthYear = parseInt(yearMatch[1], 10);
    const today = new Date();
    return Math.max(0, today.getFullYear() - birthYear);
  }
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) {
    if (yearMatch) {
      return Math.max(0, new Date().getFullYear() - parseInt(yearMatch[1], 10));
    }
    return 0;
  }
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('*')) {
    const yearMatch = dateStr.match(/^(\d{4})/);
    return yearMatch ? `${yearMatch[1]}-**-**` : '****-**-**';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get a scheme category color.
 */
export function getSchemeCategoryColor(category: string): string {
  const map: Record<string, string> = {
    pension: 'bg-amber-100 text-amber-800 border-amber-200',
    scholarship: 'bg-blue-100 text-blue-800 border-blue-200',
    housing: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    health: 'bg-rose-100 text-rose-800 border-rose-200',
    employment: 'bg-violet-100 text-violet-800 border-violet-200',
    social: 'bg-teal-100 text-teal-800 border-teal-200',
    food: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return map[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get scheme category icon name (Lucide).
 */
export function getSchemeCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    pension: 'Landmark',
    scholarship: 'GraduationCap',
    housing: 'Home',
    health: 'Heart',
    employment: 'Briefcase',
    social: 'Users',
    food: 'Wheat',
  };
  return map[category] || 'FileText';
}

/**
 * Truncate text to a max length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
