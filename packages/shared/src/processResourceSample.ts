/** 进程资源样本的来源标识；兼容服务端资源查询协议，不包含事件上报。 */
export const PROCESS_RESOURCE_CLI_LANES = ["chat", "plugin", "mcp-status"] as const;
export type ProcessResourceCliLane = (typeof PROCESS_RESOURCE_CLI_LANES)[number];
