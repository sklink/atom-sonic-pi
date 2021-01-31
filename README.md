# Sonic Pi Atom integration

This package makes it easier to write and run your [Sonic Pi](http://sonic-pi.net/) code within Atom. :)
NOTE: This package may not be regularly maintained. This is not an official package.

## Features
* Control Sonic Pi from Atom:
  - Play a buffer
  - Stop the current runs
  - Save a buffer and tell Sonic Pi to play it - allowing for playback of large buffers
  - Play a selection
* Keyboard shortcuts (similar to Sonic Pi's shortcuts) to activate the commands
* The server IP and port can be changed in the settings
* Integration with the [tool-bar](https://atom.io/packages/tool-bar) package
* Auto-completions for (most) synths, FX, and samples (not nearly as well integrated as the official Sonic Pi GUI though)
* Very partial syntax highlighting and snippets for Sonic Pi functions
* Quick action to access the online tutorial from your web browser

This isn't a full client for Sonic Pi; it requires the server to already be running and doesn't have support for viewing the logs, closing the server etc.

## Requirements
**Sonic Pi needs to be running in the background.**
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
 `f5`         | `sb-atom-sonic-pi:save-and-play-file` | Saves the current file and tells Sonic Pi to play the file. Allows for playback of large buffers. (If used with an *untitled* file, it opens a save-as dialog box to allow you to save the file.)
 `ctrl-alt-r` | `sb-atom-sonic-pi:play-selection`     | Sends currently selected text to Sonic Pi for instant playback.
 `alt-s`      | `sb-atom-sonic-pi:stop`               | Tells Sonic Pi to stop all playback.
 `alt-i`      | `sb-atom-sonic-pi:open_tutorial`      | Open the online Sonic-Pi tutorial in your system's web browser (https://sonic-pi.net/tutorial)

## Credit
* This package was originally forked from [rkh/atom-sonic](https://github.com/rkh/atom-sonic)
* Some code in this package comes from [euwbah/sonic-pi-autocomplete](https://github.com/euwbah/sonic-pi-autocomplete) and [atom/language-ruby](https://github.com/atom/language-ruby)

## License
 This package is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for the full license.
