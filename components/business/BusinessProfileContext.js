import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BUSINESS_PROFILE_KEY, EMPTY_BUSINESS_PROFILE, computeProfileCompletion } from "@/lib/businessProfileData";

const BusinessProfileContext = createContext(null);

function readLocalProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BUSINESS_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function BusinessProfileProvider({ children }) {
  const [profile, setProfileState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfileState(readLocalProfile());
    setHydrated(true);
  }, []);

  const setProfile = useCallback((next) => {
    const value = next || null;
    setProfileState(value);
    if (typeof window !== "undefined") {
      try {
        if (value) window.localStorage.setItem(BUSINESS_PROFILE_KEY, JSON.stringify(value));
        else window.localStorage.removeItem(BUSINESS_PROFILE_KEY);
      } catch {
        /* storage unavailable */
      }
    }
  }, []);

  const resetProfile = useCallback(() => setProfile(null), [setProfile]);

  const value = useMemo(() => {
    const completion = computeProfileCompletion(profile);
    const display = profile
      ? {
          name: profile.identity?.businessName || "Your Business",
          legalName: profile.identity?.legalName || "",
          type: profile.identity?.businessType || "",
          industry: profile.identity?.industry || "",
          subIndustry: profile.identity?.subIndustry || "",
          city: profile.location?.primaryCity || "",
          state: profile.location?.state || "",
          country: profile.location?.country || "",
          ops: profile.operations?.operations || [],
          employees: profile.scale?.employees || "",
          stage: profile.scale?.businessStage || "",
        }
      : null;
    return { profile, display, completion, isRegistered: Boolean(profile), setProfile, resetProfile, hydrated, emptyProfile: EMPTY_BUSINESS_PROFILE };
  }, [profile, setProfile, resetProfile, hydrated]);

  return <BusinessProfileContext.Provider value={value}>{children}</BusinessProfileContext.Provider>;
}

export function useBusinessProfile() {
  const ctx = useContext(BusinessProfileContext);
  if (!ctx) throw new Error("useBusinessProfile must be used within BusinessProfileProvider");
  return ctx;
}