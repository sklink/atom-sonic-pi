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

  return describe("when the sb-atom-sonic-pi:test_toggle event is triggered", function() {
    it("hides and shows the modal panel", function() {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      console.log('sb-atom-sonic-pi: test 1');
      expect(workspaceElement.querySelector('.sb-atom-sonic-pi')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'sb-atom-sonic-pi:test_toggle');

      waitsForPromise(() => activationPromise);

      return runs(function() {
        console.log('sb-atom-sonic-pi: test 2');
        expect(workspaceElement.querySelector('.sb-atom-sonic-pi')).toExist();

        const sbAtomSonicPiElement = workspaceElement.querySelector('.sb-atom-sonic-pi');
        expect(sbAtomSonicPiElement).toExist();

        const sbAtomSonicPiPanel = atom.workspace.panelForItem(sbAtomSonicPiElement);
        expect(sbAtomSonicPiPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'sb-atom-sonic-pi:test_toggle');
        return expect(sbAtomSonicPiPanel.isVisible()).toBe(false);
      });
    });

    return it("hides and shows the view", function() {
      console.log('sb-atom-sonic-pi: next set of tests');
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);
      console.log('sb-atom-sonic-pi: test 3');
      expect(workspaceElement.querySelector('.sb-atom-sonic-pi')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'sb-atom-sonic-pi:test_toggle');

      waitsForPromise(() => activationPromise);

      return runs(function() {
        console.log('sb-atom-sonic-pi: test 4');
        // Now we can test for view visibility
        const sbAtomSonicPiElement = workspaceElement.querySelector('.sb-atom-sonic-pi');
        expect(sbAtomSonicPiElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'sb-atom-sonic-pi:test_toggle');
        return expect(sbAtomSonicPiElement).not.toBeVisible();
      });
    });
  });
});
