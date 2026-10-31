"use client";

import { Description, Input, Label, ListBox, Select as HSelect, Switch, TextArea, TextField } from "@heroui/react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

// Small form pieces for the editor: HeroUI fields, styled to match the site.

/** The small muted label above a group of choices (chips, swatches, checkboxes). */
export const groupLabel = "mb-1.5 block text-[13px] font-medium text-muted";

export function Panel({
  id,
  icon,
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  hint?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-2xl border bg-card transition-colors ${open ? "border-ink/15 shadow-[0_10px_30px_-22px_rgb(42_37_32/0.5)]" : "border-line"}`}>
      <h2>
        <button type="button" onClick={() => onToggle(id)} aria-expanded={open} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-start">
          <span className="grid size-9 flex-none place-items-center rounded-xl bg-paper-2 text-brand">{icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15.5px] font-medium">{title}</span>
            {hint && !open && <span className="block truncate text-[13px] text-muted">{hint}</span>}
          </span>
          <ChevronDown className={`size-4.5 flex-none text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </h2>
      {open && <div className="space-y-4 border-t border-line px-4 pt-4 pb-5">{children}</div>}
    </section>
  );
}

export function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  inputMode,
  maxLength,
  dir,
  className = "",
  inputClassName = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "date" | "time" | "tel" | "url" | "email";
  inputMode?: "text" | "tel" | "url" | "numeric";
  maxLength?: number;
  dir?: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <TextField value={value} onChange={onChange} type={type} inputMode={inputMode} maxLength={maxLength} className={`min-w-0 ${className}`}>
      <Label>{label}</Label>
      <Input placeholder={placeholder} dir={dir ?? (type === "date" || type === "time" ? undefined : "auto")} className={inputClassName} />
      {hint && <Description>{hint}</Description>}
    </TextField>
  );
}

export function Area({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
  maxLength,
  onReset,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  /** Shows "Reset" when the text differs from the default. */
  onReset?: (() => void) | null;
}) {
  return (
    <TextField value={value} onChange={onChange} maxLength={maxLength}>
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {onReset && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 rounded-md text-[12.5px] text-muted hover:text-brand">
            <RotateCcw className="size-3" aria-hidden /> Reset
          </button>
        )}
      </div>
      <TextArea rows={rows} placeholder={placeholder} dir="auto" className="resize-y" />
      {hint && <Description>{hint}</Description>}
    </TextField>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch isSelected={checked} onChange={onChange} className="w-full">
      <Switch.Content className="w-full items-start justify-between gap-4">
        <span className="min-w-0">
          <Label className="block text-[15px] font-normal text-ink">{label}</Label>
          {hint && <Description className="block">{hint}</Description>}
        </span>
        <Switch.Control className="mt-0.5">
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className={groupLabel}>{label}</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-9 rounded-full border px-3.5 text-[14px] transition-colors ${
              value === o.value ? "border-brand bg-brand text-[#fbf8f2]" : "border-line bg-paper text-ink hover:border-ink/25"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  className?: string;
}) {
  return (
    <HSelect value={value} onChange={(k) => k != null && onChange(String(k))} className={className}>
      <Label>{label}</Label>
      <HSelect.Trigger>
        <HSelect.Value className="truncate" />
        <HSelect.Indicator />
      </HSelect.Trigger>
      <HSelect.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </HSelect.Popover>
      {hint && <Description>{hint}</Description>}
    </HSelect>
  );
}

export function ColorDot({ value, onChange, label, onRemove }: { value: string; onChange: (v: string) => void; label: string; onRemove?: () => void }) {
  return (
    <span className="group relative inline-block">
      <label className="block size-10 cursor-pointer overflow-hidden rounded-full ring-1 ring-line" style={{ background: value }} title={label}>
        <input type="color" className="sr-only" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} />
      </label>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-ink text-[11px] text-paper opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 max-md:opacity-100">
          ×
        </button>
      )}
    </span>
  );
}
