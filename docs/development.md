# Your Weather — 开发文档

## 1. 技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| 构建 | Vite 5 | 默认模板 react-ts |
| 框架 | React 18 | 函数组件 + hooks |
| 语言 | TypeScript 5 | strict 模式 |
| 样式 | Tailwind CSS 3 | + `@tailwindcss/forms` |
| 状态管理 | Zustand | 轻量,优于 useState + props 透传 |
| 数据请求 | 原生 fetch + 自封装 hook | 不引入 react-query,需求规模不需要 |
| 图标 | lucide-react | 简洁好看 |
| 工具 | clsx, dayjs | UI 拼类、时间格式化 |

## 2. 目录结构

```
your-weather/
├── docs/
│   ├── requirements.md
│   ├── development.md
│   └── ui-mockup.html         # frontend-design 产出
├── src/
│   ├── api/
│   │   ├── client.ts          # fetch 封装 + 缓存
│   │   ├── openweather.ts     # OWM API 调用
│   │   └── types.ts           # API 响应类型
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── CurrentWeather.tsx
│   │   ├── ForecastList.tsx
│   │   ├── ForecastCard.tsx
│   │   ├── FavoritesList.tsx
│   │   ├── UnitToggle.tsx
│   │   ├── WeatherBackground.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── EmptyState.tsx
│   ├── hooks/
│   │   ├── useWeather.ts
│   │   ├── useForecast.ts
│   │   ├── useGeolocation.ts
│   │   └── useDebounce.ts
│   ├── store/
│   │   ├── favorites.ts       # zustand + localStorage
│   │   ├── units.ts
│   │   └── currentCity.ts
│   ├── utils/
│   │   ├── format.ts          # 温度、风速、时间格式化
│   │   ├── weatherTheme.ts    # 天气 → 背景主题
│   │   └── storage.ts         # LocalStorage 封装
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .env.local                  # 不入库
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 3. OpenWeatherMap API

### 3.1 注册与配额
- 免费版:60 次/分钟、1,000,000 次/月
- 注册 https://openweathermap.org/api 拿 key

### 3.2 使用的接口

| 端点 | 用途 |
|---|---|
| `GET /geo/1.0/direct?q={city}&limit=5` | 城市搜索/补全 |
| `GET /geo/1.0/reverse?lat=&lon=&limit=1` | 反向地理编码(定位后用) |
| `GET /data/2.5/weather?lat=&lon=&units=metric&lang=zh_cn` | 当前天气 |
| `GET /data/2.5/forecast?lat=&lon=&units=metric&lang=zh_cn` | 5 天预报(3 小时间隔,需聚合) |

> 注:免费版没有 One Call API 3.0,`forecast` 返回 5 天 × 8 个 3 小时点 = 40 条,前端聚合为 5 天概览(取每天 12:00 或日内最高/低)。

### 3.3 关键参数
- `units=metric` 始终取摄氏,前端按需转华氏
- `lang=zh_cn` 天气描述返回中文
- `appid` 从 `import.meta.env.VITE_OWM_API_KEY` 注入

### 3.4 缓存策略
- 内存级 Map<cacheKey, { data, expiresAt }>
- key = `${endpoint}:${lat}:${lon}` 或 `${endpoint}:${query}`
- TTL = 10 分钟
- 跨刷新不持久化(简单可控)

## 4. 数据模型

```ts
// src/api/types.ts
export interface GeoCity {
  name: string;
  local_names?: Record<string, string>; // local_names.zh
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  coord: { lat: number; lon: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;          // 米
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  name: string;
}

export interface ForecastResponse {
  list: ForecastItem[];        // 40 条
  city: { name: string; country: string; sunrise: number; sunset: number };
}

export interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number; deg: number };
  pop: number;                 // 降水概率 0-1
  dt_txt: string;
}

// 聚合后的每日概览(前端计算)
export interface DailyForecast {
  date: string;                // YYYY-MM-DD
  weekday: string;             // 周一
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
  pop: number;                 // 当天最高 pop
}

export interface FavoriteCity {
  id: string;                  // `${lat},${lon}`
  name: string;                // 中文名优先
  country: string;
  state?: string;
  lat: number;
  lon: number;
  addedAt: number;
}
```

## 5. 状态管理

### 5.1 Zustand store

```ts
// store/favorites.ts
interface FavoritesStore {
  items: FavoriteCity[];
  add(city: FavoriteCity): void;
  remove(id: string): void;
  has(id: string): boolean;
}
// 持久化到 localStorage:`your-weather:favorites`

// store/units.ts
interface UnitsStore {
  temp: 'C' | 'F';
  wind: 'm/s' | 'km/h';
  toggleTemp(): void;
  toggleWind(): void;
}
// 持久化到 localStorage:`your-weather:units`

