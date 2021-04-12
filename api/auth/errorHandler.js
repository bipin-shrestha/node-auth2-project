module.exports = (err, req, res, next) => {
    console.log('Express error', err);
    if(err.apicode && err/apicode >= 400){
        err.apiMessage = err.apiMessage ? errapiMessage : '';
        res.status(err.apiCode.json({
            apiCode: err.apiCode, apiMessage: err.apiMessage, ...err
        }));
    } else {
        next();
    }
}