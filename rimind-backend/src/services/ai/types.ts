export type IAiService = {
  ask: (question: string, context?: string) => Promise<string>;
};
