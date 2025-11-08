import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { transform } = require('enketo-transformer');

const xformPath = process.argv[2];
const outputPath = process.argv[3];

try {
  const xformXml = readFileSync(xformPath, 'utf8');
  const result = await transform({ xform: xformXml, markdown: true, media: {} });
  writeFileSync(outputPath, JSON.stringify({ form: result.form, model: result.model }));
  process.exit(0);
} catch(e) {
  writeFileSync(outputPath, JSON.stringify({ error: e.message }));
  process.exit(1);
}
