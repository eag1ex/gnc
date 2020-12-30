### Global Node Cache (GNC)
####  [ Developed by Eaglex ](http://eaglex.net)

##### LICENSE
* LICENCE: CC BY-NC-ND
* SOURCE: _(https://creativecommons.org/licenses/by-nc-nd/4.0/)_

### About
Allow storing repeat process data, initialized classes on to global or local variable

- Global variable: node `global.GNC={}`
- Local variable:  stored in current class instance


### Why use it

- your application makes high computations, and repeated tasks that can be cached to save process/memory
- store repeated data outputs to cache


#### Install
- `npm i` 


#### Example:

- More examples in `./example.one.js` and `./example.two.js`

```js

const GNC = require('global-node-cache')() // require('./index')()

let debug = false // will enable more detailed output, to help debug
let opts = {
    keepPerTotal: 5, // how much cache to keep per total, checked on every $setCache call
    keepPerScope: 5, // how much cache to keep per each scope, it is also evaluate first and before keepPerTotal
    scopedRefMaxLength: 100,
    storeType: 'GLOBAL' // GLOBAL, or LOCAL
}

let gnc = new GNC(opts, debug)


let scopeName = 'fnOne'
let props = { name: 'a', values: [1, 2, 3], prop: 1 }
let dataOutput = { A: [1, 3, 4, { a: 1, b: 2 }] }

if ( gnc.$setCache(scopeName, props, dataOutput) )  console.log('fnOne/setCache set')

// set or not give us output of fnOne. Returns > dataOutput
gnc.$getCache(scopeName, props) // { A: [1, 3, 4, { a: 1, b: 2 }] }

// return all data as array[] from scopeName: fnOne
gnc.$getScope(scopeName, true) // [ { A: [1, 3, 4, { a: 1, b: 2 }] }]

// return raw data from all scopes
gnc.$getAll()
/**
 * example output:
   { fnOne:
    { 'eyJuYW1lIjoiYSIsInByb3AiOjEsInZhbHVlcyI6WzEsMiwzXX0=':
        { data: { A: [ 1, 3, 4, [Object], [length]: 4 ] },
            timestamp: 1609332760702 } } } 

 */



// practical example, more details in `./example.two.js`
function a(){
    let cache = gnc.$get('fn_a', Object.values(arguments)) 
    if(cache) {
        console.log('fn_a/ calling from cache')       
        return cache // same data
    }

     console.log('fn_a/initial')
    // else do this if not yet set or different
    let logic = (()=> 1+1)() // some logical operator
    gnc.$set('fn_a', Object.values(arguments),logic)
    return logic 
}

a(1,2,3); // initial
a(1,2,3); // call from cache
a(1,2,3); // call from cache



// new instance 
let gnc2 = new GNC(opts, debug) // if opts.storeType==='GLOBAL'
gnc2.$getCache('fnOne', props) // then scopeName/propsRef will return same cache


```



#### setup/options

```js

// these can be set and will be intercepted on each gnc class with opts.storeType=GLOBAL
global.GNC_SETTINGS = {
    scopedRefMaxLength:50, // default 100
    keepPerScope:20, // default 5
    keepPerTotal:20 // default 5
}

let debug = false
let opts = {
    scopedRefMaxLength:50, // default 100
    storeType:'LOCAL' // or 'GLOBAL'
    keepPerScope:20, // default 5
    keepPerTotal:20 // default 5
}

let gnc = new GNC(opts, debug)

```

- `opt.scopedRefMaxLength`: Each propsRef is converted to a string via JSON.stringify > utf8/base64. If provided method/function properties are too large you can set a limit. Since Each ref is an object property, so it is not recommended to keep them large! Default is set to 100 when not set, or less then 10!

- `opt.storeType:string`: two types are available `GLOBAL`: Uses node `global.GNC={}` variable to store your cache, this way every time your re-initiate the class module in the same node process your data still remains. `LOCAL`: only exists in current class instance.



#### GLOBAL vs LOCAL cache
We have an option to use gnc as a global or local cache manager. But when the `GLOBAL` opt is set we can also control all of currently running gnc apps with `global.GNC_SETTINGS = {scopedRefMaxLength,keepPerScope,keepPerTotal}` only 3 options can be set, and will offset any locally set options as long as declared at top of your application stack, before any gnc are initialized!


#### Caching limits
Cache is monitored for its use and consumption, always latest cache is kept and limits are deleted, Last created cache becomes the latest entry.

- `opt.keepPerScope:number`: How much cache to keep on each scope, defaults to latest 5 entries.
- `opt.keepPerTotal:number`: How much cache to keep on all scopes, defaults to latest 5 entries.
- keepPerScope is evaluated first and keepPerTotal second, all is checked on every `$setCache` call


#### methods

- `$setCache(scopeName,propsRef,data) /> $set()`: stores cache to gncStore
    * `scopeName`: defines name of cache scope, in which you wish to store data. `gncStore[scopeName]={}`
    * `propsRef`:  JSON.stringifies properties that are used to return provided data output, can use any except: `""` and `undefined`, example:`{any:'data'},[1,2,3],true,false,0,1,2,'hello world'`.  `gncStore[scopeName][propsRef]=data`
    * `data`: data you want to cache is stored in `gncStore[scopeName][propsRef]=data`

- `$getCache(scopeName,propsRef) /> $get()`: return existing data or undefined
    * `scopeName` the name used to create cache
    * `propsRef` same ref used to generate data output, if it was an object, then order does not matter, as long all properties are the same!

- `$getScope(scopeName,asArray=false) /> $scope()`: returns all available data in current scope or undefined or []
    * `asArray:false` Optional when true will return only data[] as array in the order created.

- `(get) gncStore /=> $getAll()`: returns all available data in the current store, example: `{[scopeName][propsRef],[scopeName][propsRef]}`

- `$getAll() /> $all()` : returns all available cache   from either `GLOBAL` or `LOCAL`


#### methods/aliases
Can use either original or alias conventions 

-  `$set() === $setCache()`
-  `$get() === $getCache()`
-  `$scope() === $getScope()`
-  `$all() === $getAll()`


#### TODOS
* add support for window/browser


#### Contact
Have questions, or would like to submit feedback, [contact eaglex.net](https://eaglex.net/app/contact?product=gnc)


#### Thank you