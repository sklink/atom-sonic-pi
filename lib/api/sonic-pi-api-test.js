'use babel';
let SonicPiApi;

const {CompositeDisposable} = require('atom');
const electron              = require('electron').remote;

const os                    = require('os');
const process               = require('process');
const fs                    = require('fs');
const path                  = require('path');
const child_process         = require('child_process');
const net                   = require('net');

const uuid                  = require('uuid')
const osc                   = require('node-osc');

const logger = require('../utils/logger.js');
const proc_utils = require('../utils/proc_utils.js')

const State = {
  Start: 0,
  Initializing: 1,
  Invalid: 2,
  Created: 3
};

const SonicPiPortId = {
    Invalid: 0,
    gui_listen_to_server: 1,
    gui_send_to_server: 2,
    server_listen_to_gui: 3,
    server_send_to_gui: 4,
    scsynth: 5,
    scsynth_send: 6,
    server_osc_cues: 7,
    erlang_router: 8,
    osc_midi_out: 9,
    osc_midi_in: 10,
    websocket: 11
};

// Log output of the API to the log files or the console?
const LogOption = {
    File: 0,
    Console: 1
};


class SonicPiAPI {
  constructor(root_path) {
    this.use_udp = false;
    this.m_paths =  {
        RootPath: "", // Sonic Pi Application root
        RubyPath: "", // Path to ruby executable
        RubyServerPath: "", // Path to the ruby server script
        PortDiscoveryPath: "", // Path to the port discovery script
        FetchUrlPath: "", // Path to the fetch url script
        SamplePath: "", // Path to the samples folder
        UserPath: "",
        ServerErrorLogPath: "",
        ServerOutputLogPath: "",
        ProcessLogPath: "",
        SCSynthLogPath: "",
        InitScriptPath: "",
        ExitScriptPath: "",
        GUILogPath: "",
        TaskRegisterPath: ""
    }
    this.m_ports = {}
    this.m_guid = "";
    init(root_path);
 }
//
//
// using TimePoint = std::chrono::time_point<std::chrono::high_resolution_clock>;
//
// struct CueInfo
// {
//     std::string time;
//     std::string address;
//     int id;
//     std::string args;
//     uint64_t index;
//     TimePoint arrivalTime;
// };
//
// // This is the processed audio data from the thread
// struct ProcessedAudio
// {
//     std::vector<float> m_spectrum[2];
//     std::vector<float> m_spectrumQuantized[2];
//     std::vector<float> m_samples[2];
//     std::vector<float> m_monoSamples;
// };
//
// enum class MessageType
// {
//     StartupError,
//     RuntimeError,
//     SyntaxError,
//     Message,
//     Info,
//     InfoText,
//     Muti
// };
//
// struct MessageData
// {
//     std::string text;
//     int style = 0;
// };
//
// struct MessageInfo : MessageData
// {
//     MessageType type;
//     int jobId = 0;
//     std::string threadName;
//     std::string runtime;
//     std::string backtrace;
//     int line = 0;
//     std::string errorLineString;
//     std::string lineNumString;
//
//     std::vector<MessageData> multi;
// };
//
// enum class MidiType
// {
//     Out,
//     In
// };
//
// struct MidiInfo
// {
//     MidiType type;
//     std::string portInfo;
// };
//
// enum class StatusType
// {
//     Ack,
//     AllComplete,
//     Exited
// };
//
// struct StatusInfo
// {
//     StatusType type;
//     std::string id;
// };
//
// struct VersionInfo
// {
//     std::string version;
//     int num;
//     std::string latestVersion;
//     int latestVersionNum;
//     int lastCheckedDay;
//     int lastCheckedMonth;
//     int lastCheckedYear;
//     std::string platform;
// };
//
// enum class BufferType
// {
//     Replace,
//     ReplaceIndex,
//     ReplaceLines,
//     RunIndex
// };
//
// struct BufferInfo
// {
//     BufferType type;
//     std::string id;
//     int bufferIndex;
//     std::string content;
//     int line;
//     int index;
//     int lineNumber;
//
//     // replace-lines
//     int startLine;
//     int finishLine;
//     int pointLine;
//     int pointIndex;
// };
//

