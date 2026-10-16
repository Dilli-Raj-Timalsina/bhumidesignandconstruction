"use client";

import { useState } from "react";

import { updateEditorialContentAction } from "@/app/actions/admin";
import {
  processIconNames,
  type EditorialContent,
} from "@/features/content/editorial";

import { FormActions, FormSection } from "./form-fields";

type TextKey = {
  [K in keyof EditorialContent]: EditorialContent[K] extends string ? K : never;
}[keyof EditorialContent];
type ListKey =
  "highlights" | "practiceCards" | "capacityCards" | "processSteps";

const textSections: {
  title: string;
  description: string;
  fields: { key: TextKey; label: string; multiline?: boolean }[];
}[] = [
  {
    title: "Navigation and page links",
    description:
      "Button and enquiry labels. Their destinations stay fixed to the relevant pages.",
    fields: [
      { key: "headerCta", label: "Header contact button" },
      {
        key: "whatsappGreeting",
        label: "WhatsApp opening message",
        multiline: true,
      },
      { key: "servicesPageCta", label: "Services page contact link" },
      { key: "projectsPageCta", label: "Projects page contact link" },
      { key: "serviceEnquiryCta", label: "Service enquiry link" },
    ],
  },
  {
    title: "Homepage hero",
    description:
      "Edit the small label and button text. The title, subtitle, and photo are in Settings.",
    fields: [
      { key: "homeHeroEyebrow", label: "Eyebrow" },
      { key: "homePrimaryCta", label: "Projects button" },
      { key: "homeSecondaryCta", label: "Contact button" },
      { key: "homeScrollLabel", label: "Scroll cue" },
    ],
  },
  {
    title: "Homepage practice",
    description:
      "The main description and About photo are in Settings. Cards can be added and reordered below.",
    fields: [
      { key: "practiceEyebrow", label: "Practice label" },
      { key: "homeAboutEyebrow", label: "About section label" },
      { key: "homeAboutCta", label: "About link" },
    ],
  },
  {
    title: "Homepage section headings",
    description:
      "These headings sit above the managed services, projects, and gallery items.",
    fields: [
      { key: "homeServicesEyebrow", label: "Services label" },
      { key: "homeServicesTitle", label: "Services title", multiline: true },
      {
        key: "homeServicesDescription",
        label: "Services description",
        multiline: true,
      },
      { key: "homeServicesCta", label: "Services link" },
      { key: "homeProjectsEyebrow", label: "Projects label" },
      { key: "homeProjectsTitle", label: "Projects title", multiline: true },
      { key: "homeProjectsCta", label: "Projects link" },
      { key: "homeGalleryEyebrow", label: "Gallery label" },
      { key: "homeGalleryTitle", label: "Gallery title", multiline: true },
      { key: "homeGalleryCta", label: "Gallery link" },
    ],
  },
  {
    title: "About page",
    description:
      "The company overview and image are in Settings. Edit capacity cards and process steps below.",
    fields: [
      { key: "aboutPracticeEyebrow", label: "Practice label" },
      { key: "aboutPracticeCta", label: "Contact link" },
      { key: "capacityEyebrow", label: "Capacity label" },
      { key: "capacityTitle", label: "Capacity title", multiline: true },
      {
        key: "capacityDescription",
        label: "Capacity description",
        multiline: true,
      },
      { key: "processEyebrow", label: "Process label" },
      { key: "processTitle", label: "Process title" },
      {
        key: "processDescription",
        label: "Process description",
        multiline: true,
      },
    ],
  },
  {
    title: "Contact page",
    description:
      "The address, phone, email, and map location are in Contact details.",
    fields: [
      { key: "contactEyebrow", label: "Section label" },
      { key: "contactTitle", label: "Section title" },
      {
        key: "contactDescription",
        label: "Section description",
        multiline: true,
      },
    ],
  },
  {
    title: "Calculator guidance",
    description:
      "Only enter current, approved lender information. Leave the rate note blank to hide it.",
    fields: [
      { key: "emiRateNote", label: "EMI rate guidance", multiline: true },
    ],
  },
  {
    title: "Shared contact banner",
    description:
      "Shown at the foot of the homepage, About, and Services pages.",
    fields: [
      { key: "ctaEyebrow", label: "Banner label" },
      { key: "ctaTitle", label: "Banner title" },
      { key: "ctaDescription", label: "Banner description", multiline: true },
      { key: "ctaButton", label: "Contact button" },
    ],
  },
];

