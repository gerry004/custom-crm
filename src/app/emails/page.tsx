'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useUser } from '@/hooks/useUser';
import { FiPaperclip } from 'react-icons/fi';

export default function EmailsPage() {
  const [recipientCount, setRecipientCount] = useState(0);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    async function fetchRecipientCount() {
      try {
        const response = await fetch('/api/leads/count');
        if (response.ok) {
          const data = await response.json();
          setRecipientCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching recipient count:', error);
      }
    }

    fetchRecipientCount();
  }, []);

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
      formData.append('from', user?.email || '');
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

      // Clear form after successful send
      setSubject('');
      setBody('');
      setAttachments([]);
      alert('Emails sent successfully!');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mass Email</h1>
          <p className="text-gray-400">
            Send emails to all your leads at once. Currently, you have {recipientCount} leads in your database.
          </p>
        </div>

        <div className="bg-[#2f2f2f] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">From</label>
              <input
                type="email"
                value={user?.email || ''}
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
                rows={12}
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className={`px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {sending ? 'Sending...' : `Send to ${recipientCount} Recipients`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 