  find_home_path() {
    var homePath;
    var pszHome = process.env["SONIC_PI_HOME"];
    if (pszHome != null) {
      homePath = path.normalize(pszHome);
    }

    // Check for home path existence and if not, use user documents path
    if (!path.exists(homePath)) {
      homePath = os.homedir();
    }

    // Final attempt at getting the folder; try to create it if possible
    if (!path.exists(homePath)) {
      fs.mkdir(homePath, { recursive: false }, (err) => {
        if (err) throw err;
      });
    }
    return homePath;
  }


// Initialize the API with the sonic pi root path (the folder containing the app folder)
  init(root) {
    if (m_state == State.Created) {
      console.err("Call shutdown before init!");
      return false;
    }

    // Start again, shutdown if we fail init
    m_state = State.Invalid;
    // auto exitScope = sg::make_scope_guard([&]() {
    //     if (m_state == State::Invalid)
    //     {
    //         LOG(DBG, "Init failure, calling shutdown");
    //         Shutdown();
    //     }
    // });

    // A new Guid for each initialization
    m_guid = uuid();

    if (!fs.exists(root)) {
        return atom.notifications.addError(`Could not find root path: ${root}`);
    }

    var homePath = find_home_path();

    m_paths.RootPath = path.normalize(root);

    if (process.platform == "win32") {
      this.m_paths.RubyPath = path.join(this.m_paths.RootPath, "app/server/native/ruby/bin/ruby.exe");
    } else {
      this.m_paths.RubyPath = path.join(this.m_paths.RootPath, "app/server/native/ruby/bin/ruby");
    }

    if (!fs.exists(m_path.RubyPath)) {
      this.m_paths.RubyPath = "ruby";
    }

    // Create script paths
    this.m_paths.RubyServerPath    = path.join(this.m_paths.RootPath, "app/server/ruby/bin/sonic-pi-server.rb");
    this.m_paths.PortDiscoveryPath = path.join(this.m_paths.RootPath, "app/server/ruby/bin/port-discovery.rb");
    this.m_paths.FetchUrlPath      = path.join(this.m_paths.RootPath, "app/server/ruby/bin/fetch-url.rb");
    this.m_paths.InitScriptPath    = path.join(this.m_paths.RootPath, "app/server/ruby/bin/init-script.rb");
    this.m_paths.ExitScriptPath    = path.join(this.m_paths.RootPath, "app/server/ruby/bin/exit-script.rb");
    this.m_paths.TaskRegisterPath  = path.join(this.m_paths.RootPath, "app/server/ruby/bin/task-register.rb");

    // Sanity check on script existence
    const checkPaths = [
      this.m_paths.RubyServerPath,
      this.m_paths.PortDiscoveryPath,
      this.m_paths.FetchUrlPath,
      this.m_paths.InitScriptPath,
      this.m_paths.ExitScriptPath,
      this.m_paths.TaskRegisterPath
    ];
    checkPaths.forEach((path, i) => {
      if (!fs.exists(path)) {
          return atom.notifications.addError(`Could not find script path: ${path}`);
      }
    });

    // Samples
    this.m_paths.SamplePath = path.join(this.m_paths.RootPath, "etc/samples");

    // Sonic pi home directory
    this.m_paths.UserPath = path.join(homePath, ".sonic-pi");
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
    this.m_paths.ServerErrorLogPath  = path.join(logPath, "server-errors.log");
    this.m_paths.ServerOutputLogPath = path.join(logPath, "server-output.log");
    this.m_paths.ProcessLogPath      = path.join(logPath, "processes.log");
    this.m_paths.SCSynthLogPath      = path.join(logPath, "scsynth.log");
  this.  m_paths.GUILogPath          = path.join(logPath, "gui.log");
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
    const init_script = spawnSync(this.m_paths.RubyPath, this.m_paths.InitScriptPath]);
    if (init_script.error) {
      console.log('error', init_script.error);
      return false;
    }

