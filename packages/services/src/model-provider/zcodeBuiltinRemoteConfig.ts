import { downloadZCodeBuiltinRelease, type ZCodeBuiltinRelease } from "@zcode/provider-node";
import { assertOfficialServiceAvailable, type ApiClient } from "@zcode/shared";

interface FetchZCodeBuiltinRemoteReleaseOptions {
  readonly apiClient: ApiClient;
  readonly endpointOrigin: string;
  readonly appVersion: string;
  readonly platform: string;
  readonly signal?: AbortSignal;
}

/** Services 仅注入既有网络装配；URL、预算与 Release 校验由 provider-node 唯一实现。 */
export async function fetchZCodeBuiltinRemoteRelease(
  options: FetchZCodeBuiltinRemoteReleaseOptions,
): Promise<ZCodeBuiltinRelease | null> {
  // Built-in Provider 的后台刷新会在 Host 启动后运行；默认策略必须在请求 adapter 前拒绝，
  // 否则未操作应用也会向官方 endpoint 发送版本和平台信息。
  assertOfficialServiceAvailable("clientConfig");
  return downloadZCodeBuiltinRelease({
    endpointOrigin: options.endpointOrigin,
    appVersion: options.appVersion,
    platform: options.platform,
    signal: options.signal,
    request: (url, init) => options.apiClient.request(url, init),
  });
}
