// tslint:disable:no-import-side-effect

import 'whatwg-fetch';

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
if (process.env.NODE_ENV === 'test') {
  import('raf')
    .then((raf) => {
      raf.default.polyfill(global);
    });
}
