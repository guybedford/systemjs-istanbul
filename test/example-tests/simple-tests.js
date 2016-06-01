import expect from 'unexpected';

export default {
  'amd.js': async function() {
    let amd = await System.import('app/amd.js');
    expect(amd.fn(), 'to equal', 5);
  },

  'cjs.js': async function() {
    let cjs = await System.import('app/cjs.js');
    expect(cjs, 'to equal', 'hello world');
  },

  'es6.js': async function() {
    let es6 = await System.import('app/es6.js');
    let result = await es6.a();
    expect(result, 'to equal', 'first function');
  }
}