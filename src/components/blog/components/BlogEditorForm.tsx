
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, DraftingCompass, Calendar } from 'lucide-react';
import { BlogPost } from '../blog';

interface BlogEditorFormProps {
  title: string;
  content: string;
  imageUrl: string;
  originalStatus?: string;
  isDraftMode: boolean;
  isScheduledMode: boolean;
  loading: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onImageUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveDraft: () => void;
  onConvertToDraft: () => void;
  onSchedule: () => void;
  onCancel: () => void;
}

const BlogEditorForm: React.FC<BlogEditorFormProps> = ({
  title,
  content,
  imageUrl,
  originalStatus,
  isDraftMode,
  isScheduledMode,
  loading,
  onTitleChange,
  onContentChange,
  onImageUrlChange,
  onSubmit,
  onSaveDraft,
  onConvertToDraft,
  onSchedule,
  onCancel
}) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  // Determine which draft/convert button to show based on current state
  const shouldShowSaveDraft = isDraftMode || originalStatus === undefined;
  const shouldShowConvertToDraft = !isDraftMode && originalStatus && originalStatus !== 'draft';

  return (
    <Card className="allow-copy p-4 sm:p-6 bg-gradient-to-r from-[#F1F0FB] to-[#D6BCFA] border-2 border-[#E5DEFF] shadow-lg animate-fade-in">
      <form onSubmit={onSubmit} className="space-y-6">
        {isDraftMode && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <strong>Editing Draft:</strong> This post will be published when you click "Publish Post" and removed from your drafts.
          </div>
        )}

        {isScheduledMode && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
            <strong>Editing Scheduled Post:</strong> You can reschedule, publish now, or convert to draft.
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-[#7E69AB]">
            Blog Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter blog title"
            required
            className="w-full border-[#9b87f5] bg-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-[#7E69AB]">
            Blog Content
          </label>

          <div className="mb-6">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={onContentChange}
              modules={modules}
              formats={formats}
              className="custom-editor"
            />
            <style>
              {`
                .custom-editor {
                  height: 300px;
                  background-color: white;
                  border-radius: 0.5rem;
                  overflow: hidden;
                }
                .custom-editor .ql-toolbar {
                  background-color: white;
                  border-top-left-radius: 0.5rem;
                  border-top-right-radius: 0.5rem;
                  border: 1px solid #9b87f5;
                }
                .custom-editor .ql-container {
                  height: calc(300px - 42px);
                  background-color: white;
                  border: 1px solid #9b87f5;
                  border-top: none;
                  border-bottom-left-radius: 0.5rem;
                  border-bottom-right-radius: 0.5rem;
                  font-family: inherit;
                }
              `}
            </style>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <label htmlFor="imageUrl" className="text-sm font-medium text-[#7E69AB]">
              Optional Blog Image URL
            </label>
            {imageUrl && (
              <span className="text-sm font-medium text-[#7E69AB]">
                Image Preview
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start">
            <Input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-white border-[#9b87f5] flex-1"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full sm:w-32 h-20 object-cover rounded border shadow hover:scale-105 transition-transform"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {/* {shouldShowSaveDraft && ( */}
              {!shouldShowConvertToDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={loading}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            )}

            {shouldShowConvertToDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={onConvertToDraft}
                disabled={loading}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
              >
                <DraftingCompass className="h-4 w-4" />
                Convert to Draft
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={onSchedule}
              disabled={loading}
              className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
            >
              <Calendar className="h-4 w-4" />
              {isScheduledMode ? 'Reschedule' : 'Schedule'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white font-bold hover:shadow-md transition-all text-sm"
            >
              {loading ? 'Saving...' : isDraftMode ? 'Publish Post' : 'Update Post'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default BlogEditorForm;
