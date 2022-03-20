const { ApolloServer, gql } = require("apollo-server");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");
const { readFileSync } = require("fs");

// const schemaString = readFileSync('./supergraph.graphql').toString();
// const supergraphSdl = gql` ${schemaString} `;

// Initialize an ApolloGateway instance and pass it
// the supergraph schema
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "subgraph1", url: "http://localhost:4001" },
      { name: "subgraph2", url: "http://localhost:4002/graphql" },
      // ...additional subgraphs...
    ],
  }),
});

// Pass the ApolloGateway to the ApolloServer constructor
const server = new ApolloServer({
  gateway,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
