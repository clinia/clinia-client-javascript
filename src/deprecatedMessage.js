module.exports = function deprecatedMessage(previousUsage, newUsage) {
  const githubAnchorLink = previousUsage.toLowerCase().replace(/[\.\(\)]/g, '');

  return `cliniasearch: \`${previousUsage}\` was replaced by \`${newUsage}\`. Please see https://github.com/clinia/cliniasearch-client-javascript/wiki/Deprecated#${githubAnchorLink}`;
};
