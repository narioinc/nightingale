var getAdapters = require('webbluetooth').getAdapters;


var clientController = {}

clientController.getAdapter = async function (req, res) {
    const adapters = await getAdapters();
    console.log(adapters);
    if (!adapters || adapters.length === 0) {
        return {"status": 404, "error": "No Bluetooth adapters found"};
    }
    return {"status": 200, "res": adapters};
};

module.exports = clientController;