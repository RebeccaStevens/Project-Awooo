/**
 * In production, we register a service worker to serve assets from local cache.
 *
 * This lets the app load faster on subsequent visits in production, and gives
 * it offline capabilities. However, it also means that developers (and users)
 * will only see deployed updates on the 'N+1' visit to a page, since previously
 * cached resources are updated in the background.
 *
 * To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
 * This link also includes instructions on opting out of this behavior.
 */

import foreach from 'callbag-for-each';
import sourceFromEvent from 'callbag-from-event';
import pipe from 'callbag-pipe';
import take from 'callbag-take';
import promiseFromEvent from 'event-to-promise';
import * as httpStatusCodes from 'http-status-codes';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  ) !== null
);

/**
 * Register the service worker.
 */
export async function register(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return Promise.reject(new Error('Browser does not support service workers.'));
  }

  if (process.env.NODE_ENV !== 'production') {
    return Promise.reject(new Error('Not in production environment.'));
  }

  if (process.env.PUBLIC_URL === undefined) {
    return Promise.reject(new Error('PUBLIC_URL not set.'));
  }

  const relativePublicUrl = process.env.PUBLIC_URL;
  const publicUrl = new URL(relativePublicUrl, window.location.toString());

  if (publicUrl.origin !== window.location.origin) {
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
    return Promise.reject(new Error(`Cross origin "${publicUrl.origin}" !== "${window.location.origin}".`));
  }

  await promiseFromEvent(window, 'load');

  const swUrl = `${relativePublicUrl}/service-worker.js`;

  if (isLocalhost) {
    // This is running on localhost. Lets check if a service worker still exists or not.
    await checkValidServiceWorker(swUrl);

    // Add some additional logging to localhost, pointing developers to the
    // service worker/PWA documentation.
    await navigator.serviceWorker.ready;
    console.info(
`This web app is being served cache-first by a service worker.
To learn more, visit https://goo.gl/SC7cgQ`
    );
  } else {
    // Is not local host. Just register service worker
    await registerValidSW(swUrl);
  }
}

/**
 * Check if the service worker can be found.
 * If so, register it, otherwise reload the page.
 */
async function checkValidServiceWorker(swUrl: string): Promise<void> {
  const response = await fetch(swUrl);

  const contentType = response.headers.get('content-type');

  // Ensure service worker exists, and that we really are getting a JS file.
  if (
    response.status === httpStatusCodes.NOT_FOUND ||
    contentType === null ||
    contentType.indexOf('javascript') === -1
  ) {
    // No service worker found. Probably a different app. Reload the page.
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    window.location.reload();
  } else {
    // Service worker found. Proceed as normal.
    await registerValidSW(swUrl);
  }
}

/**
 * Register the service worker at the given url.
 *
 * @param url The path to the service worker.
 */
async function registerValidSW(url: string): Promise<void> {
  const registration = await navigator.serviceWorker.register(url);

  pipe(
    sourceFromEvent(registration, 'updatefound'),
    foreach<Event>((updateFound) => {
      // tslint:disable-next-line:no-non-null-assertion
      const installingWorker = (updateFound.target! as ServiceWorkerRegistration).installing;

      if (installingWorker === null) {
        console.warn('No service worker found.');
        return;
      }

      if (installingWorker.state !== 'installing') {
        console.warn(`Service worker not in state "installing". Is currently in state ${installingWorker.state}`);
        return;
      }

      pipe(
        sourceFromEvent(installingWorker, 'statechange'),
        take(1),  // The next state should be 'installed' - therefore only take the next event.
        foreach<Event>((stateChange) => {
          // tslint:disable-next-line:no-non-null-assertion
          const updatedState = (stateChange.target! as ServiceWorker).state;

          if (updatedState === 'installed') {
            if (navigator.serviceWorker.controller === null) {
              console.info('Content is cached for offline use.');
            } else {
              console.info('New content is available; please refresh.');
            }
          } else {
            console.error(
`Service Worker didn\'t change state from "installing" to "installed".
Instead it went from "installing" to "${updatedState}"`
            );
          }
        })
      );
    })
  );
}

/**
 * Unregister the service worker.
 */
export async function unregister(): Promise<boolean> {
  // Service worker not supported? Don't need to do anything.
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.unregister();
}
