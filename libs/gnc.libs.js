
module.exports = () => {
    const { log, onerror, warn, isString, isFalsy } = require('x-utils-es/umd')
    const { encode } = require('./utils')
    return class GNClibs {
        constructor(opts = {}, debug) {
            this.debug = debug
            this._gncStore = {}
            this.settings = {
                /** 
                 * `when GLOBAL`, we save cache data to node global variable, this option is more flexible but less secure
                 * `when LOCAL`, we save cache to LOCAL variable, this option is more secure but less flexible since we can only access out cache via class instance
                */
                storeType: opts.storeType || 'LOCAL' // GLOBAL OR LOCAL
            }

            if (this.settings.storeType !== 'LOCAL' || this.settings.storeType === 'GLOBAL') {
                throw ('wrong storeType selected, available are: LOCAL or GLOBAL')
            }
        }



        /** 
         * make sure name is valid
         * @returns boolean
        */
        validName(name) {
            let a = isString(name) && (name || '').length > 1
            let b = !!(/[ `!@#$%^&*()+\-=\[\]{};'"\\|,.<>\/?~]/).test(name)
            return a && b
        }
        /** 
         * Generate ref to be assigned with cache item
         * @param rawRef: usualy and object,string or array that will be converted to json and the encoded to a string to be used as reference pointer
        */
        genRef(rawRef) {
            try {

                if (rawRef === undefined || rawRef === '') throw ('rawRef cannot be undefined or ""')
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