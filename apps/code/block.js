/**
 * Blockly Lua: ComputerCraft Block superclass
 *
 * Copyright 2013 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Abstract base class for ComputerCraft blocks.
 * @author ellen.spertus@gmail.com (Ellen Spertus)
 */
'use strict';
goog.provide('ComputerCraft.Block');

goog.require('goog.asserts');

Blockly.ComputerCraft = {};

Blockly.ComputerCraft.BASE_HELP_URL = 'http://computercraft.info/wiki/';

/**
 * Whether the described block should have previous and next statement
 * connections.
 */
Blockly.ComputerCraft.StmtConns = {
  NONE: 0,
  PREVIOUS: 1,
  NEXT: 2,
  BOTH: 3  // Provided for convenience.
};

/**
 * Ways of computing a help URL as a function of other pieces of information
 * about a block.  In all cases, the URL begins with
 * Blockly.ComputerCraft.BASE_HELP_URL.
 */
Blockly.ComputerCraft.HelpUrlType = {
  // Concatenate the prefix and funcName.
  PREFIX_NAME: 1,
  // Concatenate the prefix and the value of the title of the dropdown menu
  // specified by ddFuncName.
  PREFIX_DD: 2
};

// This is only used in Blockly.ComputerCraft.convertFromCamelCase but is
// declared here to avoid recompilation.
Blockly.ComputerCraft.LOWER_TO_UPPER_REGEX_ = /([a-z])(?=[A-Z])/g;

/**
 * Convert a camelCase string (e.g., "lightGray") to all lower-case, with
 * words separated by underscores.  Only one underscore occurs before
 * runs of multiple adjacent capital letters.
 *
 * @param {!string} s A string consisting of only [A-Za-z].
 * @return {string} A version of the input string in which all letters
 *   are now lower-case and undescores appear at every transition from
 *   a lower-case letter to an upper-case letter in the original.
 */
Blockly.ComputerCraft.convertFromCamelCase = function(s) {
  return s.replace(Blockly.ComputerCraft.LOWER_TO_UPPER_REGEX_, '$1_').
      toLowerCase();
};

/**
 * Generate a block name, such as 'peripheral_get_names'.  This is done by
 * concatenating:
 * - prefix
 * - an underscore
 * - either:
 *   - info.blockName, if provided, or
 *   - info.funcName, with every instance of '[A-Z]+' replaced with '_[a-z]+'.
 *     For example, 'isPresent' would become 'is_present' and
 *     'getID' would become 'get_id'.
 * @param {string} prefix A ComputerCraft API prefix, such as 'os'.
 * @param {Object} func An object containing a funcName field and optionally
 *     a blockName
 * @return {string} An underscore-separated string suitable for use as a block
 *     name.
 */
Blockly.ComputerCraft.getBlockName_ = function(prefix, info) {
  var name = info.blockName;
  if (!name) {
    goog.asserts.assert(info.funcName, 'info.funcName not defined');
    name = Blockly.ComputerCraft.convertFromCamelCase(info.funcName);
  }
  return prefix + '_' + name;
}

/**
 * Base class for ComputerCraft blocks.
 *
 * This may be used directly in creating blocks, and it is extended by
 * Blockly.ComputerCraft.ValueBlock.  In any case, this does not set up
 * block text or inputs, which must be set elsewhere.
 *
 * @param {string} prefix A ComputerCraft API name, such as 'turtle'.
 * @param {number} colour The block colour, an HSV hue value.
 * @param {Object} info Information about the block being defined.
 *     The following fields are used:
 *     <ul>
 *     <li>blockName {?string} The part of the Blockly name of the block that
 *         follows the prefix, such as 'turn' for the 'turtle_turn' block.
 *         If not provided, this is inferred from funcName via
 *         Blockly.ComputerCraft.getBlockName_().
 *     <li>funcName {?string} The name of the Lua function generated by this
 *         block.  This must be provided if blockName is not.  This is used for
 *         code generation.
 *     <li>output {?string|Array.<string>} Type(s) of the first output.
 *         If undefined, there are assumed to be no outputs.  If null, any
 *         output type can be returned.
 *     <li>stmtConns {?Blockly.ComputerCraft.StmtConns}
 *         Whether there are previous and next statements.
 *         If absent and if there is no output, it will be assumed
 *         that there are previous and next statement connections
 *     <li>multipleOutputs {?number} The number of outputs, if greater than 1.
 *     <li>tooltip {?string} Tooltip text of a function on this block that
 *         returns a tooltip string.
 *     <li>helpUrl {?string} The help URL, accessible through the context menu.
 *         This may also be specified through helpUrlType.
 *     <li>helpUrlType {?Blockly.ComputerCraft.HelpUrlType} How to create the
 *         help URL, as a function of other fields.  This is ignored if
 *         helpUrl is provided.
 *     </ul>
 */
