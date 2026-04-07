'use client';

import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, ImagePlus, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { useEffect, useRef } from 'react';

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

export type MarkdownEditorImageUploadResult = { src: string; key: string };

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<MarkdownEditorImageUploadResult>;
  placeholder?: string;
  className?: string;
  stickyToolbar?: boolean;
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
      active ? 'bg-white/20 text-white' : 'text-primary-foreground/70 hover:bg-white/10 hover:text-white',
    )}
  >
    {children}
  </button>
);

export const MarkdownEditor = ({ value, onChange, onImageUpload, placeholder, className, stickyToolbar }: MarkdownEditorProps) => {
  const internalValue = useRef(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ strike: false }),
      TiptapUnderline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageWithS3Key.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[80px] px-3 py-2 text-sm tiptap-content',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate({ editor: e }) {
      const html = e.getHTML();
      internalValue.current = html;
      onChange(html);
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
      alignLeft: ctx.editor?.isActive({ textAlign: 'left' }) ?? false,
      alignCenter: ctx.editor?.isActive({ textAlign: 'center' }) ?? false,
      alignRight: ctx.editor?.isActive({ textAlign: 'right' }) ?? false,
      alignJustify: ctx.editor?.isActive({ textAlign: 'justify' }) ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== internalValue.current) {
      internalValue.current = value;
      editor.commands.setContent(value ?? '');
    }
  }, [value, editor]);

  const handleImageInsert = async (file: File) => {
    if (!editor || !onImageUpload) return;
    const result = await onImageUpload(file);
    if (!result?.src || !result?.key) return;
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    editor
      .chain()
      .focus()
      .insertContent(`<img src="${escape(result.src)}" alt="${escape(file.name)}" data-s3-key="${escape(result.key)}">`)
      .run();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleImageInsert(file);
    }
    e.target.value = '';
  };

  if (!editor) return null;

  return (
    <div className={cn('w-full rounded-md border border-input bg-white focus-within:ring-1 focus-within:ring-ring', !stickyToolbar && 'overflow-hidden', className)}>
      <div className={cn('flex flex-wrap items-center gap-0.5 border-b border-input bg-primary px-2 py-1.5', stickyToolbar && 'sticky top-0 z-10 rounded-t-[inherit]')}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={activeMarks?.bold} title='Bold'>
          <Bold className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={activeMarks?.italic} title='Italic'>
          <Italic className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={activeMarks?.underline} title='Underline'>
          <Underline className='h-3.5 w-3.5' />
        </ToolbarButton>
        <div className='mx-1 h-4 w-px bg-white/20' />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={activeMarks?.h1} title='Heading 1'>
          <Heading1 className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={activeMarks?.h2} title='Heading 2'>
          <Heading2 className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={activeMarks?.h3} title='Heading 3'>
          <Heading3 className='h-3.5 w-3.5' />
        </ToolbarButton>
        <div className='mx-1 h-4 w-px bg-white/20' />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={activeMarks?.orderedList} title='Numbered List'>
          <ListOrdered className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={activeMarks?.bulletList} title='Bullet List'>
          <List className='h-3.5 w-3.5' />
        </ToolbarButton>
        <div className='mx-1 h-4 w-px bg-white/20' />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={activeMarks?.alignLeft} title='Align Left'>
          <AlignLeft className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={activeMarks?.alignCenter} title='Align Center'>
          <AlignCenter className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={activeMarks?.alignRight} title='Align Right'>
          <AlignRight className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={activeMarks?.alignJustify} title='Justify'>
          <AlignJustify className='h-3.5 w-3.5' />
        </ToolbarButton>
        {onImageUpload && (
          <>
            <div className='mx-1 h-4 w-px bg-white/20' />
            <ToolbarButton onClick={() => fileInputRef.current?.click()} title='Insert Image'>
              <ImagePlus className='h-3.5 w-3.5' />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/gif,image/webp'
              className='hidden'
              onChange={handleFileInputChange}
            />
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
