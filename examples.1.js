const {getArgs} = require('./libs/utils')

function a(){
    console.log(getArgs(arguments))
}

a(1,2,3,{},[1,2,3])