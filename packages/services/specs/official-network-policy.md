# 官方网络出口策略

## 规则

- `officialPlatformPolicy` 是官方服务联网许可的唯一 owner。所有对 ZCode Built-in 远端 release 的刷新在读取 URL、版本或调用请求 adapter 前，必须执行 `assertOfficialServiceAvailable("clientConfig")`。
- 默认开关为关闭。Provider Registry 可继续读取随包配置和本地缓存；后台刷新被拒绝时不得回退到任何网络路径。
- Services Host 与 standalone CLI 复用同一策略。用户启用官方客户端配置后，现有 release 校验、超时和缓存规则不变。

## 验收

- 默认策略下，注入的 release downloader 不会被调用。
- Services 与 CLI 的两个 `fetchRelease` 装配点均包含策略断言。
- `no-official-platform`、TypeScript、lint 与架构检查通过。
