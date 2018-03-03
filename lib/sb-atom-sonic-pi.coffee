'use babel';

{CompositeDisposable} = require 'atom';
osc                   = require 'node-osc';
provider              = require './sb-atom-sonic-pi-autocomplete';
sbAtomSonicPiView     = require './sb-atom-sonic-pi-view';          # for test_toggle

module.exports = sbAtomSonicPi =
  config: # Settings
    sonicPiServerIP:
      title: 'Sonic Pi Server IP Address',
      description: 'The IP address that the Sonic Pi server receives OSC messages on. OSC messages for the Sonic Pi server will be sent to this IP address.',
      type: 'string',
      default: '127.0.0.1'
      order: 1
    sonicPiServerPort:
      title: 'Sonic Pi Server Port',
      description: 'The port that the Sonic Pi server receives OSC messages on. OSC messages for the Sonic Pi server will be sent to this port.',
      type: 'integer',
      default: 4557
      order: 2
    sonicPiGUIIP:
      title: 'Sonic Pi GUI IP Address',
      description: 'The IP address that the Sonic Pi GUI receives OSC messages on. OSC messages for the Sonic Pi GUI will be sent to this IP address.',
      type: 'string',
      default: 'localhost'
      order: 3
    sonicPiGUIPort:
      title: 'Sonic Pi GUI Port',
      description: 'The port that the Sonic Pi GUI receives OSC messages on. OSC messages for the Sonic Pi GUI will be sent to this port.',
      type: 'integer',
      default: 4559
      order: 4
    sendOSCMessagesToGUI:
      title: 'Send OSC Messages To GUI',
      description: 'If this option is enabled, when OSC commands are sent to Sonic Pi, they will appear in the cue log. This may affect OSC cues.',
      type: 'boolean',
      default: false
      order: 5
  sbAtomSonicPiView: null;  # for test_toggle
  subscriptions: null;
  modalPanel: null;         # for test_toggle
  provide: -> provider;

  activate: (state) ->
    # Set up sbAtomSonicPiView
    @sbAtomSonicPiView = new sbAtomSonicPiView(state.sbAtomSonicPiViewState);
    @modalPanel = atom.workspace.addModalPanel(
      item: this.sbAtomSonicPiView.getElement(),
      visible: false
    );

    # Register commands
    @subscriptions = new CompositeDisposable;
    @subscriptions.add(atom.commands.add 'atom-workspace',
      'sb-atom-sonic-pi:play-file': {
        displayName: 'Sonic Pi: Play File'
        didDispatch: => @play('getText')
      }
      'sb-atom-sonic-pi:save-and-play-file': {
        displayName: 'Sonic Pi: Save and Play File'
        didDispatch: => @saveAndPlay()
      }
      'sb-atom-sonic-pi:play-selection': {
        displayName: 'Sonic Pi: Play Selection'
        didDispatch: => @play('getSelectedText')
      }
      'sb-atom-sonic-pi:stop': {
        displayName: 'Sonic Pi: Stop Playing Code'
        didDispatch: => @stop()
      }
      #'sb-atom-sonic-pi:test_toggle': => @test_toggle()
    );

  # Set up toolbar
  consumeToolBar: (getToolBar) ->
    @toolBar = getToolBar('sb-atom-sonic-pi');
    # Using custom icon set (Ionicons)

    # Add spacer
    @toolBar.addSpacer();

    # Add buttons
    button_play = @toolBar.addButton({
      icon: 'play',
      callback: 'sb-atom-sonic-pi:play-file',
      tooltip: 'Play File',
      iconset: 'ion'
    });

    button_saveAndPlayFile = @toolBar.addButton({
      icon: 'ios-download',
      callback: 'sb-atom-sonic-pi:save-and-play-file',
      tooltip: 'Save and Play File',
      iconset: 'ion'
    });

    button_stop = @toolBar.addButton({
      icon: 'stop',
      callback: 'sb-atom-sonic-pi:stop',
      tooltip: 'Stop Playing Code',
      iconset: 'ion'
    });

    # Add spacer
    @toolBar.addSpacer();

    # Cleaning up when tool bar is deactivated
    #@toolBar.onDidDestroy(() => {
    #  @toolBar = null;
    #  # Teardown any stateful code that depends on tool bar ...
    #});

  deactivate: ->
    if @toolBar
      # Remove any toolbar items added
      @toolBar.removeItems();
      @toolBar = null;
    @modalPanel.destroy();        # for test_toggle
    @subscriptions.dispose();
    @sbAtomSonicPiView.destroy(); # for test_toggle

  serialize: ->
    return sbAtomSonicPiViewState: this.sbAtomSonicPiView.serialize(); # for test_toggle

  play: (selector) ->
    editor = atom.workspace.getActiveTextEditor();
    source = editor[selector]();
    @send('/run-code', 'atom', source);
    atom.notifications.addSuccess("Sent source code to Sonic Pi.");

  saveAndPlay: ->
    editor = atom.workspace.getActiveTextEditor();
    editor.save();
    fullPath = editor.getPath().replace(/\\/g,"/");
    title = editor.getTitle();
    @send('/run-code', 'atom', "run_file \"" + fullPath + "\"");
    atom.notifications.addSuccess("Saved file and told Sonic Pi to start playing.");

  stop: ->
    @send('/stop-all-jobs');
    atom.notifications.addInfo("Told Sonic Pi to stop playing.");

  send: (args...) ->
    # Get IP addresses and ports
    sp_server_ip = atom.config.get('sb-atom-sonic-pi.sonicPiServerIP');     # default: 127.0.0.1
    sp_server_port = atom.config.get('sb-atom-sonic-pi.sonicPiServerPort'); # default: 4557

    sp_gui_ip = atom.config.get('sb-atom-sonic-pi.sonicPiGUIIP');           # default: localhost
    sp_gui_port = atom.config.get('sb-atom-sonic-pi.sonicPiGUIPort');       # default: 4559

    # Send OSC messages
    if atom.config.get('sb-atom-sonic-pi.sendOSCMessagesToGUI') == true
      sp_gui = new osc.Client('localhost', 4559);
      sp_gui.send args..., -> sp_gui.kill();
    sp_server = new osc.Client('127.0.0.1', 4557);
    sp_server.send args..., -> sp_server.kill();

  test_toggle: ->
    console.log('sb-atom-sonic-pi: test_toggle was activated!');
    return (
      if this.modalPanel.isVisible()
        console.log('sb-atom-sonic-pi: hiding panel');
        this.modalPanel.hide()
      else
        console.log('sb-atom-sonic-pi: showing panel');
        this.modalPanel.show()
    )
