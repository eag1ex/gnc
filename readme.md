### Global Node Cache (GNC)
Allow storing processed, repeat processed data, initialized classes on to global or local variable
- Global variable: node `global.GNC={}`
- local variable: node `const GNC={}` stored at top of application scope

### Why use it
- your application makes high computations, and repeated tasks that can be cached to save process/memory
- store repeated data outputs to cache


### Example:
- More examples in `./examples.js`

```js

// 
```



### setup/options

```js

let debug = false
let opts = {
    scopedRefMaxLength:50, // default 100
    storeType:'LOCAL' // or 'GLOBAL'
    keepPerScope:20, // default 5
    keepPerTotal:20 // default 5
}

let gnc = new GNC(opts, debug)

```

- `opt.scopedRefMaxLength`: Each propsRef is converted to a string via JSON.stringify > utf8/base64. If provided method/function properties are too large you can set a limit. Since Each ref is an object property, so it is not recommended to keep then large! Default is set to 100 when not set, or less then 10!

- `opt.storeType:string`: two types are available `GLOBAL`: Uses node `global.GNC={}` variable to store your cache, this way every time your re-initiate the class module in the same node process your data still remains. `LOCAL`: only exists in current class instance.


### Caching limits
Cache is monitored for its use and consumption, always latest cache is kept and limits are deleted, Last created cache becomes the latest entry.
- `opt.keepPerScope:number`: How much cache to keep on each scope, defaults to latest 5 entries.
- `opt.keepPerTotal:number`: How much cache to keep on all scopes, defaults to latest 5 entries.
- keepPerScope is evaluated first and keepPerTotal second, all on every `$setCache` call


### methods

- `(get) gncStore /=> $getAll()`: returns all available data in the current store, example: `{[scopeName][propsRef],[scopeName][propsRef]}`

- `$setCache(scopeName,propsRef,data)`: stores cache to gncStore
    * `scopeName`: defines name of cache scope, in which you wish to store data. `gncStore[scopeName]={}`
    * `propsRef`:  JSON.stringifies properties that are used to return provided data output, can use any except: `""` and `undefined`, example:`{any:'data'},[1,2,3],true,false,0,1,2,'hello world'`.  `gncStore[scopeName][propsRef]=data`
    * `data`: data you want to cache is stored in `gncStore[scopeName][propsRef]=data`

- `$getCache(scopeName,propsRef)`: return existing data or undefined
    * `scopeName` the name used to create cache
    * `propsRef` same ref used to generate data output, if it was an object, then order does not matter, as long all properties are the same!

- `$getScope(scopeName,asArray=false)`: returns all available data in current scope or undefined or []
    * `asArray:false` Optional when true will return only data[] as array in the order created.

- `$getAll()` : returns all available cache   from either `GLOBAL` or `LOCAL`