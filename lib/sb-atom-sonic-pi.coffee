{CompositeDisposable} = require 'atom'
osc                   = require 'node-osc'
provider              = require './sb-atom-sonic-pi-autocomplete'

module.exports = sbAtomSonicPi =
  config:
    sendMessagesToGUI:
      title: 'Send Messages To GUI'
      type: 'boolean'
      default: false
  subscriptions: null
  provide: -> provider

  activate: (state) ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add(atom.commands.add 'atom-workspace',
      'sb-atom-sonic-pi:play-file':         => @play('getText'),
      'sb-atom-sonic-pi:save-and-play-file':=> @saveAndPlay(),
      'sb-atom-sonic-pi:play-selection':    => @play('getSelectedText'),
      'sb-atom-sonic-pi:stop':              => @stop())

  deactivate: ->
    @subscriptions.dispose()

  play: (selector) ->
    editor = atom.workspace.getActiveTextEditor()
    source = editor[selector]()
    @send '/run-code', 'atom', source
    atom.notifications.addSuccess "Sent source code to Sonic Pi. :)"

  saveAndPlay: ->
    editor = atom.workspace.getActiveTextEditor()
    editor.save();
    fullPath = editor.getPath()
    title = editor.getTitle()
    @send '/run-code', 'atom', "run_file \"" + fullPath + "\""
    atom.notifications.addSuccess "Saved file and told Sonic Pi to start playing. :)"

  stop: ->
    @send '/stop-all-jobs'
    atom.notifications.addInfo "Told Sonic Pi to stop playing."

  send: (args...) ->
    if atom.config.get('sb-atom-sonic-pi.sendMessagesToGUI') == true
      sp_gui = new osc.Client('localhost', 4559)
      sp_gui.send args..., -> sp_gui.kill()
    sp_server = new osc.Client('127.0.0.1', 4557)
    sp_server.send args..., -> sp_server.kill()
