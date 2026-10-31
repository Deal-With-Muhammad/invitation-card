"use client";

import { Input, Label, ListBox, Select, TextArea, TextField, buttonVariants } from "@heroui/react";
import { useState } from "react";

import { OCCASIONS, type Occasion } from "@/invite/types";
import { AUTHOR } from "@/lib/dwm";
import { OCCASION_LABEL } from "@/lib/filters";

/** Builds the request and opens it in WhatsApp or email. Nothing is sent from this page. */
export function CustomForm() {
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("wedding");
  const [date, setDate] = useState("");
  const [idea, setIdea] = useState("");

  const message = [
    "Hi, I'd like a custom invitation from DWM Invite.",
    name && `Name: ${name}`,
    `Occasion: ${OCCASION_LABEL[occasion]}`,
    date && `Date: ${date}`,
    idea && `What I have in mind: ${idea}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ready = idea.trim().length > 3;

  return (
    <form className="space-y-4 rounded-[24px] border border-line bg-card p-5 sm:p-7" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField value={name} onChange={setName} autoComplete="name">
          <Label>Your name</Label>
          <Input />
        </TextField>
        <Select value={occasion} onChange={(k) => k && setOccasion(k as Occasion)}>
          <Label>Occasion</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {OCCASIONS.map((o) => (
                <ListBox.Item key={o} id={o} textValue={OCCASION_LABEL[o]}>
                  {OCCASION_LABEL[o]}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <TextField value={date} onChange={setDate} type="date">
        <Label>Event date (if you know it)</Label>
        <Input />
      </TextField>
      <TextField value={idea} onChange={setIdea}>
        <Label>What do you have in mind?</Label>
        <TextArea rows={5} placeholder="Colours, a theme, a monogram, a design you saw somewhere, how many functions…" />
      </TextField>
      <div className="flex flex-wrap gap-2 pt-1">
        {/* Links can't be disabled, so aria-disabled also switches off their pointer events. */}
        <a
          aria-disabled={!ready}
          tabIndex={ready ? undefined : -1}
          className={buttonVariants({ size: "lg", className: "bg-[#1f7a4d] px-5 text-[15px] text-white hover:bg-[#17663f]" })}
          href={`${AUTHOR.whatsapp}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Send on WhatsApp
        </a>
        <a
          aria-disabled={!ready}
          tabIndex={ready ? undefined : -1}
          className={buttonVariants({ variant: "outline", size: "lg", className: "px-5 text-[15px]" })}
          href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent("Custom invitation request")}&body=${encodeURIComponent(message)}`}
        >
          Send by email
        </a>
      </div>
      <p className="text-[12.5px] text-muted">This opens WhatsApp or your email app with the message ready. Nothing is sent until you press send there.</p>
    </form>
  );
}
