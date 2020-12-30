

const { log, warn } = require('x-utils-es/umd')
const GNC = require('./index')()

let opts = {
    keepPerTotal: 1, // how much cache to keep per total, checked on every $setCache call
    keepPerScope: 1, // how much cache to keep per each scope, it is also evaluate first and before keepPerTotal
    scopedRefMaxLength: 100,
    storeType: 'GLOBAL' // GLOBAL, or LOCAL
}

let debug = false // will enable more detailed output, to help debug
let gnc = new GNC(opts, debug)


let scopeName = 'fnOne'
let props = { name: 'a', values: [1, 2, 3], prop: 1 }
let dataOutput = { A: [1, 3, 4, { a: 1, b: 2 }] }

if ( gnc.$setCache(scopeName, props, dataOutput) )  console.log('fnOne/setCache set')

// set or not give us output of fnOne. Returns > dataOutput
gnc.$getCache(scopeName, props) 

// return all data as array[] from scopeName: fnOne
gnc.$getScope(scopeName, true)

// return raw data from all scopes
log( gnc.$getAll())
/**
 * example output:
   { fnOne:
    { 'eyJuYW1lIjoiYSIsInByb3AiOjEsInZhbHVlcyI6WzEsMiwzXX0=':
        { data: { A: [ 1, 3, 4, [Object], [length]: 4 ] },
            timestamp: 1609332760702 } } } 

 */

let gnc2 = new GNC(opts, debug) // if storeType==='GLOBAL
gnc2.$getCache('fnOne', { name: 'a', values: [1, 2, 3], prop: 1 }) // then will return same cache