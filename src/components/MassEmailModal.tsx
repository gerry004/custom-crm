'use client';

import React, { useState } from 'react';
import { FiX, FiPaperclip } from 'react-icons/fi';

interface MassEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromEmail: string;
  recipientCount: number;
}

const MassEmailModal = ({ isOpen, onClose, fromEmail, recipientCount }: MassEmailModalProps) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const formData = new FormData();
      formData.append('from', fromEmail);
      formData.append('subject', subject);
      formData.append('body', body);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/email/mass-send', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      onClose();
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2f2f2f] rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Mass Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">From</label>
            <input
              type="email"
              value={fromEmail}
              disabled
              className="w-full px-3 py-2 bg-[#3f3f3f] rounded border border-gray-600 text-gray-300"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">To</label>
            <div className="w-full px-3 py-2 bg-[#3f3f3f] rounded border border-gray-600 text-gray-300">
              All Leads ({recipientCount} recipients)
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#3f3f3f] rounded border border-gray-600 text-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[#3f3f3f] rounded border border-gray-600 text-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Attachments</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-[#3f3f3f] rounded border border-gray-600 text-gray-300 hover:bg-[#4f4f4f]">
                  <FiPaperclip />
                  <span>Add files</span>
                </div>
              </label>
              {attachments.length > 0 && (
                <span className="text-sm text-gray-400">
                  {attachments.length} file(s) selected
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {sending ? 'Sending...' : `Send to ${recipientCount} Recipients`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MassEmailModal; 