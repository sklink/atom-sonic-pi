let config;
module.exports = (config = {
  sonic_pi: {
    title: "Sonic Pi",
    type: "object",
    properties: {
      rootPath: {
        title: "Sonic Pi Root Path",
        description: "",
        type: "string",
        default: "/opt/sonic-pi"
      }
    }
  },
  connection: {
    title: "Sonic Pi Connection",
    type: 'object',
    properties: {
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
      },
    }
  },
  ui: {
    title: "UI",
    type: 'object',
    properties: {
      notificationLevel: {
        title: 'Notification Level',
        description: 'Specify which notifications are shown.',
        type: 'integer',
        default: 2,
        enum: [
          {value: 2, description: 'Show all notifications (default)'},
          {value: 1, description: 'Only show warnings and errors'},
          {value: 0, description: 'Only show errors'}
        ]
      }
    }
  }
})
