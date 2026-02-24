#!/usr/bin/env node

const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyEntry(sourceRoot, destRoot, relativePath) {
  const sourcePath = path.join(sourceRoot, relativePath);
  const destPath = path.join(destRoot, relativePath);

  if (!(await pathExists(sourcePath))) {
    return { relativePath, copied: false, reason: 'source_not_found' };
  }

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.cp(sourcePath, destPath, { recursive: true, force: true });

  return { relativePath, copied: true };
}

async function main() {
  const sourceRoot = process.argv[2] || '/Users/huithrive/nexspark/.tmp/NexSpark-main';
  const destRoot = process.argv[3] || '/Users/huithrive/nexspark/backend/strategist';

  const includePaths = [
    'src',
    'migrations',
    'tests',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    'wrangler.toml',
    'README.md',
    'CLAUDE.md'
  ];

  if (!fssync.existsSync(sourceRoot)) {
    throw new Error(`Source path does not exist: ${sourceRoot}`);
  }

  await fs.mkdir(destRoot, { recursive: true });

  const results = [];
  for (const relativePath of includePaths) {
    // Sequential copy keeps logging deterministic and easier to debug.
    // eslint-disable-next-line no-await-in-loop
    const result = await copyEntry(sourceRoot, destRoot, relativePath);
    results.push(result);
  }

  const copiedCount = results.filter(item => item.copied).length;
  const skipped = results.filter(item => !item.copied);

  const manifest = {
    importedAt: new Date().toISOString(),
    sourceRoot,
    destinationRoot: destRoot,
    copiedCount,
    includePaths,
    results
  };

  const manifestPath = path.join(destRoot, 'IMPORT_MANIFEST.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const localReadme = [
    '# Strategist Part I Import',
    '',
    'This directory is imported from `NexSpark-main.zip` as a reference and merge base for Strategist.',
    '',
    `- Source: \`${sourceRoot}\``,
    `- Imported at: \`${manifest.importedAt}\``,
    '- Manifest: `IMPORT_MANIFEST.json`',
    '',
    'Re-import command:',
    '',
    '```bash',
    'cd backend',
    'node scripts/import-strategist-part1.js',
    '```',
    ''
  ].join('\n');

  await fs.writeFile(path.join(destRoot, 'README_IMPORT.md'), localReadme, 'utf8');

  console.log(`Imported Strategist Part I into: ${destRoot}`);
  console.log(`Copied ${copiedCount}/${includePaths.length} entries`);

  if (skipped.length > 0) {
    console.log('\nSkipped entries:');
    skipped.forEach(item => {
      console.log(`- ${item.relativePath} (${item.reason})`);
    });
  }
}

main().catch((error) => {
  console.error('Import failed:', error.message);
  process.exit(1);
});
