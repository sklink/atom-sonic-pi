'use babel';

const {CompositeDisposable} = require('atom');

export default class SonicPiLogView {

  constructor(serializedState) {
    console.log('[sbAtomSonicPiView]: creating element');
    this.logs = [];

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sb-atom-sonic-pi');

    // Create log element
    this.log = document.createElement('div');
    this.log.classList.add("log");
    this.log.classList.add("sb-atom-sonic-pi");
    this.element.appendChild(this.log);

    this.change_font_size(atom.config.get('editor.fontSize'));
  }

  change_font_size(size) {
    console.log(size);
    var r = document.querySelector(':root');
    r.style.setProperty('--sb-atom-sonic-pi_font-size', `${size}px`);
  }

  change_font_family(family) {
    var r = document.querySelector(':root');
    r.style.setProperty('--sb-atom-sonic-pi_font-family', family);
  }

  add_messages(pre, messages, multi_message=false) {
    for (var i = 0; i < messages.length; i++) {
      var type = messages[i][0];
      var message = messages[i][1];


      if (multi_message && i > 0) {
        var msg_decoration = document.createElement('span');
        if (i == messages.length-1) {
          msg_decoration.textContent = " └─ ";
        } else {
          msg_decoration.textContent = " ├─ ";
        }
        pre.appendChild(msg_decoration);
      }

      var msg = document.createElement('span');
      var br = document.createElement('br');
      msg.classList.add("info");
      msg.classList.add("sub-message");
      msg.classList.add("sb-atom-sonic-pi");
      msg.textContent = message;

      // Apply highlighting if needed
      switch (type) {
        case 4:
          msg.classList.add("highlight-pink");
          break;
        case 5:
          msg.classList.add("highlight-blue");
          break;
        case 6:
          msg.classList.add("highlight-orange");
          break;
        default:
      }

      pre.appendChild(msg);
      pre.appendChild(br);
    }
  }

  add_info_message(message) {
    var msg = document.createElement('pre');
    msg.classList.add("info");
    msg.classList.add("message");
    msg.classList.add("sb-atom-sonic-pi");
    this.add_messages(msg, [message])
    this.log.appendChild(msg);
    msg.scrollIntoView(false);
  }
  add_error_message(message) {
    var msg = document.createElement('pre');
    msg.classList.add("error");
    msg.classList.add("message");
    msg.classList.add("sb-atom-sonic-pi");
    var line_1 = message[1].replaceAll("&#39;", "'");
    var line_2 = message[2].replaceAll("&#39;", "'");
    msg.textContent = `[Runtime Error]: ${line_1}\n${line_2}`;
    this.log.appendChild(msg);
    msg.scrollIntoView(false);
  }

  add_multi_message(message_data) {
    var msg = document.createElement('pre');
    msg.classList.add("info");
    msg.classList.add("message");
    msg.classList.add("sb-atom-sonic-pi");

    var run = message_data[0];
    var thread_id = message_data[1];
    var timestamp = message_data[2];
    var n = message_data[3];

    var messages = [];

    if (thread_id === "" || thread_id == "\"\"" || thread_id == undefined) {
      messages.push([0, `{run: ${run}, time: ${timestamp}}`]);
    } else {
      messages.push([0, `{run: ${run}, time: ${timestamp}, thread: ${thread_id}}`]);
    }

    for (var i = 0; i < (n-1); i++) {
      var type = message_data[4+(2*i)];
      var message = message_data[5+(2*i)];
      messages.push([type, `${message}`]);
    }

    var type = message_data[4+(2*(n-1))];
    var message = message_data[5+(2*(n-1))];
    messages.push([type, `${message}`]);

    this.add_messages(msg, messages, true);

    this.log.appendChild(msg);
    msg.scrollIntoView(false);
  }

  serialize() {
    return {
      // This is used to look up the deserializer function. It can be any string, but it needs to be
      // unique across all packages!
      deserializer: 'sb-atom-sonic-pi/SonicPiLogView'
    };
  }

  deserialize(serialized) {
    return this;
    //return new SonicPiLogView(serialized);
  }

  // Tear down any state and detach
  destroy() {
    console.log('[SonicPiLogView]: removing element');
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getDefaultLocation() {
  // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
  // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Sonic Pi Log';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://sonic-pi/log';
  }

  getIconName() {
    return "list-unordered";
  }

}
