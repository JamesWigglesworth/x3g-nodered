module.exports = function(RED) {
    function x3gParserNode(config) {
        RED.nodes.createNode(this,config);
	var node = this;
	var x3gParser = require('./x3g_functionarray.js')
        this.on('input', function(msg) {
		var context = this.context();
            	var buffer = new Buffer(msg.payload.data,'base64');
		this.status({fill:"yellow",shape:"dot",text:"Busy Parsing"});
		msg.payload = {"name":msg.payload.name,"printerid":msg.payload.printerid,"parseddata":x3gParser.getProcessingFunction(buffer)};
		this.status({fill:"green",shape:"ring",text:"Ready"});	
            	node.send(msg);
        });
    }
    RED.nodes.registerType("X3GParser",x3gParserNode);
}
