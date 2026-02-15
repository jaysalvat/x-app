import filesize from 'rollup-plugin-filesize';
import pkg from './package.json' with { type: 'json' };

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
        filesize({
          showMinifiedSize: false
        })
      ]
    }
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
        filesize({
          showMinifiedSize: false
        })
      ]
    }
  ]
};

export default [ main, minified ];
