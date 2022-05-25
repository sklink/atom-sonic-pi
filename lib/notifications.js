'use babel';
const {CompositeDisposable} = require('atom');

let notification_setting = 'sb-atom-sonic-pi.ui.notificationLevel';

class Notifications {
  static addError(message, options) {
    return atom.notifications.addError(message, options);
  }
  static addWarning(message, options) {
    if (atom.config.get(notification_setting) >= 1) {
      return atom.notifications.addWarning(message, options);
    }
  }
  static addSuccess(message, options) {
    if (atom.config.get(notification_setting) >= 2) {
      return atom.notifications.addSuccess(message, options);
    }
  }
  static addInfo(message, options) {
    if (atom.config.get(notification_setting) >= 2) {
      return atom.notifications.addInfo(message, options);
    }
  }
}

module.exports = Notifications;
