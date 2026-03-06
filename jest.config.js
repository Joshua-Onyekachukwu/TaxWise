module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  moduleNameMapper: {
    'pdfjs-dist/legacy/build/pdf.worker.mjs': '<rootDir>/test/mocks/pdf-worker.js',
  },
};
