const path = require('path');

const moduleRoot = path.resolve(__dirname, '..', '..');
const defaultConfigPath = path.resolve(moduleRoot, 'scripts/svg-assets.config.js');

function toPosixPath(value) {
  return String(value).replace(/\\/g, '/');
}

function resolveModulePath(value) {
  return path.resolve(moduleRoot, value);
}

function relativeToModule(value) {
  return toPosixPath(path.relative(moduleRoot, value));
}

module.exports = {
  defaultConfigPath,
  moduleRoot,
  relativeToModule,
  resolveModulePath,
  toPosixPath,
};
