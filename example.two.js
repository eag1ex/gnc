
/** 
 * - More in practice example use
*/

const { log, warn } = require('x-utils-es/umd')
const GNC = require('./index')()

//  NOTE will override below opts only of in storeType = GLOBAL
// global.GNC_SETTINGS = {
//     scopedRefMaxLength:200, // default 100
//     keepPerScope:20, // default 5
//     keepPerTotal:20 // default 5
// }

let opts = {
    keepPerTotal: 5, // how much cache to keep per total, checked on every $setCache call
    keepPerScope: 5, // how much cache to keep per each scope, it is also evaluate first and before keepPerTotal
    scopedRefMaxLength: 100,
    storeType: 'GLOBAL' // GLOBAL, or LOCAL
}

let debug = false // will enable more detailed output, to help debug
let gnc = new GNC(opts, debug)


function a(){
    let cache = gnc.$get('fn_a', Object.values(arguments)) 
    if(cache) {
        log('fn_a/ calling from cache')       
        return cache // same data
    }

    log('fn_a/initial')
    // else do this if not yet set or different
    let logic = (()=> 1+1)() // some logical operator
    gnc.$set('fn_a', Object.values(arguments),logic)
    return logic 
}

a(1,2,3); // initial
a(1,2,3); // call from cache
a(1,2,3); // call from cache


a(4,5,6); // initial
a(4,5,6); // call from cache
a(4,5,6); // call from cache

a(1,2,3); // call from cache
a(4,5,6); // call from cache


// reset as new instance with in GLOBAL setting
// opts.storeType ='LOCAL' << this would reset our cache to local and not remember on reset of instance
gnc = new GNC(opts, debug)  

a(1,2,3); // call from cache
a(4,5,6); // call from cache