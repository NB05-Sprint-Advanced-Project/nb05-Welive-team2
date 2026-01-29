export interface IWorkerExternal {
  register(workerScriptPath: string, workerData: unknown): Promise<unknown>;
}