const listSections: {
  key: ListKey;
  title: string;
  description: string;
  fields: { key: string; label: string; multiline?: boolean }[];
  limit: number;
}[] = [
  {
    key: "highlights",
    title: "Homepage statistics",
    description:
      "Publish only figures verified in the company portfolio. Remove an unverified claim.",
    fields: [
      { key: "value", label: "Value" },
      { key: "label", label: "Label" },
    ],
    limit: 8,
  },
  {
    key: "practiceCards",
    title: "Homepage practice cards",
    description: "Short points below the company overview.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    limit: 8,
  },
  {
    key: "capacityCards",
    title: "About capacity cards",
    description: "Keep team and site figures current and portfolio-backed.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    limit: 8,
  },
  {
    key: "processSteps",
    title: "Our process steps",
    description:
      "Add, remove, and reorder steps. Numbers are assigned automatically.",
    fields: [
      { key: "icon", label: "Icon" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    limit: 12,
  },
];

const emptyRows: Record<ListKey, Record<string, string>> = {
  highlights: { value: "", label: "" },
  practiceCards: { title: "", description: "" },
  capacityCards: { title: "", description: "" },
  processSteps: { icon: "consultation", title: "", description: "" },
};

export function PageContentForm({ initial }: { initial: EditorialContent }) {
  const [content, setContent] = useState(initial);

  function updateText(key: TextKey, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateList(key: ListKey, next: Record<string, string>[]) {
    setContent((current) => ({ ...current, [key]: next }) as EditorialContent);
  }

  return (
    <form
      action={updateEditorialContentAction}
      className="mx-auto max-w-5xl space-y-5"
    >
      <input
        type="hidden"
        name="editorial_content"
        value={JSON.stringify(content)}
      />
      <nav
        aria-label="Page content sections"
        className="flex flex-wrap gap-2 border border-line bg-white p-4 text-xs font-semibold text-bhumi"
      >
        <a className="px-2 py-1 hover:underline" href="#highlights">
          Homepage statistics
        </a>
        <a className="px-2 py-1 hover:underline" href="#practiceCards">
          Practice cards
        </a>
        <a className="px-2 py-1 hover:underline" href="#capacityCards">
          About capacity
        </a>
        <a className="px-2 py-1 hover:underline" href="#processSteps">
          Our process
        </a>
      </nav>
      {textSections.map((section) => (
        <FormSection
          key={section.title}
          title={section.title}
          description={section.description}
        >
          {section.fields.map(({ key, label, multiline }) => (
            <div key={key} className={multiline ? "md:col-span-2" : undefined}>
              <label
                htmlFor={key}
                className="mb-2 block text-sm font-semibold text-ink"
              >
                {label}
              </label>
              {multiline ? (
                <textarea
                  id={key}
                  value={content[key]}
                  onChange={(event) => updateText(key, event.target.value)}
                  rows={3}
                  className="min-h-24 w-full resize-y border border-line bg-white px-3 py-2.5 text-sm leading-6 text-ink focus:border-bhumi focus:outline-none"
                />
              ) : (
                <input
                  id={key}
                  value={content[key]}
                  onChange={(event) => updateText(key, event.target.value)}
                  className="min-h-10 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-bhumi focus:outline-none"
                />
              )}
            </div>
          ))}
        </FormSection>
      ))}
      {listSections.map((section) => {
        const items = content[section.key] as Record<string, string>[];
        return (
          <div id={section.key} key={section.key} className="scroll-mt-24">
            <FormSection
              title={section.title}
              description={section.description}
            >
              <div className="space-y-4 md:col-span-2">
                {items.map((item, index) => (
                  <div key={index} className="border border-line p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-bhumi">
                        Item {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-wrap gap-3 text-xs font-semibold text-ink">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...items];
                            [next[index - 1], next[index]] = [
                              next[index],
                              next[index - 1],
                            ];
                            updateList(section.key, next);
                          }}
                          className="disabled:opacity-40"
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => {
                            const next = [...items];
                            [next[index], next[index + 1]] = [
                              next[index + 1],
                              next[index],
                            ];
                            updateList(section.key, next);
                          }}
                          className="disabled:opacity-40"
                        >
                          Move down
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateList(
                              section.key,
                              items.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          className="text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.fields.map((field) => {
                        const id = `${section.key}-${index}-${field.key}`;
                        const update = (value: string) =>
                          updateList(
                            section.key,
                            items.map((row, rowIndex) =>
                              rowIndex === index
                                ? { ...row, [field.key]: value }
                                : row,
                            ),
                          );
                        return (
                          <div
                            key={field.key}
                            className={
                              field.multiline ? "md:col-span-2" : undefined
                            }
                          >
                            <label
                              htmlFor={id}
                              className="mb-2 block text-sm font-semibold text-ink"
                            >
                              {field.label}
                            </label>
                            {field.key === "icon" ? (
                              <select
                                id={id}
                                value={item.icon}
                                onChange={(event) => update(event.target.value)}
                                className="min-h-10 w-full border border-line bg-white px-3 py-2 text-sm"
                              >
                                {processIconNames.map((icon) => (
                                  <option key={icon} value={icon}>
                                    {icon}
                                  </option>
                                ))}
                              </select>
                            ) : field.multiline ? (
                              <textarea
                                id={id}
                                required
                                value={item[field.key]}
                                onChange={(event) => update(event.target.value)}
                                rows={3}
                                className="min-h-24 w-full resize-y border border-line bg-white px-3 py-2.5 text-sm leading-6"
                              />
                            ) : (
                              <input
                                id={id}
                                required
                                value={item[field.key]}
                                onChange={(event) => update(event.target.value)}
                                className="min-h-10 w-full border border-line bg-white px-3 py-2.5 text-sm"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={items.length >= section.limit}
                  onClick={() =>
                    updateList(section.key, [
                      ...items,
                      { ...emptyRows[section.key] },
                    ])
                  }
                  className="min-h-10 border border-line bg-white px-4 text-sm font-semibold text-bhumi hover:border-bhumi disabled:opacity-40"
                >
                  Add item
                </button>
              </div>
            </FormSection>
          </div>
        );
      })}
      <FormActions
        cancelHref="/admin/dashboard"
        submitLabel="Save page content"
      />
    </form>
  );
}
