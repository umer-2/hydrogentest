import { createWithCache, CacheLong } from '@shopify/hydrogen';

export function createProductClient({ cache, waitUntil }) {
  const withCache = createWithCache({ cache, waitUntil });

  async function query(options = { variables: {}, cache: CacheLong() }) {
    return withCache(
      ['products', JSON.stringify(options.variables)],
      options.cache,
      async function () {
        // Basic Authentication header
        const headers = new Headers();
        headers.set('Authorization', 'Basic ' + btoa('tacuiar:angola-tacuiar-fluxoreal-2024-12VsdzDo'));

        // call to the API
        const response = await fetch('http://fluxoreal-api.online/v1/fluxoreal/ao/products?page=1&pageSize=20', {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Error fetching from product API: ${response.statusText}`);
        }

        const json = await response.json();

        return json;
      },
    );
  }

  return { query };
}
