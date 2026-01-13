module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // strict rules: type must be one of [feat, fix, chore, docs, style, refactor, perf, test]
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test']],
  },
};
