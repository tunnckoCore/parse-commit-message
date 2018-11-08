import mixinDeep from 'mixin-deep';

import { mentions, increment } from './plugins';
import { parse, stringify, validate, check } from './main';

import {
  parseHeader,
  stringifyHeader,
  validateHeader,
  checkHeader,
} from './header';

import {
  parseCommit,
  stringifyCommit,
  validateCommit,
  checkCommit,
} from './commit';

/**
 * Apply a set of `plugins` over all of the given `commits`.
 * A plugin is a simple function passed with `Commit` object,
 * which may be returned to modify and set additional properties
 * to the `Commit` object.
 *
 * _The `commits` should be coming from `parse`, `validate` (with `ret` option)
 * or the `check` methods._
 *
 * @name  .applyPlugins
 * @param {Array<Function>} plugins a simple function like `(commit) => {}`
 * @param {object|array} commits a value which should already be gone through `parse`
 * @returns {Array<Commit>} plus the modified or added properties from each function in `plugins`
 * @public
 */
export function applyPlugins(plugins, commits) {
  const plgs = [].concat(plugins).filter(Boolean);

  return commits.reduce((result, commit) => {
    const cmt = plgs.reduce((acc, fn) => {
      const res = fn(acc);
      return acc.concat(mixinDeep(acc, res));
    }, commit);

    return result.concat(cmt);
  }, []);
}

/**
 * An array which includes `mentions` and `increment` built-in plugins.
 * The `mentions` is an array of objects. Basically what's returned from
 * the [collect-mentions][] package.
 *
 * @example
 * import { plugins, applyPlugins, parse } from 'parse-commit-message';
 *
 * console.log(plugins); // =>  [mentions, increment]
 * console.log(plugins[0]); // => [Function mentions]
 * console.log(plugins[0]); // => [Function increment]
 *
 * const cmts = parse([
 *   'fix: foo @bar @qux haha',
 *   'feat(cli): awesome @tunnckoCore feature\n\nSuper duper baz!'
 *   'fix: ooh\n\nBREAKING CHANGE: some awful api change'
 * ]);
 *
 * const commits = applyPlugins(plugins, cmts);
 * console.log(commits);
 * // => [
 * //   {
 * //     header: { type: 'fix', scope: '', subject: 'foo bar baz' },
 * //     body: '',
 * //     footer: '',
 * //     increment: 'patch',
 * //     isBreaking: false,
 * //     mentions: [
 * //       { handle: '@bar', mention: 'bar', index: 8 },
 * //       { handle: '@qux', mention: 'qux', index: 13 },
 * //     ]
 * //   },
 * //   {
 * //     header: { type: 'feat', scope: 'cli', subject: 'awesome feature' },
 * //     body: 'Super duper baz!',
 * //     footer: '',
 * //     increment: 'minor',
 * //     isBreaking: false,
 * //     mentions: [
 * //       { handle: '@tunnckoCore', mention: 'tunnckoCore', index: 18 },
 * //     ]
 * //   },
 * //   {
 * //     header: { type: 'fix', scope: '', subject: 'ooh' },
 * //     body: 'BREAKING CHANGE: some awful api change',
 * //     footer: '',
 * //     increment: 'major',
 * //     isBreaking: true,
 * //     mentions: [],
 * //   },
 * // ]
 *
 * @name .plugins
 * @public
 */
export const plugins = [mentions, increment];

/**
 * An object (named set) which includes `mentions` and `increment` built-in plugins.
 *
 * @example
 * import { mappers, applyPlugins, parse } from 'parse-commit-message';
 *
 * console.log(mappers); // => { mentions, increment }
 * console.log(mappers.mentions); // => [Function mentions]
 * console.log(mappers.increment); // => [Function increment]
 *
 * const flat = true;
 * const parsed = parse('fix: bar', flat);
 * console.log(parsed);
 * // => {
 * //   header: { type: 'feat', scope: 'cli', subject: 'awesome feature' },
 * //   body: 'Super duper baz!',
 * //   footer: '',
 * // }
 *
 * const commit = applyPlugins([mappers.increment], parsed);
 * console.log(commit)
 * // => [{
 * //   header: { type: 'feat', scope: 'cli', subject: 'awesome feature' },
 * //   body: 'Super duper baz!',
 * //   footer: '',
 * //   increment: 'patch',
 * // }]
 *
 * @name .mappers
 * @public
 */
export const mappers = { mentions, increment };

export {
  // main
  parse,
  stringify,
  validate,
  check,
  // Only for header (the first line of commit message)
  parseHeader,
  stringifyHeader,
  validateHeader,
  checkHeader,
  // Whole commit message
  parseCommit,
  stringifyCommit,
  validateCommit,
  checkCommit,
};