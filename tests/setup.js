import '@testing-library/jest-dom';
import zlib from 'node:zlib';

// Polyfill node:zlib decompress methods for undici compatibility in CI environments
if (zlib) {
  if (typeof zlib.createGunzip !== 'function') zlib.createGunzip = () => ({ pipe: () => {}, on: () => {} });
  if (typeof zlib.createInflate !== 'function') zlib.createInflate = () => ({ pipe: () => {}, on: () => {} });
  if (typeof zlib.createDeflate !== 'function') zlib.createDeflate = () => ({ pipe: () => {}, on: () => {} });
  if (typeof zlib.createBrotliDecompress !== 'function') zlib.createBrotliDecompress = () => ({ pipe: () => {}, on: () => {} });
}