    console.log("Welcome to Sonic Pi");
    console.log("===================");

    if (!get_ports()) {
        return false;
    }
    if (!start_osc_server()) {
        return false;
    }
    if (!start_ruby_server()) {
        return false;
    }

    m_state = State.Initializing;

    console.log("Init SonicPi Succeeded...");
    return true;
  },




  start_ruby_server() {
    var cmd = m_paths.RubyPath;
    var args = [];
    args.push("--enable-frozen-string-literal");
    args.push("-E");
    args.push("utf-8");
    args.push(m_paths.RubyServerPath);

    if (use_udp == true) {
        args.push_back("-u");
    } else {
        args.push_back("-t");
    }

    args.push_back(m_ports.server_listen_to_gui);
    args.push_back(m_ports.server_send_to_gui);
    args.push_back(m_ports.scsynth);
    args.push_back(m_ports.scsynth_send);
    args.push_back(m_ports.server_osc_cues);
    args.push_back(m_ports.erlang_router);
    args.push_back(m_ports.websocket);

    console.log("Launching Sonic Pi Runtime Server:");

    console.log(`Args: ${cmd} ${args.join(" ")}`);

    if (m_homeDirWriteable) {
      m_spRubyServer = proc_utils.start_process(cmd, args, m_paths.ServerOutputLogPath, m_paths.ServerErrorLogPath);
    } else {
      m_spRubyServer = proc_utils.start_process(cmd, args);
    }

    if (!m_spRubyServer) {
      atom.notifications.addError("The Sonic Pi Server could not be started!");
      console.error("Failed to start ruby server!");
      return false;
    }

      // // Register server pid for potential zombie clearing
      // RunProcess(std::vector<std::string>{ GetPath(SonicPiPath::RubyPath).string(), GetPath(SonicPiPath::TaskRegisterPath).string(), std::to_string(m_spRubyServer->pid().first) });
      // LOG(INFO, "Ruby server pid registered: " << m_spRubyServer->pid().first);
      //
      // m_startServerTime = timer_start();

    return true;
  },




  shutdown() {
    if (m_state == State.Created || m_state == State.Invalid || m_state == State.Initializing)
    {
        console.log("Shutdown");
        // m_spAudioProcessor.reset();
        StopServerAndOsc();
        RunCleanupScript();
        // if (m_coutbuf)
        // {
        //     std::cout.rdbuf(m_coutbuf); // reset to stdout before exiting
        //     m_coutbuf = nullptr;
        // }
    }
    m_state = State.Start;
  },

  get_ports() {
    const port_discovery = child_process.spawnSync(m_paths.RubyPath, [m_paths.PortDiscoveryPath]);
    if (port_discovery.error) {
      console.log('error', port_discovery.error);
      return false;
    }

    // Split
    // Trim and replace - with _ because our enum uses underscores
    var ports = port_discovery.stdout.replace("-", "_").split("\r\n:");

    var port_map = {};
    var id;
    ports.forEach((item, i) => {
      if (i % 2 == 0) {
        id = item;
      } else {
        port_map[id] = int(item);
      }
    });

    console.log("Checking Ports: ");

    var missingPort = false;
    Object.entries(port_map).forEach(([id,port])=>{
      m_ports[id] = port;

      var server = net.createServer(function(socket) {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
      });

      server.on('error', function (e) {
        console.error(`${id}: ${port} [Not Available]`);
        missingPort = true;
      });
      server.on('listening', function (e) {
        server.close();
        console.log(`${id}: ${port} [OK]`);
      });

      server.listen(port, '127.0.0.1');

      console.log(`${key}:${value}`);
    });

    if (missingPort) {
      console.error("Critical Error. One or more ports is not available.");
      atom.notifications.addError("One or more ports is not available. Is Sonic Pi already running? If not, please reboot your machine and try again.");
      return false;
    } else {
      console.log("All Ports OK!");
    }

    return true;
  },

  start_osc_server() {
    if (use_udp) {
        var listenPort = m_ports.gui_listen_to_server;

        // m_spOscServer = std::make_shared<OscServerUDP>(m_pClient, std::make_shared<OscHandler>(m_pClient), listenPort);
        // m_oscServerThread = std::thread([&]() {
        //     m_spOscServer->start();
        //     LOG(DBG, "Osc Server Thread Exiting");
        // });
    } else {
        // TODO: TCP
        //sonicPiOSCServer = new SonicPiTCPOSCServer(this, handler);
        //sonicPiOSCServer->start();
    }
    return true;
  },

  bool SonicPiAPI::send_osc(Message m)
  {
      bool res = m_spOscSender->sendOSC(m);
      if (!res)
      {
          LOG(ERR, "Could Not Send OSC");
      }
      return res;
  }

