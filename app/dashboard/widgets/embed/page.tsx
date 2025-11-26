'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { widgetAPI } from '@/lib/api';
import { 
  RiCodeLine,
  RiArrowLeftLine,
  RiFileCopyLine,
  RiCheckLine,
  RiInformationLine
} from '@remixicon/react';

export default function WidgetEmbedPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [selectedWidget, setSelectedWidget] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (selectedWorkspace) {
      loadWidgets();
    }
  }, [selectedWorkspace]);

  const loadWidgets = async () => {
    if (!selectedWorkspace) return;

    try {
      setIsLoading(true);
      const data = await widgetAPI.getWorkspaceWidgets(selectedWorkspace.id);
      setWidgets(data || []);
      if (data && data.length > 0) {
        setSelectedWidget(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load widgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const widget = widgets.find(w => w.id === selectedWidget);
  const installCode = widget?.installCode || '';

  const embedScript = `<!-- AI Chat Widget -->
<script>
  window.aiChatConfig = {
    installCode: '${installCode}',
    apiUrl: '${backendUrl}'
  };
</script>
<script src="${backendUrl}/widget.js" async></script>`;

  const reactExample = `import { useEffect } from 'react';

export default function MyComponent() {
  useEffect(() => {
    // Configure widget
    window.aiChatConfig = {
      installCode: '${installCode}',
      apiUrl: '${backendUrl}'
    };
    
    // Load widget script
    const script = document.createElement('script');
    script.src = '${backendUrl}/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>{/* Your content */}</div>;
}`;

  const nextjsExample = `'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function MyPage() {
  useEffect(() => {
    window.aiChatConfig = {
      installCode: '${installCode}',
      apiUrl: '${backendUrl}'
    };
  }, []);

  return (
    <>
      <Script
        src="${backendUrl}/widget.js"
        strategy="lazyOnload"
      />
      {/* Your content */}
    </>
  );
}`;

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading widgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/widgets')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <RiArrowLeftLine size={20} />
          Back to Widgets
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Embed Widget</h1>
        <p className="text-muted-foreground">
          Add the AI chat widget to your website in minutes
        </p>
      </div>

      <div className="max-w-4xl">
        {/* Widget Selection */}
        {widgets.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <RiCodeLine size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No widgets found
            </h3>
            <p className="text-muted-foreground mb-6">
              Create a widget first to get the embed code
            </p>
            <button
              onClick={() => router.push('/dashboard/widgets')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Create Widget
            </button>
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Widget
              </label>
              <select
                value={selectedWidget}
                onChange={(e) => setSelectedWidget(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                {widgets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* CORS Warning */}
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <RiInformationLine size={20} className="text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    CORS Configuration Required
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                    To use the widget on external websites, your backend must allow cross-origin requests. Add these CORS headers:
                  </p>
                  <div className="bg-orange-100 dark:bg-orange-900 rounded p-3 font-mono text-xs">
                    <div>Access-Control-Allow-Origin: *</div>
                    <div>Access-Control-Allow-Methods: GET, POST, OPTIONS</div>
                    <div>Access-Control-Allow-Headers: Content-Type</div>
                  </div>
                </div>
              </div>
            </div>

            {/* HTML Embed */}
            <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 border-b border-border px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">HTML Embed Code</h3>
                <button
                  onClick={() => handleCopy(embedScript, 'html')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {copiedSection === 'html' ? (
                    <>
                      <RiCheckLine size={16} className="text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Add this code just before the closing <code className="px-1.5 py-0.5 bg-muted rounded text-xs">&lt;/body&gt;</code> tag:
                </p>
                <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-foreground">{embedScript}</code>
                </pre>
              </div>
            </div>

            {/* React Example */}
            <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 border-b border-border px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">React Integration</h3>
                <button
                  onClick={() => handleCopy(reactExample, 'react')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {copiedSection === 'react' ? (
                    <>
                      <RiCheckLine size={16} className="text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  For React applications, use this component:
                </p>
                <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-foreground">{reactExample}</code>
                </pre>
              </div>
            </div>

            {/* Next.js Example */}
            <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 border-b border-border px-6 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Next.js Integration</h3>
                <button
                  onClick={() => handleCopy(nextjsExample, 'nextjs')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {copiedSection === 'nextjs' ? (
                    <>
                      <RiCheckLine size={16} className="text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  For Next.js applications (App Router), use the Next.js Script component:
                </p>
                <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-foreground">{nextjsExample}</code>
                </pre>
              </div>
            </div>

            {/* Installation Steps */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Installation Steps</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Copy the embed code</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose the appropriate code snippet for your platform (HTML, React, or Next.js)
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Add to your website</h4>
                    <p className="text-sm text-muted-foreground">
                      Paste the code into your website's HTML or component file
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Test the widget</h4>
                    <p className="text-sm text-muted-foreground">
                      Load your website and verify the chat widget appears in the bottom right corner
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Customize appearance</h4>
                    <p className="text-sm text-muted-foreground">
                      Gebruik de Editor om kleuren, positie en gedrag aan te passen
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/widgets')}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Ga naar Widgets →
                    </button>
                  </div>
                </li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
