# x3g-nodered
Node red node to parse X3G/S3G protocol

This project is aimed at using node red to control a makerbot (clone) 3d printer.
The project consist of 3 parts
* Parser - converts the binary s3g/x3g file into a json payload with CRC calculation (this result could be stored in a nosql database as a repository of printable objects)
* Set work - this is needed for node red to be able to store multiple print jobs in a queue
* State machine - this is the statemachine that sends data to the printer and makes sure that the printer buffer doesn't overflow etc.

Its relying on node red however you can also use it in other projects as the node red parts are merely wrappers around the bare functionality

Everything is written in nodejs so that should be familiar teritory for most people.

Included Files
*Parser
- x3g_functionarray.js this is the parser, it accepts a binary base64 encoded file
- x3g_parser.html/js these are needed in case you want to use this whith node red
