import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import expressPlayground from 'graphql-playground-middleware-express';

const PORT = 4002;

const typeDefs = gql`
    extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: ["@key", "@requires", "@shareable", "@external"])

    type Query {
        topProduct: Product
        you: User!
    }

    type Product @key(fields: "id") {
        id: ID!
        productName: String!
    }

    type User @key(fields: "id") {
        id: ID!
        products: [Product]
    }
`;
interface IUserData {
  id: string;
  productIds: string[];
}
interface IProductInfo {
  id: string;
  productName: string;
}
interface IContext {
  fetchUserDataById: (userId: string) => Promise<IUserData>;
  fetchProductDataById: (productId: string) => Promise<IProductInfo>;
}

const resolvers = {
  Query: {
    topProduct(root: void, args: {}, { fetchProductDataById }: IContext): string {
      return '333';
    },
    you(root: void, args: {}, { fetchUserDataById }: IContext): Promise<IUserData> {
      return fetchUserDataById('2');
    },
  },
  Product: {
    __resolveReference(product: { id: string }, { fetchProductDataById }: IContext): string {
      console.log('Product __resolveReference');
      return product.id;
    },
    id: async (productId: string) => {
      return productId;
    },
    productName: async (productId: string, args: any, { fetchProductDataById }: IContext) => {
      const productInfo = await fetchProductDataById(productId);
      return productInfo.productName;
    },
  },
  User: {
    __resolveReference(user: { id: string }, { fetchUserDataById }: IContext): Promise<IUserData> {
      console.log('User __resolveReference', user);
      return fetchUserDataById(user.id);
    },
    products: (userData: IUserData) => {
      console.log('User.products resolver');
      console.log('userData', userData);
      return userData.productIds;
    },
  },
};

async function listen(port: number) {
  const app = express();
  const httpServer = http.createServer(app);
  const context: IContext = {
    fetchUserDataById: async (id: string) => {
      if (id === '1') {
        return {
          id: '1',
          productIds: ['222'],
        };
      }
      if (id === '2') {
        return {
          id: '2',
          productIds: ['111', '222'],
        };
      }
      throw new Error(`Unknown user ${id}`);
    },
    fetchProductDataById: async (id: string) => {
      if (id === '111') {
        return {
          id: '111',
          productName: 'Coke',
        };
      }
      if (id === '222') {
        return {
          id: '222',
          productName: 'Cheetos',
        };
      }
      if (id === '333') {
        return {
          id: '333',
          productName: 'Factorial',
        };
      }
      throw new Error(`Unknown product ${id}`);
    },
  };

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers } as any),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context,
  });

  console.log('expressPlayground', expressPlayground);
  app.get('/playground', (expressPlayground as any).default({ endpoint: '/graphql' }));

  await server.start();

  server.applyMiddleware({ app });

  return new Promise((resolve, reject) => {
    httpServer.listen(port).once('listening', resolve).once('error', reject);
  });
}

async function main() {
  try {
    await listen(PORT);
    console.log(`🚀 Server is ready at http://localhost:${PORT}/graphql`);
  } catch (err) {
    console.error('💀 Error starting the node server', err);
  }
}

void main();
