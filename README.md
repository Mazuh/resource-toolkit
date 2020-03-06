<p align="center"><h1 align="center">
  resource-toolkit
</h1>

<p align="center">
  Async and RESTful resource management tool.
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/resource-toolkit"><img src="https://badgen.net/npm/v/resource-toolkit" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/resource-toolkit"><img src="https://badgen.net/npm/license/resource-toolkit" alt="license"/></a>
  <a href="https://www.npmjs.org/package/resource-toolkit"><img src="https://badgen.net/npm/dt/resource-toolkit" alt="downloads"/></a>
  <a href="https://codecov.io/gh/mazuh/resource-toolkit"><img src="https://badgen.net/codecov/c/github/mazuh/resource-toolkit" alt="codecov"/></a>
</p>

## About

Often we consume RESTful APIs, like for a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete), using reactive UIs (with React or not). And there are a few state scenarios always present and our UI demands some questions to be answered:
- Loading state
  - Is the loading a creation request and you want to disable or hide the creation form buttons?
  - Is the loading a reading operation and only a blinking skeleton is supposed to fill that table?
  - Or maybe you're updating a single row and you only want to disable that specific row action buttons with a cute spinning instead of disabling that creation form?
  - What if the loading is actually a deleting action?
  - And if all of that is happening at the same time?
  - Did you consider these loadings to have a minimal (and [pleasant](https://www.nngroup.com/articles/website-response-times/)) delay?
- Easy feedback for no data found
- Stacking error messages
- Repetitive fetching messages
  - For example, success messages for when something was successfully deleted
  - Another example, an error message when some specific request HTTP verb failed
- Data fetching itself
  - Bored of having to write the same `filter` when you remove elements for your data?
  - Or tired of writing the same `map` for editing?
  - Or being confused with all that spread and rest operations for adding new stuff?

While this is not a UI lib, it's a state helper to automate all of these state changes above.
It's type safed, has high test coverage (written with [TDD](https://en.wikipedia.org/wiki/Test-driven_development)).
Your code commits using this for repetitive CRUDs will be short, readable,
safer by [pure](https://en.wikipedia.org/wiki/Pure_function) automation. You'll be free to focus
on crafting other complex designed behaviours.

This lib is a composition mostly pure
functions (based on [Reducer pattern](https://kentcdodds.com/blog/the-state-reducer-pattern/)),
so It's also supposed to be easily integrated on any state manager you're using, like
[Redux](https://redux-toolkit.js.org/), [MobX](https://mobx.js.org/) or just raw
[React Hooks](https://reactjs.org/docs/hooks-overview.html) (or even class-based life cycle methods).

## Install

```bash
npm install --save resource-toolkit
```

## Example

On the next topic there is a dumb usage example. But you may already see a running To Do List application
here, crafted for didactic reasons with a friend:
https://github.com/Mazuh/octo-todo

## Usage

TODO

## Contributing

Please consult [CONTIRBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**resource-toolkit** © [Mazuh](https://github.com/mazuh), Released under the [MIT](./LICENSE) License.
