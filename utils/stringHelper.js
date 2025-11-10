exports.getNthLastCharacter = (str, n) => {
  const newString = str.substring(str.length - n);
  return newString;
};

exports.getNthLastCharactersInArray = (strings = [], n) => {
  let stringArray = [];

  for (let string of strings) {
    const newString = string.substring(string.length - n);
    stringArray.push(newString);
  }

  return stringArray;
};
