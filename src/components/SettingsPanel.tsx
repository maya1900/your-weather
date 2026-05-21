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
