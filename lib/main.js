// TODO: decaffeinate suggestions which may need checking:
// DS205: Consider reworking code to avoid use of IIFEs
// decaffeinate docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md

'use babel';
let sbAtomSonicPi;

const {CompositeDisposable} = require('atom');
const osc                   = require('node-osc');
const electron              = require('electron').remote;

const autocomplete_provider = require('./autocomplete');
const config_schema         = require('./config');
const Notifications         = require('./utils/notifications');
const SonicPiAPI            = require('./api/sonic-pi-api');
const SonicPiLogView        = require('./views/log');
const sbAtomSonicPiView     = require('./sb-atom-sonic-pi-view');          // for sbAtomSonicPiView

module.exports = (sbAtomSonicPi = {
  config: config_schema,
  sbAtomSonicPiView: null,  // for sbAtomSonicPiView
  subscriptions: null,
  modalPanel: null,         // for sbAtomSonicPiView

  provide() { return autocomplete_provider; },

  activate(state) {
    const _this = this;
    // Set up sbAtomSonicPiView
    this.sbAtomSonicPiView = new sbAtomSonicPiView(state.sbAtomSonicPiViewState);
    this.log_view = new SonicPiLogView();
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sbAtomSonicPiView.getElement(),
      visible: false
    });

    this.api = new SonicPiAPI();

    // Register commands
    this.subscriptions = new CompositeDisposable;
    // Add opener for the console
    this.subscriptions.add(atom.workspace.addOpener(uri => {
        if (uri === 'atom://sonic-pi/log') {
          return this.log_view;
        }
    }));
    // Add commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sb-atom-sonic-pi:start-server': {
        displayName: 'Sonic Pi: Start Server',
        didDispatch: () => this.start_server()
      },
      'sb-atom-sonic-pi:shutdown-server': {
        displayName: 'Sonic Pi: Shutdown Server',
        didDispatch: () => this.shutdown_server()
      },
      'sb-atom-sonic-pi:play-file': {
        displayName: 'Sonic Pi: Play File',
        didDispatch: () => this.play('getText')
      },
      'sb-atom-sonic-pi:save-and-play-file': {
        displayName: 'Sonic Pi: Save and Play File',
        didDispatch: () => this.saveAndPlay()
      },
      'sb-atom-sonic-pi:play-selection': {
        displayName: 'Sonic Pi: Play Selection',
        didDispatch: () => this.play('getSelectedText')
      },
      'sb-atom-sonic-pi:stop': {
        displayName: 'Sonic Pi: Stop Playing Code',
        didDispatch: () => this.stop()
      },
      'sb-atom-sonic-pi:open-tutorial': {
        displayName: 'Sonic Pi: Open Online Tutorial',
        didDispatch: () => this.open_tutorial()
      },
      'sb-atom-sonic-pi:toggle-log': {
        displayName: 'Toggle Log',
        didDispatch: () => this.toggle_log()
      }
      // 'sb-atom-sonic-pi:test-toggle': {
      //   displayName: 'Test Toggle',
      //   didDispatch: () => this.test_toggle()
      // }
    }));
  },

  // Set up toolbar
  consumeToolBar(getToolBar) {
    this.toolBar = getToolBar('sb-atom-sonic-pi');
    // Using custom icon set (Ionicons)

    // Add spacer
    this.toolBar.addSpacer();

    let label_element = document.createElement('h2')
    label_element.innerHTML = "Sonic Pi"
    const label = this.toolBar.addItem({
      element: label_element
    })

    this.toolBar.addSpacer();

    // Add buttons
    const button_play = this.toolBar.addButton({
      icon: 'md-play',
      callback: 'sb-atom-sonic-pi:play-file',
      tooltip: 'Play File',
      iconset: 'ion'
    });

    const button_stop = this.toolBar.addButton({
      icon: 'md-square',
      callback: 'sb-atom-sonic-pi:stop',
      tooltip: 'Stop Playing Code',
      iconset: 'ion'
    });

    const button_saveAndPlayFile = this.toolBar.addButton({
      icon: 'md-download',
      callback: 'sb-atom-sonic-pi:save-and-play-file',
      tooltip: 'Save and Play File',
      iconset: 'ion'
    });

    this.toolBar.addSpacer();

    const button_openTutorial = this.toolBar.addButton({
      icon: 'md-book',
      callback: 'sb-atom-sonic-pi:open_tutorial',
      tooltip: 'Open Online Tutorial',
      iconset: 'ion'
    });

    // Add spacer
    return this.toolBar.addSpacer();
  },

  deserializeLogView({data}) {
    return this.log_view.deserialize(data);
  },

  deactivate() {
    if (this.toolBar) {
      // Remove any toolbar items added
      this.toolBar.removeItems();
      this.toolBar = null;
    }
    this.modalPanel.destroy();        // for sbAtomSonicPiView
    this.subscriptions.dispose();
    this.api.destroy();
    return this.sbAtomSonicPiView.destroy();
  }, // for sbAtomSonicPiView

  serialize() {
    return {sbAtomSonicPiViewState: this.sbAtomSonicPiView.serialize()};
  }, // for test_toggle

  is_server_running() {
    if (!this.api.running) {
      Notifications.addError("Sonic Pi Server is not running. Please start it first.");
      return false;
    } else {
      return true;
    }
  },

  async start_server() {
    var _this = this;
    if (!this.api.running) {
      this.toggle_log();
      Notifications.addInfo("Starting Sonic Pi server...");
      var result = await this.api.init(atom.config.get('sb-atom-sonic-pi.sonic_pi.rootPath'));

      if (result.success) {
        Notifications.addSuccess("Sonic Pi server started successfully!");
        this.api.osc_server.log_emitter.on("log/info", (message) => this.log_view.add_info_message(message));
        this.api.osc_server.log_emitter.on("log/error", (message) => this.log_view.add_error_message(message));
        this.api.osc_server.log_emitter.on("log/multi-message", (message) => this.log_view.add_multi_message(message));
        this.api.osc_server.log_emitter.on("exited", () => {
          _this.log_view.add_info_message([0, "Sonic Pi Server exited"]);
          Notifications.addInfo("Sonic Pi Server exited successfully.");
        });
        atom.config.onDidChange("editor.fontSize", ({oldValue, newValue}) => this.log_view.change_font_size(newValue));
        atom.config.onDidChange("editor.fontFamily", ({oldValue, newValue}) => this.log_view.change_font_family(newValue));
      } else {
        Notifications.addError(`An error occurred when trying to start the server: ${result.error_message}`)
      }
    } else {
      Notifications.addInfo("Sonic Pi server is alredy running")
    }
  },

  shutdown_server() {
    Notifications.addInfo("Shutting down Sonic Pi server...");
    this.api.shutdown();
  },

  toggle_log() {
    atom.workspace.toggle('atom://sonic-pi/log');
  },

  open_tutorial() {
    electron.shell.openExternal("https://sonic-pi.net/tutorial");
    return Notifications.addInfo("Opened the Online Sonic Pi Tutorial.");
  },

  play(selector) {
    if (this.is_server_running()) {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor === undefined) {
        return Notifications.addError("No active text editor found.");
      } else {
        const source = editor[selector]();
        this.api.run_code(source);
        return Notifications.addSuccess("Sent source code to Sonic Pi.");
      }
    }
  },

  saveAndPlay() {
    if (this.is_server_running()) {
      const _this = this;
      const editor = atom.workspace.getActiveTextEditor();
      if (editor === undefined) {
        return Notifications.addError("No active text editor found.");
      } else {
        let saved;
        if (editor.getPath() === undefined) {
          const filepath = electron.dialog.showSaveDialog({
            title: "Sonic Pi: Save As and Play File",
            filters: [
              {name: "Ruby file", extensions: ["rb"]},
              {name: "Text file", extensions: ["txt"]},
              {name: "All files", extensions: ["*"]}
            ]
          });
          if (filepath === undefined) {
            // User has exited, return
            return;
          } else {
            saved = editor.saveAs(filepath);
            return saved.then(
              function(result) {
                console.log(result); // Stuff worked!
                const filePath = filepath.replace(/\\/g,"/");
                console.log(filePath);
                _this.api.run_code(`run_file "${filePath}"`);
                return Notifications.addSuccess("Saved file and told Sonic Pi to start playing.");
              },
              function(error) {
                console.log(error); // It broke
                return Notifications.addError(`Error when saving file: ${error}, try saving it using File > Save instead`);
              });
            }

          } else {
            saved = editor.save();
            return saved.then(
              function(result) {
                console.log(result); // Stuff worked!
                const filePath = editor.getPath().replace(/\\/g,"/");
                console.log(filePath);
                _this.api.run_code(`run_file "${filePath}"`);
                return Notifications.addSuccess("Saved file and told Sonic Pi to start playing.");
              },
              function(error) {
                console.log(error); // It broke
                return Notifications.addError(`Error when saving file: ${error}, try saving it using File > Save instead`);
              }
            );
          }
        }
      }
    },

    stop() {
      if (this.is_server_running()) {
        this.api.stop();
        return Notifications.addInfo("Told Sonic Pi to stop playing.");
      }
    },

    // send(...args) {
    //   // Get IP addresses and ports
    //   const sp_server_ip = atom.config.get('sb-atom-sonic-pi.connection.sonicPiServerIP');
    //   const sp_server_port = atom.config.get('sb-atom-sonic-pi.connection.sonicPiServerPort');
    //
    //   const sp_gui_ip = atom.config.get('sb-atom-sonic-pi.connection.sonicPiGUIIP');
    //   const sp_gui_port = atom.config.get('sb-atom-sonic-pi.connection.sonicPiGUIPort');
    //
    //   // Send OSC messages
    //   if (atom.config.get('sb-atom-sonic-pi.connection.sendOSCMessagesToGUI') === true) {
    //     const sp_gui = new osc.Client(sp_gui_ip, sp_gui_port);
    //     sp_gui.send(...(args), () => sp_gui.kill());
    //   }
    //   const sp_server = new osc.Client(sp_server_ip, sp_server_port);
    //
    //   console.log(`Sent ${args} to ${sp_server_ip}:${sp_server_port}`);
    //   atom.notifications.addInfo(`Sent ${args} to ${sp_server_ip}:${sp_server_port}`);
    //   return sp_server.send(...(args), () => sp_server.kill());
    // },

    test_toggle() {
      console.log('sb-atom-sonic-pi: test_toggle was activated!');
      if (this.modalPanel.isVisible()) {
        console.log('sb-atom-sonic-pi: hiding panel');
        return this.modalPanel.hide();
      } else {
        console.log('sb-atom-sonic-pi: showing panel');
        return this.modalPanel.show();
      }
    }
  });
