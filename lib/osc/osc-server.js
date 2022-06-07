'use babel';

const osc = require('node-osc');
const {Emitter} = require('event-kit')

export default class SonicPiOSCServer {
  constructor(ip, port, spider_ip, spider_port) {
    let _this = this;

    this.m_port = port;
    this.m_ip = ip;
    this.log_emitter = new Emitter();
    this.osc_client = new osc.Client(spider_ip, spider_port);

    this.osc_server = new osc.Server(port, ip, () => {
      console.log(`OSC server is listening on ${ip}:${port}`);
    });

    this.osc_server.on('message', function (msg) {
      switch (msg[0]) {
        case "/log/info":
          var message = msg[2];
          _this.log_emitter.emit('log/info', msg.slice(1));
          break;
        case "/log/error":
          _this.log_emitter.emit('log/error', msg.slice(1));
          break;
        case "/log/multi_message":
          var run = msg[1];
          var thread_name = msg[2];
          var timestamp = msg[3];
          _this.log_emitter.emit('log/multi-message', msg.slice(1));
          break;

        case "/exited":
          _this.log_emitter.emit('exited');
        default:

      }
      console.log(`Message recieved: ${msg}`);
      _this.osc_client.send("/ack");
    })
  }

  destructor() {
    this.osc_server.close();
    this.log_emitter.dispose();
  }
}
