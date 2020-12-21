/** 
 * Global Node Cache ( GNC )
*/
module.exports = () => {
    const {log, onerror, warn, isString, isFalsy} = require('x-utils-es/umd')
    const {encode} = require('./utils')
    return class GNC {
        constructor(opts = {}, debug) {
            this.debug = debug
            
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

        set gncStore(v){
            this._gncStore = v
        }

        get gncStore(){
            return this._gncStore
        }

        getCache(name){

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

        /** 
         * set your new cache to variable
         * @param {String} name the name of this cache, usualy best to call it name of the function its used in
         * @param {JSON/String} ref this param is usualy what was needed to achieve particular data output, for example when in functional methods with properties, and overtime we used the same properties< that would result in the same output
         * @param {*} data any data except: undefined or ""
        */
        setCache(name='',ref,data){
            if(!this.validName(name)){
                onerror('[setCache]','name invalid, or illegal characters provided, specials allowed: {_:}')
                return false
            }
        }

        /** 
         * make sure name is valid
         * @returns boolean
        */
        validName(name){
            let a = isString(name) && (name||'').length>1
            let b = !!(/[ `!@#$%^&*()+\-=\[\]{};'"\\|,.<>\/?~]/).test(name)
            return a && b
        }
    }
}