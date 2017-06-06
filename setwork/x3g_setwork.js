module.exports = function(RED) {
    function x3gSetworkNode(config) {
        RED.nodes.createNode(this,config);
	var node = this;
    var flowContext = node.context().flow;

        this.on('input', function(msg) {
            	flowContext.set(msg.payload.printerid+'_queue',msg.payload)
                msg.payload = {success:"true"}
                node.send(msg);
        });
    }
    RED.nodes.registerType("X3GSetwork",x3gSetworkNode);
}
