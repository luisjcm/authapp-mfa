// server/src/utils/templates.js
const fs = require('fs');
const path = require('path');

/**
 * Render simple tipo mustache:
 * - Reemplaza {{key}}
 * - Soporta bloques condicionales: {{#if key}}...{{/if}}
 */
function renderTemplate(fileName, data = {}) {
  const filePath = path.join(__dirname, '..', 'templates', fileName);
  let html = fs.readFileSync(filePath, 'utf8');

  // Bloques condicionales {{#if key}}...{{/if}}
  html = html.replace(/{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g, (_, key, inner) => {
    const val = get(data, key);
    return truthy(val) ? inner : '';
  });

  // Variables simples {{key}}
  html = html.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const val = get(data, key);
    return val != null ? String(val) : '';
  });

  return html;
}

function get(obj, pathStr) {
  return pathStr.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
}

function truthy(v) {
  if (v === false || v === 0 || v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim() !== '';
  return true;
}

module.exports = { renderTemplate };
