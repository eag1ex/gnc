/** 
 * Global Node Cache ( GNC )
*/
module.exports = () => {
    const { log, onerror, warn, isString, isFalsy } = require('x-utils-es/umd')
    // const { encode } = require('./utils')
    const Libs = require('./gnc.libs')()
    return class GNC extends Libs {
        constructor(opts, debug) {
            super(opts, debug)
        }

        set gncStore(v) {
            this._gncStore = v
        }

        get gncStore() {
            return this._gncStore
        }


        /** 
         * @setCacheStoreType
         * - get data from gncStore and assign it to relevent cacheType set in opts by the user
        */
        setCacheStoreType(name, nRef) {
            let cacheStoreTypes = [this.settings.storeType === 'LOCAL' ? 'LOCAL' : null,
            this.settings.storeType === 'GLOBAL' ? 'GLOBAL' : null].filter(n => !!n)

            let forSwitch = (type) => {
                switch (type) {
                    case 'LOCAL': {

                        break
                    }
                    case 'GLOBAL': {

                    }
                    default:
                        onerror('[setCacheStoreType]', `not supported StoreType: ${type} provided`)

                }
            }
            for (let inx = 0; inx < cacheStoreTypes.length; inx++) {
                forSwitch(cacheStoreTypes[inx])
            }

        }

        /** 
         * set your new cache to variable
         * @param {String} name the name of this cache, usualy best to call it name of the function its used in
         * @param {JSON/String} ref this param is usualy what was needed to achieve particular data output, for example when in functional methods with properties, and overtime we used the same properties< that would result in the same output
         * @param {*} data any data except: undefined
         * @returns {boolean} true/false, when succesfull returns true, if not errors but data already cached return false
        */
        setCache(name = '', ref, data) {

            if (!this.validName(name)) {
                if (this.debug) onerror('[setCache]', 'name invalid, or illegal characters provided, specials allowed: {_:}')
                return false
            }

            let nRef = this.genRef(ref)
            if (!nRef) return false

            if (data === undefined) {
                if (this.debug) warn('[setCache]', 'your data was undefined, nothing cached')
                return false
            }
            // data already exist nothig to set
            if (this.gncStore[name]) return false
            if(this.gncStore[name][nRef]!==undefined) return false
            else {

                // set new cache scope
                if (!this.gncStore[name]) {
                    this.gncStore[name] = {
                        [nRef]: data
                    }
                }
                // update cache scope
                if (this.gncStore[name]) this.gncStore[name][nRef] = data

                this.gncStore = Object.assign({}, this.gncStore)
                return true
            }
        }

        /** 
         * Available cache by name and ref, both are required
         * - to get related cache for example: your functional method properties where the same as previously so we should be able to grab last cached.
         * @param name scope object cache name
         * @param ref helps to target desired cache from scoped Object by: `gncStore[name][ref]`
         * @returns {*} any, but undefind if entries were invalid, and undefind when no cache found
        */
        getCache(name,ref) {
            if (!this.validName(name)) {
                if(this.debug) onerror('[getCache]', 'name invalid, or illegal characters provided, specials allowed: {_:}')
                return undefined
            }
            let nRef = this.genRef(ref)
            if(!nRef) return undefined
            if(this.gncStore[name]){
                if(this.gncStore[name][nRef]) return this.gncStore[name][nRef]
            }
            return undefined
        }
    }
}