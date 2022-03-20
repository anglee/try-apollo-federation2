var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import expressPlayground from 'graphql-playground-middleware-express';
const PORT = 4002;
const typeDefs = gql `
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
const resolvers = {
    Query: {
        topProduct(root, args, { fetchProductDataById }) {
            return '333';
        },
        you(root, args, { fetchUserDataById }) {
            return fetchUserDataById('2');
        },
    },
    Product: {
        __resolveReference(product, { fetchProductDataById }) {
            console.log('Product __resolveReference');
            return product.id;
        },
        id: (productId) => __awaiter(void 0, void 0, void 0, function* () {
            return productId;
        }),
        productName: (productId, args, { fetchProductDataById }) => __awaiter(void 0, void 0, void 0, function* () {
            const productInfo = yield fetchProductDataById(productId);
            return productInfo.productName;
        }),
    },
    User: {
        __resolveReference(user, { fetchUserDataById }) {
            console.log('User __resolveReference', user);
            return fetchUserDataById(user.id);
        },
        products: (userData) => {
            console.log('User.products resolver');
            console.log('userData', userData);
            return userData.productIds;
        },
    },
};
function listen(port) {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const httpServer = http.createServer(app);
        const context = {
            fetchUserDataById: (id) => __awaiter(this, void 0, void 0, function* () {
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
            }),
            fetchProductDataById: (id) => __awaiter(this, void 0, void 0, function* () {
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
            }),
        };
        const server = new ApolloServer({
            schema: buildSubgraphSchema({ typeDefs, resolvers }),
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
            context,
        });
        console.log('expressPlayground', expressPlayground);
        app.get('/playground', expressPlayground.default({ endpoint: '/graphql' }));
        yield server.start();
        server.applyMiddleware({ app });
        return new Promise((resolve, reject) => {
            httpServer.listen(port).once('listening', resolve).once('error', reject);
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield listen(PORT);
            console.log(`🚀 Server is ready at http://localhost:${PORT}/graphql`);
        }
        catch (err) {
            console.error('💀 Error starting the node server', err);
        }
    });
}
void main();
