require('ereqt/register');
setTimeout(function() {     // should fix a bug which causes all breakpoints being ignored in synchronous code on startup
    require('./index');     // update to the actual application antry point
}, 200);
