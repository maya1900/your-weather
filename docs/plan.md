# Your Weather — 开发执行计划

> 本文件用于持久化开发进度,防止会话过长导致上下文丢失。
> 每完成一项任务,把对应 `[ ]` 改为 `[x]`,并写下任何关键决策/坑。

## 项目根目录
`/Users/mayang/projects/own/your-weather`

## 关键凭据
- OpenWeatherMap API key:`ce3a04147cb16d452c2b7db7df32c603`(用户授权可入库)
- 写入位置:`.env` 文件 `VITE_OWM_API_KEY=ce3a04147cb16d452c2b7db7df32c603`

## 技术栈定稿
- Vite 5 + React 18 + TypeScript 5
- Tailwind CSS 3 + PostCSS + Autoprefixer
- Zustand 5(状态 + localStorage)
- dayjs(时间)、clsx(类名)、lucide-react(图标)
- 字体:Instrument Serif / Geist / JetBrains Mono / Noto Serif SC / Noto Sans SC(Google Fonts CDN)

## 全局原则
- 设计严格遵循 `docs/ui-mockup.html`
- 不写测试(个人项目)
- 用 `verify` 思路通过浏览器确认
- 路径别名:`@/*` → `src/*`

---

## Phase 1 — 脚手架(in progress)

### 1.1 配置文件
- [x] `package.json`(React/TS/Tailwind/Zustand/dayjs/clsx/lucide-react 依赖)
- [x] `tsconfig.json`(strict + path alias `@/*`)
- [x] `tsconfig.node.json`
- [ ] `vite.config.ts`(React 插件 + path alias)
- [ ] `tailwind.config.js`(content paths + 字体扩展)
- [ ] `postcss.config.js`
- [ ] `.gitignore`(node_modules / dist / .env.local 不入库,但 .env 入库)
- [ ] `.env`(含真实 API key,入库)
- [ ] `.env.example`(占位提示)

### 1.2 入口文件
- [ ] `index.html`(挂载点 + 字体预加载)
- [ ] `src/main.tsx`(ReactDOM 挂载)
- [ ] `src/index.css`(Tailwind 三件套 + 字体变量 + 主题 CSS 变量)
- [ ] `src/vite-env.d.ts`(ImportMeta.env 类型)
- [ ] `src/App.tsx`(临时空壳,确认运行)

### 1.3 安装与启动确认
- [ ] `npm install`
- [ ] `npm run dev` 启动,浏览器看到空壳
- [ ] git init + 首次 commit (baseline)

---

## Phase 2 — API 层

### 2.1 类型定义
- [ ] `src/api/types.ts` — `GeoCity` / `CurrentWeather` / `ForecastResponse` / `ForecastItem` / `DailyForecast` / `FavoriteCity` / `ApiError`

### 2.2 fetch client
- [ ] `src/api/client.ts`
  - 内存 Map 缓存,TTL 10 分钟
  - 错误归一化:401 → INVALID_KEY、429 → RATE_LIMIT、404 → NOT_FOUND、其他 → NETWORK
  - 自动注入 appid + lang=zh_cn + units=metric

### 2.3 OWM 端点
- [ ] `src/api/openweather.ts`
  - `searchCities(q): Promise<GeoCity[]>` — /geo/1.0/direct
  - `reverseGeocode(lat, lon): Promise<GeoCity | null>` — /geo/1.0/reverse
  - `getCurrentWeather(lat, lon): Promise<CurrentWeather>` — /data/2.5/weather
  - `getForecast(lat, lon): Promise<ForecastResponse>` — /data/2.5/forecast
  - `aggregateDaily(list): DailyForecast[]` — 把 3 小时步长聚合为日

### 2.4 烟雾测试
- [ ] 在 App.tsx 临时调用 `getCurrentWeather(31.23, 121.47)`,console.log 看返回

---

## Phase 3 — 状态层(Zustand)

- [ ] `src/store/favorites.ts` — `items`, `add`, `remove`, `has`, `clear`;持久化到 `your-weather:favorites`
- [ ] `src/store/units.ts` — `temp: 'C'|'F'`, `wind: 'm/s'|'km/h'`, `toggleTemp`, `toggleWind`;持久化到 `your-weather:units`
- [ ] `src/store/currentCity.ts` — `city: FavoriteCity | null`, `setCity`;不持久化
- [ ] `src/store/apiKey.ts` — `override: string`, `setOverride`, `clearOverride`, `effective`(优先 override,fallback env);持久化到 `your-weather:apikey-override`

---

## Phase 4 — 工具函数

- [ ] `src/utils/format.ts`
  - `formatTemp(celsius, unit): string` — 取整 + ° 符号
  - `formatWind(ms, unit): string` — 含单位
  - `windDirection(deg): string` — "北/东北/..."
  - `formatTime(unix, tzOffsetSec): string` — HH:mm
  - `formatDate(unix, tzOffsetSec): { date, weekday }` — 中文周
  - `isNight(dt, sunrise, sunset): boolean`
