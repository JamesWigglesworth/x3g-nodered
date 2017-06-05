//function to parse incoming makerbot data
//Parses one command at a time
//All commands end up on the global global.gInstructionArray variable
//This parsing is done using the spec of the S3g/X3G protocol here:
//https://github.com/makerbot/s3g/blob/master/doc/s3gProtocol.md
//Inspiration for the CRC and helper functions comes from here:
//https://github.com/aowola/makerbot-status

/*      Following codes are implemented
        Host buffered commands
        131 -   Find Axes minimums
        132 -   Find Axes maximums
        133 -   Delay pause all motion for the specified time
        
        134 -   Change tool
        135 -   Wait for tool ready
        136 -   Tool action command
        137 -   Enable / Disable axis
        139 -   Que extended point
        140 -   Set extended point
        141 -   Wait for platform ready
        142 -   Que extended point, new style
        143 -   Store home positions
        144 -   Recall home positions
        145 -   Set digital potention meter value
        146 -   Set RGB led value
        147 -   Set Beep
        148 -   Wait for Button
        149 -   Display message to LCD
        150 -   Set Build Percentage
        151 -   Que songe
        152 -   Reset to factory
        153 -   Build start notification
        154 -   Build end notification
        155 -   Queue extended point X3G
        157 -   Stream Version
        
        Tool action commands
        01  -   Initialize firmware to boot state
        03  -   Set toolhead target temperature
        06  -   Set motorspeed
        10  -   Enable/disable motor
        12  -   Enable/Disable fan
        13  -   Enable/Disable extra output
        14  -   Set servo 1 position
        23  -   Pause/Resume:Halt execution temporarily
        24  -   Abort immediately
        31  -   Set build target patform temperature
        
    */

var processingFunctionArray = []
var MBCommandArray = []
//the first function is 131 since the first 130 places in the array would be empty, we simply put it to 
var offset = 131
var gData = [];
var gDataPointer = 0;
var gInstructionArray = [];



module.exports = {

    getProcessingFunction(x3gData){
        gData = x3gData;
        
        while(gDataPointer<gData.length){
            
            var functionId = gData[gDataPointer]
            var toDo = MBCommandArray[functionId-offset];
        
            if(toDo != undefined)
                {
                    if(typeof(toDo) === 'function' )
                        toDo()
                    else    
                        fillInstructionArray(functionId,toDo);   
                }
            else
                {
                    console.log('This function '+functionId+' is not defined in the function aray')
			return	{ "ErrorCode":"0003","ErrorMessage":"This function "+functionId+" is not defined"}
                }
            }
        return gInstructionArray;
        }

    }

//Most of the functions consist of
//function code
//number of bytes
//some functions need some special attention, so this array contains the number of bytes (which is the majority of the case) but in case we need to do something special it returns a function.

// 131 -   Find Axes minimums
MBCommandArray[131-offset] = 7
//132 -   Find Axes maximums
MBCommandArray[132-offset] = 7
//133 -   Delay pause all motion for the specified time
MBCommandArray[133-offset] = 1
//134 -   Change tool
MBCommandArray[134-offset] = 1
//135 -   Wait for tool ready
MBCommandArray[135-offset] = 5
//136 -   Tool action command
MBCommandArray[136-offset] = function()
        {
    
    
            //start of build function
            var payloadData = []
            var CRCcalculated = 0;
            var CRCData = [];
            
            //pop of the opening command
            gDataPointer += 1
            
            //set the length of the payload, which is to be found at gDataPointer + 2 (toolid +command) an extra + 3 because we also need to read the tool id and action command and the byte counter it self
            var noOfBytes = gData[gDataPointer+2]+3
           for(var i =0 ;i < noOfBytes;i++)
                {
                    payloadData.push(gData[gDataPointer])
                    gDataPointer += 1;
                }   
            
            //as the function id is part of the payload too we should include it in the CRC calculations
            
            CRCData.push(136)
            CRCData = CRCData.concat(payloadData)    
            CRCcalculated = CRC(CRCData)
        
            //add stuff to the ginstruction array    
            gInstructionArray.push({ "functionId":136,
                                            "functionData":payloadData,
                                            "CRC":CRCcalculated})
    
        }
