'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';

import { cn } from '../lib/utils';

interface MarkdownViewerProps {
  value: string;
  className?: string;
}

export const MarkdownViewer = ({ value, className }: MarkdownViewerProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({ strike: false }),
      TiptapUnderline,
      Markdown.configure({ html: true, breaks: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'outline-none prose prose-sm max-w-none',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={cn('w-full', className)}>
      <EditorContent editor={editor} />
    </div>
  );
};