bool SonicPiAPI::WaitForServer()
{
    if (m_state == State::Created)
    {
        return true;
    }

    if (m_state != State::Initializing)
    {
        return false;
    }

    //QString contents;
    LOG(INFO, "Waiting for Sonic Pi Server to boot...");
    bool server_booted = false;
    if (!m_homeDirWriteable)
    {
        // we can't monitor the logs so hope for the best!
        std::this_thread::sleep_for(15s);
        server_booted = true;
    }
    else
    {
        // TODO: Is this really necessary?
        for (int i = 0; i < 30; i++)
        {
            auto contents = file_read(GetPath(SonicPiPath::ServerOutputLogPath));
            if (contents.find("Sonic Pi Server successfully booted.") != std::string::npos)
            {
                LOG(INFO, "Sonic Pi Server successfully booted.");
                server_booted = true;
                break;
            }
            else
            {
                std::cout << ".";
                std::this_thread::sleep_for(2s);
            }
            server_booted = true;
            break;
        }
    }

    if (!server_booted)
    {
        MessageInfo message;
        message.type = MessageType::StartupError;
        message.text = "Critical error! Could not boot Sonic Pi Server.";

        m_pClient->Report(message);
        return false;
    }

    int timeout = 60;
    LOG(INFO, "Waiting for Sonic Pi Server to respond...");
    while (m_spOscServer->waitForServer() && timeout-- > 0)
    {
        std::this_thread::sleep_for(1s);
        std::cout << ".";
        if (m_spOscServer->isIncomingPortOpen())
        {
            Message msg("/ping");
            msg.pushStr(m_guid);
            msg.pushStr("QtClient/1/hello");
            SendOSC(msg);
        }
    }
    std::cout << std::endl;

    if (!m_spOscServer->isServerStarted())
    {
        MessageInfo message;
        message.type = MessageType::StartupError;
        message.text = "Critical error! Could not connect to Sonic Pi Server.";

        m_pClient->Report(message);
        return false;
    }
    else
    {
        auto time = timer_stop(m_startServerTime);
        LOG(INFO, "Sonic Pi Server connection established in " << time << "s");

        // Create the audio processor
        m_spAudioProcessor = std::make_shared<AudioProcessor>(m_pClient, GetPort(SonicPiPortId::scsynth));

        // All good
        m_state = State::Created;

        return true;
    }
}

