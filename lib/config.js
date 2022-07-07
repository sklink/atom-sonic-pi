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
    },
    order: 1
  },
  audio: {
    type: "object",
    properties: {
      mainVolume: {
        title: "Main Volume",
        type: "number",
        default: 50,
        minimum: 0,
        maximum: 100
      }
    },
    order: 2
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
