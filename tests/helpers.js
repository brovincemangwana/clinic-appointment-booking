import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadPage(file) {
  const html = readFileSync(resolve(process.cwd(), file), 'utf8');
  document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
}

export const flush = () => new Promise((done) => setTimeout(done, 0));