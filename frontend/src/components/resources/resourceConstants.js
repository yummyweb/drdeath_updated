import { FileText, ClipboardList, Mail, AlertCircle, MoreHorizontal, Gavel } from 'lucide-react';

export const CATEGORIES = [
  'Judgment',
  'Article',
  'RTI Template',
  'Legal Notice',
  'Consumer Complaint',
  'Other'
];

export const JUDGMENT_CATEGORIES = new Set(['Judgment']);
export const CITATION_CATEGORIES = new Set(['Judgment']);

export const CATEGORY_META = {
  'Judgment':           { icon: Gavel,         colour: 'amber',  hint: 'Supreme Court / High Court / District Court judgment' },
  'Article':            { icon: FileText,       colour: 'blue',   hint: 'Educational article or explainer' },
  'RTI Template':       { icon: ClipboardList,  colour: 'green',  hint: 'Ready-to-use RTI application template' },
  'Legal Notice':       { icon: Mail,           colour: 'red',    hint: 'Template legal notice for medical negligence' },
  'Consumer Complaint': { icon: AlertCircle,    colour: 'orange', hint: 'Consumer forum complaint template' },
  'Other':              { icon: MoreHorizontal, colour: 'slate',  hint: 'Other legal resource' },
};

export const BADGE_COLOURS = {
  amber:  'bg-amber-100 text-amber-800',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  teal:   'bg-teal-100 text-teal-800',
  slate:  'bg-slate-100 text-slate-600',
};

export const EMPTY_FORM = {
  title: '',
  category: 'Judgment',
  citation: '',
  court: '',
  judgmentDate: '',
  summary: '',
  facts: '',
  issues: '',
  ratio: '',
  held: '',
  relevance: '',
  content: '',
  author: '',
  instructions: '',
  pdfUrl: '',
  extractedText: '',
  externalLink: '',
  tags: '',
  featured: false,
  published: true
};
