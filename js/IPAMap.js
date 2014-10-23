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
  'i': [0.45, 2],
  'e': [0.8, 1.9]
});
