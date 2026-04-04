'use client';

import type { AnyExtension } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useMemo } from 'react';
import { Markdown } from 'tiptap-markdown';

import { cn } from '../lib/utils';
import './tiptap-content.css';

interface MarkdownViewerProps {
  value: string;
  className?: string;
}

export const MarkdownViewer = ({ value, className }: MarkdownViewerProps) => {
  const isHtml = useMemo(() => /^\s*<[a-z]/i.test(value), [value]);

  const extensions = useMemo<AnyExtension[]>(() => {
    const base: AnyExtension[] = [
      StarterKit.configure({ strike: false }),
      TiptapUnderline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: false }),
    ];
    if (!isHtml) {
      base.push(Markdown.configure({ html: true, breaks: true }));
    }
    return base;
  }, [isHtml]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions,
    content: value,
    editorProps: {
      attributes: {
        class: 'outline-none tiptap-content',
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
