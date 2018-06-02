'use babel';

export default class sbAtomSonicPiView {

  constructor(serializedState) {
    console.log('[sbAtomSonicPiView]: creating element');
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sb-atom-sonic-pi');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The sb-atom-sonic-pi package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    console.log('[sbAtomSonicPiView]: removing element');
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
