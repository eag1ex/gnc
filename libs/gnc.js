/** 
 * Global Node Cache ( GNC )
 * - cache your data in LOCAL or node GLOBAL variable
 * - store subsequent access to same data
*/
module.exports = () => {
    const { log, onerror, warn } = require('x-utils-es/umd')
    const Libs = require('./gnc.libs')()
    // TODO add data expiry and max slots per scoped items, to help with maintaining memory efficiency

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
         * - get data from gncStore and assign it to relevent cacheType set in opts
         * @returns {Array} single array if type that was set, either ['LOCAL'] OR ['GLOBAL']
        */
        setCacheStoreType(name, nRef) {
            let cacheStoreTypes = [this.settings.storeType === 'LOCAL' ? 'LOCAL' : null,
                this.settings.storeType === 'GLOBAL' ? 'GLOBAL' : null]
                .filter(n => !!n)

            let forSwitch = (type) => {
                let typeSet
                switch (type) {
                    case 'LOCAL': {
                        // no need we already keep record in `get gncStore`
                        typeSet = 'LOCAL'
                        break
                    }
                    // copy data from LOCAL to GLOBAL
                    case 'GLOBAL': {
                        if (!global.GNC) global.GNC = {}

                        if (!global.GNC[name]) {
                            let data = this.gncStore[name][nRef]
                            global.GNC[name] = { [nRef]: data }
                            typeSet = 'GLOBAL'
                            break
                        }

                        if (global.GNC[name]) {
                            let data = this.gncStore[name][nRef]
                            global.GNC[name][nRef] = data
                            typeSet = 'GLOBAL'
                        }

                        break
                    }
                    default:
                        onerror('[setCacheStoreType]', `not supported StoreType: ${type} provided`)
                }
                return typeSet
            }

            let ready = []
            for (let inx = 0; inx < cacheStoreTypes.length; inx++) {
                let d = forSwitch(cacheStoreTypes[inx])
                ready.push(d)
            }

            return ready.filter(n => !!n)
        }

        /** 
         * set your new cache to variable
         * @param {String} name the name of this cache, usualy best to call it name of the function its used in
         * @param {JSON/String} ref this param is usualy what was needed to achieve particular data output, for example when in functional methods with properties, and overtime we used the same properties< that would result in the same output
         * @param {*} data any data except: undefined
         * @returns {boolean} true/false, when succesfull returns true, if not errors but data already cached return false
        */
        $setCache(name = '', ref, data) {

            if (!this.validName(name)) {
                if (this.debug) onerror('[setCache]', 'name invalid, or illegal characters provided, specials allowed: {_:}')
                return false
            }

            let nRef = this.genRef(ref)
            if (!nRef) return false

            if (nRef.length > this.settings.scopedRefMaxLength) {
                if (this.debug) warn('[setCache]', 'ref>scopedRefMaxLength, ref did no meet {scopedRefMaxLength} criteria')
                return false
            }

            if (data === undefined) {
                if (this.debug) warn('[setCache]', 'your data was undefined, nothing cached')
                return false
            }

            // data already exist nothig to set
            if (this.settings.storeType === 'GLOBAL') {
                if ((global.GNC || {})[name]) {
                    if ((global.GNC[name] || {})[nRef]) return false
                }
            }

            // data already exist nothig to set
            if (this.settings.storeType === 'LOCAL') {
                if (this.gncStore[name]) {
                    if ((this.gncStore[name] || {})[nRef]) return false
                }
            }

            // set new cache scope
            if (!this.gncStore[name]) {
                this.gncStore[name] = {
                    [nRef]: data
                }

                this.gncStore = Object.assign({}, this.gncStore)
                if (this.setCacheStoreType(name, nRef).length < 1) {
                    if (this.debug) warn('[setCacheStoreType]', 'did not return correct storeType setting')
                    return false
                }

                return true
            }

            // update cache scope
            if (this.gncStore[name]) {
                this.gncStore[name][nRef] = data
                this.gncStore = Object.assign({}, this.gncStore)

                if (this.setCacheStoreType(name, nRef).length < 1) {
                    if (this.debug) warn('[setCacheStoreType]', 'did not return correct storeType setting')
                    return false
                }
                return true
            }

            return false

        }

        /** 
         * Available cache by name and ref, both are required
         * - to get related cache for example: your functional method properties where the same as previously so we should be able to grab last cached.
         * - depending on `{settings.storeType}` either `LOCAL` or `GLOBAL` will be accessed to check data! 
         * @param name scope object cache name
         * @param ref helps to target desired cache from scoped Object by: `gncStore[name][ref]`
         * @returns {*} any, but undefind if entries were invalid, and undefind when no cache found
        */
        $getCache(name, ref) {

            if (!this.validName(name)) {
                if (this.debug) onerror('[getCache]', 'invalid conventional function name, or illegal chars provided')
                return undefined
            }

            let nRef = this.genRef(ref)
            if (!nRef) return undefined

            if (this.settings.storeType === 'LOCAL') {
                if (this.gncStore[name]) {
                    if (this.gncStore[name][nRef]) {
                        if (this.debug) log(`[getCache]','available for name: ${name}[ref]`)
                        return this.gncStore[name][nRef]
                    }
                }
                return undefined
            }

            if (this.settings.storeType === 'GLOBAL') {
                if (global.GNC[name]) {
                    if (global.GNC[name][nRef]) {
                        if (this.debug) log(`[getCache]','available for name: ${name}[ref]`)
                        return global.GNC[name][nRef]
                    }
                }
                return undefined
            }
        }
    }
}
