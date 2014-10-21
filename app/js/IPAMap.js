/**
 * Represents the general location of the IPA symbols, in regressed MFCCs.
 * The first value represents frontness and backness, and the second
 * value represents height.
 *
 * @example
 * var a = IPAMap['a'];
 * var backness = a[0];
 * var height = a[1];
 *
 * @TODO: Switch this to use VowelWorm's location markers
 * @TODO: This is really inaccurate
 */
define({
  'iː': [-0.4, 1.2]
});
