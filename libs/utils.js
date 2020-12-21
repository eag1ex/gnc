const base64 = require('base-64');
const utf8 = require('utf8');


/** 
 * provide string data and encode it as readable one-liner reference 
*/
exports.encode = (text) => {
    text = (text ||'').trim()
    const bytes = utf8.encode(text);
    const encoded = base64.encode(bytes);
    return encoded
}

