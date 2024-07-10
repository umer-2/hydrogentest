import {createWithCache, CacheLong} from '@shopify/hydrogen';

export function createRickAndMortyClient({
  cache,
  waitUntil,
}) {
  const withCache = createWithCache({cache, waitUntil});

  async function query(
    query,
    options = {variables: {}, cache: CacheLong()},
  ) {
    return withCache(
      ['r&m', query, JSON.stringify(options.variables)],
      options.cache,
      async function () {
        // call to the API
        const response = await fetch('https://rickandmortyapi.com/graphql', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            variables: options.variables,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Error fetching from rick and morty api: ${response.statusText}`,
          );
        }

        const json = await response.json();

        return json.data;
      },
    );
  }

  return {query};
}
