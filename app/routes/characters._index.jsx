import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {CacheShort} from '@shopify/hydrogen';

// Fetch and return API data with a Remix loader function
export async function loader({context}) {
  const {characters} = await context.rickAndMorty.query(CHARACTERS_QUERY, {
    cache: CacheShort(),
  });
  return json({characters});
}

// Render the component using data returned by the loader
export default function Characters() {
  const {characters} = useLoaderData();
  return (
    <div>
      <h1>Rick & Morty Characters</h1>
      <ul>
        {(characters.results || []).map((character) => (
          <li key={character.name}>{character.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Query the API for a list of characters
const CHARACTERS_QUERY = `#graphql:rickAndMorty
  query {
    characters(page: 1) {
      results {
        name
        id
      }
    }
  }
`;
