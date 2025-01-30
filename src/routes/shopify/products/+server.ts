

/*  
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_ADMIN_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_products'],
  hostName: 'https://solvd-testing.myshopify.com',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});
export const GET = async ({ request }) => {
  try {
    const queryString = `{
      products(first: 5) {
        edges {
          node {
            id
            handle
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }`;
// @ts-ignore
    const client = new shopify.clients.Graphql({session: {accessToken: SHOPIFY_ADMIN_API_KEY, shop: 'solvd-testing.myshopify.com'}});
    const products = await client.query({
      data: queryString,
    });

    return json(products);
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return json({ error: 'Failed to fetch products' }, { status: 500 });
  }
};
*/