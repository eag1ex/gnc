
const {log} = require('x-utils-es/umd')
const {getGlobal} = require('./libs/utils')
const GNC = require('./index')()

let opts = {
    scopedRefMaxLength:100,
    storeType:'GLOBAL'
}

let gnc = new GNC(opts, true)

// NOTE for objects as long as all same values exist, the order does NOT matter
// BUT! For arrays order does matter!
let props = {prop:1,name:'abc',values:[1,2,3]}
let prop2s = {name:'abc',values:[1,2,3],prop:1}

if(gnc.$setCache('1fn1',props,{data:[1,3,4,5,{a:1,b:2}]})){
    log('setCache is set')
}


//log(gnc.$getCache('fn1',prop2s))
log( getGlobal('fn1',gnc.genRef(prop2s)) ) // should be the same as gnc.$getCache with storeType==='GLOBAL'