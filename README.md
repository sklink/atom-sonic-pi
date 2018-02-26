# Sonic Pi Atom integration

This plugin, which is forked from [rkh/atom-sonic](https://github.com/rkh/atom-sonic), allows remote controlling [Sonic Pi](http://sonic-pi.net/) via [Atom](https://atom.io/).

Sonic Pi is fun to play with, but its built-in editor is very rudimentary.
With this plugin, you can do all the live coding in Atom instead.

## Requirements

Sonic Pi needs to be running in the background.

## Changes from rkh/atom-sonic
* Adjusted OSC code to send to Sonic Pi server, and optionally the Sonic Pi GUI (OSC messages sent to GUI appear in the cue log).
* Added save-and-play-file command, which saves the current file and tells Sonic Pi to play the file. This allows for playback of large buffers. This command can be activated using F5.
* Changed some key bindings (atom-sonic:stop used ctrl-s, which is used as save on many systems, so I changed that), see below for the key bindings.

I'm happy to contribute these changes to rkh/atom-sonic if wanted. :)

## Default Key Bindings

 Key Binding  | Action                         | Description
--------------|--------------------------------|-----------------
 `ctrl-f5`     | `atom-sonic:play-file`         | Sends content of the currently open buffer to Sonic Pi for instant playback.
 `f5`         | `atom-sonic:save-and-play-file`| Saves the current file and tells Sonic Pi to play the file. Allows for playback of large buffers.
 `ctrl-alt-r` | `atom-sonic:play-selection`    | Sends currently selected text to Sonic Pi for instant playback.
 `ctrl-alt-s`     | `atom-sonic:stop`              | Tells Sonic Pi to stop all playback.
