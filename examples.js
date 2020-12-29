
const { log } = require('x-utils-es/umd')
const { getGlobal } = require('./libs/utils')
const GNC = require('./index')()

let opts = {
   // keepPerTotal: 5,
   //  keepPerScope:1,
    scopedRefMaxLength: 100,
    storeType: 'LOCAL'
}

let gnc = new GNC(opts, false)

// NOTE for objects as long as all same values exist, the order does NOT matter
// BUT! For arrays order does matter!
let props = 0//{ prop: 1, name: 'abc', values: [1, 2, 3] }
let prop2s = { name: 'a', values: [1, 2, 3], prop: 1 }
let prop3s = { name: 'ab', values: [1, 2, 3], prop: 2 }
let prop4s = { name: 'abc', values: [1, 2, 3], prop: 3 }

if (gnc.$setCache('1fn1', props, { A: [1, 3, 4, { a: 1, b: 2 }] })) {
    log('setCache is set')
}

if (gnc.$setCache('1fn1', prop2s, { B: [5, { a: 1, b: 2 }] })) {
    log('setCache is set')
}

// if (gnc.$setCache('1fn2', prop2s, { c: [5, { a: 1, b: 2 }] })) {
//     log('setCache is set')
// }

// if (gnc.$setCache('1fn1', prop2s, { d: [5, { a: 1, b: 2 }] })) {
//     log('setCache is set')
// }

// if (gnc.$setCache('1fn1', prop3s, { D: [1, 3, { a: 1, b: 2 }] })) {
//     log('setCache is set')
// }

// if (gnc.$setCache('1fn1', prop4s, { D: [1, { a: 1, b: 2 }] })) {
//     log('setCache is set')
// }

log(gnc.$getScope('1fn1',true))
//log(gnc.gncStore)
//log(gnc.$getCache('1fn1',prop2s))
//log(getGlobal('1fn1', gnc.genRef(prop2s))) // should be the same as gnc.$getCache with storeType==='GLOBAL'