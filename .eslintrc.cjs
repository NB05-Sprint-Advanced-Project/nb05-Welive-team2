/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist/', 'node_modules/'],
};

/*
eslint:recommended: 자바스크립트 기본 오류/버그 패턴(정의되지 않은 변수, 중복 선언 등) 위주
plugin:@typescript-eslint/recommended: TypeScript 전용 권장 규칙(타입 기반 실수, 불필요한 any 등)
prettier: 스타일 규칙 충돌 방지. 포맷은 Prettier가 맡도록
*/
