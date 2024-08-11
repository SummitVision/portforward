/*
    Author: GYZheng, http://github.com/iamgyz
    Feature: A port forwarding service that supports both local port forwarding and remote port forwarding.
    Environment: Node.js
    Install: npm install -g portforward
    Usage: portforward <from> <to>
    Update date: 2015.06.17
*/

var net = require('net');

function start() {
    console.log('============PORTFORWARD SERVICE BY GYZHENG============');
    
    var localPort, forwardPort, forwardAddr = '127.0.0.1';
    
    if (process.argv.length <= 5 && process.argv.length >= 4) {
        localPort = process.argv[2];
        forwardPort = process.argv[3];
        if (process.argv.length == 5)
            forwardAddr = process.argv[4];
    } else {
        console.log('Usage');
        console.log('#Mode 1: Local forwarding');
        console.log('portforward <from> <to>');
        console.log('Example: portforward 9999 80, which means forward port 9999 to port 80');
        console.log('#Mode 2: Remote host forwarding');
        console.log('portforward <from> <to> <remoteHost>');
        console.log('Example: portforward 9999 80 whatismyip.org, which means forward port 9999 to whatismyip.org:80');
        return;
    }

    var server = net.createServer();

    server.on('connection', function(sock) {
        console.log('[INFO] New client connect from ' + sock.remoteAddress + ':' + sock.remotePort);
        console.log('[INFO] Step1 : Connect to forwarded address and port...');
        var to = net.createConnection({
            host: forwardAddr,
            port: forwardPort
        });
        to.on('connect', function() {
            console.log('[INFO] ======> Connect to forwarded address & port successfully!');
            console.log('[INFO] Step2 : Start to forward the socket data!');
            to.pipe(sock);
            sock.pipe(to);
        });
        to.on('close', function() {
            console.log('[INFO] Forwarded port close the connection');
        });
        to.on('error', function(err) {
            console.log('[ERRO] Error occur! Connection to forwarded port closed');
            if (err.code == 'ENOTFOUND') {
                console.log('[ERRO] Remote host does not exist! Please check your host address again!!');
            } else if (err.code == 'ECONNREFUSED') {
                console.log('[ERRO] Forwarded Port is not open! Please check your port again!!');
            } else {
                console.log(err);
            }
            console.log('[INFO] Close client connection due to the errors');
            sock.destroy();
        });
        sock.on('close', function() {
            console.log('[INFO] Client closed the connection to forwarded port');
        });
    });
    server.on('error', function(err) {
        console.log('[ERRO] Error occur! Are you trying to bind an already-used port?');
        console.log(err);
    });

    server.listen(localPort, '0.0.0.0', function() {
        console.log('[INFO] Listening on ' + server.address().address + ':' + server.address().port);
        console.log('[INFO] Forward target ' + forwardAddr + ':' + forwardPort);
        console.log('[INFO] Ready for handling the port-forwarding!');
    });
}

exports.start = start;
