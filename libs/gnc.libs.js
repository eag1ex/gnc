
module.exports = () => {
    const { log, onerror, warn, isString, isObject, isNumber } = require('x-utils-es/umd')
    const { encode, sortObject } = require('./utils')
    return class GNClibs {
        constructor(opts = {}, debug) {

            this.debug = debug
            this._gncStore = {}

            this.settings = {
                
                // to not overload the system only keep totals of data, to be updated on every change 
                keepPerTotal: opts.keepInTotal=== undefined || 5, // how many items to keep in total
                keepPerScope: opts.keepInScope === undefined || 5, // how many items to keep per scope

                /** 
                 * `when GLOBAL`, we save cache data to node global variable, this option is more flexible but less secure
                 * `when LOCAL`, we save cache to LOCAL variable, this option is more secure but less flexible since we can only access out cache via class instance
                */
                storeType: opts.storeType || 'LOCAL', // GLOBAL OR LOCAL
                /** 
                 * max allowed size of each {ref} reference pointing to each data in scope
                 *  each reference is genereted thru process: JSON.stringify > encode/bytes > to string, and that produced max allowed size, it is usefull when your functional properties are too big to be used as reference pointers, overall it is not good to keep large object properies anyway!
                 * example : gncStore[name][ref][{yourData}] === gncStore[functionName:orSimilar][sdfklsudf765dsfgsdsde==--][{yourdate}]
                */
                scopedRefMaxLength: (opts.scopedRefMaxLength < 10) ? 100 : !opts.scopedRefMaxLength ? 100 : opts.scopedRefMaxLength
            }

            if (!isNumber(this.settings.scopedRefMaxLength)) {
                throw ('settings.scopedRefMaxLength must be a number')
            }

            if (opts.scopedRefMaxLength < 10) {
                warn('scopedRefMaxLength must be gth 10, offsetting to 100 default')
            }

            if (['LOCAL', 'GLOBAL'].indexOf(this.settings.storeType) === -1) {
                throw ('wrong storeType selected, available are: LOCAL or GLOBAL')
            }

            if (this.debug) {
                log(`GNC accesing cache storeType: ${this.settings.storeType}`)
            }
        }


  



        /** 
         * make sure name is valid
         * @returns boolean
        */
        validName(name) {
            let a = isString(name) && (name || '').length > 1
            let b = (/[ `!@#$%^&*()+\-=\[\]{};:'"\\|,.<>\/?~]/).test(name) === false
            let validFN = () => {
                try {
                    // not 100% reliable but its a start
                    this[name] = function () { }
                    delete this[name]
                    return true
                } catch (err) {
                    return false
                }
            }
            let c = validFN() // must also be a valid conventional function name    
            return a && b && c
        }

        /** 
         * @returns {Number} timestamp as number
        */
        timestamp(){
            return new Date().getTime()
        }

        /** 
         * Generate ref to be assigned with cache item
         * @param rawRef: usualy and object,string or array that will be converted to json and the encoded to a string to be used as reference pointer
        */
        genRef(rawRef) {
            try {

                if (rawRef === undefined || rawRef === '') throw ('rawRef cannot be undefined or ""')

                // only sort object, arrays should be kept as they are!
                if (isObject(rawRef)) {
                    rawRef = sortObject(rawRef)
                }
    
                const jsonStr = JSON.stringify(rawRef)
                let e = encode(jsonStr)
                if (e === undefined || e === '') throw ('rawRef cannot be undefined or ""')

                return e
            } catch (err) {
                if (this.debug) onerror('[genRef]', 'invalid rawRef provided', err)
                return undefined
            }
        }
    }
}
