# Sonic Pi Atom integration

This plugin, which is forked from [rkh/atom-sonic](https://github.com/rkh/atom-sonic) and contains a little code from [euwbah/sonic-pi-autocomplete](https://github.com/euwbah/sonic-pi-autocomplete), allows remote controlling [Sonic Pi](http://sonic-pi.net/) via [Atom](https://atom.io/).

This package makes it easier to write and run your Sonic Pi code within Atom. :)

For a list of releases in chronological order, see [the Releases wiki page](https://github.com/SunderB/sb-atom-sonic-pi/wiki/Releases).

## Requirements

Sonic Pi needs to be running in the background.
The [tool-bar](https://atom.io/packages/tool-bar) package for Atom needs to be installed to use the toolbar functionality.

## Changes from rkh/atom-sonic
* Adjusted OSC code to send to Sonic Pi server, and optionally to the Sonic Pi GUI (OSC messages sent to GUI appear in the cue log).
* Added save-and-play-file command, which saves the current file and tells Sonic Pi to play the file. This allows for playback of large buffers. This command can be activated using F5.
* Added integration with the [tool-bar](https://atom.io/packages/tool-bar) package to add buttons which run some commands to a toolbar.
* Changed some of the default key bindings to be more similar to Sonic Pi's keyboard shortcuts, see below for the key bindings.
* Added options to change the Sonic Pi server IP address and port, and the Sonic Pi GUI IP address and port.
* Updated autocompletions for synths, FX and samples (not nearly as integrated as the official Sonic Pi GUI though)

I'm happy to contribute these changes to rkh/atom-sonic if wanted. :)

## Commands and Default Key Bindings

 Key Binding  | Action                                | Description
--------------|---------------------------------------|-----------------
 `alt-r`      | `sb-atom-sonic-pi:play-file`          | Sends content of the currently open buffer to Sonic Pi for instant playback.
 `f5`         | `sb-atom-sonic-pi:save-and-play-file` | Saves the current file and tells Sonic Pi to play the file. Allows for playback of large buffers. (If used with an **untitled** file, it opens a save-as dialog box to allow you to save the file.)
 `ctrl-alt-r` | `sb-atom-sonic-pi:play-selection`     | Sends currently selected text to Sonic Pi for instant playback.
 `alt-s`      | `sb-atom-sonic-pi:stop`               | Tells Sonic Pi to stop all playback.
