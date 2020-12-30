
module.exports = () => {
    const { log, onerror, warn, isString, isObject, isNumber, isFalsy } = require('x-utils-es/umd')
    const { encode, sortObject } = require('./utils')
    return class GNClibs {

        constructor(opts = {}, debug) {

            this.debug = debug
            this._gncStore = {}

            this.settings = {

                // to not overload the system only keep totals of data, to be updated on every change 
                keepPerTotal: opts.keepPerTotal === undefined ? 5 : opts.keepPerTotal, // how many items to keep in total
                keepPerScope: opts.keepPerScope === undefined ? 5 : opts.keepPerScope, // how many items to keep per scope

                /** 
                 * `when GLOBAL`, we save cache data to node global variable, this option is more flexible but less secure
                 * `when LOCAL`, we save cache to LOCAL variable, this option is more secure but less flexible since we can only access out cache via class instance
                */
                storeType: opts.storeType || 'LOCAL', // GLOBAL OR LOCAL
                /** 
                 * max allowed size of each {ref} reference pointing to each data in scope
                 *  each reference is generated thru process: JSON.stringify > encode/bytes > to string, and that produced max allowed size, it is useful when your functional properties are too big to be used as reference pointers, overall it is not good to keep large object properties anyway!
                 * example : gncStore[name][ref][{yourData}] === gncStore[functionName:orSimilar][sdfklsudf765dsfgsdsde==--][{yourData}]
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

        set gncStore(v) {
            this._gncStore = v
        }

        get gncStore() {
            return this._gncStore
        }

        /** 
         * - this is called on every new or existing setCache, and checks if threshold has beed reached
         * for {keepPerTotal} or {keepPerScope} and reduces the gncStore overloads to limit memory overloads
         * @param {String} byRef makes sure nto tu delete last entry
        */
        reduceGncStore(byRef = null) {

            // get timestamps
            let scopes = {} // name of all outter scopes ()
            let innerScopeRefs = {}
            let innerScopeIndex = {}

            let gncStore
            if (this.settings.storeType === 'LOCAL') gncStore = this._gncStore
            if (this.settings.storeType === 'GLOBAL') gncStore = global.GNC
            if (!gncStore) return 0



            let storeEntriesArr = Object.entries(gncStore).reduce((n, [name, val], inx, all) => {

                Object.entries(val).map(([ref, item]) => {
                    if (!ref) return n
                    if (!item) return n
                    scopes[name] = true
                    if (!innerScopeRefs[name]) innerScopeRefs[name] = {}
                    if (innerScopeIndex[name] === undefined) innerScopeIndex[name] = 0
                    if (!innerScopeRefs[name][ref]) {
                        innerScopeRefs[name][ref] = true
                        innerScopeIndex[name]++ // count number of references on each outter scope
                    }

                    let { data, timestamp } = item
                    n.push({ name, ref, data, timestamp })
                })

                return n
            }, []).filter(n => !!n)

            // avoid resources
            if (this.settings.keepPerTotal === 1 && storeEntriesArr.length === 1) {
                return 0
            }


            // latest entries first
            storeEntriesArr.sort((a, b) => b.timestamp - a.timestamp)
            let storeToDelete = storeEntriesArr.filter((n, inx) => {

                // ignore last entry
                if (n.ref === byRef && byRef) return false
                // check if there are more then keepPerScope items by index on each outter scope tree
                if (this.settings.keepPerScope && innerScopeIndex[n.name] > this.settings.keepPerScope) {
                    if (this.debug) log('we have more then innerScopeIndex > keepPerScope:', innerScopeIndex[n.name])
                    return true
                }
                // all scope indexes to be counted, and it keepPerTotal was set
                // store to delete above inx
                if (this.settings.keepPerTotal && this.settings.keepPerTotal < inx + 1) {
                    if (this.debug) log('we have more then keepPerTotal < inx:', inx + 1)
                    return true
                }
            })
            return this.deleteStores(storeToDelete)
        }

        /** 
         * - delete store by entry, either LOCAL or GLOBAL
         * @param {Array} entries:`[{name, ref, data, timestamp},...]`
         * @returns index of deleted gncStore entries
        */
        deleteStores(entries = []) {
            if (!entries.length) return 0

            let deleted = 0
            for (let inx = 0; inx < entries.length; inx++) {
                let { name, ref, data, timestamp } = entries[inx]

                if (this.settings.storeType === 'LOCAL') {
                    if (this._gncStore[name]) {
                        if (this._gncStore[name][ref]) {
                            delete this._gncStore[name][ref]
                            deleted++
                        }
                        // recycle any empty scopes as well
                        if (isFalsy(this._gncStore[name])) delete this._gncStore[name]
                    }
                }


                if (this.settings.storeType === 'GLOBAL') {
                    if (global.GNC) {

                        if (global.GNC[name]) {
                            if (global.GNC[name][ref]) {
                                delete global.GNC[name][ref]
                                deleted++
                            }

                            // recycle any empty scopes as well
                            if (isFalsy(global.GNC[name])) delete global.GNC[name]
                        }
                    }
                }
            }

            if (this.debug) log('[deleteStores]', `deleted: ${deleted}`)
            return deleted
        }


        /** 
         * @setCacheStoreType
         * - get data from gncStore and assign it to relevant cacheType set in opts
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
                            global.GNC[name] = { [nRef]: { ...data } }
                            typeSet = 'GLOBAL'
                            break
                        }

                        if (global.GNC[name]) {
                            let data = this.gncStore[name][nRef]
                            global.GNC[name][nRef] = { ...data }
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
        timestamp() {
            return new Date().getTime()
        }

        /** 
         * Generate ref to be assigned with cache item
         * @param rawRef: usually and object,string or array that will be converted to json and the encoded to a string to be used as reference pointer
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
