
const { log, warn } = require('x-utils-es/umd')
const GNC = require('./index')()

let opts = {
    keepPerTotal: 1, // how mutch cache to keep per total, checked on every $setCache call
    keepPerScope: 5, // how mutch cache to keep per each scope, it is also evalueded first and before keepPerTotal
    scopedRefMaxLength: 100,
    storeType: 'GLOBAL' // GLOBAL, or LOCAL
}

let debug = false // will enable more detailed output, to help debug
let gnc = new GNC(opts, debug)

// initial reference defines the scope name
// let scopeName = 'fnOne'

/** 
 * Regarding same `propsRef` > for objects as long as same values exist order does NOT matter, 
 * except for arrays where it does!
 * 
 * example of a function arguments / property refs  > function(){ arguments } 
 * these props are converted to a string reference which helps to find inner scoped data
*/
let propsOne = 0 //{ prop: 1, name: 'abc', values: [1, 2, 3] }
let propsTwo = { name: 'a', values: [1, 2, 3], prop: 1 }
let propsThree = { name: 'ab', values: [1, 2, 3], prop: 2 }
let propFour = { name: 'abc', values: [1, 2, 3], prop: 3 }

// caching data output examples
let dataOutput_1 = { A: [1, 3, 4, { a: 1, b: 2 }] }
let dataOutput_2 = { B: [5, 6, 7, { c: 1, d: 2 }] }
let dataOutput_3 = { C: [8, 9, 10, { e: 1, f: 2 }] }
let dataOutput_4 = { D: [11, 12, 13, { g: 1, h: 2 }] }

// will return undefined, as nothing is yet available
// log({ $getCache:  gnc.$getCache('fnOne',propsTwo)  } ) 

// setting cache with scopeName and property reference (raw properties), and setting data desired outputs
if (gnc.$setCache('fnOne', propsOne, dataOutput_1)) {
    log('fnOne/setCache set')
}

if (gnc.$setCache('fnOne', propsTwo, dataOutput_2)) {
    log('fnOne/setCache set')
}

if (gnc.$setCache('fnTwo', propsThree, dataOutput_3)) {
    log('fnTwo/setCache set')
}

if (gnc.$setCache('fnTwo', propFour, dataOutput_4)) {
    log('fnTwo/setCache set')
}


// accesing cached data by scopeName and raw property reference

log({ $getCache: gnc.$getCache('fnOne', propsTwo) }) // return specific scope/reference cache by fn/arguments
log({ $getScope: gnc.$getScope('fnOne', true) }) // return all cached data for scopeName: fnOne, (optionally {true} means: return only data[] as array in the order created )
log({ $getAll: gnc.$getAll() }) //  return all available cache 



/**
 * NOTE if we re-declared the instance with `GLOBAL` setting on the same process, will give us access to the same cache and references!
*/
let gn2 = new GNC(opts, debug) 
log({ $getCache2:  gn2.$getCache('fnTwo',propFour)  } )
// etc