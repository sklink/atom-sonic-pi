'use babel';

// const {CompositeDisposable} = require('atom');
// const electron              = require('electron').remote;

const os                    = require('os');
const process               = require('process');
const fs                    = require('fs');
const path                  = require('path');
const child_process         = require('child_process');
// const net                   = require('net');

const uuid                  = require('uuid')
const osc = require('node-osc');

const SonicPiOSCServer      = require('../osc/osc-server');

// const logger = require('../utils/logger.js');
const proc_utils = require('../utils/proc_utils.js')

const State = {
  Start: 0,
  Initializing: 1,
  Invalid: 2,
  Created: 3
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class SonicPiAPI {
  constructor(root_path) {
    this.state = State.Start;
    this.use_udp = false;
    this.m_paths =  {
      RootPath: "", // Sonic Pi Application root
      RubyPath: "", // Path to ruby executable
      BootDaemonPath: "", // Path to the ruby server script

      SamplePath: "", // Path to the samples folder
      UserPath: "",
      ServerErrorLogPath: "",
      ServerOutputLogPath: "",
      ProcessLogPath: "",
      SCSynthLogPath: "",
      GUILogPath: ""
    }
    this.m_ports = {}
    this.m_guid = "";
    this.m_token = null;
    this.osc_server = null;
    this.osc_client = null;
    this.init(root_path);
  }

  destructor() {
    delete this.osc_server;
    this.shutdown();
  }

  start_boot_daemon() {
    console.log("Launching Sonic Pi Boot Daemon:");

    var output = "";
    var cmd = this.m_paths.RubyPath;
    var args = [];

    args.push(this.m_paths.BootDaemonPath);

    console.log("Args: " + args.join(", "));

    m_bootDaemonProcess = proc_utils.start_process(cmd, args);
    if (!m_bootDaemonProcess) {
      atom.notifications.addError("The Boot Daemon could not be started!");
      console.error("Failed to start Boot Daemon!");
      return false;
    }

    console.log("Attempting to read Boot Daemon output");
    return new Promise((resolve, reject) => {
      m_bootDaemonProcess.stdout.once('data', (data) => {
        console.log(`Received chunk ${data}`);

        var list = data.toString().split(" ");

        var token = list.pop();
        var ports = list;

        // Redirect stdout and stderr
        out_pipe = fs.createWriteStream(this.m_paths.DaemonLogPath);
        m_bootDaemonProcess.stdout.pipe(out_pipe);
        m_bootDaemonProcess.stderr.pipe(out_pipe);
        console.log(`Token: ${token}`)
        console.log(`Ports: ${ports}`)
        if (ports.length == 7) {
          resolve({
            token: parseInt(token),
            ports: {
              daemon:               parseInt(ports[0]),
              gui_listen_to_spider: parseInt(ports[1]),
              gui_send_to_spider:   parseInt(ports[2]),
              scsynth:              parseInt(ports[3]),
              tau_osc_cues:         parseInt(ports[4]),
              tau:                  parseInt(ports[5]),
              phx_http:             parseInt(ports[6])
            }
          });
        } else {
          resolve({
            token: null,
            ports: null
          });
        }
      });
      m_bootDaemonProcess.once('error', (err) => {
        reject(err);
      });
    });
  }

  run_code(code) {
    this.osc_client.send('/run-code', this.m_token, code);
  }

  stop() {
    this.osc_client.send('/stop-all-jobs', this.m_token);
  }

  async init(root) {
    if (this.state == State.Created) {
      console.err("Call shutdown before init!");
      return false;
    }

    // Start again, shutdown if we fail init
    this.state = State.Invalid;
    // auto exitScope = sg::make_scope_guard([&]() {
    //     if (this.state == State::Invalid)
    //     {
    //         LOG(DBG, "Init failure, calling shutdown");
    //         Shutdown();
    //     }
    // });

    // A new Guid for each initialization
    m_guid = uuid.v4();

    if (!fs.existsSync(root)) {
      return atom.notifications.addError(`Could not find root path: ${root}`);
    }

    this.m_paths.RootPath = path.normalize(root);

    // Find ruby path
    if (process.platform == "win32") {
      this.m_paths.RubyPath = path.join(this.m_paths.RootPath, "app/server/native/ruby/bin/ruby.exe");
    } else {
      this.m_paths.RubyPath = path.join(this.m_paths.RootPath, "app/server/native/ruby/bin/ruby");
    }

    if (!fs.existsSync(this.m_paths.RubyPath)) {
      this.m_paths.RubyPath = "ruby";
    }

    // Check script paths
    this.m_paths.BootDaemonPath = path.join(this.m_paths.RootPath, "app/server/ruby/bin/daemon.rb");
    if (!fs.existsSync(this.m_paths.BootDaemonPath)) {
      return atom.notifications.addError(`Could not find script path: ${this.m_paths.BootDaemonPath}`);
    }

    // Samples
    this.m_paths.SamplePath = path.join(this.m_paths.RootPath, "etc/samples");

    // Sonic Pi home directory
    this.m_paths.UserPath = path.join(os.homedir(), ".sonic-pi");
    var logPath = path.join(this.m_paths.UserPath, "log");

    // Make the log folder and check we can write to it.
    // This is /usr/home/.sonic-pi/log
    m_homeDirWriteable = true;
    try {
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath);
        fs.writeFileSync(path.join(logPath, ".writeTest"), "test");
        fs.unlinkSync(path.join(logPath, ".writeTest"));
      }
    } catch (err) {
      atom.notifications.addWarning(`Home directory not writable: ${err.message}`);
      console.error(err);
      m_homeDirWriteable = false;
    }

    // Our log paths
    this.m_paths.DaemonLogPath       = path.join(logPath, "daemon.log");
    this.m_paths.ServerErrorLogPath  = path.join(logPath, "server-errors.log");
    this.m_paths.ServerOutputLogPath = path.join(logPath, "server-output.log");
    this.m_paths.ProcessLogPath      = path.join(logPath, "processes.log");
    this.m_paths.SCSynthLogPath      = path.join(logPath, "scsynth.log");
    this.m_paths.GUILogPath          = path.join(logPath, "gui.log");
    //
    // // Setup redirection of log from this app to our log file
    // // stdout into ~/.sonic-pi/log/gui.log
    // if (m_homeDirWriteable && (m_logOption == LogOption::File))
    // {
    //     m_coutbuf = std::cout.rdbuf();
    //     m_stdlog.open(m_paths.GUILogPath.string().c_str());
    //     std::cout.rdbuf(m_stdlog.rdbuf());
    // }

    // Clear out old tasks from previous sessions if they still exist
    // in addition to clearing out the logs
    const init_script = child_process.spawnSync(this.m_paths.RubyPath, [this.m_paths.InitScriptPath]);
    if (init_script.error) {
      console.log('error', init_script.error);
      return false;
    }

    console.log("Welcome to Sonic Pi");
    console.log("===================");

    var result = await this.start_boot_daemon();

    this.m_token = result.token;
    this.m_ports = result.ports

    console.log(`Token: ${this.m_token}`)
    console.log(`Ports: ${this.m_ports}`)
    if (this.m_token == null) {
      return false;
    }

    this.daemon_osc_client = new osc.Client("127.0.0.1", this.m_ports.daemon);
    let _this = this;
    this.daemon_keep_alive = setInterval(() => {
      _this.daemon_osc_client.send("/daemon/keep-alive", _this.m_token);
    }, 4000);

    this.state = State.Initializing;

    this.osc_client = new osc.Client("127.0.0.1", this.m_ports.gui_send_to_spider);
    this.osc_server = new SonicPiOSCServer("127.0.0.1", this.m_ports.gui_listen_to_spider, "127.0.0.1", this.m_ports.gui_send_to_spider);


    console.log("Init SonicPi Succeeded...");
    return true;
  }
}
