/** ZCodium 审计版：官方平台功能开关。
 *
 * 每个官方功能一个开关，默认全部关闭；关闭时应用不发起任何官方平台请求（凭证读取与网络请求前短路）。
 * 用户可以在设置的“官方服务”里单独开启需要的功能。
 * 例外：对话分享已整体下线——不提供开关，开启任何开关都不会恢复它。
 */

export type OfficialServiceKey =
  | "account"
  | "feedback"
  | "codingPlan"
  | "officialMcp"
  | "offPeak"
  | "marketplace"
  | "clientConfig";

export interface OfficialServiceSwitches {
  account: boolean;
  feedback: boolean;
  codingPlan: boolean;
  officialMcp: boolean;
  offPeak: boolean;
  marketplace: boolean;
  clientConfig: boolean;
}

export const OFFICIAL_SERVICE_KEYS: readonly OfficialServiceKey[] = [
  "account",
  "feedback",
  "codingPlan",
  "officialMcp",
  "offPeak",
  "marketplace",
  "clientConfig",
];

export function createDefaultOfficialServiceSwitches(): OfficialServiceSwitches {
  return {
    account: false,
    feedback: false,
    codingPlan: false,
    officialMcp: false,
    offPeak: false,
    marketplace: false,
    clientConfig: false,
  };
}

/** 进程级开关状态：宿主启动时从设置加载，设置变更时调用 setOfficialServiceSwitches 刷新。 */
let officialServiceSwitches: OfficialServiceSwitches = createDefaultOfficialServiceSwitches();

export function normalizeOfficialServiceSwitches(input: unknown): OfficialServiceSwitches {
  const next = createDefaultOfficialServiceSwitches();
  if (input && typeof input === "object") {
    const source = input as Record<string, unknown>;
    for (const key of OFFICIAL_SERVICE_KEYS) {
      if (source[key] === true) {
        next[key] = true;
      }
    }
  }
  return next;
}

export function setOfficialServiceSwitches(input: unknown): void {
  officialServiceSwitches = normalizeOfficialServiceSwitches(input);
}

export function getOfficialServiceSwitches(): OfficialServiceSwitches {
  return { ...officialServiceSwitches };
}

export function isOfficialServiceEnabled(key: OfficialServiceKey): boolean {
  return officialServiceSwitches[key] === true;
}

/** 任一官方功能开启即视为平台可用；用于不区分功能的历史判断。 */
export function isOfficialPlatformEnabled(): boolean {
  return OFFICIAL_SERVICE_KEYS.some((key) => officialServiceSwitches[key] === true);
}

export function assertOfficialServiceAvailable(key: OfficialServiceKey): void {
  if (!isOfficialServiceEnabled(key)) {
    throw new Error(
      `ZCodium 默认不连接官方平台，此功能未开启。可在设置的“官方服务”里打开；反馈请访问 ${ZCODIUM_ISSUES_URL}`,
    );
  }
}

/** 对话分享已下线：不提供开关，任何组合都不能恢复。 */
export function isConversationShareAvailable(): boolean {
  return false;
}

export function assertConversationShareRemoved(): void {
  throw new Error(`对话分享已在 ZCodium 下线。反馈请访问 ${ZCODIUM_ISSUES_URL}`);
}

export const ZCODIUM_ISSUES_URL = "https://github.com/ZCodium-project/ZCodium/issues";

export function assertOfficialPlatformAvailable(): void {
  if (!isOfficialPlatformEnabled()) {
    throw new Error(
      `ZCodium 默认不连接官方平台，此功能未开启。可在设置的“官方服务”里打开；反馈请访问 ${ZCODIUM_ISSUES_URL}`,
    );
  }
}

/** 仅阻断平台域名，保留用户自配的模型 API、代理和本地地址。 */
export function isOfficialPlatformUrl(input: string | URL): boolean {
  try {
    const host = new URL(String(input)).hostname.toLowerCase().replace(/\.$/, "");
    return ["zcode.z.ai", "cdn-zcode.z.ai"].some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

/** 平台路径与功能的对应关系；命中即代表该请求归属某个可开启功能。 */
const OFFICIAL_SERVICE_PATH_RULES: ReadonlyArray<{
  key: OfficialServiceKey;
  patterns: readonly RegExp[];
}> = [
  {
    key: "account",
    patterns: [
      /^\/api\/v1\/(oauth|login|logout|token|authorize|user|users|account|customer|organization|client\/claim)/,
    ],
  },
  { key: "feedback", patterns: [/^\/api\/v1\/feedback/] },
  {
    key: "codingPlan",
    patterns: [
      /^\/api\/v1\/(coding-plan|subscription|balance|billing|order|orders|claim|enterprise|pay|usage|zcode-plan)/,
    ],
  },
  { key: "officialMcp", patterns: [/^\/api\/v1\/mcp/] },
  { key: "offPeak", patterns: [/^\/api\/v1\/off-peak/, /\/off-peak/] },
  {
    key: "marketplace",
    patterns: [/^\/api\/v1\/(plugin|marketplace|scenes|preview|models)/, /^\/deps\//],
  },
  {
    key: "clientConfig",
    patterns: [
      /^\/api\/v1\/(client|configs|bootstrap|event|releases|manifest|report|remote-control|server-info)/,
    ],
  },
];

/**
 * 官方 URL 归属的功能键；返回 null 表示不归属任何可开启功能——分享与未知路径
 * 永远拒绝，只有明确登记的功能路径才可能随开关放行。
 */
export function resolveOfficialServiceForUrl(input: string | URL): OfficialServiceKey | null {
  let url: URL;
  try {
    url = new URL(String(input));
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const isCdn = host === "cdn-zcode.z.ai" || host.endsWith(".cdn-zcode.z.ai");
  const isPlatform = host === "zcode.z.ai" || host.endsWith(".zcode.z.ai");
  if (!isCdn && !isPlatform) {
    return null;
  }
  if (isCdn) {
    return "marketplace";
  }
  const path = url.pathname.toLowerCase();
  // 对话分享已下线：无论开关如何都拒绝。
  if (/(^|\/)share(\/|$)/.test(path)) {
    return null;
  }
  for (const rule of OFFICIAL_SERVICE_PATH_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(path))) {
      return rule.key;
    }
  }
  return null;
}

/** 出口拦截判断：非平台 URL 放行；平台 URL 按功能开关放行，未登记路径一律拒绝。 */
export function shouldBlockOfficialPlatformUrl(input: string | URL): boolean {
  if (!isOfficialPlatformUrl(input)) {
    return false;
  }
  const key = resolveOfficialServiceForUrl(input);
  if (key === null) {
    return true;
  }
  return !isOfficialServiceEnabled(key);
}

export function assertNoOfficialPlatformUrl(input: string | URL): void {
  if (isOfficialPlatformUrl(input)) assertOfficialPlatformAvailable();
}
