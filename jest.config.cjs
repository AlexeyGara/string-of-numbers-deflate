const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {

  preset: 'ts-jest',

  testEnvironment: "node",

  roots: ['<rootDir>/src', '<rootDir>/test'],

  testMatch: [
    '<rootDir>/test/**/?(*.)+(spec|test).ts?(x)'
  ],

  moduleNameMapper: {
    '^Deflate$': '<rootDir>/src/Deflate.ts',
    '^Inflate$': '<rootDir>/src/Inflate.ts',
  },

  transform: {
    ...tsJestTransformCfg,
  },

};