// Ace custom mode for log highlighting
import ace from 'ace-builds/src-noconflict/ace';

const logHighlightRules = function() {
  this.$rules = {
    start: [
      {
        token: 'log-date',
        regex: /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/
      },
      {
        token: 'log-number',
        regex: /\b\d+\b/
      },
      {
        token: 'log-fatal',
        regex: /\bFATAL\b/
      },
      {
        token: 'log-fail',
        regex: /\bFAIL(?:ED)?\b/
      },
      {
        token: 'log-error',
        regex: /\bERROR\b/
      },
      {
        token: 'log-warn',
        regex: /\bWARN(?:ING)?\b/
      },
      {
        token: 'log-info',
        regex: /\bINFO\b/
      },
      {
        token: 'log-debug',
        regex: /\bDEBUG\b/
      },
      {
        token: 'log-tag-inf',
        regex: /\bINF\b/
      },
      {
        token: 'log-tag-err',
        regex: /\bERR\b/
      },
      {
        token: 'log-http-get',
        regex: /\bGET\b/
      },
      {
        token: 'log-default',
        regex: /.+/
      }
    ]
  };
};

ace.define('ace/mode/log_highlight', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/text_highlight_rules'], function(require, exports, module) {
  const oop = require('ace/lib/oop');
  const TextMode = require('ace/mode/text').Mode;
  const TextHighlightRules = require('ace/mode/text_highlight_rules').TextHighlightRules;

  const LogHighlightRules = function() {
    logHighlightRules.call(this);
  };
  oop.inherits(LogHighlightRules, TextHighlightRules);

  const Mode = function() {
    TextMode.call(this);
    this.HighlightRules = LogHighlightRules;
  };
  oop.inherits(Mode, TextMode);

  (function() {
    this.$id = 'ace/mode/log_highlight';
  }).call(Mode.prototype);

  exports.Mode = Mode;
});
