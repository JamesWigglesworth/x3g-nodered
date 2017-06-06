module.exports = function(RED) {
    function x3gStatemachine(config) {
        RED.nodes.createNode(this,config);
	var node = this;
    var flowContext = node.context().flow;
    var x3gStatemachine_impl = require('./x3g_statemachine_impl.js')
        this.on('input', function(msg) {
            var thisPrinterStatus =  flowContext.get(config.printerid+'_status')||{};
            var thisPrinterQueue =    flowContext.get(config.printerid+'_queue')||[]; 
    
                //call the statemachine, whilst passing in the printerstatus and the received message
             x3gStatemachine_impl.newInput(msg.payload,thisPrinterStatus,thisPrinterQueue);
                
                flowContext.set(config.printerid+'_status',thisPrinterStatus)
            	if(thisPrinterStatus.payload != "")
			{
				msg.payload = thisPrinterStatus.payload
                		node.send(msg);
			}
        });
    }
    RED.nodes.registerType("X3GStatemachine",x3gStatemachine);
}