// store/currentCity.ts
interface CurrentCityStore {
  city: FavoriteCity | null;
  setCity(c: FavoriteCity): void;
}
// 不持久化(每次默认走定位)
```

## 6. 关键流程

### 6.1 首次进入
```
mount
 ├─ 读 localStorage 收藏/单位
 ├─ 调用 useGeolocation()
 │    ├─ success → reverse geocode → setCity → 加载天气
 │    └─ denied/error → 显示 EmptyState(引导搜索或选收藏)
 └─ render
```

### 6.2 搜索
```
input 变化
 └─ debounce 300ms
     └─ GET /geo/1.0/direct → 候选下拉
        └─ 点击 → setCity → 加载天气 + 关闭下拉
```

### 6.3 切换收藏城市
```
点击收藏项 → setCity(item) → useWeather/useForecast 自动重新请求
```

## 7. 动态背景方案

```ts
// utils/weatherTheme.ts
type Theme = 'clear-day' | 'clear-night' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'mist';

function themeOf(weatherId: number, isNight: boolean): Theme {
  // OWM weather id 范围:
  // 2xx 雷暴 / 3xx 毛毛雨 / 5xx 雨 / 6xx 雪 / 7xx 大气(雾霾) / 800 晴 / 80x 云
  if (weatherId >= 200 && weatherId < 300) return 'thunder';
  if (weatherId >= 300 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return isNight ? 'clear-night' : 'clear-day';
  return 'cloudy';
}
```

Tailwind 用 `data-theme` 属性切换 CSS 变量:

```css
[data-theme="clear-day"]  { --bg-from: #4a9eff; --bg-to:#a3d5ff; }
[data-theme="clear-night"]{ --bg-from: #0f1e4c; --bg-to:#1a2f6e; }
[data-theme="rain"]       { --bg-from: #475569; --bg-to:#1e293b; }
...
```

雨滴/雪花用纯 CSS animation,不引第三方动画库。

## 8. 环境变量 + 用户可覆盖

### 8.1 构建时来源
`.env`(入库,默认 key)
```
VITE_OWM_API_KEY=ce3a04147cb16d452c2b7db7df32c603
```

### 8.2 运行时覆盖(用户在 UI 里粘贴)
- LocalStorage key:`your-weather:apikey-override`
- `apiKey` store 提供 `effective` getter:有 override 用 override,否则用 env
- 当 API 返回 401 或 env+override 都为空时,弹出 `<ApiKeyPrompt>`(顶部 banner + 设置面板)引导用户重新粘贴

### 8.3 设置面板
- 主 UI 右上角齿轮按钮 → 抽屉/弹窗
- 内含:温度单位、风速单位、API key 输入框、清除收藏按钮
- key 输入框默认 masked(••••),点击可显示,带"保存/恢复默认"按钮

## 9. 开发计划(分阶段)

### Phase 1 — 脚手架(0.5h)
- `npm create vite@latest your-weather -- --template react-ts`
- 装 Tailwind / zustand / dayjs / clsx / lucide-react
- 配置 tailwind.config / index.css
- 提交 baseline

### Phase 2 — API 层(1h)
- `api/client.ts`:fetch 封装 + 缓存 + 错误归一化
- `api/openweather.ts`:4 个接口的具体实现
- `api/types.ts`:类型定义
- 用 .env.local 配置真实 key 跑通一个调用

### Phase 3 — Store(0.5h)
- favorites / units / currentCity 三个 store
- localStorage 持久化中间件

### Phase 4 — 基础组件(2h)
- SearchBar(含 debounce + 下拉补全)
- CurrentWeather(主信息卡)
- ForecastList + ForecastCard
- FavoritesList
- UnitToggle
- WeatherBackground(动态背景容器)
- LoadingSkeleton + EmptyState

### Phase 5 — 主流程联调(1h)
- App.tsx 组装
- 定位 → 天气 → 渲染
- 搜索 → 切城市
- 收藏 ↔ 取消

### Phase 6 — 视觉打磨(1.5h)
- 动态背景 CSS 主题 + 雨/雪 animation
- 移动端适配
- 微交互(hover / 切换过渡)

### Phase 7 — 验收(0.5h)
- 走一遍 requirements.md §6 的清单
- README.md 写使用说明

合计 ~7 小时。

## 10. 测试策略

个人项目,不写单测。靠 frontend-design skill 的 verify 流程在浏览器跑一遍:
- 输入"上海"/"Tokyo"/拼错的字符串
- 拒绝/接受定位
- 收藏/取消收藏 → 刷新页面验证持久化
- 切换 °C/°F、m/s/km/h
- 切换不同天气城市看背景变化
- 移动端 DevTools 模拟 375px 宽度

## 11. 风险与取舍

| 风险 | 取舍 |
|---|---|
| OWM 免费版没有 One Call 3.0,需聚合 3 小时步长为日预报 | 接受,前端聚合逻辑简单 |
| API key 在前端暴露 | 接受,个人项目,免费额度足够 |
| 定位在 HTTP 上不可用 | 本地开发用 localhost(被允许),部署如需则上 HTTPS |
| 中文城市名匹配 | OWM Geocoding 对中文支持有限,建议显示英文 + local_names.zh |
