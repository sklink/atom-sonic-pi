// TODO: decaffeinate suggestions which may need checking:
// DS102: Remove unnecessary code created because of implicit returns
// decaffeinate docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md

const fs        = require('fs');
const path      = require('path');
const jsonfile  = require('jsonfile');

var completions = {};

var completions_path = path.join(__dirname, "..", "completions", "v3.2.2")
console.log("sbAtomSonicPi: loading suggestions")
jsonfile.readFile(path.join(completions_path, "synths.json"), function (err, obj) {
  if (err) console.error(err)
  console.dir(obj)
  completions["synths"] = obj
});

jsonfile.readFile(path.join(completions_path, "fx.json"), function (err, obj) {
  if (err) console.error(err)
  console.dir(obj)
  completions["fx"] = obj
});

jsonfile.readFile(path.join(completions_path, "samples.json"), function (err, obj) {
  if (err) console.error(err)
  console.dir(obj)
  completions["samples"] = obj
});

let end_of_sentence_regex = RegExp("[.!?](?:[\\s\\n]|)", "g")
let sentence_regex = RegExp("/\\b(?:[\\w\\d\s:'\",-]|[.!?](?=\\S))+(?:[.!?](?=\\s|))/", "g")

let provider;
module.exports = (provider = {
  selector: '.source.ruby',
  disableForSelector: '.source.ruby .comment',
  inclusionPriority: 10,
  excludeLowerPriority: false,
  completions: completions,

  getPrefix(editor, bufferPosition) {
    // Whatever your prefix regex might be
    var regex = /[\w0-9_:-]+$/;
    // Get the text for the line up to the triggered buffer position
    var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    // Match the regex to the line, and return the match
    var matches = line.match(regex);
    if (matches) {
      return matches[0];
    } else {
      return "";
    }
  },

  getFxSuggestions(editor, bufferPosition, scopeDescriptor, prefix) {
    fx_suggestions = [];
    for (let fx of Object.keys(this.completions["fx"])) {
      if ((":" + fx).substring(0, prefix.length) === prefix) {
        // get the 1st sentence of the docs
        doc = this.completions["fx"][fx]["doc"]
        desc = ""
        if (doc != "" && doc != "Please write documentation!") {
          desc = doc.split(end_of_sentence_regex)[0]
        }

        fx_suggestions.push({
          text: fx,
          type: 'snippet',
          description: desc,
          iconHTML: '<i class="icon-settings"></i>',
          rightLabel: `Sonic Pi FX`
        });
      }
    }
    console.debug(fx_suggestions);
    return fx_suggestions;
  },

  getSynthSuggestions(editor, bufferPosition, scopeDescriptor, prefix) {
    synth_suggestions = [];
    for (let synth of Object.keys(this.completions["synths"])) {
      if ((":" + synth).substring(0, prefix.length) === prefix) {
        // get them 1st sentence of the docs
        doc = this.completions["synths"][synth]["doc"]
        desc = ""
        if (doc != "" && doc != "Please write documentation") {
          desc = doc.split(end_of_sentence_regex)[0]
        }

        synth_suggestions.push({
          text: synth,
          type: 'snippet',
          description: desc,
          iconHTML: '<i class="icon-megaphone"></i>',
          rightLabel: `Sonic Pi Synth`
        });
      }
    }
    console.debug(synth_suggestions);
    return synth_suggestions;
  },

  getSampleSuggestions(editor, bufferPosition, scopeDescriptor, prefix) {
    sample_suggestions = [];
    for (let group of Object.keys(this.completions["samples"])) {
      for (let sample of this.completions["samples"][group]["samples"]) {
        if ((":" + sample).substring(0, prefix.length) === prefix) {
          sample_suggestions.push({
              text: sample,
              type: 'snippet',
              iconHTML: '<i class="icon-triangle-right"></i>',
              rightLabel: `Sonic Pi Sample`
          });
        }
      }
    }
    console.debug(sample_suggestions);
    return sample_suggestions;
  },


  getSuggestions({editor, bufferPosition, scopeDescriptor}) {
    var prefix = this.getPrefix(editor, bufferPosition);
    console.debug("prefix: " + prefix);

    return new Promise(resolve => {
      var suggestions = [];
      console.debug(scopeDescriptor);
      if (prefix.length > 0) {
        if (true) {//(scopeDescriptor.scopes.includes("constant.other.symbol")) {
          suggestions = [
            ...this.getSynthSuggestions(editor, bufferPosition, scopeDescriptor, prefix),
            ...this.getFxSuggestions(editor, bufferPosition, scopeDescriptor, prefix),
            ...this.getSampleSuggestions(editor, bufferPosition, scopeDescriptor, prefix)
          ];
        }
        console.debug(suggestions);
      }

      return resolve(suggestions);
    });
  }
});
