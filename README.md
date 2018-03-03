# Sonic Pi Atom integration

This plugin, which is forked from [rkh/atom-sonic](https://github.com/rkh/atom-sonic), allows remote controlling [Sonic Pi](http://sonic-pi.net/) via [Atom](https://atom.io/).

This package makes it easier to write and run your Sonic Pi code within Atom. :)

## Requirements

Sonic Pi needs to be running in the background.
The [tool-bar](https://atom.io/packages/tool-bar) package for Atom needs to be installed to use the toolbar functionality.

## Changes from rkh/atom-sonic
* Adjusted OSC code to send to Sonic Pi server, and optionally to the Sonic Pi GUI (OSC messages sent to GUI appear in the cue log).
* Added save-and-play-file command, which saves the current file and tells Sonic Pi to play the file. This allows for playback of large buffers. This command can be activated using F5.
* Added integration with the [tool-bar](https://atom.io/packages/tool-bar) package to add buttons which run some commands to a toolbar.
* Changed some of the default key bindings (for example: `atom-sonic:stop` used `ctrl-s`, which is used as the 'save' shortcut on many systems, so I changed that to `ctrl-alt-s`), see below for the key bindings.
* Added options to change the Sonic Pi server IP address and port, and the Sonic Pi GUI IP address and port.

I'm happy to contribute these changes to rkh/atom-sonic if wanted. :)

## Commands and Default Key Bindings

 Key Binding  | Action                         | Description
--------------|--------------------------------|-----------------
 `ctrl-f5`    | `atom-sonic:play-file`         | Sends content of the currently open buffer to Sonic Pi for instant playback.
 `f5`         | `atom-sonic:save-and-play-file`| Saves the current file and tells Sonic Pi to play the file. Allows for playback of large buffers.
 `ctrl-alt-r` | `atom-sonic:play-selection`    | Sends currently selected text to Sonic Pi for instant playback.
 `ctrl-alt-s` | `atom-sonic:stop`              | Tells Sonic Pi to stop all playback.
