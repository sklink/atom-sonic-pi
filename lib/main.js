// TODO: decaffeinate suggestions which may need checking:
// DS205: Consider reworking code to avoid use of IIFEs
// decaffeinate docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md

'use babel';
let sbAtomSonicPi;

const {CompositeDisposable} = require('atom');
const osc                   = require('node-osc');
const electron              = require('electron').remote;
const autocomplete_provider = require('./sb-atom-sonic-pi-autocomplete');
const sbAtomSonicPiView     = require('./sb-atom-sonic-pi-view');          // for sbAtomSonicPiView

module.exports = (sbAtomSonicPi = {
  config: { // Settings
    sonicPiServerIP: {
      title: 'Sonic Pi Server IP Address',
      description: 'The IP address that the Sonic Pi server receives OSC messages on. OSC messages for the Sonic Pi server will be sent to this IP address.',
      type: 'string',
      default: '127.0.0.1',
      order: 1
    },
    sonicPiServerPort: {
      title: 'Sonic Pi Server Port',
      description: 'The port that the Sonic Pi server receives OSC messages on. OSC messages for the Sonic Pi server will be sent to this port.',
      type: 'integer',
      default: 51235,
      order: 2
    },
    sonicPiGUIIP: {
      title: 'Sonic Pi GUI IP Address',
      description: 'The IP address that the Sonic Pi GUI receives OSC messages on. OSC messages for the Sonic Pi GUI will be sent to this IP address.',
      type: 'string',
      default: '127.0.0.1',
      order: 3
    },
    sonicPiGUIPort: {
      title: 'Sonic Pi GUI Port',
      description: 'The port that the Sonic Pi GUI receives OSC messages on. OSC messages for the Sonic Pi GUI will be sent to this port.',
      type: 'integer',
      default: 51236,
      order: 4
    },
    sendOSCMessagesToGUI: {
      title: 'Send OSC Messages To GUI',
      description: 'If this option is enabled, when OSC commands are sent to Sonic Pi, they will appear in the cue log. This may affect OSC cues.',
      type: 'boolean',
      default: false,
      order: 5
    }
  },
  sbAtomSonicPiView: null,  // for sbAtomSonicPiView
  subscriptions: null,
  modalPanel: null,         // for sbAtomSonicPiView

  provide() { return autocomplete_provider; },

  activate(state) {
    // Set up sbAtomSonicPiView
    this.sbAtomSonicPiView = new sbAtomSonicPiView(state.sbAtomSonicPiViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sbAtomSonicPiView.getElement(),
      visible: false
    });

    // Register commands
    this.subscriptions = new CompositeDisposable;
    return this.subscriptions.add(atom.commands.add('atom-workspace', {
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
      }
    })
      //'sb-atom-sonic-pi:test_toggle': => @test_toggle()
    );
  },

  // Set up toolbar
  consumeToolBar(getToolBar) {
    this.toolBar = getToolBar('sb-atom-sonic-pi');
    // Using custom icon set (Ionicons)

    // Add spacer
    this.toolBar.addSpacer();

    // Add buttons
    const button_play = this.toolBar.addButton({
      icon: 'md-play',
      callback: 'sb-atom-sonic-pi:play-file',
      tooltip: 'Play File',
      iconset: 'ion'
    });

    const button_saveAndPlayFile = this.toolBar.addButton({
      icon: 'md-download',
      callback: 'sb-atom-sonic-pi:save-and-play-file',
      tooltip: 'Save and Play File',
      iconset: 'ion'
    });

    const button_stop = this.toolBar.addButton({
      icon: 'md-square',
      callback: 'sb-atom-sonic-pi:stop',
      tooltip: 'Stop Playing Code',
      iconset: 'ion'
    });

    // Add spacer
    return this.toolBar.addSpacer();
  },

    // Cleaning up when tool bar is deactivated
    //@toolBar.onDidDestroy(() => {
    //  @toolBar = null;
    //  # Teardown any stateful code that depends on tool bar ...
    //});

  deactivate() {
    if (this.toolBar) {
      // Remove any toolbar items added
      this.toolBar.removeItems();
      this.toolBar = null;
    }
    this.modalPanel.destroy();        // for sbAtomSonicPiView
    this.subscriptions.dispose();
    return this.sbAtomSonicPiView.destroy();
  }, // for sbAtomSonicPiView

  serialize() {
    return {sbAtomSonicPiViewState: this.sbAtomSonicPiView.serialize()};
  }, // for test_toggle

  play(selector) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor === undefined) {
      return atom.notifications.addError("No active text editor found.");
    } else {
      const source = editor[selector]();
      this.send('/run-code', 'atom', source);
      return atom.notifications.addSuccess("Sent source code to Sonic Pi.");
    }
  },

  saveAndPlay() {
    const _this = this;
    const editor = atom.workspace.getActiveTextEditor();
    const fullPath = "";
    if (editor === undefined) {
      return atom.notifications.addError("No active text editor found.");
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
              _this.send('/run-code', 'atom', `run_file "${filePath}"`);
              return atom.notifications.addSuccess("Saved file and told Sonic Pi to start playing.");
            },
            function(error) {
              console.log(error); // It broke
              return atom.notifications.addError(`Error when saving file: ${error}, try saving it using File > Save instead`);
          });
        }

      } else {
        saved = editor.save();
        return saved.then(
          function(result) {
            console.log(result); // Stuff worked!
            const filePath = editor.getPath().replace(/\\/g,"/");
            console.log(filePath);
            _this.send('/run-code', 'atom', `run_file "${filePath}"`);
            return atom.notifications.addSuccess("Saved file and told Sonic Pi to start playing.");
          },
          function(error) {
            console.log(error); // It broke
            return atom.notifications.addError(`Error when saving file: ${error}, try saving it using File > Save instead`);
          }
        );
      }
    }
  },

  stop() {
    this.send('/stop-all-jobs');
    return atom.notifications.addInfo("Told Sonic Pi to stop playing.");
  },

  send(...args) {
    // Get IP addresses and ports
    const sp_server_ip = atom.config.get('sb-atom-sonic-pi.sonicPiServerIP');     // default: 127.0.0.1
    const sp_server_port = atom.config.get('sb-atom-sonic-pi.sonicPiServerPort'); // default: 4557

    const sp_gui_ip = atom.config.get('sb-atom-sonic-pi.sonicPiGUIIP');           // default: 127.0.0.1
    const sp_gui_port = atom.config.get('sb-atom-sonic-pi.sonicPiGUIPort');       // default: 4559

    // Send OSC messages
    if (atom.config.get('sb-atom-sonic-pi.sendOSCMessagesToGUI') === true) {
      const sp_gui = new osc.Client(sp_gui_ip, sp_gui_port);
      sp_gui.send(...(args), () => sp_gui.kill());
    }
    const sp_server = new osc.Client(sp_server_ip, sp_server_port);
    return sp_server.send(...(args), () => sp_server.kill());
  },

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
