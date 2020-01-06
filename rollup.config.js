import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';

import pkg from './package.json';

const name = pkg.name.split('/').pop();
const className = name.replace('x-', 'X');
const dist = './dist';
const entrypoint = `./src/${name}.js`;
const date = new Date();

const bannerFull = `
/**!
* ${name} — ${pkg.description}
* https://github.com/jaysalvat/x-app
* @version ${pkg.version} built ${date.toISOString().replace(/[TZ]/g, ' ')}
* @license MIT
* @author Jay Salvat http://jaysalvat.com
*/`;

const bannerLight = `
/*!
 * ${name} v${pkg.version}
 * https://github.com/jaysalvat/x-app
 */`;

const watched = process.env.ROLLUP_WATCH;

const main = {
  input: entrypoint,
  output: [
    {
      name: className,
      file: `${dist}/${name}.js`,
      format: 'umd',
      sourcemap: watched,
      banner: !watched && bannerFull,
      plugins: [
        terser({
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2,
            braces: true
          }
        }),
        filesize({
          showMinifiedSize: false
        })
      ]
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};

const minified = {
  input: entrypoint,
  output: [
    {
      name: className,
      file: `${dist}/${name}.min.js`,
      format: 'umd',
      sourcemap: watched,
      banner: !watched && bannerLight,
      plugins: [
        terser({
          mangle: {
            eval: true,
            toplevel: true
          },
          compress: {
            toplevel: true,
            reduce_funcs: true,
            keep_infinity: true,
            pure_getters: true,
            passes: 10
          }
        }),
        filesize({
          showMinifiedSize: false
        })
      ]
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};

const configs = [ main, minified ];

// if (true) {
//   configs.push(minified);
// }

module.exports = configs;
