/** 
 * Global Node Cache ( GNC )
 * - cache your data in LOCAL or node GLOBAL variable
 * - store subsequent access to same data
*/
module.exports = () => {
    const { log, onerror, warn, isFalsy } = require('x-utils-es/umd')
    const Libs = require('./gnc.libs')()
    // TODO add data expiry and max slots per scoped items, to help with maintaining memory efficiency

    return class GNC extends Libs {
        constructor(opts, debug) {
            super(opts, debug)
        }


        /** 
         * set your new cache to variable
         * @param {String} scopeName the name of this cache, usualy best to call it name of the function its used in
         * @param {JSON/String} propsRef this param is usualy what was needed to achieve particular data output, for example when in functional methods with properties, and overtime we used the same properties< that would result in the same output
         * @param {*} data any data except: undefined
         * @returns {boolean} true/false, when succesfull returns true, if not errors but data already cached return false
        */
        $setCache(scopeName = '', propsRef, data) {

            if (!this.validName(scopeName)) {
                if (this.debug) onerror('[setCache]', 'scopeName invalid, or illegal characters provided, specials allowed: {_:}')
                return false
            }

            let nRef = this.genRef(propsRef)
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
                if ((global.GNC || {})[scopeName]) {
                    if ((global.GNC[scopeName] || {})[nRef]) return false
                }
            }

            // data already exist nothig to set
            if (this.settings.storeType === 'LOCAL') {
                if (this.gncStore[scopeName]) {
                    if ((this.gncStore[scopeName] || {})[nRef]) return false
                }
            }

            // set new cache scope
            if (!this.gncStore[scopeName]) {
                this.gncStore[scopeName] = {
                    [nRef]: { data, timestamp: this.timestamp() }
                }

                this.gncStore = Object.assign({}, this.gncStore)

                //NOTE  this section sets up `global.GNC` if storeType==='GLOBAL
                if (this.setCacheStoreType(scopeName, nRef).length < 1) {
                    if (this.debug) warn('[setCacheStoreType]', 'did not return correct storeType setting')
                    return false
                }

                // reduce our store per user configs: {keepPerTotal,keepPerScope} 
                this.reduceGncStore(null)
                return true
            }

            // update cache scope
            if (this.gncStore[scopeName]) {
                this.gncStore[scopeName][nRef] = { data, timestamp: this.timestamp() }
                this.gncStore = Object.assign({}, this.gncStore)

                if (this.setCacheStoreType(scopeName, nRef).length < 1) {
                    if (this.debug) warn('[setCacheStoreType]', 'did not return correct storeType setting')
                    return false
                }
                this.reduceGncStore(null)
                return true
            }

            return false

        }

        /** 
         * Available cache by name and ref, both are required
         * - to get related cache for example: your functional method properties where the same as previously so we should be able to grab last cached.
         * - depending on `{settings.storeType}` either `LOCAL` or `GLOBAL` will be accessed to check data! 
         * @param scopeName scope object cache name
         * @param propsRef helps to target desired cache from scoped Object by: `gncStore[name][ref]`
         * @returns {*} any, but undefind if entries were invalid, and undefind when no cache found
        */
        $getCache(scopeName, propsRef) {

            if (!this.validName(scopeName)) {
                if (this.debug) onerror('[getCache]', 'invalid conventional function name, or illegal chars provided')
                return undefined
            }

            let nRef = this.genRef(propsRef)
            if (!nRef) return undefined

            if (this.settings.storeType === 'LOCAL') {
                if (this.gncStore[scopeName]) {
                    if (this.gncStore[scopeName][nRef]) {

                        if (this.debug) log(`[getCache]','available for name: ${scopeName}[ref]`)
                        return this.gncStore[scopeName][nRef].data
                    }
                }
                return undefined
            }

            if (this.settings.storeType === 'GLOBAL') {

                if (!global.GNC) {
                    if (this.debug) log(`[getCache]','no global.GNC available`)
                    return undefined
                }

                if (global.GNC[scopeName]) {
                    if (global.GNC[scopeName][nRef]) {
                        if (this.debug) log(`[getCache]','available for name: ${scopeName}[ref]`)
                        return global.GNC[scopeName][nRef].data
                    }
                }
                return undefined
            }
        }


        /** 
         * - get all data from scope
         * @param {String} scopeName
         * @param {boolean} asArray when true will return only data[] as an array in the order they were created
         * @returns `{[ref]: {data,timestamp},... }`
        */
        $getScope(scopeName, asArray = false) {
            if (!this.validName(scopeName)) {
                if (this.debug) onerror('[getScope]', 'invalid conventional function name, or illegal chars provided')
                return undefined
            }

            if (this.settings.storeType === 'LOCAL') {
                if (asArray) {
                    if (!this.gncStore[scopeName]) return undefined
                    return Object.entries(this.gncStore[scopeName]).reduce((n, [ref, item]) => {
                        n.push(item.data)
                        return n
                    }, []).filter(n => !!n)
                } else return this.gncStore[scopeName]

            }

            if (this.settings.storeType === 'GLOBAL') {
                // make sure global.GNC exists and was set
                if (global.GNC) {
                    if (asArray) {
                        if (!global.GNC[scopeName]) return undefined
                        return Object.entries(global.GNC[scopeName]).reduce((n, [ref, item]) => {
                            n.push(item.data)
                            return n
                        }, []).filter(n => !!n)
                    } else return global.GNC[scopeName]
                }
                return undefined
            }
        }

        /** 
         * - get all Cache currently stored
        */
        $getAll() {
            if (this.settings.storeType === 'LOCAL') {
                return this.gncStore
            }

            if (this.settings.storeType === 'GLOBAL') {
                return global.GNC
            }

        }
    }
}
