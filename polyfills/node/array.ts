/**
 * Array polyfills.
 */

// Array.prototype.flatMap
import flatMap from 'array.prototype.flatmap';
if (Array.prototype.flatMap === undefined) {
  Array.prototype.flatMap = flatMap.shim();
}
