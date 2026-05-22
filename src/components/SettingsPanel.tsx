import { Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApiKeyStore } from '@/store/apiKey';
import { useFavoritesStore } from '@/store/favorites';
import { useUnitsStore } from '@/store/units';
import { clearCache } from '@/api/client';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: Props) {
  const tempUnit = useUnitsStore((s) => s.temp);
  const setTemp = useUnitsStore((s) => s.setTemp);
  const windUnit = useUnitsStore((s) => s.wind);
  const setWind = useUnitsStore((s) => s.setWind);

  const apiOverride = useApiKeyStore((s) => s.override);
  const setOverride = useApiKeyStore((s) => s.setOverride);
  const clearOverride = useApiKeyStore((s) => s.clearOverride);

  const clearFavorites = useFavoritesStore((s) => s.clear);

  const [localKey, setLocalKey] = useState(apiOverride);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (open) setLocalKey(apiOverride);
  }, [open, apiOverride]);

  if (!open) return null;

  const envKey = import.meta.env.VITE_OWM_API_KEY ?? '';
  const effective = apiOverride || envKey;
  const source = apiOverride ? '用户覆盖' : envKey ? '构建默认' : '未配置';

  function saveKey() {
    if (localKey.trim()) {
      setOverride(localKey);
    } else {
      clearOverride();
    }
    clearCache();
  }

  function restoreDefault() {
    clearOverride();
    setLocalKey('');
    clearCache();
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-stone-950 text-stone-100 shadow-2xl overflow-y-auto"
        role="dialog"
        aria-label="设置"
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="font-display-it text-2xl">设置</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/10 transition"
            aria-label="关闭"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        <div className="px-6 py-6 space-y-8">
          <Section label="单位">
            <Row label="温度">
              <UnitToggle
                value={tempUnit}
                options={['C', 'F']}
                onChange={(v) => setTemp(v)}
                labelOf={(v) => `°${v}`}
              />
            </Row>
            <Row label="风速">
              <UnitToggle
                value={windUnit}
                options={['m/s', 'km/h']}
                onChange={(v) => setWind(v)}
                labelOf={(v) => v}
              />
            </Row>
          </Section>

          <Section label="API key">
            <p className="text-[12px] text-stone-400 leading-relaxed mb-3">
              当前来源:<span className="font-mono">{source}</span>
              <br />
              留空则恢复使用构建时默认。修改后会清除缓存。
            </p>
            <div className="flex items-center gap-2">
              <input
                type={reveal ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder={envKey ? '使用构建默认 key' : '请粘贴 openweathermap.org 的 key'}
                className="flex-1 bg-white/8 ring-1 ring-white/10 rounded px-3 py-2 font-mono text-[12px] outline-none focus:ring-white/30"
              />
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                className="p-2 rounded hover:bg-white/10 transition"
                aria-label={reveal ? '隐藏' : '显示'}
              >
                {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[12px]">
              <button
                type="button"
                onClick={saveKey}
                disabled={localKey.trim() === apiOverride}
                className="px-3 py-1.5 rounded bg-stone-100 text-stone-900 disabled:opacity-40 hover:bg-white transition"
              >
                保存
              </button>
              <button
                type="button"
                onClick={restoreDefault}
                disabled={!apiOverride}
                className="px-3 py-1.5 rounded ring-1 ring-white/20 disabled:opacity-40 hover:bg-white/10 transition"
              >
                恢复默认
              </button>
              <span className="font-mono text-[10px] text-stone-500">
                {effective ? `••• ${effective.slice(-4)}` : ''}
              </span>
            </div>
          </Section>

          <Section label="数据">
            <button
              type="button"
              onClick={() => {
                clearCache();
              }}
              className="text-[12px] text-stone-300 hover:text-white"
            >
              清除请求缓存
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('确定清空所有收藏吗?')) clearFavorites();
              }}
              className="text-[12px] text-stone-300 hover:text-white block mt-2"
            >
              清空收藏列表
            </button>
          </Section>

          <Section label="关于">
            <p className="text-[12px] text-stone-400 leading-relaxed mb-3">
              基于 OpenWeather 的极简天气面板。数据本地缓存，单位与收藏均保存在浏览器。
            </p>
            <div className="flex flex-col gap-1.5 text-[12px]">
              <a
                href="https://github.com/maya1900/your-weather"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-stone-200 hover:text-white underline-offset-4 hover:underline"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4 1 0 2 .1 2.9.4 2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5C20.2 21.4 23.5 17.1 23.5 12 23.5 5.7 18.3.5 12 .5z" />
                </svg>
                <span>GitHub 仓库</span>
                <span className="ml-auto font-mono text-[10px] text-stone-500">
                  maya1900/your-weather
                </span>
              </a>
              <a
                href="https://github.com/maya1900/your-weather/issues"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-stone-200 hover:text-white underline-offset-4 hover:underline"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                <span>提交反馈 / Issues</span>
              </a>
            </div>
          </Section>

          <p className="font-mono text-[10px] text-stone-600 tracking-widest uppercase">
            your weather · settings
          </p>
        </div>
      </aside>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-stone-400 mb-3">
        {label}
      </p>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-stone-200">{label}</span>
      {children}
    </div>
  );
}

function UnitToggle<T extends string>({
  value,
  options,
  onChange,
  labelOf,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  labelOf: (v: T) => string;
}) {
  return (
    <div className="flex items-center gap-1 font-mono text-[11px] tracking-widest uppercase">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded transition ${
            value === o ? 'bg-white/15' : 'opacity-50 hover:opacity-80'
          }`}
        >
          {labelOf(o)}
        </button>
      ))}
    </div>
  );
}
