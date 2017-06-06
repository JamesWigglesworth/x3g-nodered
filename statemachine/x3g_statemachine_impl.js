var _crctab = [
      0, 94, 188, 226, 97, 63, 221, 131, 194, 156, 126, 32, 163, 253, 31, 65,
      157, 195, 33, 127, 252, 162, 64, 30, 95, 1, 227, 189, 62, 96, 130, 220,
      35, 125, 159, 193, 66, 28, 254, 160, 225, 191, 93, 3, 128, 222, 60, 98,
      190, 224, 2, 92, 223, 129, 99, 61, 124, 34, 192, 158, 29, 67, 161, 255,
      70, 24, 250, 164, 39, 121, 155, 197, 132, 218, 56, 102, 229, 187, 89, 7,
      219, 133, 103, 57, 186, 228, 6, 88, 25, 71, 165, 251, 120, 38, 196, 154,
      101, 59, 217, 135, 4, 90, 184, 230, 167, 249, 27, 69, 198, 152, 122, 36,
      248, 166, 68, 26, 153, 199, 37, 123, 58, 100, 134, 216, 91, 5, 231, 185,
      140, 210, 48, 110, 237, 179, 81, 15, 78, 16, 242, 172, 47, 113, 147, 205,
      17, 79, 173, 243, 112, 46, 204, 146, 211, 141, 111, 49, 178, 236, 14, 80,
      175, 241, 19, 77, 206, 144, 114, 44, 109, 51, 209, 143, 12, 82, 176, 238,
      50, 108, 142, 208, 83, 13, 239, 177, 240, 174, 76, 18, 145, 207, 45, 115,
      202, 148, 118, 40, 171, 245, 23, 73, 8, 86, 180, 234, 105, 55, 213, 139,
      87, 9, 235, 181, 54, 104, 138, 212, 149, 203, 41, 119, 244, 170, 72, 22,
      233, 183, 85, 11, 136, 214, 52, 106, 43, 117, 151, 201, 74, 20, 246, 168,
      116, 42, 200, 150, 21, 75, 169, 247, 182, 232, 10, 84, 215, 137, 107, 53
  ];

module.exports = {
        newInput(payload,status,printerqueue){
            //we need to decide here what data is coming in, is this data coming from the printer or a notification that there is new data
            if((!(payload instanceof Buffer)) && payload.success=="true" && (status.nextstate == "ready" || status.nextstate === undefined) )
                {
                  startPrinter(payload,status,printerqueue)
                }
            else
                handleData(payload,status,printerqueue)
            }  
        }

var startPrinter = function(payload,status,printerqueue)
    {
        console.log('starting printer')
	console.log(printerqueue)
	var array = []
        console.log(printerqueue.parseddata[0])
        status.busy = "true"
        array.push(213)
        array.push(printerqueue.parseddata[0].functionData.length+1)
        array.push(printerqueue.parseddata[0].functionId)
        array = array.concat(printerqueue.parseddata[0].functionData)
        array.push(printerqueue.parseddata[0].CRC)
        status.payloadcounter = 1
        status.payload = new Buffer(array)
        return  
    }

var handleData = function(payload,status,printerqueue)
    {
        //successfull message
        status.payload = ""
        console.log('-----------------')
	console.log(payload[0])
	if(payload[0] == 213) 
		status.recv = [213]
	else
		status.recv.push(payload[0])

	console.log(status.recv)
	if(status.recv.length == status.recv[1]+3)
		{
		console.log('length ok')
			if(CRC(status.recv.slice(2,-1)) == status.recv[status.recv.length-1])
			{
			console.log('crc ok')					
        			if(status.recv[2] == 129 && status.queuebusy != "true" &&(status.payloadcounter < printerqueue.parseddata.length))
            				{
                				var array = []
                				var counter = status.payloadcounter
		  					console.log("Now I am printing "+ printerqueue.parseddata[counter].functionId)
                					array.push(213)
                					array.push(printerqueue.parseddata[counter].functionData.length+1)
                					array.push(printerqueue.parseddata[counter].functionId)
                					array = array.concat(printerqueue.parseddata[counter].functionData)
                					array.push(printerqueue.parseddata[counter].CRC)
                					status.payloadcounter += 1
                					status.payload = new Buffer(array)
            				}
				else
					{
						if(status.recv[2] == 130)
							{
								var array = []
                                                		var counter = status.payloadcounter
                                                        	console.log("Found action buffer overflow, checking what is available")
                                                        	array.push(213)
                                                        	array.push(1)
                                                        	array.push(2)
                                                        	array.push(CRC([2]))
                                                        	status.payloadcounter -= 1
                                                        	status.payload = new Buffer(array)
							}
					}
    			}
			else 
				console.log(CRC(status.recv.slice(2,-1)) + " is not " + status.recv[status.recv.length-1])
		}
	console.log('***************')
     }


/**
  * Calculate 8-bit [iButton/Maxim CRC][http://www.maxim-ic.com/app-notes/index.mvp/id/27] of the payload
   */
function CRC(payload) {
    var crc = 0;
    for(var i = 0; i < payload.length; ++i) {
      crc = _crctab[crc ^ payload[i]];
    }
    return crc;
  };
