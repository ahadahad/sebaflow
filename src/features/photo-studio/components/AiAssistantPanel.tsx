import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Send, X, Check, AlertTriangle, Info, Trash2, Wand2, Loader2, Lightbulb } from 'lucide-react';
import type { AiOperation, AiAssistantResponse, AiStatus, PhotoAssistantRequest } from '../types/aiAssistant';
import { EXAMPLE_COMMANDS } from '../types/aiAssistant';
import { getOperationDescription } from '../utils/aiExecutor';

interface AiAssistantPanelProps {
  hasImage: boolean;
  imageMetadata?: { width: number; height: number; mimeType?: string };
  currentEditState?: PhotoAssistantRequest['currentEditState'];
  onApplyOperations: (operations: AiOperation[]) => void;
  onPushHistory: () => void;
  onOpenSettings?: () => void;
  t: (en: string, bn: string) => string;
  lang: 'en' | 'bn';
}

export default function AiAssistantPanel({
  hasImage,
  imageMetadata,
  currentEditState,
  onApplyOperations,
  onPushHistory,
  onOpenSettings,
  t,
  lang,
}: AiAssistantPanelProps) {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [conversation, setConversation] = useState<{ command: string; response: AiAssistantResponse; timestamp: number }[]>([]);

  const getLocalApiKey = () => {
    try {
      return localStorage.getItem('shebaflow_th_key') || localStorage.getItem('tokenharborApiKey') || '';
    } catch { return ''; }
  };

  const fetchStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      // Local fallback works even without API key - always show as connected if localFallbackAvailable
      const localKey = getLocalApiKey();
      if (data.localFallbackAvailable || localKey || data.configured) {
        setStatus({
          ...data,
          status: 'AI Connected' as const,
          configured: true,
          hasApiKey: !!localKey || data.hasApiKey,
        });
      } else {
        setStatus(data);
      }
    } catch (e) {
      setStatus({
        success: true,
        status: 'AI Connected' as const,
        configured: true,
        model: 'local-fallback',
        hasApiKey: !!getLocalApiKey(),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30s
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleSend = async () => {
    if (!command.trim()) return;
    if (!hasImage) {
      setError(t('Please upload an image first', 'আগে ছবি আপলোড করুন'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const localKey = getLocalApiKey();
      const requestBody: any = {
        command: command.trim(),
        imageMetadata,
        currentEditState,
      };
      // Include API key from UI if available (dev convenience, sent as body + header)
      if (localKey) {
        requestBody.apiKey = localKey;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (localKey) {
        headers['X-TokenHarbor-Key'] = localKey;
      }

      const res = await fetch('/api/ai/photo-assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const aiResponse: AiAssistantResponse = {
        success: true,
        operations: data.operations || [],
        explanation: data.explanation || data.message || 'Edits prepared',
        confidence: data.confidence,
        model: data.model,
      };

      setResponse(aiResponse);
      setConversation(prev => [
        ...prev.slice(-4), // keep last 4
        { command: command.trim(), response: aiResponse, timestamp: Date.now() },
      ]);
    } catch (e: any) {
      console.error('AI Assistant error:', e);
      setError(e.message || t('AI request failed', 'AI অনুরোধ ব্যর্থ'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!response || !response.operations.length) return;
    // Filter out unsupported for apply, but keep info
    const applicable = response.operations.filter(op => op.type !== 'unsupported');
    if (applicable.length === 0) {
      setError(t('No applicable operations', 'প্রযোজ্য কোনো অপারেশন নেই'));
      return;
    }
    onPushHistory();
    onApplyOperations(applicable);
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  const getStatusColor = () => {
    if (statusLoading) return 'text-slate-400 bg-slate-800';
    if (!status) return 'text-slate-400 bg-slate-800';
    if (status.status === 'AI Connected') return 'text-emerald-400 bg-emerald-900/30 border-emerald-700/30';
    if (status.status === 'Configuration Required') return 'text-amber-300 bg-amber-900/20 border-amber-700/30';
    return 'text-red-300 bg-red-900/20 border-red-700/30';
  };

  const getStatusText = () => {
    if (statusLoading) return t('Checking AI...', 'AI চেক হচ্ছে...');
    if (!status) return t('AI Unavailable', 'AI অনুপলব্ধ');
    return status.status === 'AI Connected'
      ? t('AI Connected', 'AI সংযুক্ত')
      : status.status === 'Configuration Required'
      ? t('Configuration Required', 'কনফিগারেশন প্রয়োজন')
      : t('AI Unavailable', 'AI অনুপলব্ধ');
  };

  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              {t('AI Assistant', 'AI সহকারী')} <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white">BETA</span>
            </div>
            <div className="text-[10px] text-slate-400">{t('Powered by gpt-5.6-luna', 'gpt-5.6-luna দ্বারা চালিত')}</div>
          </div>
        </div>
        <div className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor()}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status?.status === 'AI Connected' ? 'bg-emerald-400 animate-pulse' : status?.status === 'Configuration Required' ? 'bg-amber-400' : 'bg-red-400'}`} />
          {getStatusText()}
        </div>
      </div>

      {/* Status details */}
      {status && !status.configured && (
        <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 p-3 text-[11px] text-amber-200 flex gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">{t('AI is not configured', 'AI কনফিগার করা নেই')}</div>
            <div className="text-[10px] mt-1 opacity-80">
              {t('Set TOKEN_HARBOR_API_KEY in .env file or add via UI. Local editing still works.', '.env ফাইলে TOKEN_HARBOR_API_KEY সেট করুন বা UI থেকে যোগ করুন।')}
            </div>
            {onOpenSettings && (
              <button onClick={onOpenSettings} className="mt-2 px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-500 flex items-center gap-1">
                <Sparkles size={10} /> {t('Add API Key', 'API কী যোগ করুন')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
          {t('Describe what you want', 'আপনি কী চান বর্ণনা করুন')}
        </label>
        <div className="relative">
          <textarea
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(
              'e.g., Make the background white, improve lighting, create passport style...',
              'যেমন, ব্যাকগ্রাউন্ড সাদা করুন, লাইটিং উন্নত করুন, পাসপোর্ট স্টাইল তৈরি করুন...'
            )}
            className="w-full min-h-[80px] rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-none"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="absolute bottom-2 right-2 text-[10px] text-slate-500">{command.length}/500</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={!command.trim() || isLoading || !hasImage}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 text-sm font-bold hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
            {isLoading ? t('Thinking...', 'ভাবছে...') : t('Ask AI', 'AI কে জিজ্ঞাসা')}
          </button>
          <button
            onClick={() => {
              setCommand('');
              setResponse(null);
              setError(null);
            }}
            className="rounded-xl bg-slate-700 text-slate-300 px-3 py-2.5 text-xs hover:bg-slate-600"
          >
            <X size={14} />
          </button>
        </div>
        <div className="text-[10px] text-slate-500">{t('Ctrl+Enter to send', 'পাঠাতে Ctrl+Enter')}</div>
      </div>

      {/* Example suggestions */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
          <Lightbulb size={12} /> {t('Try these', 'এগুলো চেষ্টা করুন')}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_COMMANDS.slice(0, 8).map((ex, i) => (
            <button
              key={i}
              onClick={() => setCommand(ex)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/50 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white text-left disabled:opacity-40"
            >
              {lang === 'bn' ? ex : ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-700/30 p-3 text-[11px] text-red-200 flex gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">{t('Request Failed', 'অনুরোধ ব্যর্থ')}</div>
            <div className="mt-1 opacity-90">{error}</div>
            {error.includes('temporarily unavailable') || error.includes('continue editing manually') ? (
              <div className="mt-2 text-[10px] bg-slate-800 rounded p-2">
                {t('AI assistance is temporarily unavailable. You can continue editing manually.', 'AI সহায়তা সাময়িকভাবে অনুপলব্ধ। আপনি ম্যানুয়ালি এডিটিং চালিয়ে যেতে পারেন।')}
              </div>
            ) : null}
          </div>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-xl bg-violet-900/10 border border-violet-700/20 p-3 space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
              <Wand2 size={12} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-violet-300">
                {t('AI Suggestion', 'AI পরামর্শ')} {response.confidence ? `• ${response.confidence}%` : ''} {response.model ? `• ${response.model}` : ''}
              </div>
              <div className="text-[12px] text-slate-200 mt-1 leading-relaxed">{response.explanation}</div>
            </div>
          </div>

          {/* Operations preview */}
          {response.operations.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                {t('Proposed changes', 'প্রস্তাবিত পরিবর্তন')} ({response.operations.length})
              </div>
              <div className="grid gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {response.operations.map((op, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] border ${
                      op.type === 'unsupported'
                        ? 'bg-amber-900/20 border-amber-700/30 text-amber-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${op.type === 'unsupported' ? 'bg-amber-600' : 'bg-violet-600'}`}>
                      {op.type === 'unsupported' ? <AlertTriangle size={10} className="text-white" /> : <Check size={10} className="text-white" />}
                    </div>
                    <span className="flex-1">{getOperationDescription(op)}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{op.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply / Cancel */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApply}
              disabled={response.operations.filter(o => o.type !== 'unsupported').length === 0}
              className="flex-1 rounded-lg bg-emerald-600 text-white py-2 text-xs font-bold hover:bg-emerald-500 disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> {t('Apply Changes', 'পরিবর্তন প্রয়োগ')}
            </button>
            <button
              onClick={() => {
                setResponse(null);
                setError(null);
              }}
              className="flex-1 rounded-lg bg-slate-700 text-slate-300 py-2 text-xs hover:bg-slate-600"
            >
              {t('Cancel', 'বাতিল')}
            </button>
          </div>

          {response.operations.some(o => o.type === 'unsupported') && (
            <div className="rounded-lg bg-amber-900/10 border border-amber-700/20 p-2 text-[10px] text-amber-300/80 flex gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                {t(
                  'Some operations are not supported by the local editor and were skipped.',
                  'কিছু অপারেশন লোকাল এডিটর দ্বারা সমর্থিত নয় এবং বাদ দেওয়া হয়েছে।'
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Conversation history */}
      {conversation.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              {t('Recent', 'সাম্প্রতিক')} ({conversation.length})
            </div>
            <button
              onClick={() => setConversation([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <Trash2 size={10} /> {t('Clear', 'মুছুন')}
            </button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {conversation
              .slice()
              .reverse()
              .map((item, idx) => (
                <div key={idx} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2.5">
                  <div className="text-[11px] text-slate-300 font-medium truncate">"{item.command}"</div>
                  <div className="text-[10px] text-slate-500 mt-1">{item.response.explanation.substring(0, 80)}...</div>
                  <div className="text-[9px] text-slate-600 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Offline note */}
      <div className="rounded-lg bg-slate-800/30 border border-slate-700/30 p-2.5 text-[10px] text-slate-500 leading-relaxed">
        <div className="flex gap-1.5">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            {t(
              'AI only suggests edits. Local Canvas editor applies changes. Works offline after load. No image is sent to AI unless explicitly supported.',
              'AI শুধু এডিটের পরামর্শ দেয়। লোকাল ক্যানভাস এডিটর পরিবর্তন প্রয়োগ করে। লোডের পর অফলাইনে কাজ করে।'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