// Initialize the API with the sonic pi root path (the folder containing the app folder)
bool SonicPiAPI::Init(const fs::path& root)
{
    if (m_state == State::Created)
    {
        MessageInfo message;
        message.type = MessageType::StartupError;
        message.text = "Call shutdown before Init!";

        m_pClient->Report(message);
        LOG(ERR, "Call shutdown before init!");
        return false;
    }

    // Start again, shutdown if we fail init
    m_state = State::Invalid;
    auto exitScope = sg::make_scope_guard([&]() {
        if (m_state == State::Invalid)
        {
            LOG(DBG, "Init failure, calling shutdown");
            Shutdown();
        }
    });

    // A new Guid for each initialization
#if defined(__APPLE__)
    m_guid = random_string(32);
#else
    m_guid = xg::newGuid().str();
#endif

    if (!fs::exists(root))
    {
        MessageInfo message;
        message.type = MessageType::StartupError;
        message.text = "Could not find root path: " + root.string();

        m_pClient->Report(message);
        return false;
    }

    auto homePath = FindHomePath();

    m_paths.RootPath = fs::canonical(fs::absolute(root));

#if defined(WIN32)
    m_paths.RubyPath = m_paths.RootPath / "app/server/native/ruby/bin/ruby.exe";
#else
    m_paths.RubyPath = m_paths.RootPath / "app/server/native/ruby/bin/ruby";
#endif

    if (!fs::exists(m_paths.RubyPath))
    {
        m_paths.RubyPath = "ruby";
    }

    // Create script paths
    m_paths.RubyServerPath = m_paths.RootPath / "app/server/ruby/bin/sonic-pi-server.rb";
    m_paths.PortDiscoveryPath = m_paths.RootPath / "app/server/ruby/bin/port-discovery.rb";
    m_paths.FetchUrlPath = m_paths.RootPath / "app/server/ruby/bin/fetch-url.rb";
    m_paths.InitScriptPath = m_paths.RootPath / "app/server/ruby/bin/init-script.rb";
    m_paths.ExitScriptPath = m_paths.RootPath / "app/server/ruby/bin/exit-script.rb";
    m_paths.TaskRegisterPath = m_paths.RootPath / "app/server/ruby/bin/task-register.rb";

    // Sanity check on script existence
    const auto checkPaths = std::vector<SonicPiPath>{ SonicPiPath::RubyServerPath, SonicPiPath::PortDiscoveryPath, SonicPiPath::FetchUrlPath, SonicPiPath::InitScriptPath, SonicPiPath::ExitScriptPath, SonicPiPath::TaskRegisterPath };
    for (const auto& check : checkPaths)
    {
        if (!fs::exists(m_paths.RubyServerPath))
        {
            MessageInfo message;
            message.type = MessageType::StartupError;
            message.text = "Could not find script path: " + m_paths.RubyServerPath.string();

            m_pClient->Report(message);
            return false;
        }
    }

    // Samples
    m_paths.SamplePath = m_paths.RootPath / "etc/samples";

    // Sonic pi home directory
    m_paths.UserPath = homePath / ".sonic-pi";

    auto logPath = m_paths.UserPath / "log";

    // Make the log folder and check we can write to it.
    // This is /usr/home/.sonic-pi/log
    m_homeDirWriteable = true;
    if (!fs::exists(logPath))
    {
        std::error_code err;
        if (!fs::create_directories(logPath, err))
        {
            m_homeDirWriteable = false;
            LOG(INFO, "Home dir not writable: " << err.message());
        }
        else
        {
            std::ofstream fstream(logPath / ".writeTest");
            if (!fstream.is_open())
            {
                m_homeDirWriteable = false;
                LOG(INFO, "Home dir not writable!");
            }
        }
    }

    // Our log paths
    m_paths.ServerErrorLogPath = logPath / "server-errors.log";
    m_paths.ServerOutputLogPath = logPath / "server-output.log";
    m_paths.ProcessLogPath = logPath / "processes.log";
    m_paths.SCSynthLogPath = logPath / "scsynth.log";

    // This is technically 'this' processes log path; but it is called gui log
    m_paths.GUILogPath = logPath / "gui.log";

    std::for_each(m_paths.begin(), m_paths.end(), [this](auto& entry) {
        if (fs::exists(entry.second))
        {
            entry.second = fs::canonical(entry.second);
        }
        return entry;
    });

    // Setup redirection of log from this app to our log file
    // stdout into ~/.sonic-pi/log/gui.log
    if (m_homeDirWriteable && (m_logOption == LogOption::File))
    {
        m_coutbuf = std::cout.rdbuf();
        m_stdlog.open(m_paths.GUILogPath.string().c_str());
        std::cout.rdbuf(m_stdlog.rdbuf());
    }

    // Clear out old tasks from previous sessions if they still exist
    // in addition to clearing out the logs
    auto ec = RunProcess(std::vector<std::string>{
        m_paths.RubyPath.string(),
        m_paths.InitScriptPath.string() });
    if (ec)
    {
        return false;
    }

    LOG(INFO, "Welcome to Sonic Pi");
    LOG(INFO, "===================");

    if (!GetPorts())
    {
        return false;
    }

    if (!StartOscServer())
    {
        return false;
    }

    if (!StartRubyServer())
    {
        return false;
    }

    // Create the sender
    m_spOscSender = std::make_shared<OscSender>(GetPort(SonicPiPortId::gui_send_to_server));

    m_state = State::Initializing;

    LOG(INFO, "Init SonicPi Succeeded...");
    return true;
}

