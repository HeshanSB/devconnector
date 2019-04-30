const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data){
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';

    if(!Validator.isLength(data.text,{min:10, max:300})){
        errors.text = "Text should between 10 to 300";
    }

    
    if(Validator.isEmpty(data.text)){
        errors.text = "Text field is requried";
    }

    return ({ 
        errors,
        isValid : isEmpty(errors)
    });
};