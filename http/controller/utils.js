var utils = {}


//fucntion returns text if type is text, otherwise returns the data as an array
utils.getDataFromDataView = function (dataView, type) {
  if (type === "text") {
    let decoder = new TextDecoder("utf-8");
    return decoder.decode(dataView);
  } else {
    let data = [];
    for (let i = 0; i < dataView.byteLength; i++) {
      data.push(dataView.getUint8(i));
    }
    return data;
  }
}

module.exports = utils;
