'use client';

import type { AnyExtension } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect, useMemo, useRef } from 'react';
import { Markdown } from 'tiptap-markdown';

import { cn } from '../lib/utils';
import './tiptap-content.css';

const ImageWithS3Key = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataS3Key: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-s3-key'),
        renderHTML: (attributes) => {
          if (!attributes.dataS3Key) return {};
          return { 'data-s3-key': attributes.dataS3Key };
        },
      },
    };
  },
});

interface MarkdownViewerProps {
  value: string;
  className?: string;
  onResolveImageKey?: (key: string) => Promise<string>;
}

export const MarkdownViewer = ({ value, className, onResolveImageKey }: MarkdownViewerProps) => {
  const isHtml = useMemo(() => /^\s*<[a-z]/i.test(value), [value]);
  const containerRef = useRef<HTMLDivElement>(null);

  const extensions = useMemo<AnyExtension[]>(() => {
    const base: AnyExtension[] = [
      StarterKit.configure({ strike: false }),
      TiptapUnderline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageWithS3Key.configure({ inline: false, allowBase64: false }),
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

  useEffect(() => {
    if (!editor || !onResolveImageKey || !containerRef.current) return;
    let cancelled = false;
    const imgs = containerRef.current.querySelectorAll<HTMLImageElement>('img[data-s3-key]');
    imgs.forEach((img) => {
      const key = img.getAttribute('data-s3-key');
      if (!key) return;
      void onResolveImageKey(key).then((url) => {
        if (cancelled) return;
        img.src = url;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [editor, value, onResolveImageKey]);

  if (!editor) return null;

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <EditorContent editor={editor} />
    </div>
  );
};
