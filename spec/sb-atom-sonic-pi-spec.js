// TODO: decaffeinate suggestions which may need checking:
// DS102: Remove unnecessary code created because of implicit returns
// decaffeinate docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
const sbAtomSonicPi = require('../lib/sb-atom-sonic-pi');

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("sbAtomSonicPi", function() {
  let [workspaceElement, activationPromise] = [];

  beforeEach(function() {
    workspaceElement = atom.views.getView(atom.workspace);
    return activationPromise = atom.packages.activatePackage('sb-atom-sonic-pi');
  });

  return describe("when the sb-atom-sonic-pi:toggle_log event is triggered", function() {

    return it("hides and shows the log view", function() {
      console.log('sb-atom-sonic-pi: testing toggle_log...');
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);
      console.log('sb-atom-sonic-pi: checking that the log is initially not visible...');
      expect(workspaceElement.querySelector('.sb-atom-sonic-pi')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      console.log("sb-atom-sonic-pi: running sb-atom-sonic-pi:toggle_log");
      atom.commands.dispatch(workspaceElement, 'sb-atom-sonic-pi:toggle_log');

      waitsForPromise(() => activationPromise);

      return runs(function() {
        console.log('sb-atom-sonic-pi: checking that the log is now visible');
        // Now we can test for view visibility
        const sbAtomSonicPiElement = workspaceElement.querySelector('.sb-atom-sonic-pi');
        expect(sbAtomSonicPiElement).toBeVisible();
        console.log("sb-atom-sonic-pi: running sb-atom-sonic-pi:toggle_log");
        atom.commands.dispatch(workspaceElement, 'sb-atom-sonic-pi:test_toggle');
        console.log('sb-atom-sonic-pi: checking that the log is now not visible');
        return expect(sbAtomSonicPiElement).not.toBeVisible();
      });
    });
  });
});
