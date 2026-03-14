'use client';

import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { useEffect } from 'react';
import { Markdown } from 'tiptap-markdown';

import { cn } from '../lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

const ToolbarButton = ({ onClick, active, title, children }: ToolbarButtonProps) => (
  <button
    type='button'
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={cn(
      'flex h-7 w-7 items-center justify-center rounded transition-colors',
      active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    )}
  >
    {children}
  </button>
);

export const MarkdownEditor = ({ value, onChange, placeholder, className }: MarkdownEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ strike: false }), TiptapUnderline, Markdown.configure({ transformPastedText: true })],
    content: value,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[80px] px-3 py-2 text-sm',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate({ editor: e }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange((e.storage as any).markdown.getMarkdown() as string);
    },
  });

  const activeMarks = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive('bold') ?? false,
      italic: ctx.editor?.isActive('italic') ?? false,
      underline: ctx.editor?.isActive('underline') ?? false,
      h1: ctx.editor?.isActive('heading', { level: 1 }) ?? false,
      h2: ctx.editor?.isActive('heading', { level: 2 }) ?? false,
      h3: ctx.editor?.isActive('heading', { level: 3 }) ?? false,
      bulletList: ctx.editor?.isActive('bulletList') ?? false,
      orderedList: ctx.editor?.isActive('orderedList') ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (editor.storage as any).markdown.getMarkdown() as string;
    if (current !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn('w-full overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring', className)}>
      <div className='flex flex-wrap items-center gap-0.5 border-b border-input px-2 py-1.5'>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={activeMarks?.bold} title='Bold'>
          <Bold className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={activeMarks?.italic} title='Italic'>
          <Italic className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={activeMarks?.underline} title='Underline'>
          <Underline className='h-3.5 w-3.5' />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
