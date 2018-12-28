const moment=require("moment")


var generateMessage = (from, text) => {
    return {from, text, createdat: moment().valueOf()}
};


var generateLocation = (from, lat,long) => {
    return {
        from,
        'url':`http://google.com/maps?q=${lat},${long}`,
        createdat: moment().valueOf()}
};
module.exports={generateMessage,generateLocation};