//137 -   Enable / Disable axis
MBCommandArray[137-offset] = 1
//139 -   Que extended point
MBCommandArray[139-offset] = 24
//140 -   Set extended point
MBCommandArray[140-offset] = 20
//141 -   Wait for platform ready
MBCommandArray[141-offset] = 5
//142 -   Que extended point, new style
MBCommandArray[142-offset] = 25
//143 -   Store home positions
MBCommandArray[143-offset] = 1
//144 -   Recall home positions
MBCommandArray[144-offset] = 1
//145 -   Set digital potention meter value
MBCommandArray[145-offset] = 2
//146 -   Set RGB led value
MBCommandArray[146-offset] = 5
//147 -   Set Beep
MBCommandArray[147-offset] = 5
//148 -   Wait for Button
MBCommandArray[148-offset] = 4
//149 -   Display message to LCD
MBCommandArray[149-offset] = function(){
        //start of build function
            var payloadData = []
            var CRCcalculated = 0;
            var CRCData = [];
            
            //pop of the opening command
            gDataPointer += 1
            
            for(var i=0; i<4 ; i++)
                {
                    payloadData.push(gData[gDataPointer].toString(16))
                    gDataPointer += 1;
                }
            
            //if there is no null found then go on and pop off whatever needs to go on the display
            while(gData[gDataPointer]!=0)
                {
                    payloadData.push(gData[gDataPointer])
                    gDataPointer += 1;
                }   
            //pop of the last byte and add it to the build name
            payloadData.push(0);
            gDataPointer += 1;
    
             //as the function id is part of the payload too we should include it in the CRC calculations
            
            CRCData.push(149)
            CRCData = CRCData.concat(payloadData)    
            CRCcalculated = CRC(CRCData)
            
            gInstructionArray.push({ "functionId":149,
                                            "functionData":payloadData,
                                            "CRC":CRCcalculated})
    
}
//150 -   Set Build Percentage
MBCommandArray[150-offset] = 2
//151 -   Que songe
MBCommandArray[151-offset] = 1
//152 -   Reset to factory
//153 -   Build start notification
MBCommandArray[153-offset] = function()
        {
            //start of build function
            var payloadData = []
            var CRCcalculated = 0;
            var CRCData = [];
            
            //pop of the opening command, and the 4 zero bytes following
            gDataPointer += 5
            
            //if there is no null found then go on and pop off the build data
            while(gData[gDataPointer]!=0)
                {
                    payloadData.push(gData[gDataPointer])
                    gDataPointer += 1;
                }   
            //pop of the last byte and add it to the build name
            payloadData.push(0);
            gDataPointer += 1;
             //as the function id is part of the payload too we should include it in the CRC calculations
            
            CRCData.push(153)
            CRCData = CRCData.concat(payloadData)    
            CRCcalculated = CRC(CRCData)
        
            gInstructionArray.push({ "functionId":153,
                                            "functionData":payloadData,
                                            "CRC":CRCcalculated})
    
        }
//154 -   Build end notification
MBCommandArray[154-offset] = 1
//155 -   Queue extended point X3G
MBCommandArray[155-offset] = 31
//157 -   Stream Version
MBCommandArray[157-offset] = 18

function fillInstructionArray(functionId,nOfBytes)
    {
         //start of build function
            var payloadData = []
            var CRCcalculated = 0;
            var CRCData = [];
            //pop of the opening command
            gDataPointer += 1
            
            //for this command we need to take the next 2 bytes
            for(var i=0; i<nOfBytes ; i++)
                {
                    payloadData.push(gData[gDataPointer])
                    gDataPointer += 1;
                }   
        //as the function id is part of the payload too we should include it in the CRC calculations
        CRCData.push(functionId)
        CRCData = CRCData.concat(payloadData)    
        
        CRCcalculated = CRC(CRCData)
        gInstructionArray.push( {"functionId":functionId,
                                        "functionData":payloadData,
                                        "CRC":CRCcalculated})
    }


  /**
   * CRC table from http://forum.sparkfun.com/viewtopic.php?p=51145 this is needed to calculate the crc over the payload
   */
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

