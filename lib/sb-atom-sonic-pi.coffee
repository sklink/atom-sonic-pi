'use babel';

{CompositeDisposable} = require 'atom';
osc                   = require 'node-osc';
provider              = require './sb-atom-sonic-pi-autocomplete';
sbAtomSonicPiView     = require './sb-atom-sonic-pi-view';

module.exports = sbAtomSonicPi =
  config:
    sendMessagesToGUI:
      title: 'Send Messages To GUI',
      type: 'boolean',
      default: false
  sbAtomSonicPiView: null,
  subscriptions: null,
  modalPanel: null,
  provide: -> provider;

  activate: (state) ->
    @sbAtomSonicPiView = new sbAtomSonicPiView(state.sbAtomSonicPiViewState);
    @modalPanel = atom.workspace.addModalPanel(
      item: this.sbAtomSonicPiView.getElement(),
      visible: false
    );

    @subscriptions = new CompositeDisposable;
    @subscriptions.add(atom.commands.add 'atom-workspace',
      'sb-atom-sonic-pi:play-file':         => @play('getText'),
      'sb-atom-sonic-pi:save-and-play-file':=> @saveAndPlay(),
      'sb-atom-sonic-pi:play-selection':    => @play('getSelectedText'),
      'sb-atom-sonic-pi:stop':              => @stop(),
      'sb-atom-sonic-pi:toggle-tutorial':   => @toggleTutorial(),
      'sb-atom-sonic-pi:test_toggle':       => @test_toggle()
    );

  deactivate: ->
    @modalPanel.destroy();
    @subscriptions.dispose();
    @sbAtomSonicPiView.destroy();

  serialize: ->
    return sbAtomSonicPiViewState: this.sbAtomSonicPiView.serialize();

  play: (selector) ->
    editor = atom.workspace.getActiveTextEditor();
    source = editor[selector]();
    @send('/run-code', 'atom', source);
    atom.notifications.addSuccess("Sent source code to Sonic Pi. :)");

  saveAndPlay: ->
    editor = atom.workspace.getActiveTextEditor();
    editor.save();
    fullPath = editor.getPath().replace(/\\/g,"/");
    title = editor.getTitle();
    @send('/run-code', 'atom', "run_file \"" + fullPath + "\"");
    atom.notifications.addSuccess("Saved file and told Sonic Pi to start playing. :)");

  stop: ->
    @send('/stop-all-jobs');
    atom.notifications.addInfo("Told Sonic Pi to stop playing.");

  send: (args...) ->
    if atom.config.get('sb-atom-sonic-pi.sendMessagesToGUI') == true
      sp_gui = new osc.Client('localhost', 4559);
      sp_gui.send args..., -> sp_gui.kill();
    sp_server = new osc.Client('127.0.0.1', 4557);
    sp_server.send args..., -> sp_server.kill();

  test_toggle: ->
    console.log('sb-atom-sonic-pi was toggled!');
    return (
      if this.modalPanel.isVisible()
        console.log('sb-atom-sonic-pi: hiding panel');
        this.modalPanel.hide()
      else
        console.log('sb-atom-sonic-pi: showing panel');
        this.modalPanel.show()
    )
