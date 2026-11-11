// Expand paths in JavaScript so Node 20 and Windows run the same suite.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const directory = path.join(__dirname, '__tests__');
const files = fs.readdirSync(directory).filter(name => name.endsWith('.test.js')).map(name => path.join(directory, name));
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
