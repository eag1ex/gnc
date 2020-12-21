
const {log} = require('x-utils-es/umd')
const {getGlobal} = require('./libs/utils')
const GNC = require('./index')()

let opts = {
    scopedRefMaxLength:100,
    storeType:'GLOBAL'
}
let gnc = new GNC(opts, true)

let props = {prop:1,name:'abc',values:[1,2,3]}
if(gnc.$setCache('1fn1',props,{data:[1,3,4,5,{a:1,b:2}]})){
    log('setCache is set')
}

let prop2s = {name:'abc',values:[1,2,3],prop:1,}

//log(gnc.$getCache('fn1',prop2s))
log( getGlobal('fn1',gnc.genRef(prop2s)) ) // should be the same as gnc.$getCache with storeType==='GLOBAL'