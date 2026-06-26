import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import { getApiUrl, getBackendUrl } from '@/config/env';
import {
  Scale,
  Calendar,
  Building2,
  Tag,
  User,
  Download,
  ExternalLink,
  ArrowLeft,
  Printer,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const API = getApiUrl();

// ── SEO helper ──────────────────────────────────────────────────────────────

const useSEO = ({ title, description }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title
      ? `${title} | VOICE Legal Repository`
      : 'Legal Repository | VOICE';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.getAttribute('content');
    if (description) metaDesc.setAttribute('content', description.slice(0, 160));

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    if (title) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    if (description) ogDesc.setAttribute('content', description.slice(0, 200));

    return () => {
      document.title = prev;
      if (prevDesc !== null) metaDesc.setAttribute('content', prevDesc);
    };
  }, [title, description]);
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const CategoryBadge = ({ category }) => {
  const colours = {
    Judgment: 'bg-amber-100 text-amber-800 border-amber-200',
    Article: 'bg-blue-100 text-blue-800 border-blue-200',
    'Case Analysis': 'bg-purple-100 text-purple-800 border-purple-200',
    'RTI Template': 'bg-green-100 text-green-800 border-green-200',
    'Legal Notice': 'bg-red-100 text-red-800 border-red-200',
    'Consumer Complaint': 'bg-orange-100 text-orange-800 border-orange-200',
    'Medical Research': 'bg-teal-100 text-teal-800 border-teal-200',
    Other: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${
        colours[category] || colours.Other
      }`}
    >
      {category}
    </span>
  );
};

const RichContent = ({ html }) => {
  if (!html) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div
        className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-amber-400 prose-blockquote:text-slate-600 prose-li:marker:text-amber-600 text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
    );
  }
  return (
    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{html}</div>
  );
};

const LegalSection = ({ heading, content, sectionMark }) => {
  if (!content) return null;
  return (
    <section className="print:break-inside-avoid">
      <div className="flex items-baseline gap-3 mb-4">
        {sectionMark && (
          <span className="font-mono text-xs text-amber-600 font-bold select-none">
            {sectionMark}
          </span>
        )}
        <h2 className="font-serif text-xl font-bold text-slate-900 uppercase tracking-wide">
          {heading}
        </h2>
      </div>
      <RichContent html={content} />
    </section>
  );
};

const Divider = () => <hr className="border-t border-slate-200 my-8 print:my-6" />;

// ── PDF Preview Modal ────────────────────────────────────────────────────────

const PdfPreview = ({ url, onClose }) => (
  <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-80 no-print">
    {/* Toolbar */}
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white flex-shrink-0">
      <span className="text-sm font-medium truncate max-w-xs">PDF Preview</span>
      <div className="flex items-center gap-3">
        <a
          href={url}
          download
          className="inline-flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs border border-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Tab
        </a>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>

    {/* iframe */}
    <div className="flex-1 overflow-hidden">
      <iframe
        src={`${url}#toolbar=1&navpanes=0`}
        className="w-full h-full"
        title="PDF Preview"
      />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  useSEO({
    title: resource?.title,
    description: resource?.summary || resource?.citation
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/resources/${id}`);
        setResource(res.data);
      } catch (err) {
        setError(
          err.response?.status === 404 ? 'Resource not found.' : 'Failed to load resource.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Close PDF preview on Escape
  useEffect(() => {
    if (!showPdf) return;
    const handler = (e) => { if (e.key === 'Escape') setShowPdf(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPdf]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-3 animate-pulse opacity-40" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-4">{error || 'Resource not found.'}</p>
          <Link to="/resources" className="text-amber-700 hover:underline text-sm">
            ← Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  const hasJudgmentSections =
    resource.facts || resource.issues || resource.ratio || resource.held || resource.relevance;

  // Resolve PDF URL — could be absolute or relative (uploaded file)
  const resolvedPdfUrl = resource.pdfUrl
    ? resource.pdfUrl.startsWith('http')
      ? resource.pdfUrl
      : `${getBackendUrl()}${resource.pdfUrl}`
    : null;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12pt; }
          .prose { font-size: 11pt; }
        }
      `}</style>

      {/* PDF Preview Modal */}
      {showPdf && resolvedPdfUrl && (
        <PdfPreview url={resolvedPdfUrl} onClose={() => setShowPdf(false)} />
      )}

      <div className="min-h-screen bg-white">
        {/* ── Nav bar ── */}
        <div className="no-print border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Legal Resources
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        <article className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          {/* ── HEADER ── */}
          <header className="mb-8">
            <div className="mb-4">
              <CategoryBadge category={resource.category} />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {resource.title}
            </h1>

            {/* Metadata card */}
            {(resource.citation || resource.court || resource.judgmentDate || resource.author) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6">
                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  {resource.citation && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Citation
                      </p>
                      <p className="font-mono text-sm text-amber-800 font-semibold">
                        {resource.citation}
                      </p>
                    </div>
                  )}
                  {resource.court && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Court
                      </p>
                      <p className="text-sm text-slate-800 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {resource.court}
                      </p>
                    </div>
                  )}
                  {resource.judgmentDate && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Date
                      </p>
                      <p className="text-sm text-slate-800 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(resource.judgmentDate)}
                      </p>
                    </div>
                  )}
                  {resource.author && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Author
                      </p>
                      <p className="text-sm text-slate-800 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {resource.author}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {resource.tags?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2 items-center">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* PDF + External actions */}
                {(resolvedPdfUrl || resource.externalLink) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-3 no-print">
                    {resolvedPdfUrl && (
                      <>
                        <button
                          onClick={() => setShowPdf(true)}
                          className="inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          Preview PDF
                        </button>
                        <a
                          href={resolvedPdfUrl}
                          download
                          className="inline-flex items-center gap-1.5 text-sm bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </a>
                        <a
                          href={resolvedPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open PDF
                        </a>
                      </>
                    )}
                    {resource.externalLink && (
                      <a
                        href={resource.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        External Source
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </header>

          <Divider />

          {/* ── HOW TO USE (templates only) ── */}
          {resource.instructions && ['RTI Template', 'Legal Notice', 'Consumer Complaint'].includes(resource.category) && (
            <>
              <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h2 className="font-serif text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span> How to Use This Template
                </h2>
                <div className="text-amber-900 leading-relaxed whitespace-pre-line text-sm">
                  {resource.instructions}
                </div>
              </section>
              <Divider />
            </>
          )}

          {/* ── SUMMARY ── */}
          {resource.summary && (
            <>
              <section>
                <h2 className="font-serif text-xl font-bold text-slate-900 uppercase tracking-wide mb-4">
                  Summary
                </h2>
                <p className="text-slate-700 leading-relaxed text-base">{resource.summary}</p>
              </section>
              <Divider />
            </>
          )}

          {/* ── JUDGMENT SECTIONS ── */}
          {hasJudgmentSections && (
            <>
              {resource.facts && (
                <>
                  <LegalSection heading="Facts" content={resource.facts} sectionMark="I." />
                  <Divider />
                </>
              )}
              {resource.issues && (
                <>
                  <LegalSection heading="Issues" content={resource.issues} sectionMark="II." />
                  <Divider />
                </>
              )}
              {resource.ratio && (
                <>
                  <LegalSection
                    heading="Ratio Decidendi"
                    content={resource.ratio}
                    sectionMark="III."
                  />
                  <Divider />
                </>
              )}
              {resource.held && (
                <>
                  <LegalSection heading="Held" content={resource.held} sectionMark="IV." />
                  <Divider />
                </>
              )}
              {resource.relevance && (
                <>
                  <LegalSection
                    heading="Relevance to Medical Negligence"
                    content={resource.relevance}
                    sectionMark="V."
                  />
                  <Divider />
                </>
              )}
            </>
          )}

          {/* ── FULL ANALYSIS / CONTENT ── */}
          {resource.content && (
            <section>
              <h2 className="font-serif text-xl font-bold text-slate-900 uppercase tracking-wide mb-4">
                {hasJudgmentSections ? 'Full Analysis' : 'Content'}
              </h2>
              <RichContent html={resource.content} />
            </section>
          )}

          {!resource.summary && !hasJudgmentSections && !resource.content && (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No content available for this resource.</p>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-14 pt-8 border-t border-slate-100 no-print">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Legal Resources
            </Link>
          </div>
        </article>
      </div>
    </>
  );
};

export default ResourceDetail;
