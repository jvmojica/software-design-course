/** A lesson step after build-time rendering (markdown → HTML, code → highlighted HTML). */
export type RenderedStep = {
  title: string;
  bodyHtml: string;
  codeHtml?: string;
  sceneState: Record<string, unknown>;
};
