import type { SavedPlan } from '@/types';

const STORAGE_PREFIX = 'travelkr_saved_plans_';

function isClient() {
  return typeof window !== 'undefined';
}

function storageKey(email: string) {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export function getSavedPlans(email: string) {
  if (!isClient()) return [] as SavedPlan[];
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    return raw ? (JSON.parse(raw) as SavedPlan[]) : [];
  } catch {
    return [];
  }
}

export function isPlanSaved(email: string, planId: string) {
  const plans = getSavedPlans(email);
  return plans.some((plan) => plan.id === planId);
}

export function savePlan(email: string, plan: SavedPlan) {
  if (!isClient()) return;
  const plans = getSavedPlans(email);
  const nextPlans = plans.filter((item) => item.id !== plan.id);
  nextPlans.unshift(plan);
  window.localStorage.setItem(storageKey(email), JSON.stringify(nextPlans));
}
