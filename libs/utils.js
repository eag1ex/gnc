const base64 = require('base-64')
const utf8 = require('utf8')

/** 
 * provide string data and encode it as readable one-liner reference 
*/
exports.encode = (text) => {
    text = (text || '').trim()
    const bytes = utf8.encode(text)
    const encoded = base64.encode(bytes)
    return encoded
}

exports.sortObject = (obj = {}) => {
    return Object.keys(obj).sort().reduce((o, key) => {               
        o[key] = obj[key]  
        return o  
    }, {}) 
}

/** 
 * get check node global value, sould only be available when using 'GLOBAL' in our GNC/storeType
 * @param {string} name valid name 
 * @param {json/string} ref valid json string optimized by gnc.genRef(rawRef) 
 * @returns any 
*/
exports.getGlobal = (name, ref) => {
    try {
        return global['GNC'][name][ref] 
    } catch (err) {
        return undefined
    }
}