Blockly.ComputerCraft.Block = function(prefix, colour, info) {
  this.prefix = prefix;
  this.colour = colour;
  this.info = info;
  this.blockName = Blockly.ComputerCraft.getBlockName_(prefix, info);
};

Blockly.ComputerCraft.Block.prototype.init = function() {
  this.setColour(this.colour);
  this.setInputsInline(true);
  if (this.info.helpUrlType ==
      Blockly.ComputerCraft.HelpUrlType.PREFIX_NAME) {
      this.helpUrl =
        Blockly.ComputerCraft.BASE_HELP_URL +
            this.prefix.charAt(0).toUpperCase() +
            this.prefix.slice(1) + '.' + this.info.funcName;
  }
  if (this.info.tooltip) {
    if (typeof this.info.tooltip == 'function') {
      var thisBlock = this;
      this.setTooltip(function() {
        var t = thisBlock.info.tooltip(thisBlock);
        return t;});
    } else {
      this.setTooltip(this.info.tooltip);
    }
  }
  // If no output or statement connections are specified,
  // place a previous and next statement connector.
  if (!this.info.multipleOutputs && typeof this.info.output == 'undefined' &&
      this.info.stmtConns != Blockly.ComputerCraft.StmtConns.NONE) {
    this.info.stmtConns = Blockly.ComputerCraft.StmtConns.BOTH;
  }
  if (this.info.stmtConns) {
    this.setPreviousStatement(
      (this.info.stmtConns & Blockly.ComputerCraft.StmtConns.PREVIOUS) != 0);
    this.setNextStatement(
      (this.info.stmtConns & Blockly.ComputerCraft.StmtConns.NEXT) != 0);
  }
  if (typeof this.info.output != 'undefined') {
    this.setOutput(true, this.info.output);
  }
  if (this.info.multipleOutputs) {
    this.multipleOutputs = this.info.multipleOutputs;
    if (!this.info.output) {
      this.setOutput(true);
    }
  }
  // Subclass must set up inputs, including block title.
};

/**
 * Generate the code for a dropdown menu.  This must be overridden by
 * subclasses.
 * @param {!Blockly.FieldDropdown} field The dropdown menu.
 * @return {!string} Lua code.
 * @throws {goog.asserts.AssertionError} if not overridden
 */
Blockly.ComputerCraft.Block.prototype.generateDropdownCode = function(field) {
  goog.asserts.fail('generateDropdownCode() must be overridden.');
};

/**
 * Generate Lua code without distinguishing between statements and
 * expressions.
 * @return {!string} Lua code for this block.
 */
Blockly.ComputerCraft.Block.prototype.generateLuaInner_ = function() {
  // Evaluate each parameter in order, building up a list of parameter
  // expressions.
  var inputsCode = [];
  var thisBlock = this;
  this.getOrderedParameterNames().forEach(function(name) {
    // Is it the name of an input?
    var input = thisBlock.getInput(name);
    if (input) {
      // If so, evaluate it recursively.
      goog.asserts.assert(input.type == Blockly.INPUT_VALUE);
      inputsCode.push(Blockly.Lua.valueToCode(
        thisBlock, input.name, Blockly.Lua.ORDER_NONE));
    } else {
      // If not, it had better be a title.
      var title = thisBlock.getTitle_(name);
      goog.asserts.assert(title,
          'Unable to find input or title named ' + name);
      goog.asserts.assert(title instanceof Blockly.FieldDropdown,
          'Only value inputs and dropdowns are currently supported.');
      var result = thisBlock.generateDropdownCode(title);
      if (result) {
        inputsCode.push(result);
      }
    }
  });
  return this.getFuncName() + '(' + inputsCode.join(', ') + ')';
};

/**
 * Generate Lua code for a block.
 * @return {!string|!Array.<!string, number>} The Lua code.
 */
Blockly.ComputerCraft.Block.prototype.generateLua = function() {
  var code = this.generateLuaInner_();
  if (this.outputConnection) {
    return [code, Blockly.Lua.ORDER_HIGH];
  } else {
    return code + '\n';
  }
};

/*
Blockly.ComputerCraft.nameValidator = function(newVar) {
  // Merge runs of whitespace.  Strip leading and trailing whitespace.
  // Beyond this, all names are legal.
  newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
  return newVar || null;
};
*/

/**
 * Ensure that no argument name matches the regular expression.
 * This is used to detect conflicts between argument names chosen
 * by users and used internally by a Blockly.ComputerCraft.Block subclass.
 * @param {?Array.<Array.<string,object>>} The arguments.
 * @param {!RegExp} The regular expression.
 * @throws {goog.asserts.AssertionError} if any name matches the regular
 *     expression.
 */
Blockly.ComputerCraft.Block.disallowArgTitle_ = function(args, regex) {
  if (args) {
    args.forEach(function(arg) {
      goog.asserts.assert(!regex.exec(arg[0]),
        'Illegal argument name ' + arg[0]);
    });
  }
}
