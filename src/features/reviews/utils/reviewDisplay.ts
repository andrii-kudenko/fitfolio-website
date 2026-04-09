import type { FitProfileResponse } from '@/features/users/types/users.types';

export function fitInfoFromProfile(
  fitProfile: FitProfileResponse | undefined | null,
  purchasedSize: string | null
): string[] {
  const fitInfo: string[] = [];
  if (!fitProfile) {
    if (purchasedSize) fitInfo.push(`Size ${purchasedSize}`);
    return fitInfo;
  }
  if (fitProfile.heightCm && fitProfile.lengthUnit) {
    if (fitProfile.lengthUnit === 'in') {
      const totalInches = fitProfile.heightCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      fitInfo.push(`${feet}'${inches}"`);
    } else {
      fitInfo.push(`${fitProfile.heightCm} cm`);
    }
  }
  if (fitProfile.weightKg && fitProfile.weightUnit) {
    if (fitProfile.weightUnit === 'lbs') {
      const lbs = Math.round(fitProfile.weightKg / 0.453592);
      fitInfo.push(`${lbs}lbs`);
    } else {
      fitInfo.push(`${Math.round(fitProfile.weightKg)}kg`);
    }
  }
  if (purchasedSize) {
    fitInfo.push(`Size ${purchasedSize}`);
  }
  return fitInfo;
}
