import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
  onOpenSettings: () => void;
}

/**
 * Sticky banner shown when the effective API key is missing or returned 401.
 * Doesn't itself accept the key — sends user to SettingsPanel for that.
 */
export function ApiKeyPrompt({ message, onOpenSettings }: Props) {
  return (
    <div className="relative z-20 mx-6 md:mx-10 mt-4 rounded-lg bg-red-900/30 ring-1 ring-red-300/30 text-red-50 px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
      <AlertCircle size={16} strokeWidth={1.6} className="shrink-0" />
      <p className="text-[13px] flex-1">{message}</p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded bg-red-100/15 hover:bg-red-100/25 transition shrink-0"
      >
        打开设置
      </button>
    </div>
  );
}
