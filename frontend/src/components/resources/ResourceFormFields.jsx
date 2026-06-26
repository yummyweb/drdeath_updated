import React from 'react';
import RichTextEditor from '../RichTextEditor';
import { CATEGORY_META, BADGE_COLOURS } from './resourceConstants';

export const SectionLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const FieldInput = ({ label, required, ...props }) => (
  <div>
    <SectionLabel required={required}>{label}</SectionLabel>
    <input
      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      {...props}
    />
  </div>
);

export const FieldTextarea = ({ label, ...props }) => (
  <div>
    <SectionLabel>{label}</SectionLabel>
    <textarea
      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 leading-relaxed"
      {...props}
    />
  </div>
);

export const RichField = ({ label, value, onChange, placeholder }) => (
  <div>
    <SectionLabel>{label}</SectionLabel>
    <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

export const SectionHeading = ({ mark, children }) => (
  <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">
    {mark && <span className="mr-1">{mark}</span>}{children}
  </p>
);

export const CategoryBadge = ({ category }) => {
  const meta = CATEGORY_META[category] || CATEGORY_META['Other'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLOURS[meta.colour]}`}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
};
