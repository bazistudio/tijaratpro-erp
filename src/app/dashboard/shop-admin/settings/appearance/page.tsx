'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import toast from 'react-hot-toast';
import { Palette, RotateCcw, Save, CheckCircle } from 'lucide-react';

// ===========================
// COLOR PRESETS
// ===========================

const PRIMARY_PRESETS = [
  { name: 'Teal',   value: '#006970' },
  { name: 'Blue',   value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Green',  value: '#16a34a' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Red',    value: '#dc2626' },
  { name: 'Pink',   value: '#db2777' },
  { name: 'Slate',  value: '#475569' },
];

const SECONDARY_PRESETS = [
  { name: 'Teal Light', value: '#00b4bb' },
  { name: 'Sky',        value: '#38bdf8' },
  { name: 'Violet',     value: '#a78bfa' },
  { name: 'Emerald',    value: '#34d399' },
  { name: 'Amber',      value: '#fbbf24' },
  { name: 'Rose',       value: '#fb7185' },
  { name: 'Fuchsia',    value: '#e879f9' },
  { name: 'Slate',      value: '#94a3b8' },
];

const BACKGROUND_PRESETS = [
  { name: 'Light Gray', value: '#f8fafc' },
  { name: 'White',      value: '#ffffff' },
  { name: 'Warm Gray',  value: '#f9fafb' },
  { name: 'Slate 50',   value: '#f1f5f9' },
  { name: 'Neutral',    value: '#fafafa' },
];

// ===========================
// SUB-COMPONENTS
// ===========================

interface ColorSwatchProps {
  color: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, name, isSelected, onClick }: ColorSwatchProps) {
  return (
    <button
      id={`color-swatch-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="button"
      title={name}
      onClick={onClick}
      className="relative w-9 h-9 rounded-xl border-2 transition-all duration-150 hover:scale-110 focus-visible:scale-110"
      style={{
        backgroundColor: color,
        borderColor: isSelected ? color : 'transparent',
        boxShadow: isSelected ? `0 0 0 3px white, 0 0 0 5px ${color}` : 'none',
      }}
    >
      {isSelected && (
        <CheckCircle className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" />
      )}
    </button>
  );
}

interface ColorSectionProps {
  label: string;
  description: string;
  presets: { name: string; value: string }[];
  selectedValue: string;
  onPresetClick: (value: string) => void;
  onCustomChange: (value: string) => void;
}

function ColorSection({ label, description, presets, selectedValue, onPresetClick, onCustomChange }: ColorSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-[--color-text-primary]">{label}</p>
        <p className="text-xs text-[--color-text-muted] mt-0.5">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {presets.map((preset) => (
          <ColorSwatch
            key={preset.value}
            color={preset.value}
            name={preset.name}
            isSelected={selectedValue === preset.value}
            onClick={() => onPresetClick(preset.value)}
          />
        ))}
        {/* Divider */}
        <div className="w-px h-8 bg-[--color-border] mx-1" />
        {/* Custom picker */}
        <label
          className="relative w-9 h-9 rounded-xl border-2 border-dashed border-[--color-border] flex items-center justify-center cursor-pointer hover:border-[--color-primary] transition-colors"
          title="Custom color"
        >
          <span className="text-xs text-[--color-text-muted] select-none">+</span>
          <input
            id={`custom-${label.toLowerCase().replace(/\s+/g, '-')}`}
            type="color"
            value={selectedValue}
            onChange={(e) => onCustomChange(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />
        </label>
        {/* Show current custom color if it's not in presets */}
        {!presets.find(p => p.value === selectedValue) && (
          <div
            className="w-9 h-9 rounded-xl border-2 border-[--color-primary]"
            style={{ backgroundColor: selectedValue }}
            title={`Custom: ${selectedValue}`}
          />
        )}
      </div>
      <p className="text-xs font-mono text-[--color-text-muted]">{selectedValue}</p>
    </div>
  );
}

// ===========================
// MAIN PAGE
// ===========================

export default function AppearancePage() {
  const { theme, isLoading, previewTheme, cancelPreview, saveTheme, isSaving } = useTheme();

  const [localColors, setLocalColors] = useState({
    primary:    theme?.colors?.primary    ?? '#006970',
    secondary:  theme?.colors?.secondary  ?? '#00b4bb',
    background: theme?.colors?.background ?? '#f8fafc',
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when theme loads
  React.useEffect(() => {
    if (theme?.colors) {
      setLocalColors({
        primary:    theme.colors.primary,
        secondary:  theme.colors.secondary,
        background: theme.colors.background,
      });
    }
  }, [theme]);

  const handleColorChange = useCallback((key: 'primary' | 'secondary' | 'background', value: string) => {
    const updated = { ...localColors, [key]: value };
    setLocalColors(updated);
    setHasChanges(true);
    // Live preview — instant visual feedback
    previewTheme({ colors: updated });
  }, [localColors, previewTheme]);

  const handleSave = useCallback(async () => {
    try {
      await saveTheme({ colors: localColors });
      setHasChanges(false);
      toast.success('Theme saved successfully!');
    } catch (err) {
      toast.error('Failed to save theme. Please try again.');
    }
  }, [localColors, saveTheme]);

  const handleReset = useCallback(() => {
    const defaults = {
      primary:    '#006970',
      secondary:  '#00b4bb',
      background: '#f8fafc',
    };
    setLocalColors(defaults);
    setHasChanges(true);
    previewTheme({ colors: defaults });
  }, [previewTheme]);

  const handleCancel = useCallback(() => {
    if (theme?.colors) {
      setLocalColors({
        primary:    theme.colors.primary,
        secondary:  theme.colors.secondary,
        background: theme.colors.background,
      });
    }
    setHasChanges(false);
    cancelPreview();
  }, [theme, cancelPreview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-[--color-primary] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)', opacity: 0.12 }}
          >
            <Palette className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[--color-text-primary]">Appearance</h1>
            <p className="text-sm text-[--color-text-muted]">Customize your store's brand colors</p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              id="cancel-theme-changes"
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-[--color-border] text-[--color-text-secondary] hover:bg-[--color-surface-hover] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-theme-button"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Live Preview Banner */}
      {hasChanges && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
            borderLeft: '3px solid var(--color-primary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="text-lg">👀</span>
          You&apos;re previewing unsaved changes — the dashboard is updating in real time.
        </div>
      )}

      {/* Color Controls */}
      <div
        className="rounded-2xl border border-[--card-border] p-6 space-y-8"
        style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <ColorSection
          label="Primary Color"
          description="Used for buttons, links, active sidebar items, and key actions."
          presets={PRIMARY_PRESETS}
          selectedValue={localColors.primary}
          onPresetClick={(v) => handleColorChange('primary', v)}
          onCustomChange={(v) => handleColorChange('primary', v)}
        />

        <div className="border-t border-[--color-border]" />

        <ColorSection
          label="Secondary / Accent Color"
          description="Used for badges, hover highlights, and secondary actions."
          presets={SECONDARY_PRESETS}
          selectedValue={localColors.secondary}
          onPresetClick={(v) => handleColorChange('secondary', v)}
          onCustomChange={(v) => handleColorChange('secondary', v)}
        />

        <div className="border-t border-[--color-border]" />

        <ColorSection
          label="Background Color"
          description="The main page background. Use neutral tones to avoid contrast issues."
          presets={BACKGROUND_PRESETS}
          selectedValue={localColors.background}
          onPresetClick={(v) => handleColorChange('background', v)}
          onCustomChange={(v) => handleColorChange('background', v)}
        />
      </div>

      {/* Reset to defaults */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-[--color-text-muted]">
          Status colors (Success, Warning, Danger, Info) are fixed and cannot be changed.
        </p>
        <button
          id="reset-to-defaults"
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-[--color-text-muted] hover:text-[--color-text-secondary] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
