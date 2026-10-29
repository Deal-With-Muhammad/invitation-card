"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { useId, type ReactNode } from "react";

// Small form pieces for the editor, styled to match the site.

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
        <button type="button" onClick={() => onToggle(id)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-start">
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

export function Field({ label, hint, children, action }: { label: string; hint?: string; children: (id: string) => ReactNode; action?: ReactNode }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {action}
      </div>
      {children(id)}
      {hint && <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{hint}</p>}
    </div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
  inputMode?: "text" | "tel" | "url" | "numeric";
  maxLength?: number;
  dir?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <input
          id={id}
          className="field"
          type={type}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          dir={dir ?? "auto"}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
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
    <Field
      label={label}
      hint={hint}
      action={
        onReset ? (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-brand">
            <RotateCcw className="size-3" aria-hidden /> Reset
          </button>
        ) : null
      }
    >
      {(id) => (
        <textarea
          id={id}
          className="field resize-y leading-relaxed"
          rows={rows}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          dir="auto"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-[15px]">{label}</span>
        {hint && <span className="block text-[12.5px] leading-snug text-muted">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-[26px] w-[44px] flex-none rounded-full transition-colors ${checked ? "bg-brand" : "bg-ink/15"}`}
      >
        <span className={`absolute top-[3px] size-5 rounded-full bg-white shadow transition-[inset-inline-start] ${checked ? "start-[21px]" : "start-[3px]"}`} />
      </button>
    </div>
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
      <p className="label">{label}</p>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <div className="relative">
          <select id={id} className="field appearance-none pe-9" value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        </div>
      )}
    </Field>
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
