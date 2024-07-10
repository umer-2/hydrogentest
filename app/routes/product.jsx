import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { CacheShort } from '@shopify/hydrogen';

// Fetch and return API data with a Remix loader function
export async function loader({ context }) {
  const products = await context.productClient.query({
    cache: CacheShort(),
  });
  return json({ products });
}

// Render the component using data returned by the loader
export default function Products() {
  const { products } = useLoaderData();
  return (
    <div>
    <h1 style={{textAlign : 'center', backgroundColor : '#D3D3D3', padding : '10px', color : 'black'}}>API Product List</h1>
    <div  style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',}}>
      {products.map((product, index) => (
        <div key={product.id ? product.id : index} style={{ paddingBottom: '20px', borderRadius: '5px',paddingLeft : '20px', paddingRight : '20px' }}>
          <img src={product.imageUrl} alt={product.name} style={{ width: '400px', height: '400px',paddingBottom : '15px' }} />
           <h4><a href='#' style={{fontSize : '16px', fontWeight : 'bold'}}>{product.familyName}</a></h4>
           <a href='#' style={{fontSize : '14px'}}>{product.price}</a>
           <p>{product.brand}</p>
        </div>

      ))}
    </div>
  </div>
  );
}
