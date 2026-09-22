# ZCode 数据外发静态审计

审计日期：2026-09-22  
审计对象：以 `872ad960de7ec172591f7e1952f7849229f94521` 为上游基线，叠加本分支的审计版与确认门禁改动。
范围：第一方 `apps/`、`packages/`、`scripts/`、`config/` 源码和清单；不把 `node_modules/`、生成物和第三方许可证文本作为第一方实现结论的依据。

## 结论

没有发现第一方实现会在未经过用户发起业务操作的情况下，把整个工作区、Git 快照或工作区归档打包后上传到外部服务。未发现 `git push`、`git bundle` 或 `git archive` 被用于应用运行时的数据上传；发行打包产生的 tar/zip 仅写入本地发行目录。远端附件现仅在用户点击发送后暂存；更新检查和 Built-in Provider release 刷新默认不联网。

这不是“应用不会向网络发送任何数据”的结论。模型调用、账号登录、更新、远端工作区、会话分享、反馈、插件、MCP 和浏览器工具都可以发起网络请求，且部分功能会发送用户选择的文件。以下表格将这些边界按触发条件列出。发布说明不得把本报告写成“全部数据永不离开本机”。

## 审计方法

1. 对全仓库第一方源码检索 `snapshot`、`archive`、`zip`、`tar`、`upload`、`presign`、`signed URL`、`encrypt`、`cipher`、HTTP/WebSocket 与常见 Git 打包/推送调用。
2. 读取命中的网络、归档、凭据与附件实现，区分本地持久化、构建产物、用户发起的业务传输、已配置远端传输和自动后台请求。
3. 删除 ARMS RUM、OTLP、崩溃采集、资源/网络采样和 UI 埋点后，执行三组 `no-telemetry` 静态防回归测试。

`snapshot` 是本项目会话状态、数据库状态和 UI 投影中的普通术语，不能仅凭该词认定上传；本报告只将其与网络/归档实现联动检查。

## 不存在的路径

| 检查项                    | 结果   | 依据                                                                                                       |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| 自动工作区/Git 快照外传   | 未发现 | 第一方运行时代码中未发现将工作区打成 Git bundle/archive 后通过 HTTP、SSH 或对象存储上传的调用链。          |
| 遥测 SDK 与 OTLP exporter | 已删除 | `@arms/rum-electron`、OpenTelemetry 依赖、CLI `@zcode/telemetry` 包、初始化和环境变量注入均已移除。        |
| 崩溃转储上传              | 已删除 | Desktop crash capture、dump 归档和稳定性上报模块已删除。                                                   |
| 打包产物自动上传          | 未发现 | `scripts/build-zcode.mjs` 和 Desktop bundle 脚本仅在本地生成归档、摘要和安装包；发布上传属于显式维护流程。 |

## 加密与归档实现

| 路径                                                                     | 用途                                   | 网络行为                         |
| ------------------------------------------------------------------------ | -------------------------------------- | -------------------------------- |
| `packages/services/src/credential/providers/credentialCipherProvider.ts` | 本地凭据 AES-GCM 加密/解密             | 无网络调用。                     |
| `apps/zcode-cli/packages/adapters/src/auth/credential-cipher.ts`         | CLI 本地凭据加密/解密                  | 无网络调用。                     |
| `packages/desktop/src/main/chromeCookieManager.ts`                       | 显式导入浏览器 Cookie 时的本地解密     | 无网络调用。                     |
| `scripts/build-zcode.mjs`                                                | 本地复制运行时、生成 tar.gz 和 SHA-256 | 无上传实现。                     |
| `packages/services/src/feedback/compactLogArchive.ts`                    | 用户选择附加反馈日志时生成本地 zip     | 后续上传由反馈提交流程单独触发。 |

## 仍然存在的网络边界

| 场景                       | 触发条件与数据范围                                                                                                          | 关键实现                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 模型与 Provider API        | 用户发起 Agent/模型任务；提示词、上下文、工具结果和文件内容的实际发送范围由模型与工具调用决定                               | `apps/zcode-cli/packages/adapters/src/model/`、`packages/services/src/providers/`                                     |
| OAuth、订阅与客户端配置    | 登录、账号/套餐操作；部分客户端配置和帮助入口可在启动/设置期间请求服务                                                      | `apps/zcode-cli/packages/adapters/src/auth/`、`packages/services/src/client-config/`                                  |
| 自动更新与发行资源         | 用户点击“检查更新”后检查版本；用户确认下载后下载资源                                                                        | `packages/desktop/src/main/autoUpdater.ts`、`packages/zcode-server-cli/src/runtime/`                                  |
| 远端工作区及远程附件       | 用户建立 SSH/WSL/容器远端工作区后，会部署 Agent/资源；选取附件只保存草稿，首次点击发送才会暂存到远端                        | `packages/server/src/remote/`、`packages/desktop/src/host/promptAttachmentTransferService.ts`                         |
| 会话分享                   | 用户从分享界面勾选披露确认后，服务端创建准备记录并可上传选中的会话行和附件；附件上传可能早于最终公开确认完成                | `packages/ui/src/v4/ConversationShareConfirmationDock.tsx`、`packages/services/src/conversation-share/`               |
| 主动反馈                   | 用户提交反馈工单后，截图、附件或选择的日志可申请上传凭据并直传对象存储；后台上传可在表单收起后继续                          | `packages/ui/src/feedback/`、`packages/services/src/feedback/feedbackHttpClient.ts`                                   |
| 插件、MCP、浏览器/Web 工具 | 用户安装/配置的插件、MCP 服务及 Agent 执行的浏览器/网络工具可与各自目标通信                                                 | `apps/zcode-cli/packages/adapters/src/plugins/`、`apps/zcode-cli/packages/core/src/tool/handlers/webfetch-network.ts` |

## 需要明确的产品决定

1. 若产品不提供公开分享或反馈上传，应同时关闭 UI 入口、服务端接口和后台续传，不能只隐藏按钮。
2. 默认的模型、客户端配置和官方插件市场地址应在独立产品中逐项替换、禁用或向用户说明；它们不是遥测，但仍是联网。
3. MCP、插件、Hooks 和 Agent 工具属于可配置的任意代码执行边界。静态审计不能替代对安装来源、权限策略和运行时流量的控制。

## 防回归与验证边界

根脚本 `pnpm test:no-telemetry` 统一运行 CLI、Desktop 与 UI 的静态检查，并由 `pnpm verify:pre-push` 调用。检查阻止 ARMS、OpenTelemetry、OTLP exporter、遥测环境变量、Renderer IPC 上报桥和已删除的 CLI 遥测包重新进入已覆盖的模块。

本报告是源码静态审计：未对真实模型、第三方依赖、动态加载的插件/MCP、用户自定义 Provider、浏览器网页脚本或实际网络流量进行完整动态取证。生产发布前应在干净环境中，用允许列表代理或防火墙记录启动、空闲、发送任务、附件选择、远端连接、分享、反馈和更新的网络请求，并复核每项目的地与载荷。
