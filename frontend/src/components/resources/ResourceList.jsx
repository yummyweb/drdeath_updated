import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2, ExternalLink, Eye, EyeOff, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_META } from './resourceConstants';
import { CategoryBadge } from './ResourceFormFields';

const ResourceList = ({
  resources,
  filtered,
  loading,
  filterCategory,
  expandedId,
  setExpandedId,
  onEdit,
  onDelete,
  onTogglePublish,
  onAddFirst,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="mb-4">
          {filterCategory === 'All' ? 'No resources yet.' : `No ${filterCategory} resources yet.`}
        </p>
        <button onClick={onAddFirst} className="text-sm text-amber-700 hover:underline">
          + Add the first one
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
        {filtered.length} {filterCategory === 'All' ? 'resource' : filterCategory.toLowerCase()}
        {filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.map(resource => (
        <div
          key={resource._id}
          className={`border rounded-xl bg-white transition-shadow ${
            resource.published ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-75'
          }`}
        >
          <div className="flex items-start gap-4 p-4">

            {/* Category icon */}
            <div className="flex-shrink-0 mt-0.5">
              {(() => {
                const meta = CATEGORY_META[resource.category] || CATEGORY_META['Other'];
                const Icon = meta.icon;
                return <Icon className={`h-5 w-5 text-${meta.colour}-500`} />;
              })()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <Link
                  to={`/resources/${resource._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-slate-900 hover:text-amber-700 transition-colors leading-snug"
                >
                  {resource.title}
                </Link>
                <CategoryBadge category={resource.category} />
                {!resource.published && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Draft</span>
                )}
                {resource.featured && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>
                )}
              </div>

              {resource.citation && <p className="text-xs text-amber-700 font-mono mb-1">{resource.citation}</p>}
              {resource.court    && <p className="text-xs text-slate-500 mb-1">{resource.court}</p>}
              {resource.summary  && <p className="text-sm text-slate-600 line-clamp-2">{resource.summary}</p>}

              {/* Expanded detail */}
              {expandedId === resource._id && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  {resource.judgmentDate && (
                    <p>Date: {new Date(resource.judgmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                  {resource.author && <p>Author: {resource.author}</p>}
                  {resource.pdfUrl && (
                    <a href={resource.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                      <ExternalLink className="h-3 w-3" /> PDF
                    </a>
                  )}
                  {resource.externalLink && (
                    <a href={resource.externalLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-3">
                      <ExternalLink className="h-3 w-3" /> External Link
                    </a>
                  )}
                  {resource.tags?.length > 0 && <p>Tags: {resource.tags.join(', ')}</p>}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setExpandedId(expandedId === resource._id ? null : resource._id)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
              >
                {expandedId === resource._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onTogglePublish(resource)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
                title={resource.published ? 'Unpublish' : 'Publish'}
              >
                {resource.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onEdit(resource)}
                className="p-2 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(resource)}
                className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceList;
