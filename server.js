// @ts-ignore
// Virtual entry point for the app
import * as remixBuild from 'virtual:remix/server-build';
import { cartGetIdDefault, cartSetIdDefault, createCartHandler, createStorefrontClient, storefrontRedirect, createCustomerAccountClient, } from '@shopify/hydrogen';
import { createRequestHandler, getStorefrontHeaders } from '@shopify/remix-oxygen';
import { AppSession } from '~/lib/session';
import { CART_QUERY_FRAGMENT } from '~/lib/fragments';
import { createRickAndMortyClient } from './app/lib/createRickAndMortyClient.server';
import { createProductClient } from './app/lib/createProductClient.server'; // Import the new client

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   */
  async fetch(request, env, executionContext) {
    try {
      /**
       * Open a cache instance in the worker and a custom session instance.
       */
      if (!env?.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is not set');
      }

      const waitUntil = executionContext.waitUntil.bind(executionContext);
      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        AppSession.init(request, [env.SESSION_SECRET]),
      ]);

      /**
       * Create Hydrogen's Storefront client.
       */
      const { storefront } = createStorefrontClient({
        cache,
        waitUntil,
        i18n: { language: 'EN', country: 'US' },
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request),
      });

      /**
       * Create a client for Customer Account API.
       */
      const customerAccount = createCustomerAccountClient({
        waitUntil,
        request,
        session,
        customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
        customerAccountUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
      });

      /*
       * Create a cart handler that will be used to
       * create and update the cart in the session.
       */
      const cart = createCartHandler({
        storefront,
        customerAccount,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
        cartQueryFragment: CART_QUERY_FRAGMENT,
      });

      const rickAndMorty = createRickAndMortyClient({
        cache,
        waitUntil,
      });

      const productClient = createProductClient({
        cache,
        waitUntil,
      }); 

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          session,
          storefront,
          customerAccount,
          cart,
          env,
          waitUntil,
          rickAndMorty,
          productClient, // Add the new client to the context
        }),
      });

      const response = await handleRequest(request);

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({ request, response, storefront });
      }

      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return new Response('An unexpected error occurred', { status: 500 });
    }
  },
};

/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
