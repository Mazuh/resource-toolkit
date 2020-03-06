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

Often we consume RESTful APIs using reactive UIs with React, and there are a few state scenarios always present:
- Loading:
  - Is the loading a creation request and you want to disable or hide the creation form buttons?
  - Is the loading a reading operation and only a blinking skeleton is supposed to fill that table?
  - Or maybe you're updating a single row and you only want to disable that specific row action buttons with a cute spinning instead of disabling that creation form?
  - And if
- No data found
- Stacking error messages

While this is not a UI lib, it's a state helper to handle all of these state changes above.

## Install

```bash
npm install --save resource-toolkit
```

## Example

Below there are a dumb usage example, but you may alreadt see a running To Do List application here:
https://github.com/Mazuh/octo-todo

## Usage

TODO

## Contributing

Please consult [CONTIRBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**resource-toolkit** © [Mazuh](https://github.com/mazuh), Released under the [MIT](./LICENSE) License.
