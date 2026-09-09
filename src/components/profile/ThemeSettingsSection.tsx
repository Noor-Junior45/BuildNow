import React from 'react';
import { Sun, Moon, Laptop, Check, X } from 'lucide-react';
import { useTheme } from '../../utils/theme';

export const ThemeSettingsSection: React.FC = () => {
  const {
    themeMode,
    resolvedTheme,
    isDark,
    isSystem,
    setThemeMode,
    toggleLightDark,
    toggleFollowSystem
  } = useTheme();

  return (
    <div
      id="profile-theme-settings-card"
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5 transition-colors duration-200"
    >
      {/* Header & 3-Option Quick Segmented Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug flex items-center gap-2">
              <span>Theme &amp; Appearance</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {isSystem ? 'System' : isDark ? 'Dark' : 'Light'}
              </span>
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-0.5 leading-relaxed">
              Choose your preferred visual mode or sync automatically with device settings
            </p>
          </div>
        </div>

        {/* 3 Options: Light, Dark, System [Follow Device Theme] */}
        <div
          id="theme-three-options-switcher"
          role="radiogroup"
          aria-label="Theme selection options"
          className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80"
        >
          {/* Option 1: Light */}
          <button
            type="button"
            role="radio"
            aria-checked={themeMode === 'light'}
            onClick={() => setThemeMode('light')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              themeMode === 'light'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sun className={`w-4 h-4 ${themeMode === 'light' ? 'text-amber-500 fill-amber-500/20' : 'text-slate-500'}`} />
            <span>Light</span>
          </button>

          {/* Option 2: Dark */}
          <button
            type="button"
            role="radio"
            aria-checked={themeMode === 'dark'}
            onClick={() => setThemeMode('dark')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              themeMode === 'dark'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Moon className={`w-4 h-4 ${themeMode === 'dark' ? 'text-indigo-300 fill-indigo-300/20' : 'text-slate-500'}`} />
            <span>Dark</span>
          </button>

          {/* Option 3: System */}
          <button
            type="button"
            role="radio"
            aria-checked={themeMode === 'system'}
            onClick={() => setThemeMode('system')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              themeMode === 'system'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title="Follow Device Theme"
          >
            <Laptop className={`w-4 h-4 ${themeMode === 'system' ? 'text-white' : 'text-slate-500'}`} />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Row 1: Light & Dark Reference-Styled Custom Toggle */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              Light &amp; Dark Toggle
            </p>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isDark
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-1 leading-relaxed">
            {isSystem
              ? `Currently active: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} (following device). Tap toggle to switch manually.`
              : `Tap to switch directly between Light and Dark interface modes.`}
          </p>
        </div>

        {/* CUSTOM PILL TOGGLE MATCHING USER REFERENCE IMAGE */}
        <button
          id="toggle-light-dark-mode"
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle between Light and Dark mode"
          onClick={toggleLightDark}
          className={`relative inline-flex h-[38px] w-[78px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isDark
              ? 'bg-[#181B20] shadow-[inset_0_2px_5px_rgba(0,0,0,0.65)] ring-1 ring-white/10'
              : 'bg-[#E3E5E8] shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] ring-1 ring-black/5'
          }`}
        >
          {/* Track Sun icon on the left (visible in Dark mode background inside track) */}
          <div
            className={`absolute left-[11px] flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
              isDark ? 'opacity-55' : 'opacity-0'
            }`}
          >
            <Sun className="w-[19px] h-[19px] text-[#8C939E] stroke-[1.9]" />
          </div>

          {/* Track Moon icon on the right (visible in Light mode background inside track) */}
          <div
            className={`absolute right-[11px] flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
              isDark ? 'opacity-0' : 'opacity-65'
            }`}
          >
            <Moon className="w-[19px] h-[19px] text-[#64748B] stroke-[1.9]" />
          </div>

          {/* Sliding Circular Knob (Sun in Light mode, Moon in Dark mode) */}
          <span
            className={`relative flex items-center justify-center h-[32px] w-[32px] rounded-full transition-transform duration-300 ease-out ${
              isDark
                ? 'translate-x-[40px] bg-gradient-to-b from-[#4B5563] via-[#374151] to-[#1F2937] shadow-[0_2px_6px_rgba(0,0,0,0.65)] ring-1 ring-white/15'
                : 'translate-x-0 bg-gradient-to-b from-[#FDBA74] via-[#F59E0B] to-[#D97706] shadow-[0_2px_7px_rgba(217,119,6,0.48)] ring-1 ring-white/30'
            }`}
          >
            {isDark ? (
              <Moon className="w-[17px] h-[17px] text-white stroke-[2.2] fill-transparent drop-shadow-xs" />
            ) : (
              <Sun className="w-[18px] h-[18px] text-white stroke-[2.3] drop-shadow-xs" />
            )}
          </span>
        </button>
      </div>

      {/* Row 2: Follow Device Theme Yes or No Toggle Button (Similar Design) */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              Follow Device Theme
            </p>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isSystem
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {isSystem ? 'YES (Active)' : 'NO (Disabled)'}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-1 leading-relaxed">
            Automatically match your phone or operating system display settings (Dark / Light)
          </p>
        </div>

        {/* YES / NO TOGGLE BUTTON WITH SIMILAR SLIDING PILL DESIGN */}
        <button
          id="toggle-system-follow-theme"
          type="button"
          role="switch"
          aria-checked={isSystem}
          aria-label="Toggle Follow Device Theme Yes or No"
          onClick={() => toggleFollowSystem(!isSystem)}
          className={`relative inline-flex h-[38px] w-[78px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isSystem
              ? 'bg-[#00B050] shadow-[inset_0_2px_4px_rgba(0,0,0,0.24)] ring-1 ring-emerald-400/30'
              : 'bg-[#C8CCD0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ring-1 ring-black/5'
          }`}
        >
          {/* Subtle "NO" label inside track when ON */}
          <span
            className={`absolute left-[10px] text-[10px] font-black tracking-wider transition-opacity duration-300 pointer-events-none ${
              isSystem ? 'opacity-80 text-white' : 'opacity-0'
            }`}
          >
            NO
          </span>

          {/* Subtle "YES" label inside track when OFF */}
          <span
            className={`absolute right-[9px] text-[10px] font-black tracking-wider transition-opacity duration-300 pointer-events-none ${
              isSystem ? 'opacity-0' : 'opacity-70 text-slate-700'
            }`}
          >
            YES
          </span>

          {/* Sliding Knob with Yes/No Feedback Icon */}
          <span
            className={`relative flex items-center justify-center h-[32px] w-[32px] rounded-full transition-transform duration-300 ease-out bg-white shadow-[0_2px_5px_rgba(0,0,0,0.26)] ${
              isSystem
                ? 'translate-x-[40px] text-emerald-600 ring-1 ring-emerald-500/20'
                : 'translate-x-0 text-slate-500 ring-1 ring-slate-300/60'
            }`}
          >
            {isSystem ? (
              <Check className="w-[18px] h-[18px] stroke-[3.2] text-[#00B050]" />
            ) : (
              <X className="w-[16px] h-[16px] stroke-[2.8] text-slate-400" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
