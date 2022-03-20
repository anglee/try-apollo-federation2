const { buildSubgraphSchema } = require("@apollo/subgraph");
const { ApolloServer, gql } = require("apollo-server");

const PORT = 4001;

const typeDefs = gql`
    extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: ["@key", "@requires", "@shareable"])

    type Query {
        me: User
    }

    type User @key(fields: "id") {
        id: ID!
        username: String!
    }
`;

const resolvers = {
  Query: {
    me(root, args, { fetchUserObjectById }) {
      console.log("query me()");
      return fetchUserObjectById("1");
    },
  },
  User: {
    __resolveReference(user, { fetchUserObjectById }) {
      console.log("__resolveReference", user);
      return fetchUserObjectById(user.id);
    },
    username: (userObject) => {
      console.log("User.username", userObject);
      return userObject.username;
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: {
    fetchUserObjectById: async (id) => {
      if (id === "1") {
        return {
          id: "1",
          username: "@namoi",
        };
      }
      if (id === "2") {
        return {
          id: "2",
          username: "@kenta",
        };
      }
    },
  },
});

server.listen(PORT).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