- [ ] `src/utils/weatherTheme.ts`
  - `themeOf(weatherId, isNight): Theme` — 7 种主题
  - `Theme` type 导出

---

## Phase 5 — 组件

按依赖顺序构建:

### 5.1 基础展示组件
- [ ] `src/components/WeatherBackground.tsx` — 接收 theme,渲染 scene + 雨/雪/星/雾/闪电 装饰层
- [ ] `src/components/LoadingSkeleton.tsx` — 加载态骨架
- [ ] `src/components/EmptyState.tsx` — 无数据引导
- [ ] `src/components/ApiKeyPrompt.tsx` — key 缺失/无效时的横幅或弹窗

### 5.2 数据展示组件
- [ ] `src/components/CurrentWeather.tsx` — hero 区:日期、城市、巨大温度、描述、stat strip
- [ ] `src/components/ForecastList.tsx` — 5 列预报(含小型 SVG icon)
- [ ] `src/components/SunArc.tsx` — 日轨弧线 + 当前位置
- [ ] `src/components/WeatherIcon.tsx` — 按 weatherId 返回对应 inline SVG(共 6-7 种:晴日/晴夜/多云/雨/雪/雷/雾)

### 5.3 交互组件
- [ ] `src/components/TopBar.tsx` — 当前城市指示器 + 搜索按钮 + 单位切换 + 设置入口
- [ ] `src/components/SearchBar.tsx` — 防抖搜索 + 下拉建议(点击切换城市)
- [ ] `src/components/FavoritesList.tsx` — 底部薄 rail + 点击切换 + hover × 删除 + 添加按钮
- [ ] `src/components/SettingsPanel.tsx` — 抽屉:单位、API key 输入、清除收藏

### 5.4 钩子
- [ ] `src/hooks/useGeolocation.ts` — 包装 navigator.geolocation,返回 { coords, error, loading }
- [ ] `src/hooks/useDebounce.ts` — 通用 debounce
- [ ] `src/hooks/useWeather.ts` — 接收 city,调 API,管理 loading/error/data
- [ ] `src/hooks/useForecast.ts` — 同上

---

## Phase 6 — 组装与流程

- [ ] 在 `App.tsx` 组装所有组件,布局符合 mockup
- [ ] 初次加载流程:
  1. 读 localStorage(收藏/单位/key override)
  2. 调用 useGeolocation
  3. 成功 → reverseGeocode → setCity → useWeather/useForecast 自动触发
  4. 失败/拒绝 → 显示 EmptyState(若有收藏,选第一个;否则引导搜索)
- [ ] 动态背景:`themeOf(weather.weather[0].id, isNight)` → 注入 WeatherBackground
- [ ] 完整体感测试:
  - [ ] 输入"上海"
  - [ ] 输入"Tokyo"(英文)
  - [ ] 输入乱码 → 错误提示
  - [ ] 拒绝定位 → 引导文案
  - [ ] 收藏/取消收藏 → 刷新保留
  - [ ] °C/°F、m/s/km/h 切换全局生效
  - [ ] 不同天气城市看背景切换(晴/雨/夜)

---

## Phase 7 — 收尾

- [ ] `README.md` 写说明(运行/构建/API key 说明)
- [ ] 删除 console.log 残留
- [ ] `npm run build` 通过
- [ ] `npm run typecheck` 通过
- [ ] 提交所有变更:git commit
- [ ] 标记完成

---

## 进度日志(每完成 Phase 在此记一行)

- 2026-05-21 已完成:requirements / development / ui-mockup / plan
- 2026-05-21 Phase 1 ✅ scaffold(Vite 5.4 + React 18.3 + TS 5 + Tailwind 3.4 + Zustand 5),`npm run dev` 端口 5173 返回 200
- 2026-05-21 Phase 2 ✅ API 层(client w/ 缓存 + 错误归一化、4 个 OWM 端点、aggregateDaily);curl 烟雾测试上海:21.95°C 多云
- 2026-05-21 Phase 3 ✅ 4 个 store(favorites/units/currentCity/apiKey),persist 中间件
- 2026-05-21 Phase 4 ✅ format.ts(温度/风速/时间/方位)+ weatherTheme.ts(7 种主题映射)
- 2026-05-21 Phase 5 ✅ 12 组件 + 4 hooks,全部 typecheck pass
- 2026-05-21 Phase 6 ✅ App.tsx 组装:首屏 (收藏→geo→空状态) → reverseGeocode → useWeather(并发) → 动态背景 + 数据展示;ApiKeyPrompt 在 401/缺 key 时触发
- 2026-05-21 Phase 7 ✅ `npm run build` 通过 (186KB JS / 60KB gzip)、typecheck 通过、README 写好