bool SonicPiAPI::TestAudio()
{
    // Just play a chord
    auto fileName = "d:/pi.rb";
    Message msg("/save-and-run-buffer");
    msg.pushStr(m_guid);
    msg.pushStr(fileName);
    msg.pushStr("play_chord [:c4, :e4, :g4]");
    msg.pushStr(fileName);
    bool res = SendOSC(msg);
    return res;
}

void SonicPiAPI::StopServerAndOsc()
{
    /*
    * TODO: TCP
    if(m_protocol == APIProtocol::TCP){
        clientSock->close();
    }
    */

    // Ask the server to exit
    if (!m_spRubyServer)
    {
        LOG(DBG, "Server process is not running.");
    }
    else
    {
        auto timer = timer_start();

        // Ask the server to exit
        // This happens really fast, and the process is typically gone before we get to the sleep below.
        LOG(INFO, "Asking server process to exit...");
        Message msg("/exit");
        msg.pushStr(m_guid);
        SendOSC(msg);

        // Reproc is having a hard time figuring out that the process has gone because
        // the ruby server is holding onto a socket and not cleaning it up.
        // We use a quick platform-independent check for exit instead, and just give it a second
        // for that check to succeed before doing reproc's wait/terminate/kill process which
        // will inevitably succeed too; just with a longer delay.
        // We should fix the ruby layer and remove these extra checks
        std::this_thread::sleep_for(1s);

        // Quick check for it if it now gone
        if (process_running(m_spRubyServer->pid().first))
        {
            // OK, wait to stop it, terminate it, then till it.
            reproc::stop_actions stopAndKill = {
                { reproc::stop::wait, reproc::milliseconds(ProcessWaitMilliseconds) },
                { reproc::stop::terminate, reproc::milliseconds(TerminateProcessMilliseconds) },
                { reproc::stop::kill, reproc::milliseconds(KillProcessMilliseconds) }
            };
            m_spRubyServer->stop(stopAndKill);
        }

        LOG(INFO, "Server process gone in " << timer_stop(timer) << "s");
    }

    // Stop the osc server and hence the osc thread
    if (m_spOscServer)
    {
        LOG(DBG, "Stopping Osc Server...");
        m_spOscServer->stop();
    }

    // The server should have closed the osc channel; therefore we can join the thread
    if (m_oscServerThread.joinable())
    {
        LOG(DBG, "Waiting for Osc Server Thread...");
        m_oscServerThread.join();
        LOG(DBG, "Osc Server Thread done");
    }
    else
    {
        LOG(DBG, "Osc Server thread has already stopped");
    }
    m_spOscSender.reset();
}

void SonicPiAPI::RunCleanupScript()
{
    if (fs::exists(GetPath(SonicPiPath::ExitScriptPath)))
    {
        // Ensure child processes are nuked if they didn't exit gracefully
        LOG(DBG, "Executing exit script: " << GetPath(SonicPiPath::ExitScriptPath));
        auto ret = RunProcess({ GetPath(SonicPiPath::RubyPath).string(), GetPath(SonicPiPath::ExitScriptPath).string() });
        if (ret)
        {
            LOG(ERR, "Failed to call exit: " << ret.message());
            return;
        }
    }
}

const fs::path& SonicPiAPI::GetPath(SonicPiPath piPath)
{
    return m_paths[piPath];
}

const int& SonicPiAPI::GetPort(SonicPiPortId port)
{
    return m_ports[port];
}

