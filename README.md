<p align="center"><h1 align="center">
  resource-toolkit
</h1>

<p align="center">
  Async resource management util.
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/resource-toolkit"><img src="https://badgen.net/npm/v/resource-toolkit" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/resource-toolkit"><img src="https://badgen.net/npm/license/resource-toolkit" alt="license"/></a>
  <a href="https://www.npmjs.org/package/resource-toolkit"><img src="https://badgen.net/npm/dt/resource-toolkit" alt="downloads"/></a>
  <a href="https://codecov.io/gh/mazuh/resource-toolkit"><img src="https://badgen.net/codecov/c/github/mazuh/resource-toolkit" alt="codecov"/></a>
</p>

## About

TODO

## Install

```bash
npm install --save resource-toolkit
```

## Usage

TODO

## Example

The snippet below is an example of integration with [Redux](https://redux.js.org/)
using [Ducks pattern](https://redux.js.org/style-guide/style-guide/#structure-files-as-feature-folders-or-ducks)
to create a simple state manager.

```js
import { makeReduxAssets } from 'resource-toolkit';

export const userResource = makeReduxAssets({
  name: 'USER',
  idKey: 'id', // what property will serve to uniquelly identify each resource object?
  gateway: {
    readMany: async (queryset) => {
      // example with a restful API client, but...
      // it can be any fetching (maybe querying from local storage?)
      const response = await UserAPI.get(queryset);
      const body = await response.json();
      // my array of data may be nested in JSON body, or have another weird
      // business logic after response so I have my change to implement it here.
      return body.items;
    },
  },
});

export const initialState = {
  ...userResource.initialState,
  // (maybe I want to insert more fields here...)
};

const actions = {
  ...userResource.actions,
  // (any other action creator functions I may want...)
};

// cute naming, it'll be useful to mapDispatchToProps
// if I'm using it with React
export const userActions = actions;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case userResource.actionType:
      return userResource.reducer(state, action);
    // (any other own custom handlers here, if they exist...)
    default:
      return state;
  }
}
```

Below, the same state slice, but it's a snippet in case you don't want custom actions nor
reducers for your regular CRUD:

```js
import { makeReduxAssets } from 'resource-toolkit';

export const userResource = makeReduxAssets({
  name: 'USER',
  idKey: 'id',
  gateway: {
    readMany: async (queryset) => {
      // it's still up to you here
      const response = await UserAPI.get(queryset);
      const body = await response.json();
      return body.items;
    },
  },
});

export const initialState = userResource.initialState;

const actions = userResource.actions;
export const userActions = actions;

export userResource.reducer;
```

An example of state content, all fully handled by the `reducer` without your interference
besides implementing the gateway layer:

```js
{
  items: [], // it'll store the objects retrieved and parsed by your gateway functions
  isCreating: false, // bool if a creation thunk is pending
  isReadingBlindly: false, // bool if a reading thunk is pending but the client is unaware of its ids
  reading: [], // if reading thunk already knows the ids of what is being retrieved, it'll be stored here
  updating: [], // to store ids of what entities are being currently updated
  deleting: [], // to store ids of what entities are being currently deleted
  finishingLogs: [], // to store all logs (you can leave the default parser or implement it you by yourself)
  currentMessage: null, // last log (if it's an error, it may include the original exception for debugging)
}
```

## Contributing

Please consult [CONTIRBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**resource-toolkit** © [Mazuh](https://github.com/mazuh), Released under the [MIT](./LICENSE) License.
