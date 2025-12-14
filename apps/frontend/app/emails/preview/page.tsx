'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Mail, Eye, Code, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavigationMenu } from '@/components/navigation-menu';

type EmailTemplate =
  | 'booking-confirmation'
  | 'booking-reminder'
  | 'cancellation'
  | 'reschedule'
  | 'welcome'
  | 'password-reset';

// HTML formatting function
function formatHTML(html: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Split by tags and process
  const parts = html.split(/(<[^>]*>)/);

  parts.forEach((part) => {
    if (!part.trim()) return;

    if (part.startsWith('</')) {
      // Closing tag - decrease indent before adding
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<') && !part.endsWith('/>')) {
      // Opening tag (not self-closing)
      formatted += tab.repeat(indent) + part + '\n';
      // Don't increase indent for self-closing tags or certain tags
      if (!part.match(/<(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)/i)) {
        indent++;
      }
    } else if (part.startsWith('<') && part.endsWith('/>')) {
      // Self-closing tag
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.trim()) {
      // Text content
      formatted += tab.repeat(indent) + part.trim() + '\n';
    }
  });

  return formatted.trim();
}

export default function EmailPreviewPage() {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template') as EmailTemplate | null;

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(
    templateParam || 'booking-confirmation'
  );
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [emailHtml, setEmailHtml] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    const renderEmail = async () => {
      setIsRendering(true);
      try {
        const baseUrl =
          typeof window !== 'undefined' ? window.location.origin : 'https://bookingsystem.com';

        const response = await fetch('/api/emails/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template: selectedTemplate,
            baseUrl,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to render email');
        }

        const data = await response.json();
        setEmailHtml(data.html);
      } catch (error) {
        console.error('Error rendering email:', error);
        setEmailHtml('<p>Error rendering email template</p>');
      } finally {
        setIsRendering(false);
      }
    };

    renderEmail();
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  Email Template Preview
                </h1>
                <p className="text-zinc-700 dark:text-zinc-400 mt-1">
                  Preview and test email templates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavigationMenu />
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Template</label>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplate)}
                  className="w-full"
                >
                  <option value="booking-confirmation">Booking Confirmation</option>
                  <option value="booking-reminder">Booking Reminder</option>
                  <option value="cancellation">Cancellation Confirmation</option>
                  <option value="reschedule">Reschedule Confirmation</option>
                  <option value="welcome">Welcome Email</option>
                  <option value="password-reset">Password Reset</option>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'outline'}
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant={viewMode === 'html' ? 'default' : 'outline'}
                  onClick={() => setViewMode('html')}
                >
                  <Code className="mr-2 h-4 w-4" />
                  HTML
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Preview */}
        <Card>
          <CardContent className="p-0">
            {isRendering ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400" />
                <span className="ml-3 text-zinc-600 dark:text-zinc-400">Rendering email...</span>
              </div>
            ) : viewMode === 'preview' ? (
              <div className="bg-zinc-100 dark:bg-zinc-900 p-8">
                <div className="max-w-150 mx-auto bg-white dark:bg-zinc-950 shadow-lg">
                  {emailHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: emailHtml }}
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    />
                  ) : (
                    <div className="p-8 text-center text-zinc-500">No email to preview</div>
                  )}
                </div>
              </div>
            ) : (
              <pre className="p-6 overflow-auto text-xs bg-zinc-900 text-zinc-100 max-h-150">
                <code>{emailHtml ? formatHTML(emailHtml) : 'No HTML to display'}</code>
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
