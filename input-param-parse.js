const logger = require("./logging.js");

const parseStringArray = (strArray,entryRegex,varName) => {
  let arrayParsed = parseArray(strArray,varName)
  const isArray = Array.isArray(arrayParsed)

  if (!isArray){
    logger.logError(`${varName??'It'} must be an array.`)   
    process.exit(1)
  }

  arrayParsed.forEach((element,i) => {
    logger.logKeyValuePair(`${varName??'Array'}[${i}]`,element)
  });

  const allElementsAreString = arrayParsed.every(fb => typeof fb === "string" && fb.trim() !== "")
  if (!allElementsAreString){
    logger.logError( `${varName??'The'} entries must only contain not empty strings.`)   
    process.exit(1)
  }

  if (entryRegex) {
    const allEntriesFollowRegex = arrayParsed.every(fb => fb.match(entryRegex))
    if (!allEntriesFollowRegex) {
      logger.logError(`${varName??'The'} entries needs to follow that regular expression '${entryRegex}'.`)    
      process.exit(1)
    }
  }

  return arrayParsed;
};

const parseArray = (arrayInput,varName) => {

  let arrayInputTrimmed = arrayInput.trim()

  const isJsonFormatted = arrayInputTrimmed.match(/\[\s*[^\[\]]*?\s*\]/g)

  if(isJsonFormatted){
    try {
      return JSON.parse(arrayInputTrimmed)
    }
    catch(e){
      errorMessage = `${varName??'It'} is not a valid json array.`
      logger.logError(errorMessage)
      return
    }
  }
  
  return isJsonFormatted
    ? JSON.parse(arrayInputTrimmed)
    : arrayInputTrimmed.split(/(?:,|;| )+/)
};

module.exports = {
  parseStringArray
};