std::string SonicPiAPI::GetLogs()
{
    auto logs = std::vector<fs::path>{ GetPath(SonicPiPath::ServerOutputLogPath),
        GetPath(SonicPiPath::ServerErrorLogPath),
        GetPath(SonicPiPath::ProcessLogPath),
        GetPath(SonicPiPath::SCSynthLogPath),
        GetPath(SonicPiPath::GUILogPath) };

    std::ostringstream str;
    for (auto& log : logs)
    {
        if (fs::exists(log))
        {
            auto contents = string_trim(file_read(log));
            if (!contents.empty())
            {
                str << log << ":" << std::endl
                    << contents << std::endl
                    << std::endl;
            }
        }
    }
    return str.str();
}

void SonicPiAPI::AudioProcessor_SetMaxFFTBuckets(uint32_t buckets)
{
    if (m_spAudioProcessor)
    {
        m_spAudioProcessor->SetMaxBuckets(buckets);
    }
}

void SonicPiAPI::AudioProcessor_Enable(bool enable)
{
    if (m_spAudioProcessor)
    {
        m_spAudioProcessor->Enable(enable);
    }
}

void SonicPiAPI::AudioProcessor_EnableFFT(bool enable)
{
    if (m_spAudioProcessor)
    {
        m_spAudioProcessor->EnableFFT(enable);
    }
}


void SonicPiAPI::AudioProcessor_ConsumedAudio()
{
    if (m_spAudioProcessor)
    {
        m_spAudioProcessor->SetConsumed(true);
    }
}


const std::string& SonicPiAPI::GetGuid() const
{
    return m_guid;
}

void SonicPiAPI::BufferNewLineAndIndent(int point_line, int point_index, int first_line, const std::string& code, const std::string& fileName, const std::string& id)
{
    Message msg("/buffer-newline-and-indent");
    msg.pushStr(id);
    msg.pushStr(fileName);
    msg.pushStr(code);
    msg.pushInt32(point_line);
    msg.pushInt32(point_index);
    msg.pushInt32(first_line);
    SendOSC(msg);
}

void SonicPiAPI::Run(const std::string& buffer, const std::string& text)
{
    Message msg("/save-and-run-buffer");
    msg.pushStr(m_guid);
    msg.pushStr(buffer);
    msg.pushStr(text);
    msg.pushStr(buffer);
    bool res = SendOSC(msg);
}

void SonicPiAPI::Stop()
{
    Message msg("/stop-all-jobs");
    msg.pushStr(m_guid);
    SendOSC(msg);
}

uint32_t SonicPiAPI::MaxWorkspaces() const
{
    return 10;
}

void SonicPiAPI::LoadWorkspaces()
{
    for (uint32_t i = 0; i < MaxWorkspaces(); i++)
    {
        Message msg("/load-buffer");
        msg.pushStr(m_guid);
        std::string s = "workspace_" + string_number_name(i);
        msg.pushStr(s);
        SendOSC(msg);
    }
}

void SonicPiAPI::SaveWorkspaces(const std::map<uint32_t, std::string>& workspaces)
{
    LOG(INFO, "Saving workspaces");

    for (uint32_t i = 0; i < MaxWorkspaces(); i++)
    {
        auto itrSpace = workspaces.find(i);
        if (itrSpace != workspaces.end())
        {
            Message msg("/save-buffer");
            msg.pushStr(m_guid);
            std::string s = "workspace_" + string_number_name(i);
            msg.pushStr(s);
            msg.pushStr(itrSpace->second);
            SendOSC(msg);
        }
    }

}

bool SonicPiAPI::SaveAndRunBuffer(const std::string& name, const std::string& text)
{
    std::string code = text;
    m_settings.Preprocess(code);

    Message msg("/save-and-run-buffer");
    msg.pushStr(m_guid);
    msg.pushStr(name);
    msg.pushStr(code);
    msg.pushStr(name);
    bool res = SendOSC(msg);
    if (!res)
    {
        return false;
    }
    return true;
}

const APISettings& SonicPiAPI::GetSettings() const
{
    return m_settings;
}

void SonicPiAPI::SetSettings(const APISettings& settings)
{
    m_settings = settings;
}

} // namespace SonicPi
