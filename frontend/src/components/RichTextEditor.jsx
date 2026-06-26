import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

/* ── Base editor styles + placeholder via CSS pseudo-element ── */
const EDITOR_STYLES = `
  .ProseMirror {
    min-height: 120px;
    padding: 12px;
    font-size: 0.875rem;
    color: #1e293b;
    line-height: 1.625;
    outline: none;
  }
  .ProseMirror > * + * { margin-top: 0.6em; }
  .ProseMirror p { margin: 0; }
  .ProseMirror h2 { font-size: 1.125rem; font-weight: 700; margin-top: 1em; }
  .ProseMirror h3 { font-size: 1rem;     font-weight: 700; margin-top: 1em; }
  .ProseMirror ul  { list-style: disc;    padding-left: 1.5rem; }
  .ProseMirror ol  { list-style: decimal; padding-left: 1.5rem; }
  .ProseMirror li  { margin: 0.2em 0; }
  .ProseMirror blockquote {
    border-left: 3px solid #f59e0b;
    padding-left: 0.75rem;
    color: #64748b;
    margin: 0.5em 0;
  }
  .ProseMirror a { color: #b45309; text-decoration: underline; }
  .ProseMirror strong { font-weight: 700; }
  .ProseMirror em     { font-style: italic; }
  /* Placeholder */
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: #94a3b8;
    pointer-events: none;
    float: left;
    height: 0;
  }
`;

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`px-2 py-1 text-sm rounded border transition-colors ${
      active
        ? 'bg-slate-800 text-white border-slate-800'
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange, placeholder = 'Enter text...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-amber-700 underline' } })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: { 'data-placeholder': placeholder }
    }
  });

  // Sync value when parent changes it (switching edit record)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previous);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <>
      <style>{EDITOR_STYLES}</style>
      <div className="border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-slate-400">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')} title="Underline"><span className="underline">U</span></ToolbarButton>

          <div className="w-px bg-slate-300 mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

          <div className="w-px bg-slate-300 mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')} title="Bullet list">• List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')} title="Numbered list">1. List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')} title="Blockquote">❝</ToolbarButton>

          <div className="w-px bg-slate-300 mx-1" />

          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Add link">🔗</ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}
              active={false} title="Remove link">🔗✕</ToolbarButton>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;
