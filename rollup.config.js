import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/bundle.js',
    format: 'umd',
    name: 'resource-toolkit',
  },
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
  ],
};
