import type { Config } from "dompurify";
export type SanitizerConfig = Config;

type DOMPurifyLike = {
  sanitize: (dirty: string, cfg?: Config) => string | Node;
  addHook: (hook: string, cb: (node: Element) => void) => void;
};

let domPurifyInstance: DOMPurifyLike | null = null;

const getDOMPurify = (): DOMPurifyLike | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (domPurifyInstance) {
    return domPurifyInstance;
  }

  // Load DOMPurify only in browser runtime to avoid pulling jsdom on server.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const createDOMPurify = require("dompurify");
  domPurifyInstance = createDOMPurify(window) as DOMPurifyLike;
  return domPurifyInstance;
};

const BASE_FORBIDDEN: Config = {
  FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "base", "form", "meta"],
  FORBID_ATTR: [
    "onerror", "onload", "onclick", "onmouseover", "onfocus", 
    "onblur", "onchange", "onsubmit", "onkeydown", "onkeypress",
    "action", "formaction", "xlink:href"
  ],
  ALLOW_DATA_ATTR: false,
  USE_PROFILES: { html: true, svg: true, svgFilters: true },
};

export const IMAGE_SAFE_CONFIG: Config = {
  ...BASE_FORBIDDEN,
  ALLOWED_TAGS: ["img", "figure", "figcaption", "svg", "path", "circle", "rect"],
  ALLOWED_ATTR: [
    "src", "alt", "title", "width", "height", "loading", 
    "className", "viewBox", "d", "fill", "stroke"
  ],
  // Hanya izinkan protokol aman
  ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|[^&:\/?#]*(?:[\/?#]|$))/i,
};

export const DOCUMENT_SAFE_CONFIG: Config = {
  ...BASE_FORBIDDEN,
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6", 
    "p", "br", "hr", "div", "span",
    "ul", "ol", "li", 
    "b", "strong", "i", "em", "u", "s", "del", "ins",
    "blockquote", "code", "pre",
    "a", "img", "table", "thead", "tbody", "tr", "th", "td"
  ],
  ALLOWED_ATTR: [
    "href", "src", "alt", "title", "target", "rel", 
    "class", "className", "id", "width", "height", "align"
  ],
  ADD_ATTR: ["target", "rel"],
};

export const sanitizeHtml = (
  html: string,
  config: Config = DOCUMENT_SAFE_CONFIG
): string => {
  const DOMPurify = getDOMPurify();
  if (!DOMPurify) {
    return stripHtml(html);
  }

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
    
    if (node.tagName === "IMG") {
      const width = node.getAttribute("width");
      const height = node.getAttribute("height");
      if ((width === "1" && height === "1") || (width === "0" || height === "0")) {
        node.setAttribute("style", "display:none !important");
      }
    }
  });

  const clean = DOMPurify.sanitize(html, config);
  return typeof clean === "string" ? clean : "";
};

export const stripHtml = (html: string): string => {
  const DOMPurify = getDOMPurify();
  if (DOMPurify) {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }) as string;
  }

  return html.replace(/<[^>]*>/g, "").trim();
};

const BANNED_EXTENSIONS = [
  ".js", ".mjs", ".cjs",
  ".ts", ".tsx",
  ".php", ".py", ".rb", ".pl", ".lua",
  ".sh", ".bash", ".zsh", ".fish",
  ".bat", ".cmd", ".ps1", ".psm1",
  ".exe", ".dll", ".so", ".bin",
  ".html", ".htm", ".xhtml",
  ".xml", ".svg" // SVG diblokir di upload karena bisa mengandung script
];

const BANNED_MIME_TYPES = [
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "text/x-python",
  "application/x-python-code",
  "application/x-sh",
  "application/x-shellscript",
  "application/x-httpd-php",
];

const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const isSafeFile = (file: File): { safe: boolean; reason?: string } => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const bannedExt = BANNED_EXTENSIONS.find(ext => fileName.endsWith(ext));
  if (bannedExt) {
    const ext = bannedExt.replace(".", "");
    return { safe: false, reason: `File .${ext} tidak diizinkan demi keamanan sistem.` };
  }
  if (BANNED_MIME_TYPES.includes(mimeType)) {
    return { safe: false, reason: "Tipe file ini berpotensi berbahaya dan tidak diizinkan." };
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { safe: false, reason: "Tipe file tidak didukung. Gunakan PNG, JPG, PDF, atau dokumen Office." };
  }

  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { safe: false, reason: "Ukuran file terlalu besar (Maksimal 10MB)." };
  }

  return { safe: true };
};

export const getSecureDownloadUrl = (url: string) => {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}download=1`;
};
