'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/features/users/api/users.api';
import { FitProfileCreate, FitProfileResponse } from '@/features/users/types/users.types';

export default function FitProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fitProfile, setFitProfile] = useState<FitProfileResponse | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [heightFeet, setHeightFeet] = useState<string>('');
  const [heightInches, setHeightInches] = useState<string>('');
  const [formData, setFormData] = useState<FitProfileCreate>({
    isPublic: true,
    gender: null,
    bodyType: null,
    heightCm: null,
    lengthUnit: null,
    weightKg: null,
    weightUnit: null,
    topSize: null,
    fitPreference: null,
    stylePreference: null,
    shoeSizeSystem: null,
    shoesSizeValue: null,
  });

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const data = localStorage.getItem('fitfolio_logged_in');
    if (!data) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(data);
      if (user?.id) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Fetch fit profile when userId is available
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    usersApi
      .getFitProfile(userId)
      .then((profile) => {
        console.log("API returned isPublic:", profile.isPublic, typeof profile.isPublic);
        setFitProfile(profile);
        
        // Helper function to convert enum values (uppercase) to lowercase for form dropdowns
        const normalizeEnumValue = (value: string | null | undefined): string | null => {
          if (!value) return null;
          // Convert "PREFER_NOT_TO_SAY" -> "prefer not to say", "MALE" -> "male", etc.
          return value.toLowerCase().replace(/_/g, ' ');
        };

        // Step 1: Set unit types first
        const lengthUnit = profile.lengthUnit || null;
        const weightUnit = profile.weightUnit || null;
        const shoeSizeSystem = profile.shoeSizeSystem || null;

        // Step 2: Process height based on lengthUnit
        let heightCmValue: number | null = null;
        let feetValue = '';
        let inchesValue = '';
        
        if (profile.heightCm !== null && profile.heightCm !== undefined) {
          const heightCm = typeof profile.heightCm === 'number' ? profile.heightCm : parseFloat(String(profile.heightCm));
          
          if (lengthUnit === 'in') {
            // Convert cm to inches for display (heightCm is stored in cm, but we display as inches)
            // Actually, wait - let me check: if lengthUnit is 'in', does heightCm store inches or cm?
            // Based on the submit logic, when lengthUnit is 'in', we convert to cm before storing
            // So heightCm is always stored in cm. If user selected 'in', we need to convert cm back to inches
            const totalInches = heightCm / 2.54;
            feetValue = Math.floor(totalInches / 12).toString();
            inchesValue = Math.round(totalInches % 12).toString();
          } else {
            // lengthUnit is 'cm' or null - display as cm
            heightCmValue = heightCm;
          }
        }
        
        setHeightFeet(feetValue);
        setHeightInches(inchesValue);

        // Step 3: Process weight based on weightUnit
        let weightValue: number | null = null;
        
        if (profile.weightKg !== null && profile.weightKg !== undefined) {
          const weightKg = typeof profile.weightKg === 'number' ? profile.weightKg : parseFloat(String(profile.weightKg));
          
          if (weightUnit === 'lbs') {
            // Convert kg to lbs for display (weightKg is stored in kg, but we display as lbs)
            weightValue = Math.round(weightKg / 0.453592); // Round to whole number
          } else {
            // weightUnit is 'kg' or null - display as kg (round to whole number)
            weightValue = Math.round(weightKg);
          }
        }

        // Step 4: Pre-fill form with all data (units set first, then values)
        setFormData({
          isPublic: profile.isPublic,
          gender: normalizeEnumValue(profile.gender),
          bodyType: normalizeEnumValue(profile.bodyType),
          heightCm: heightCmValue,
          lengthUnit: lengthUnit,
          weightKg: weightValue,
          weightUnit: weightUnit,
          topSize: profile.topSize,
          fitPreference: normalizeEnumValue(profile.fitPreference),
          stylePreference: normalizeEnumValue(profile.stylePreference),
          shoeSizeSystem: shoeSizeSystem,
          shoesSizeValue: profile.shoesSizeValue,
        });
      })
      .catch((err: any) => {
        // 404 means no profile exists yet - that's fine, user will create one
        if (err?.response?.status === 404) {
          setFitProfile(null);
        } else {
          console.error('Error fetching fit profile:', err);
          setError('Failed to load fit profile');
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);

    // Validate all fields are filled
    const missingFields: string[] = [];
    
    if (!formData.gender) missingFields.push('Gender');
    if (!formData.bodyType) missingFields.push('Body Type');
    if (!formData.lengthUnit) missingFields.push('Height Unit');
    if (!formData.weightUnit) missingFields.push('Weight Unit');
    if (!formData.topSize) missingFields.push('Usual Size');
    if (!formData.fitPreference) missingFields.push('Fit Preference');
    if (!formData.stylePreference) missingFields.push('Style Preference');
    if (!formData.shoeSizeSystem) missingFields.push('Shoe Size System');
    if (formData.shoesSizeValue === null || formData.shoesSizeValue === undefined) {
      missingFields.push('Shoe Size Value');
    }

    // Validate height based on unit
    if (formData.lengthUnit === 'in') {
      if (!heightFeet || !heightInches) {
        missingFields.push('Height (feet and inches)');
      }
    } else if (formData.lengthUnit === 'cm') {
      if (!formData.heightCm) {
        missingFields.push('Height');
      }
    }

    // Validate weight based on unit
    if (!formData.weightKg) {
      missingFields.push('Weight');
    }

    if (missingFields.length > 0) {
      setError(`Please fill in all fields: ${missingFields.join(', ')}`);
      setSaving(false);
      return;
    }

    // Prepare data for submission
    const submitData: FitProfileCreate = { ...formData };
    
    // Convert height: inches to cm
    if (submitData.lengthUnit === 'in') {
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      const totalInches = feet * 12 + inches;
      if (totalInches > 0) {
        // Convert total inches to cm
        const cm = Math.round(totalInches * 2.54);
        submitData.heightCm = cm;
      }
    } else if (submitData.lengthUnit === 'cm' && submitData.heightCm) {
      // Ensure heightCm is a number
      submitData.heightCm = typeof submitData.heightCm === 'string' 
        ? parseInt(submitData.heightCm, 10) 
        : Math.round(submitData.heightCm);
    }
    
    // Convert weight: lbs to kg (but keep the user's unit preference)
    if (submitData.weightUnit === 'lbs' && submitData.weightKg !== null && submitData.weightKg !== undefined) {
      const lbs = typeof submitData.weightKg === 'string' 
        ? parseFloat(submitData.weightKg) 
        : submitData.weightKg;
      if (!isNaN(lbs)) {
        // Convert lbs to kg (1 lb = 0.453592 kg)
        // Store the value in kg, but keep weightUnit as 'lbs' to remember user's preference
        const kg = Math.round(lbs * 0.453592); // Round to whole number
        submitData.weightKg = kg;
        // Keep weightUnit as 'lbs' - this is the user's preference for display
      }
    } else if (submitData.weightKg !== null && submitData.weightKg !== undefined) {
      // Ensure weightKg is a number (already in kg) and round to whole number
      const weightValue = typeof submitData.weightKg === 'string' 
        ? parseFloat(submitData.weightKg) 
        : submitData.weightKg;
      submitData.weightKg = Math.round(weightValue);
    }

    try {
      const updated = await usersApi.upsertFitProfile(userId, submitData);
      setFitProfile(updated);
      // Show success message or redirect
      alert('Fit profile saved successfully!');
    } catch (err: any) {
      console.error('Error saving fit profile:', err);
      setError(err?.response?.data?.message || 'Failed to save fit profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log("Change event:", e.target.name, e.target.value, e.target.type)
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      // "Make profile private" checkbox: checked = private = isPublic false
      setFormData((prev) => ({
        ...prev,
        isPublic: !checked,
      }));
    } else if (name === 'lengthUnit') {
      // When unit changes, handle height conversion
      setFormData((prev) => {
        const newUnit = value === '' ? null : value;
        const oldUnit = prev.lengthUnit;
        
        // If switching from cm to inches, convert cm to total inches, then split to feet/inches
        if (oldUnit === 'cm' && newUnit === 'in' && prev.heightCm !== null && prev.heightCm !== undefined) {
          const cm = typeof prev.heightCm === 'number' ? prev.heightCm : parseFloat(String(prev.heightCm));
          if (!isNaN(cm)) {
            const totalInches = cm / 2.54;
            setHeightFeet(Math.floor(totalInches / 12).toString());
            setHeightInches(Math.round(totalInches % 12).toString());
          }
        }
        // If switching from inches to cm, convert feet/inches to cm
        else if (oldUnit === 'in' && newUnit === 'cm') {
          const feet = parseFloat(heightFeet) || 0;
          const inches = parseFloat(heightInches) || 0;
          const totalInches = feet * 12 + inches;
          if (totalInches > 0) {
            const cm = Math.round(totalInches * 2.54);
            return {
              ...prev,
              lengthUnit: newUnit,
              heightCm: cm,
            };
          }
        }
        // If switching to inches but no existing height, clear feet/inches
        else if (newUnit === 'in') {
          setHeightFeet('');
          setHeightInches('');
        }
        
        return {
          ...prev,
          lengthUnit: newUnit,
        };
      });
    } else if (name === 'weightUnit') {
      // When weight unit changes, convert the weight value
      setFormData((prev) => {
        const newUnit = value === '' ? null : value;
        const oldUnit = prev.weightUnit;
        
        // Only convert if there's an existing weight value
        if (prev.weightKg !== null && prev.weightKg !== undefined) {
          const currentWeight = typeof prev.weightKg === 'number' ? prev.weightKg : parseFloat(String(prev.weightKg));
          
          if (!isNaN(currentWeight)) {
            // If switching from kg to lbs, convert kg to lbs
            if (oldUnit === 'kg' && newUnit === 'lbs') {
              const lbs = Math.round(currentWeight / 0.453592); // Round to whole number
              return {
                ...prev,
                weightUnit: newUnit,
                weightKg: lbs,
              };
            }
            // If switching from lbs to kg, convert lbs to kg
            else if (oldUnit === 'lbs' && newUnit === 'kg') {
              const kg = Math.round(currentWeight * 0.453592); // Round to whole number
              return {
                ...prev,
                weightUnit: newUnit,
                weightKg: kg,
              };
            }
          }
        }
        
        return {
          ...prev,
          weightUnit: newUnit,
        };
      });
    } else if (name === 'heightFeet') {
      setHeightFeet(value);
    } else if (name === 'heightInches') {
      setHeightInches(value);
    } else if (name === 'heightCm') {
      // heightCm is Integer (number)
      setFormData((prev) => ({
        ...prev,
        heightCm: value === '' ? null : parseInt(value, 10),
      }));
    } else if (name === 'weightKg') {
      // weightKg - round to whole number
      setFormData((prev) => ({
        ...prev,
        weightKg: value === '' ? null : Math.round(parseFloat(value) || 0),
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? null : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? null : value,
      }));
    }
  };

  console.log("Data here:", formData)

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-white/60">Loading fit profile...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Left border with dotted line */}
        <div className="relative pl-8 border-l-2 border-dotted border-ff-cyan/30">
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-4 uppercase tracking-wide">
            CREATE YOUR FIT PROFILE
          </h1>
          
          {/* Separator line after title */}
          <div className="h-px bg-white/20 mb-8 -ml-8" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender */}
            <div>
              <label className="block text-white mb-2">What is your gender?</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
              >
                <option value="">Choose an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-white mb-2">What is your body type?</label>
              <select
                name="bodyType"
                value={formData.bodyType || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
              >
                <option value="">Choose an option</option>
                <option value="slim">Slim</option>
                <option value="average">Average</option>
                <option value="athletic">Athletic</option>
                <option value="plus">Plus</option>
              </select>
            </div>

            {/* Separator line after body type */}
            <div className="h-px bg-white/20 -ml-8" />

            {/* Height */}
            <div>
              <label className="block text-white mb-2">How tall are you?</label>
              <div className="flex gap-2 items-center">
                <select
                  name="lengthUnit"
                  value={formData.lengthUnit || ''}
                  onChange={handleChange}
                  className="px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-ff-cyan focus:outline-none"
                >
                  <option value="">Choose an option</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
                
                {formData.lengthUnit === 'in' ? (
                  // Two inputs for feet and inches with apostrophes
                  <>
                    <input
                      type="number"
                      name="heightFeet"
                      value={heightFeet}
                      onChange={handleChange}
                      placeholder=""
                      min="0"
                      max="10"
                      className="w-20 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none text-center"
                    />
                    <span className="text-white text-xl">'</span>
                    <input
                      type="number"
                      name="heightInches"
                      value={heightInches}
                      onChange={handleChange}
                      placeholder=""
                      min="0"
                      max="11"
                      className="w-20 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none text-center"
                    />
                    <span className="text-white text-xl">"</span>
                  </>
                ) : (
                  // Single input for cm
                  <input
                    type="text"
                    name="heightCm"
                    value={formData.heightCm !== null && formData.heightCm !== undefined ? formData.heightCm.toString() : ''}
                    onChange={handleChange}
                    placeholder=""
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-white mb-2">What is your weight?</label>
              <div className="flex gap-2">
                <select
                  name="weightUnit"
                  value={formData.weightUnit || ''}
                  onChange={handleChange}
                  className="px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-ff-cyan focus:outline-none"
                >
                  <option value="">Choose an option</option>
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
                <input
                  type="text"
                  name="weightKg"
                  value={formData.weightKg !== null && formData.weightKg !== undefined ? Math.round(formData.weightKg).toString() : ''}
                  onChange={handleChange}
                  placeholder=""
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Shoe Size */}
            <div>
              <label className="block text-white mb-2">What is your shoe size?</label>
              <div className="flex gap-2">
                <select
                  name="shoeSizeSystem"
                  value={formData.shoeSizeSystem || ''}
                  onChange={handleChange}
                  className="px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-ff-cyan focus:outline-none"
                >
                  <option value="">Choose an option</option>
                  <option value="EU">EU</option>
                  <option value="US">US</option>
                  <option value="UK">UK</option>
                  <option value="cm">cm</option>
                </select>
                <input
                  type="number"
                  name="shoesSizeValue"
                  value={formData.shoesSizeValue || ''}
                  onChange={handleChange}
                  step="0.5"
                  placeholder=""
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Separator line after shoe size */}
            <div className="h-px bg-white/20 -ml-8" />

            {/* Usual Size */}
            <div>
              <label className="block text-white mb-2">What is your usual size?</label>
              <select
                name="topSize"
                value={formData.topSize || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
              >
                <option value="">Choose an option</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="3XL">3XL</option>
              </select>
            </div>

            {/* Fit Preference */}
            <div>
              <label className="block text-white mb-2">What is your fit preference?</label>
              <select
                name="fitPreference"
                value={formData.fitPreference || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
              >
                <option value="">Choose an option</option>
                <option value="slim">Slim</option>
                <option value="regular">Regular</option>
                <option value="relaxed">Relaxed</option>
                <option value="oversized">Oversized</option>
              </select>
            </div>

            {/* Style Preference */}
            <div>
              <label className="block text-white mb-2">What is your style preference?</label>
              <select
                name="stylePreference"
                value={formData.stylePreference || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-ff-cyan focus:outline-none"
              >
                <option value="">Choose an option</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="minimal">Minimal</option>
                <option value="streetwear">Streetwear</option>
                <option value="techwear">Techwear</option>
                <option value="classic">Classic</option>
                <option value="sporty">Sporty</option>
              </select>
            </div>

            {/* Make profile private checkbox */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={!formData.isPublic}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-ff-cyan focus:ring-ff-cyan focus:ring-2 focus:ring-offset-0"
                />
                <span className="text-white">Make profile private</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-ff-cyan text-black font-semibold rounded-lg hover:bg-ff-cyan/90 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {saving ? 'Saving...' : fitProfile ? 'UPDATE FIT PROFILE' : 'CREATE FIT PROFILE'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
