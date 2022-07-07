# Sonic Pi Atom integration

This package is a frontend to the Sonic Pi server, and allows you to write and run your [Sonic Pi](http://sonic-pi.net/) code within Atom. :)
NOTE: This package may not be regularly maintained. This is not an official package.

## Features
* Control Sonic Pi from Atom:
  - Play a buffer
  - Stop the current runs
  - Save a buffer and tell Sonic Pi to play it - allowing for playback of large buffers
  - Play a selection
* View the Sonic Pi logs
* Keyboard shortcuts (similar to Sonic Pi's shortcuts) to activate the commands
* Integration with the [tool-bar](https://atom.io/packages/tool-bar) package
* Auto-completions for (most) synths, FX, and samples (not nearly as well integrated as the official Sonic Pi GUI though)
* Very partial syntax highlighting and snippets for Sonic Pi functions
* Quick command to access the online tutorial from your web browser

## Requirements
* **Sonic Pi v4.0** needs to be installed. Due to internal differences between versions, **older versions of Sonic Pi are not supported**.
* *[Optional]* The [tool-bar](https://atom.io/packages/tool-bar) package for Atom needs to be installed to use the toolbar functionality.

## Usage
1. Go to the sb-atom-sonic-pi settings and change the Root Path to where Sonic Pi is installed on your system.
2. Press Ctrl+Shift+P and run the Start Server command
3. Open a text file and change the syntax language to Sonic Pi
4. Get coding!
5. Run the Shutdown Server command when you're done.

## Changes from rkh/atom-sonic
* Turned the package into a full client for the Sonic Pi server
* Added save-and-play-file command, which saves the current file and tells Sonic Pi to play the file. This allows for playback of large buffers. This command can be activated using F5.
* Added integration with the [tool-bar](https://atom.io/packages/tool-bar) package to add buttons which run some commands to a toolbar.
* Changed some of the default key bindings to be more similar to Sonic Pi's keyboard shortcuts, see below for the key bindings.
* Updated autocompletions for synths, FX and samples (not nearly as integrated as the official Sonic Pi GUI though)

I'm happy to contribute these changes to rkh/atom-sonic if wanted. :)

## Commands and Default Key Bindings

 Key Binding  | Action                                | Description
--------------|---------------------------------------|-----------------
 None         | `sb-atom-sonic-pi:start-server`       | Start the Sonic Pi server
 None         | `sb-atom-sonic-pi:shutdown-server`    | Shutdown the Sonic Pi server
 `alt-r`      | `sb-atom-sonic-pi:play-file`          | Sends content of the currently open buffer to Sonic Pi for instant playback.
 `f5`         | `sb-atom-sonic-pi:save-and-play-file` | Saves the current file and tells Sonic Pi to play the file. Allows for playback of large buffers. (If used with an *untitled* file, it opens a save-as dialog box to allow you to save the file.)
 `ctrl-alt-r` | `sb-atom-sonic-pi:play-selection`     | Sends currently selected text to Sonic Pi for instant playback.
 `alt-s`      | `sb-atom-sonic-pi:stop`               | Tells Sonic Pi to stop all playback.
 `ctrl-alt-l` | `sb-atom-sonic-pi:toggle-log`         | Toggle the log view
 `alt-i`      | `sb-atom-sonic-pi:open-tutorial`      | Open the online Sonic-Pi tutorial in your system's web browser (https://sonic-pi.net/tutorial)

## Credit
* This package was originally forked from [rkh/atom-sonic](https://github.com/rkh/atom-sonic)
* Some code in this package comes from [euwbah/sonic-pi-autocomplete](https://github.com/euwbah/sonic-pi-autocomplete) and [atom/language-ruby](https://github.com/atom/language-ruby)
* The API code is based on [official C++ Sonic Pi API](https://github.com/sonic-pi-net/sonic-pi/tree/dev/app/api)

## License
 This package is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for the full license.
