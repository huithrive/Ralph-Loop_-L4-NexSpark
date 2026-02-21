/**
 * URL Reader Service — fetches and extracts text from URLs and HTML files
 */

var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');

var BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetch content from a URL
 * @param {string} url
 * @returns {Promise<{title: string, text: string, sections: string[]}>}
 */
function fetchUrlContent(url) {
  return new Promise(function(resolve, reject) {
    var lib = url.startsWith('https') ? https : http;
    var options = {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
      },
      timeout: 15000
    };

    lib.get(url, options, function(res) {
      // Follow redirects (up to 3)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        var redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          var parsed = new URL(url);
          redirectUrl = parsed.origin + redirectUrl;
        }
        return fetchUrlContent(redirectUrl).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode));
      }

      var chunks = [];
      res.on('data', function(chunk) { chunks.push(chunk); });
      res.on('end', function() {
        var html = Buffer.concat(chunks).toString('utf-8');
        var result = extractTextFromHtml(html);
        resolve(result);
      });
      res.on('error', reject);
    }).on('error', reject).on('timeout', function() {
      reject(new Error('Request timed out'));
    });
  });
}

/**
 * Extract meaningful text from HTML
 * @param {string} html
 * @returns {{title: string, text: string, sections: string[]}}
 */
function extractTextFromHtml(html) {
  // Extract title
  var titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  var title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Remove script, style, nav, footer, header tags
  var cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Extract sections from headings
  var sections = [];
  var headingRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  var match;
  while ((match = headingRegex.exec(cleaned)) !== null) {
    var heading = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (heading) sections.push(heading);
  }

  // Strip all HTML tags and normalize whitespace
  var text = cleaned
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Truncate to ~8000 chars to stay within context limits
  if (text.length > 8000) {
    text = text.substring(0, 8000) + '\n\n[Content truncated — ' + text.length + ' total characters]';
  }

  return { title: title, text: text, sections: sections };
}

/**
 * Read a local HTML or text file
 * @param {string} filePath
 * @returns {Promise<{title: string, text: string, sections: string[]}>}
 */
function readLocalFile(filePath) {
  return new Promise(function(resolve, reject) {
    var absPath = path.resolve(filePath);
    fs.readFile(absPath, 'utf-8', function(err, content) {
      if (err) return reject(err);
      var ext = path.extname(filePath).toLowerCase();
      if (ext === '.html' || ext === '.htm') {
        resolve(extractTextFromHtml(content));
      } else {
        // Plain text
        var text = content.length > 8000
          ? content.substring(0, 8000) + '\n\n[Truncated — ' + content.length + ' chars]'
          : content;
        resolve({ title: path.basename(filePath), text: text, sections: [] });
      }
    });
  });
}

module.exports = {
  fetchUrlContent: fetchUrlContent,
  extractTextFromHtml: extractTextFromHtml,
  readLocalFile: readLocalFile
};
