# try-apollo-federation2

Subgraph 1 (port :4001)
```shell
$ cd subgraph1 
$ yarn
$ yarn start
```

Subgraph 2 (port :4002)
```shell
$ cd subgraph2
$ yarn 
$ yarn run dev
```

Gateway (port :4003) 
```shell
$ cd gateway
$ yarn 
$ node index.js
```

Then go to http://localhost:4000
```
{
  me {
    id
    username
    products {
      productName
    }
  }
  you {
    id
    username
    products {
      productName
    }
  }
  topProduct {
    id
    productName
  }
}
```

# References

https://www.apollographql.com/docs/federation/v2/federated-types/overview


