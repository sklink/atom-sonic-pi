'use babel';

const osc = require('node-osc');

export default class SonicPiOSCServer {
  constructor(ip, port, spider_ip, spider_port) {
    let _this = this;

    this.m_port = port;
    this.m_ip = ip;
    this.osc_client = new osc.Client(spider_ip, spider_port);

    this.osc_server = new osc.Server(port, ip, () => {
      console.log(`OSC server is listening on ${ip}:${port}`);
    });

    this.osc_server.on('message', function (msg) {
      console.log(`Message recieved: ${msg}`);
      _this.osc_client.send("/ack");
    })
  }

  destructor() {
    this.osc_server.close();
  }
}
