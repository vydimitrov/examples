const parseCSV = require('./parse-csv');
const utils = require('./utils');

async function importProducts({
  products,
  tenantId,
  shapeId,
  vatTypeId,
  treeParentId,
}) {
  const chunks = utils.chunkArray(products, 10);

  const productImportResult = [];

  for (let i = 0; i < chunks.length; i++) {
    const data = await utils.graphQLFetcher({
      query: `mutation importProducts($products: [CreateProductInput!]!) {
        product {
          createMany(input: $products) {
            id
            tree {
              parentId
              position
            }
          }
        }
      }`,
      variables: {
        products: products.map(product => ({
          ...product,
          tenantId,
          shapeId,
          vatTypeId,
          tree: {
            parentId: treeParentId,
          },
          name: [
            {
              language: 'en',
              translation: product.name,
            },
          ],
        })),
      },
    });

    productImportResult.push(data);
  }

  return productImportResult;
}

(async function run() {
  /**
   * Extract the products from the CSV file. It will map it to a data model
   * that matches the Crystallize product and variant model
   */
  const { success, error, products } = await parseCSV('/products.csv');

  if (!success) {
    throw new Error('something went wrong parsing the csv', error);
  } else {
    console.log(`Found ${products.length} product(s) for import`);

    const tenantId = await utils.getTenantId();

    const {
      shapeId,
      vatTypeId,
      rootItemId,
    } = await utils.getExtraProductProperties(tenantId);

    const importResult = await importProducts({
      products,
      tenantId,
      shapeId,
      vatTypeId,
      treeParentId: rootItemId,
    });

    console.log('\nProducts imported successfully\n');
    console.log(JSON.stringify(importResult, null, 2));
  }
})();
