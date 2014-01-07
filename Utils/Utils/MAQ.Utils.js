/*globals MAQ:true,window,sessionStorage,alert,console,document */
if (MAQ === undefined) {
    MAQ = {};
}

/**
* Provides utilities function to use in JavaScript
*/
MAQ.Utils = (function () {

    var utilObject = {
        // A flag to set if we need to use logging, by default it is on, all logging functions can be disabled by this 
        UseLog: true,
        // Set if log values are visible on page or not
        ShowLogOnPage: false,
        StringSplitOptions: {}
    },
        EMPTY_STRING = '',
        /**
        * Returns if given variable is not undefined, null, false, empty string
        */
        isSafe = function (literalToCheck) {
            if (literalToCheck === null) {
                return false;
            }
            return true;
        },

        /**
        * Checks if JSON object is empty or not
        */
        isEmptyObject = function (oValue) {
            if (isSafe(oValue) && typeof oValue === "object") {
                var keyCount = 0, keyCounter;
                for (keyCounter in oValue) {
                    if (oValue.hasOwnProperty(keyCounter)) {
                        keyCount += 1;
                    }
                }
                return keyCount === 0;
            }
            return true;
        },

        /**
        * Private property to hold all objects type
        */
        oJSType = (function () {
            var oJSObjects = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "NodeList"],
                nTypeCounter = 0,
                oType = {};
            for (; nTypeCounter < oJSObjects.length; nTypeCounter += 1) {
                oType["[object " + oJSObjects[nTypeCounter] + "]"] = oJSObjects[nTypeCounter].toLowerCase();
            }
            return oType;
        }()),

        /**
        * Public method to get the type of object
        */
        getType = function (oValue) {
            // Passed parameter may be blank string or Boolean value false, 
            // so we cannot use if(oValue) to check for false condition
            if (oValue === null) {
                return "null";
            }
            return oJSType[Object.prototype.toString.call(oValue)] || "object";
        },

        /**
        * Checks if value is an array or not
        */
        isArray = function (oValue) {
            return getType(oValue) === "array";
        },

        /**
        * Checks if given value is string
        */
        isString = function (oValue) {
            return getType(oValue) === "string";
        },

        // Checks if a value is Boolean
        isBoolean = function (oValue) {
            return getType(oValue) === "boolean";
        },

        /**
        * Checks if variable passed is an strict object
        */
        isObject = function (oValue) {
            return getType(oValue) === "object";
        },

        isFunction = function (oValue) {
            return getType(oValue) === "function";
        },

        isInteger = function (oValue) {
            return getType(oValue) === "number";
        },

        isDate = function (oValue) {
            return getType(oValue) === "date";
        },

        isNodeList = function (oValue) {
            return getType(oValue) === "nodelist";
        },

        /**
        * Check if a given string can be used as number or not, only unsigned integers
        */
        isNumber = function (oValue) {
            if (isSafe(oValue)) {
                return (/^\d+$/.test(oValue));
            }
            return false;
        },

        // Check if a given value is signed integer or signed decimal
        isDecimal = function (oValue) {
            if (isSafe(oValue)) {
                return (/^[+\-]?\d+(\.\d+)?$/.test(oValue));
            }
            return false;
        },

        /**
        * returns number of key available if an object is passed, for an array the length of array, for string number of characters, for any other object return zero
        */
        getLength = function (oValue, IsTrim) {
            // Check if a valid object
            if (isSafe(oValue)) {
                // if array then return length
                if (isArray(oValue)) {
                    return oValue.length;
                }

                // If string then trim and then return length
                if (isString(oValue)) {
                    return (isSafe(IsTrim) && IsTrim === true) ? sTrim(oValue).length : oValue.length;
                }
                // so now if it is an object
                if (isObject(oValue)) {
                    var keyCount = 0, keyCounter;
                    for (keyCounter in oValue) {
                        if (oValue.hasOwnProperty(keyCounter)) {
                            keyCount += 1;
                        }
                    }
                    return keyCount;
                }

                if (oValue.length !== "undefined" && isInteger(oValue.length)) {
                    return oValue.length;
                }
            }
            return 0;
        },

        equalTrim = function (sFirstValue, sSecondValue) {
            return isString(sFirstValue) && isString(sSecondValue) && sTrim(sFirstValue) === sTrim(sSecondValue);
        },

        /**
        * This function job is similar to how jQuery handles optional configuration 
        * Return an object after replacing similar keys, value, in oDefaultConfig with values in oUserDefinedConfig. 
        * Non matching keys from oDefaultConfig are preserved as it is in return object.
        * @attribute oUserDefinedConfig {object} key value pair which needs to in returned object
        * @attribute oDefaultConfig {object} key value pair which needs to be replace with values in oUserDefinedConfig
        * Both user defined objects and default configuration objects are preserved as it is
        * TODO:Update this function to allow user to specify any number of arguments
        */
        getUserDefinedWithDefault = function (oUserDefinedConfig, oDefaultConfig) {
            if (isEmptyObject(oDefaultConfig) && !isEmptyObject(oUserDefinedConfig)) {
                return oUserDefinedConfig;
            }
            if (!isEmptyObject(oDefaultConfig) && !isEmptyObject(oUserDefinedConfig)) {
                var oConfig = {},
                    DefaultKey = null,
                    UserKey = null;
                for (DefaultKey in oDefaultConfig) {
                    if (oDefaultConfig.hasOwnProperty(DefaultKey)) {
                        for (UserKey in oUserDefinedConfig) {
                            if (oUserDefinedConfig.hasOwnProperty(UserKey)) {
                                // Check if current user key is in the default configuration
                                if (oDefaultConfig.hasOwnProperty(UserKey)) {
                                    // If present, then replace default configuration values with user defined values
                                    if (isObject(oUserDefinedConfig[UserKey]) && isObject(oDefaultConfig[UserKey])) {
                                        // if both values in user defined and default are objects we need deep extending
                                        oConfig[UserKey] = getUserDefinedWithDefault(oUserDefinedConfig[UserKey], oDefaultConfig[UserKey]);
                                    }
                                    else {
                                        // if one of them or both are not objects, then give value of user defined configuration
                                        oConfig[UserKey] = oUserDefinedConfig[UserKey];
                                    }
                                }
                                else {
                                    // No key is present in default configuration directly add value to default configuration object
                                    oConfig[UserKey] = oUserDefinedConfig[UserKey];
                                }
                            }
                        }
                        // User has not set some values for Default configuration, add them to extended object
                        if (!(oUserDefinedConfig.hasOwnProperty(DefaultKey))) {
                            oConfig[DefaultKey] = oDefaultConfig[DefaultKey];
                        }
                    }
                }
                return oConfig;
            }
            return oDefaultConfig;
        },

        // Join an Object key value pairs
        joinKeyValuePairs = function (oValue, keyGlue, pairGlue) {
            if (isObject(oValue)) {
                var joinString = '', x;
                for (x in oValue) {
                    if (oValue.hasOwnProperty(x)) {
                        if (joinString === '') {
                            joinString = x + keyGlue + oValue[x];
                        }
                        else {
                            joinString = joinString + pairGlue + x + keyGlue + oValue[x];
                        }
                    }
                }
                return joinString;
            }
            // If an array join with keyGlue
            if (isArray(oValue)) {
                return oValue.join(keyGlue);
            }
            // If an string return as it is
            if (isString(oValue)) {
                return oValue;
            }
        },

        // Returns a cloned copy of object, doesn't support Deep Copy
        clone = function (oValue) {
            if (isSafe(oValue)) {
                if (isDate(oValue)) {
                    // try if given object is date type
                    return new Date(oValue.getTime());
                }
                // else given value is not date type, so just clone it
                return JSON.parse(JSON.stringify(oValue));
            }
            return oValue;
        },

        // Join JSON pair with some keys to skip, takes only one dimensional array of strings as keys to skip
        joinJSON = function (oValue, KeyGlue, PairGlue, oSkipKey) {
            var oCloneValue = clone(oValue),
                i = 0, nSkipLen = 0;
            if (isSafe(oSkipKey)) {
                // If array of string keys, then delete keys from object and then pass to join key value pair function
                if (isArray(oSkipKey)) {
                    nSkipLen = oSkipKey.length;
                    for (; i < nSkipLen; i += 1) {
                        if (isString(oSkipKey[i]) && oCloneValue.hasOwnProperty(oSkipKey[i])) {
                            delete oCloneValue[oSkipKey[i]];
                        }
                    }
                }
                else if (isString(oSkipKey) && oCloneValue.hasOwnProperty(oSkipKey)) {
                    delete oCloneValue[oSkipKey];
                }
            }
            return joinKeyValuePairs(oCloneValue, KeyGlue, PairGlue);
        },

        // we will define default values that will convert one string to JSON
        oExplodeDefault = {
            KeyGlue: ":",
            PairGlue: ",",
            // if array glue is defined, 
            // then we will explode the value obtained from KeyGlue as well
            ArrayGlue: null
        },

        // process one string and returns an array if glue defined is not null and is string
        processArrayGlue = function (sValue, sGlue) {
            //TODO: convert sGlue to JSON object, 
            // so that we can take function values to perform operation on created array as well
            if (isString(sValue) && isString(sGlue) && getLength(sGlue) > 0 && sValue.indexOf(sGlue) > -1) {
                return split(sValue, sGlue, utilObject.StringSplitOptions.Trim);
            }
            return sValue;
        },

        // takes one string and then convert that string into JSON
        explodeToJSON = function (sValue, oConfig) {
            // check if value is safe to operate and is string
            if (isString(sValue)) {
                var oLocalConfig = {},
                    aPairs = [],
                    nPairLen = 0,
                    nPairCounter = 0,
                    aKeyValues = [],
                    oJson = {};
                // check if user has passed configuration object
                // then we need to use custom explode
                if (getLength(oConfig) > 0) {
                    oLocalConfig = getUserDefinedWithDefault(oConfig, oExplodeDefault);
                    // check if we have defined configuration only for array glue
                    // then it is essentially to split string to create an array
                    //TODO: extend this function to specify split options for array split
                    if (oLocalConfig.ArrayGlue !== null && isString(oLocalConfig.ArrayGlue) &&
                        oLocalConfig.KeyGlue === null && oConfig.PairGlue === null) {
                        return split(sValue, oLocalConfig.ArrayGlue);
                    }
                    // check for key and pair glue should be string and not null or empty
                    if (isString(oLocalConfig.KeyGlue) && isString(oLocalConfig.PairGlue) &&
                        isSafe(oLocalConfig.KeyGlue) && isSafe(oLocalConfig.PairGlue)) {
                        aPairs = split(sValue, oLocalConfig.PairGlue, utilObject.StringSplitOptions.RemoveEmpty),
                        nPairLen = aPairs.length;
                        for (; nPairCounter < nPairLen; nPairCounter += 1) {
                            aKeyValues = split(aPairs[nPairCounter], oLocalConfig.KeyGlue);
                            // check if we got a key value pair, i.e. two values in split array
                            if (aKeyValues.length > 1) {
                                oJson[aKeyValues[0]] = processArrayGlue(aKeyValues[1], oLocalConfig.ArrayGlue);
                            }
                            else {
                                oJson[aKeyValues[0]] = EMPTY_STRING;
                            }
                        }
                        return oJson;
                    }
                }
                // else we will use system built in JSON parser
                oJson = isValidJSON(sValue);
                if (oJson.result) {
                    return oJson.validJSON;
                }
            }
            return sValue;
        },

        // Search a value in an array
        getIndex = function (sNeedle, oValue, fnComparison) {
            if (!isSafe(oValue)) {
                return -1;
            }
            if (isArray(oValue)) {
                var i = 0,
                    index = -1,
                    bEqualResult = false,
                    bIsFunction = isFunction(fnComparison);
                for (; i < oValue.length; i += 1) {
                    bEqualResult = false;
                    if (bIsFunction) {
                        bEqualResult = fnComparison(oValue[i], sNeedle);
                    }
                    else {
                        bEqualResult = (oValue[i] === sNeedle);
                    }
                    if (bEqualResult) {
                        index = i;
                        break;
                    }
                }
                return index;
            }
            // if string then return index of character or string
            if (isString(oValue)) {
                return oValue.indexOf(sNeedle);
            }

            if (isObject(oValue)) {
                return oValue.hasOwnProperty(sNeedle) === true ? 0 : -1;
            }
        },

        // Get name of current page
        currentPageName = function () {
            var urlPath = window.location.pathname;
            return urlPath.substring(urlPath.lastIndexOf('/') + 1);
        },

        // Private object to cache data until page refreshes. This is used only if no browser storage is available
        cacheItems = {},

        // object to hold the name of the keys stored for cache
        cacheKeys = {},

        isSessionStorage = function () {
            return (typeof Storage !== "undefined" && typeof sessionStorage !== "undefined");
        },

        // Get Cache data using HTML 5 session storage, 
        // if sessionStorage is not available then we will use page level cache
        getCacheData = function (sKey) {
            if (isSessionStorage()) {
                var oValue = JSON.parse(sessionStorage[sKey]);
                if (oValue.hasOwnProperty("CacheData")) {
                    return oValue.CacheData;
                }
                return oValue;
            }
            return (cacheItems.hasOwnProperty(sKey) ? cacheItems[sKey] : null);
        },

        // Set cache data to HTML 5 session storage, if not available then save into our own created cache object
        setCacheData = function (sKey, oValue) {
            // Save data to cache only if key is a string
            if (isString(sKey)) {
                cacheKeys[sKey] = true;
                if (isSessionStorage()) {
                    // check if value needs to be saved to sessionStorage
                    // we will serialize object value and then save it
                    oValue = {
                        CacheData: oValue
                    };
                    sessionStorage[sKey] = JSON.stringify(oValue);
                }
                else {
                    cacheItems[sKey] = oValue;
                }
            }
        },

        removeCacheData = function (sKey) {
            // Remove data from cache only if key is a string
            if (isString(sKey)) {
                if (isSessionStorage()) {
                    sessionStorage.removeItem(sKey);
                }
                else {
                    if (cacheItems.hasOwnProperty(sKey)) {
                        (delete cacheItems.sKey);
                    }
                }
                delete cacheKeys[sKey];
            }
        },

        // Create a method to flush all cache
        flushCache = function () {
            if (isSessionStorage()) {
                var sKey = null;
                for (sKey in cacheKeys) {
                    if (cacheKeys.hasOwnProperty(sKey)) {
                        sessionStorage.removeItem(sKey);
                        delete cacheKeys[sKey];
                    }
                }
            }
            cacheItems = {};
        },

        // Check if given object is valid JSON object or not
        isValidJSON = function (oValue) {
            try {
                oValue = JSON.parse(oValue);
                // We can return from here parsed JSON to save time to convert to valid JSON if already Valid
                return { "result": true, "validJSON": oValue };
            }
            catch (InvalidJSONException) {
                return { "result": false, "Exception": InvalidJSONException };
            }
        },

        queryStringToJSON = function (sValue) {
            var parameters = {};
            if (getLength(sValue) > 1) {
                sValue.replace(/(\w+)=([^&]*)/gi, function (str, key, value) {
                    parameters[key] = value;
                });
            }
            return parameters;
        },

        // Get Query String key value pair object 
        getQueryStringParams = function () {
            var PageName = currentPageName();
            if (cacheItems.hasOwnProperty(PageName)) {
                return cacheItems[PageName];
            }
            else {
                cacheItems[PageName] = queryStringToJSON(window.location.search);
                return cacheItems[PageName];
            }
        },

        // Get value of case insensitive query string variable with key from URL
        getQueryParam = function (sQueryParam) {
            if (isSafe(sQueryParam) && isString(sQueryParam)) {
                var params = getQueryStringParams(),
                    paramName = null;
                for (paramName in params) {
                    if (params.hasOwnProperty(paramName) &&
                        paramName.toLowerCase() === sQueryParam.toLowerCase()) {
                        return params[paramName];
                    }
                }
                return null;
            }
        },

        // Create a trim function if not given by browser
        sTrim = function (sValue) {
            if (!isString(sValue)) { return sValue; }
            if (typeof String.prototype.trim !== 'function') {
                return sValue.replace(/^\s+|\s+$/g, '');
            }
            return sValue.trim();
        },

        // Provide log facility. 
        // Writes a given string to log, 
        // try to convert an object or an array type to string
        log = function (sValue, isAlert, depth) {
            if (utilObject.UseLog) {
                var LogPrefix = "LOG: ", LogValue = JSON.stringify(sValue),
                LogDivId = "MAQ-Utilities-Log-Div", LogElement = null,
                BodyElement = document.getElementsByTagName("BODY");
                if (BodyElement.length > 0) {
                    BodyElement = BodyElement[0];
                }
                if (typeof console !== "undefined" && isSafe(console) && typeof console.log !== "undefined" && isSafe(console.log)) {
                    console.log(LogValue);
                }
                else {
                    LogValue = LogPrefix + LogValue;
                    if (isSafe(isAlert) && isAlert) {
                        alert(LogValue);
                    }
                    else {
                        // now log is called but no alert and no console is available, so try create a hidden div and append to body and insert all log value in this div
                        // try get div with log id
                        LogElement = document.querySelector('#' + LogDivId);
                        if (!(isSafe(LogElement))) {
                            // No div already created
                            LogElement = document.createElement("DIV");
                            LogElement.setAttribute("id", LogDivId);
                            if (!(utilObject.ShowLogOnPage)) {
                                LogElement.setAttribute("style", "display:none;");
                            }
                            if (BodyElement.appendChild) {
                                BodyElement.appendChild(LogElement);
                            }
                        }
                        LogElement.innerHTML = LogElement.innerHTML + " <br />" + LogValue;
                    }
                }
            }
        },
    
        // TODO: Override this function to make it more like String.Format("$ ###, ##.##"), 
        // something like this which 

        // Format a numeric digit by using comma separated, and attaching exponent part if not available
        formatNumeric = function (sValue, iCommaAfterDigits, sExponentPart) {
            if (!isDecimal(sValue)) {
                return '';
            }
            sValue += '';
            sExponentPart = isSafe(sExponentPart) ? sExponentPart : '';
            iCommaAfterDigits = isSafe(iCommaAfterDigits) && isNumber(iCommaAfterDigits) ? iCommaAfterDigits : 3;
            var x = sValue.split('.'),
                x1 = x[0],
                x2 = x.length > 1 ? '.' + x[1] : sExponentPart,
                rgx = new RegExp("(\\d+)(\\d{" + iCommaAfterDigits + "})");
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },

        // Format a number by adding comma after certain digits
        formatNumber = function (sValue, iCommaAfterDigits) {
            return formatNumeric(sValue, (isSafe(iCommaAfterDigits) ? iCommaAfterDigits : 3));
        },

        // Format LC Amount
        formatAmountLC = function (sValue) {
            var FormattedValue = formatNumeric(sValue, 3, ".00"),
                ExponentIndex = getIndex(".", FormattedValue);
            return FormattedValue.substring(0, ExponentIndex + 3);
        },

        // Format CD Amount
        formatAmountCD = function (sValue) {
            var sLCFormatValue = formatAmountLC(sValue);
            if (getLength(sTrim(sLCFormatValue)) > 0) {
                if (isNegative(sLCFormatValue)) {
                    return sLCFormatValue.replace("-", "-$");
                }
                else {
                    return "$" + sLCFormatValue;
                }
            }
            return sLCFormatValue;
        },

        // Format Date
        formatDate = function (sValue) {
            var oDate = new Date(sValue);
            if (isSafe(oDate)) {
                return oDate.format("MM/dd/yyyy");
            }
            return sValue;
        },

        isNegative = function (sValue) {
            if (sValue.indexOf("-") === 0) {
                return true;
            }
            else {
                return false;
            }
        },

        // Walks in an array and calling a callback function for each element of array
        walk = function (aValue, fnCallBack) {
            if (isSafe(aValue) && isArray(aValue)) {
                for (var Index = 0; Index < aValue.length; Index += 1) {
                    if (isFunction(fnCallBack)) {
                        fnCallBack(aValue[Index], Index, aValue);
                    }
                }
            }
            return aValue;
        },

        // Filter all values of array and will keep only those values for which callback returns true
        filter = function (aValue, fnFilterCallback) {
            var aClone = [];
            walk(aValue, function (Value, Index, aValue) {
                if (fnFilterCallback(Value, Index, aValue)) {
                    aClone.push(Value);
                }
            });
            return aClone;
        },

        // Call a user defined for each value in an array and keeps the modified value returned
        modify = function (aValue, fnCallback) {
            if (isFunction(fnCallback)) {
                walk(aValue, function (Value, Index, aValue) {
                    aValue[Index] = fnCallback(Value, Index, aValue);
                });
            }
            return aValue;
        },

        // Private Callback to Trim all the values in an array
        trimCallback = function (Value, Index, aValue) {
            aValue[Index] = sTrim(Value);
        },

        // Trim all the values in an array
        trimValues = function (aValue) {
            walk(aValue, trimCallback);
            return aValue;
        },

        // Private callback to determine which value is empty
        removeEmptyCallback = function (Value, Index, aValue) {
            return getLength(sTrim(Value)) > 0;
        },

        // Remove all empty values from an array and returns a new array keeping original array intact
        removeEmptyValues = function (aValue) {
            return filter(aValue, removeEmptyCallback);
        },

        // Remove \r, \n and \t from a string 
        removeCRLF = function (sValue) {
            if (isSafe(sValue) && isString(sValue)) {
                return sTrim(sValue.replace(/[\n\r\t]/g, ""));
            }
            return sValue;
        },

        // This function remove all carriage return and line feed, extra whitespaces from start and end of characters 
        // from the string provided, using regular expressions
        removeCRLFAndTrim = function (aValue) {
            return modify(aValue, removeCRLF);
        },

        // Split a given string with additional options with split string
        split = function (sValue, sSeparator, oSplitOptions) {
            if (isSafe(sValue) && isString(sValue)) {
                // TODO: change this implementation to use regular expression to split by using replace method with callback option
                var aValue = sValue.split(sSeparator);
                if (isFunction(oSplitOptions)) {
                    aValue = oSplitOptions(aValue);
                }
                return aValue;
            }
            return []; // return empty array if undefined, false, null or empty string is passed
        },
    
        // Check if a path exists in JSON or not, 
        // this returns an object with true or false result 
        // and value node with given path value if exists
        isPathExist = function (sPath, oValue) {
            // Check if values are string and JSON objects
            if (isString(sPath) && isObject(oValue)) {
                var aKeys = split(sPath, ".", utilObject.StringSplitOptions.Trim),
                    i = null,
                    oFinalPathVal = null,
                    sKey = null;
                for (i in aKeys) {
                    sKey = aKeys[i];
                    if (oValue.hasOwnProperty(sKey)) {
                        oValue = oValue[sKey];
                    }
                    else {
                        return { "result": false, "value": null };
                    }
                }
                return { "result": true, "value": oValue };
            }
            return { "result": false, "value": null };
        },

        getUniqueNumber = function () {
            return (new Date()).valueOf();
        };

    // Add it to pool of utility function to make it publicly available 
    utilObject.IsSafe = isSafe;
    utilObject.IsEmptyObject = isEmptyObject;
    utilObject.Length = getLength;
    utilObject.IsArray = isArray;
    utilObject.IsString = isString;
    utilObject.IsBoolean = isBoolean;
    utilObject.IsObject = isObject;
    utilObject.IsFunction = isFunction;
    utilObject.IsInteger = isInteger;
    utilObject.IsDate = isDate;
    utilObject.IsNodeList = isNodeList;
    utilObject.GetType = getType;
    utilObject.IsNumber = isNumber;
    utilObject.IsDecimal = isDecimal;
    // This will serve as method when we are comparing any two objects to be equal
    utilObject.oComparisonFn = {
        oStringComparison: {
            Trim: equalTrim
        }
    };
    utilObject.GetUserDefinedWithDefault = getUserDefinedWithDefault;
    utilObject.Extend = getUserDefinedWithDefault;
    utilObject.JoinKeyValuePairs = joinKeyValuePairs;
    utilObject.Clone = clone;
    utilObject.JoinJSON = joinJSON;
    utilObject.Explode = explodeToJSON;
    utilObject.IndexOf = getIndex;
    utilObject.CurrentPageName = currentPageName;
    utilObject.GetCacheData = getCacheData;
    utilObject.SetCacheData = setCacheData;
    // Provide another name for same function
    utilObject.SaveCacheData = setCacheData;
    utilObject.RemoveCache = removeCacheData;
    // Provide another public name of same function 
    utilObject.DeleteFromCache = removeCacheData;
    utilObject.FlushCache = flushCache;
    utilObject.IsValidJSON = isValidJSON;
    utilObject.QueryStringToJSON = queryStringToJSON;
    utilObject.GetQueryStringParams = getQueryStringParams;
    utilObject.GetQueryParam = getQueryParam;
    utilObject.Trim = sTrim;
    utilObject.Log = log;
    utilObject.FormatNumeric = formatNumeric;
    utilObject.FormatNumber = formatNumber;
    utilObject.FormatAmountLC = formatAmountLC;
    utilObject.FormatAmountCD = formatAmountCD;
    utilObject.FormatDate = formatDate;
    utilObject.IsNegative = isNegative;
    utilObject.Walk = walk;
    utilObject.Filter = filter;
    utilObject.Modify = modify;
    utilObject.TrimValues = trimValues;
    utilObject.RemoveEmptyValues = removeEmptyValues;
    utilObject.RemoveCRLFTab = removeCRLF;
    utilObject.RemoveCRLFAndTrim = removeCRLFAndTrim;
    utilObject.RemoveCRLFTabAndTrim = removeCRLFAndTrim;
    // Private options to pepper JS orthodox split function
    utilObject.StringSplitOptions.Trim = trimValues;
    utilObject.StringSplitOptions.RemoveEmpty = removeEmptyValues;
    utilObject.StringSplitOptions.RemoveCRLFAndTrim = removeCRLFAndTrim;
    utilObject.Split = split;
    utilObject.IsPathExist = isPathExist;
    utilObject.GetUniqueNumber = getUniqueNumber;

    /**
    * Return all methods and properties that are made public
    */
    return utilObject;
})();
