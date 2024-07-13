export const isAlphabeticWithSpaces = (value) => {
    
    return (/^[a-zA-Z ]*$/.test(value))
};

export const isAlphaNumericWithSpaces = (value) => {
    //return (/^[-_ a-zA-Z0-9]+$/.test(value))
    return (/^[a-zA-Z0-9 ]*$/.test(value))
}

export const isAlphaNumeric = (value) => {

    return (/^[a-z0-9]+$/i.test(value))
}

export const isAValidPANNumber = (value) => {


    return (/([A-Z]){5}([0-9]){4}([A-Z]){1}$/.test(value.toUpperCase()))
};

export const isAlphaNumericWithSpecialCharactersForPhoneNumber = (value) => {
    return (/^[ A-Za-z0-9()+-]*$/.test(value))
}

export const getWordCount = (value) => {


    if(value.includes(' ')){
        return value.split(' ').length;
    }else{
        return 1;
    }
}

export const isNumericWithSpace = (value) => {

    return (/[0-9 ]+/.test(value))
}

export const isNumeric = (value) => {

    return (/[0-9]+/.test(value))
}

export const isYear = (value) => {

    return (/(?:(?:19|20)[0-9]{2})/.test(value))
}

export const isNumberValue = (value) => {
    
    var isANumber = !(isNaN(value));

    if(isANumber){
       if(parseFloat(value) > 0){
           return true;
       }else{
           return false;
       }
    }else{
        return false;
    }

    return ! (isNaN(value) && (parseFloat(value) > 0));
}

export const isIntegerValue = (value) => {
    
    return (Number.isInteger(parseInt(value)) && parseInt(value)>0);
}

export const isAValidGSTIN = (value) => {


    return (/^([0-9]{2}[a-zA-Z]{4}([a-zA-Z]{1}|[0-9]{1})[0-9]{4}[a-zA-Z]{1}([a-zA-Z]|[0-9]){3}){0,15}$/.test(value.toUpperCase()))
};


export const isAValidTANNumber = (value) => {    

    return (/[A-Za-z]{4}[0-9]{5}[A-Za-z]{1}/.test(value))

};

export const isAValidMSMENumber = (value) => {

    if (value.length > 10 && value.length <= 20) {
        return true;
    } else {
        return false;
    }
};

export const isAValidIENumber = (value) => {

    if (value.length == 10) {
        return true;
    } else {
        return false;
    }
};

export const isAValidDUNS = (value) => {

    if (value.length == 9) {
        return true;
    } else {
        return false;
    }
};

export const isAValidFacebookUrl = (value) => {    

    if (isAValidUrl(value) && 
        (value.startsWith('http://facebook.com') 
         || (value.startsWith('https://facebook.com'))
         || (value.startsWith('https://www.facebook.com'))
         || (value.startsWith('http://www.facebook.com'))
         || (value.startsWith('www.facebook.com'))
         || (value.startsWith('facebook.com'))
         )){
        return true;
    } else {
        return false;
    }
};

export const isAValidTwitterUrl = (value) => {

    if (isAValidUrl(value) && 
        (value.startsWith('http://twitter.com') 
         || (value.startsWith('https://twitter.com'))
         || (value.startsWith('https://www.twitter.com'))
         || (value.startsWith('http://www.twitter.com'))
         || (value.startsWith('www.twitter.com'))
         || (value.startsWith('twitter.com'))
         )){
        return true;
    } else {
        return false;
    }
};

export const isAValidLinkedInUrl = (value) => {

    if (isAValidUrl(value) && 
        (value.startsWith('http://linkedin.com') 
         || (value.startsWith('https://linkedin.com'))
         || (value.startsWith('https://www.linkedin.com'))
         || (value.startsWith('http://www.linkedin.com'))
         || (value.startsWith('www.linkedin.com'))
         || (value.startsWith('linkedin.com'))
         )){
        return true;
    } else {
        return false;
    }
};

export const isAValidUrl = (value) => {

    if(/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(value)) {
         return true;
     } else {
         return false;
     }
 }

/*export const isAValidUrl = (value) => {
    
    return (/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(value))
};*/

export const isAValidEmailAddress = (value) => {

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return true;
    } else {
        return false;
    }
};

export const isAValidPhoneNumber = (value) => {

    return (/^\d{7,}$/).test(value.replace(/[\s()+\-\.]|ext/gi, ''));
};

export const isAValidIFSCCode = (value) => {

    let regex = new RegExp(/^[A-Z]{4}0[A-Z0-9]{6}$/);

    if (value == null) {
        return "false";
    }

    if (regex.test(value) == true) {
        return "true";
    }
    else {
        return "false";
    }
};

export const isAValidPassword = (value) => {

    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(value);

};