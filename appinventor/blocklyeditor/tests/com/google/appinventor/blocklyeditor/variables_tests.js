suite('Variables', function() {
  let workspace;

  setup(function() {
    Blockly.common.setMainWorkspace(Blockly.BlocklyEditor.create(document.body, '', /*useDarkTheme*/ false, /*readonly*/ false, /*rtl*/ false));
    workspace = Blockly.common.getMainWorkspace();
  });

  test('declared global variable', function() {
    Blockly.serialization.blocks.append({
      type: 'global_declaration', fields: { NAME: 'myVar' }
    }, workspace);
    const myVarSetBlock = Blockly.serialization.blocks.append({
      type: 'lexical_variable_set',
      fields: { VAR: 'global myVar' },
      inputs: {
        VALUE: {
          block: { type: 'lexical_variable_get', fields: { VAR: 'global myVar' } }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.isNotTrue(myVarGetBlock.hasError);
    chai.assert.isNotTrue(myVarSetBlock.hasError);
  });

  test('undeclared global variable', function() {
    const myVarSetBlock = Blockly.serialization.blocks.append({
      type: 'lexical_variable_set',
      fields: { VAR: 'global myVar' },
      inputs: {
        VALUE: {
          block: { type: 'lexical_variable_get', fields: { VAR: 'global myVar' } }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.isTrue(myVarGetBlock.hasError);
    chai.assert.isTrue(myVarSetBlock.hasError);
  });

  test('declared local statement variable in scope', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_statement',
      fields: { VAR0: 'myVar' },
      inputs: {
        STACK: {
          block: {
            type: 'lexical_variable_set',
            fields: { VAR: 'myVar' },
            inputs: {
              VALUE: {
                block: { type: 'lexical_variable_get', fields: { VAR: 'myVar' } }
              }
            }
          }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const myVarSetBlock = declarationBlock.getInputTargetBlock('STACK');
    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.isNotTrue(myVarGetBlock.hasError);
    chai.assert.isNotTrue(myVarSetBlock.hasError);
  });

  test('declared local expression variable in scope', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_expression',
      fields: { VAR0: 'myVar' },
      inputs: {
        RETURN: {
          block: {
            type: 'controls_do_then_return',
            inputs: {
              STM: {
                block: { type: 'lexical_variable_set', fields: { VAR: 'myVar' } }
              },
              VALUE: {
                block: { type: 'lexical_variable_get', fields: { VAR: 'myVar' } }
              }
            }
          }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const doThenReturnBlock = declarationBlock.getInputTargetBlock('RETURN');
    const myVarSetBlock = doThenReturnBlock.getInputTargetBlock('STM');
    const myVarGetBlock = doThenReturnBlock.getInputTargetBlock('VALUE');
    chai.assert.isNotTrue(myVarSetBlock.hasError);
    chai.assert.isNotTrue(myVarGetBlock.hasError);
  });

  test('declared local statement variable out of scope', function() {
    Blockly.serialization.blocks.append({
      type: 'local_declaration_statement', fields: { VAR0: 'myVar' }
    }, workspace);
    const myVarSetBlock = Blockly.serialization.blocks.append({
      type: 'lexical_variable_set',
      fields: { VAR: 'myVar' },
      inputs: {
        VALUE: {
          block: { type: 'lexical_variable_get', fields: { VAR: 'myVar' } }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.isTrue(myVarGetBlock.hasError);
    chai.assert.isTrue(myVarSetBlock.hasError);
  });

  test('declared local expression variable out of scope', function() {
    Blockly.serialization.blocks.append({
      type: 'local_declaration_expression', fields: { VAR0: 'myVar' }
    }, workspace);
    const doThenReturnBlock = Blockly.serialization.blocks.append({
      type: 'controls_do_then_return',
      inputs: {
        STM: {
          block: { type: 'lexical_variable_set', fields: { VAR: 'myVar' } }
        },
        VALUE: {
          block: { type: 'lexical_variable_get', fields: { VAR: 'myVar' } }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const myVarSetBlock = doThenReturnBlock.getInputTargetBlock('STM');
    const myVarGetBlock = doThenReturnBlock.getInputTargetBlock('VALUE');
    chai.assert.isTrue(myVarSetBlock.hasError);
    chai.assert.isTrue(myVarGetBlock.hasError);
  });

  test('undeclared local variable', function() {
    const myVarSetBlock = Blockly.serialization.blocks.append({
      type: 'lexical_variable_set',
      fields: { VAR: 'myVar' },
      inputs: {
        VALUE: {
          block: { type: 'lexical_variable_get', fields: { VAR: 'myVar' } }
        }
      }
    }, workspace);
    workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();

    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.isTrue(myVarGetBlock.hasError);
    chai.assert.isTrue(myVarSetBlock.hasError);
  });

  test('rename global variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'global_declaration', fields: { NAME: 'myOldVar' }
    }, workspace);
    const setBlock = Blockly.serialization.blocks.append({
      type: 'lexical_variable_set',
      fields: { VAR: 'global myOldVar' },
      inputs: {
        VALUE: {
          block: { type: 'lexical_variable_get', fields: { VAR: 'global myOldVar' } }
        }
      }
    }, workspace);
    declarationBlock.setFieldValue('myNewVar', 'NAME');

    const getBlock = setBlock.getInputTargetBlock('VALUE');
    chai.assert.equal(getBlock.getFieldValue('VAR'), 'global myNewVar');
    chai.assert.equal(setBlock.getFieldValue('VAR'), 'global myNewVar');
  });

  test('rename local statement variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_statement',
      fields: { VAR0: 'myOldVar' },
      inputs: {
        STACK: {
          block: {
            type: 'lexical_variable_set',
            fields: { VAR: 'myOldVar' },
            inputs: {
              VALUE: {
                block: { type: 'lexical_variable_get', fields: { VAR: 'myOldVar' } }
              }
            }
          }
        }
      }
    }, workspace);
    declarationBlock.setFieldValue('myNewVar', 'VAR0');

    const myVarSetBlock = declarationBlock.getInputTargetBlock('STACK');
    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.equal(myVarSetBlock.getFieldValue('VAR'), 'myNewVar');
    chai.assert.equal(myVarGetBlock.getFieldValue('VAR'), 'myNewVar');
  });

  test('rename local expression variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_expression',
      fields: { VAR0: 'myOldVar' },
      inputs: {
        RETURN: {
          block: {
            type: 'controls_do_then_return',
            inputs: {
              STM: {
                block: { type: 'lexical_variable_set', fields: { VAR: 'myOldVar' } }
              },
              VALUE: {
                block: { type: 'lexical_variable_get', fields: { VAR: 'myOldVar' } }
              }
            }
          }
        }
      }
    }, workspace);
    declarationBlock.setFieldValue('myNewVar', 'VAR0');

    const doThenReturnBlock = declarationBlock.getInputTargetBlock('RETURN');
    const myVarSetBlock = doThenReturnBlock.getInputTargetBlock('STM');
    const myVarGetBlock = doThenReturnBlock.getInputTargetBlock('VALUE');
    chai.assert.equal(myVarSetBlock.getFieldValue('VAR'), 'myNewVar');
    chai.assert.equal(myVarGetBlock.getFieldValue('VAR'), 'myNewVar');
  });

  test('rename local statement variable to duplicate name', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_statement',
      fields: { VAR0: 'myVar', VAR1: 'myOtherVar' },
      extraState: '<mutation><localname name="myVar"/><localname name="myOtherVar"/></mutation>',
      inputs: {
        STACK: {
          block: {
            type: 'lexical_variable_set',
            fields: { VAR: 'myOtherVar' },
            inputs: {
              VALUE: {
                block: { type: 'lexical_variable_get', fields: { VAR: 'myOtherVar' } }
              }
            }
          }
        }
      }
    }, workspace);
    declarationBlock.setFieldValue('myVar', 'VAR1');

    chai.assert.equal(declarationBlock.getFieldValue('VAR1'), 'myVar2');
    const myVarSetBlock = declarationBlock.getInputTargetBlock('STACK');
    const myVarGetBlock = myVarSetBlock.getInputTargetBlock('VALUE');
    chai.assert.equal(myVarSetBlock.getFieldValue('VAR'), 'myVar2');
    chai.assert.equal(myVarGetBlock.getFieldValue('VAR'), 'myVar2');
  });

  test('rename local expression variable to duplicate name', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_expression',
      fields: { VAR0: 'myVar', VAR1: 'myOtherVar' },
      extraState: '<mutation><localname name="myVar"/><localname name="myOtherVar"/></mutation>',
      inputs: {
        RETURN: {
          block: {
            type: 'controls_do_then_return',
            inputs: {
              STM: {
                block: { type: 'lexical_variable_set', fields: { VAR: 'myOtherVar' } }
              },
              VALUE: {
                block: { type: 'lexical_variable_get', fields: { VAR: 'myOtherVar' } }
              }
            }
          }
        }
      }
    }, workspace);
    declarationBlock.setFieldValue('myVar', 'VAR1');

    chai.assert.equal(declarationBlock.getFieldValue('VAR1'), 'myVar2');
    const doThenReturnBlock = declarationBlock.getInputTargetBlock('RETURN');
    const myVarSetBlock = doThenReturnBlock.getInputTargetBlock('STM');
    const myVarGetBlock = doThenReturnBlock.getInputTargetBlock('VALUE');
    chai.assert.equal(myVarSetBlock.getFieldValue('VAR'), 'myVar2');
    chai.assert.equal(myVarGetBlock.getFieldValue('VAR'), 'myVar2');
  });

  test('add local statement variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_statement', fields: { VAR0: 'myVar' }
    }, workspace);
    const mutatorDiv = document.createElement('div');
    const mutatorWorkspace = Blockly.inject(mutatorDiv, {});
    const mutatorRootBlock = declarationBlock.decompose(mutatorWorkspace);
    const myVarBlock = mutatorRootBlock.getInputTargetBlock('STACK');
    const myOtherVarBlock = Blockly.serialization.blocks.append({
      type: 'local_mutatorarg', fields: { NAME: 'myOtherVar' }
    }, mutatorWorkspace);
    myVarBlock.nextConnection.connect(myOtherVarBlock.previousConnection);
    declarationBlock.compose(mutatorRootBlock);

    chai.assert.equal(declarationBlock.getFieldValue('VAR0'), 'myVar');
    chai.assert.equal(declarationBlock.getFieldValue('VAR1'), 'myOtherVar');
  });

  test('add local expression variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_expression', fields: { VAR0: 'myVar' }
    }, workspace);
    const mutatorDiv = document.createElement('div');
    const mutatorWorkspace = Blockly.inject(mutatorDiv, {});
    const mutatorRootBlock = declarationBlock.decompose(mutatorWorkspace);
    const myVarBlock = mutatorRootBlock.getInputTargetBlock('STACK');
    const myOtherVarBlock = Blockly.serialization.blocks.append({
      type: 'local_mutatorarg', fields: { NAME: 'myOtherVar' }
    }, mutatorWorkspace);
    myVarBlock.nextConnection.connect(myOtherVarBlock.previousConnection);
    declarationBlock.compose(mutatorRootBlock);

    chai.assert.equal(declarationBlock.getFieldValue('VAR0'), 'myVar');
    chai.assert.equal(declarationBlock.getFieldValue('VAR1'), 'myOtherVar');
  });

  test('reorder local statement variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_statement',
      fields: { VAR0: 'myVar', VAR1: 'myOtherVar' },
      extraState: '<mutation><localname name="myVar"/><localname name="myOtherVar"/></mutation>'
    }, workspace);
    const mutatorDiv = document.createElement('div');
    const mutatorWorkspace = Blockly.inject(mutatorDiv, {});
    const mutatorRootBlock = declarationBlock.decompose(mutatorWorkspace);
    const myVarBlock = mutatorRootBlock.getInputTargetBlock('STACK');
    const myOtherVarBlock = myVarBlock.nextConnection.targetBlock();
    myVarBlock.nextConnection.disconnect();
    myOtherVarBlock.previousConnection.connect(mutatorRootBlock.getInput('STACK').connection);
    myOtherVarBlock.nextConnection.connect(myVarBlock.previousConnection);
    declarationBlock.compose(mutatorRootBlock);

    chai.assert.equal(declarationBlock.getFieldValue('VAR0'), 'myOtherVar');
    chai.assert.equal(declarationBlock.getFieldValue('VAR1'), 'myVar');
  });

  test('reorder local expression variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_expression',
      fields: { VAR0: 'myVar', VAR1: 'myOtherVar' },
      extraState: '<mutation><localname name="myVar"/><localname name="myOtherVar"/></mutation>'
    }, workspace);
    const mutatorDiv = document.createElement('div');
    const mutatorWorkspace = Blockly.inject(mutatorDiv, {});
    const mutatorRootBlock = declarationBlock.decompose(mutatorWorkspace);
    const myVarBlock = mutatorRootBlock.getInputTargetBlock('STACK');
    const myOtherVarBlock = myVarBlock.nextConnection.targetBlock();
    myVarBlock.nextConnection.disconnect();
    myOtherVarBlock.previousConnection.connect(mutatorRootBlock.getInput('STACK').connection);
    myOtherVarBlock.nextConnection.connect(myVarBlock.previousConnection);
    declarationBlock.compose(mutatorRootBlock);

    chai.assert.equal(declarationBlock.getFieldValue('VAR0'), 'myOtherVar');
    chai.assert.equal(declarationBlock.getFieldValue('VAR1'), 'myVar');
  });

  test('remove local statement variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_statement',
      fields: { VAR0: 'myVar', VAR1: 'myOtherVar' },
      extraState: '<mutation><localname name="myVar"/><localname name="myOtherVar"/></mutation>'
    }, workspace);
    const mutatorDiv = document.createElement('div');
    const mutatorWorkspace = Blockly.inject(mutatorDiv, {});
    const mutatorRootBlock = declarationBlock.decompose(mutatorWorkspace);
    const myVarBlock = mutatorRootBlock.getInputTargetBlock('STACK');
    const myOtherVarBlock = myVarBlock.nextConnection.targetBlock();
    myOtherVarBlock.dispose();
    declarationBlock.compose(mutatorRootBlock);

    chai.assert.equal(declarationBlock.getFieldValue('VAR0'), 'myVar');
    chai.assert.isNull(declarationBlock.getField('VAR1'));
  });

  test('remove local expression variable', function() {
    const declarationBlock = Blockly.serialization.blocks.append({
      type: 'local_declaration_expression',
      fields: { VAR0: 'myVar', VAR1: 'myOtherVar' },
      extraState: '<mutation><localname name="myVar"/><localname name="myOtherVar"/></mutation>'
    }, workspace);
    const mutatorDiv = document.createElement('div');
    const mutatorWorkspace = Blockly.inject(mutatorDiv, {});
    const mutatorRootBlock = declarationBlock.decompose(mutatorWorkspace);
    const myVarBlock = mutatorRootBlock.getInputTargetBlock('STACK');
    const myOtherVarBlock = myVarBlock.nextConnection.targetBlock();
    myOtherVarBlock.dispose();
    declarationBlock.compose(mutatorRootBlock);

    chai.assert.equal(declarationBlock.getFieldValue('VAR0'), 'myVar');
    chai.assert.isNull(declarationBlock.getField('VAR1'));
  });

  suite('Constants', function() {
    function appendGroup(group, entries) {
      return Blockly.serialization.blocks.append({
        type: 'constant_group_declaration', fields: { GROUP: group },
        inputs: { CONSTANTS: { block: entries } }
      }, workspace);
    }

    function entry(name, value, next) {
      const json = {
        type: 'constant_group_entry', fields: { NAME: name },
        inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: value } } } }
      };
      if (next) {
        json.next = { block: next };
      }
      return json;
    }

    test('getter can read a constant of its group', function() {
      appendGroup('API', entry('VERSION', 3));
      const getBlock = Blockly.serialization.blocks.append({
        type: 'constant_group_get', fields: { GROUP: 'API', CONSTANT: 'VERSION' }
      }, workspace);
      workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
      chai.assert.isNotTrue(getBlock.hasError);
    });

    test('getter for a constant that is not in the group is an error', function() {
      appendGroup('API', entry('VERSION', 3));
      appendGroup('COLORS', entry('PRIMARY', 1));
      const getBlock = Blockly.serialization.blocks.append({
        type: 'constant_group_get', fields: { GROUP: 'COLORS', CONSTANT: 'VERSION' }
      }, workspace);
      workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
      chai.assert.isTrue(getBlock.hasError);
    });

    test('constants are not exposed to the variable getter', function() {
      appendGroup('API', entry('VERSION', 3));
      const getBlock = Blockly.serialization.blocks.append({
        type: 'lexical_variable_get', fields: { VAR: 'global VERSION' }
      }, workspace);
      workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
      chai.assert.isTrue(getBlock.hasError);
    });

    test('duplicate constant name in a group is an error', function() {
      const group = appendGroup('API', entry('A', 1, entry('A', 2)));
      workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
      const second = group.getInputTargetBlock('CONSTANTS').getNextBlock();
      chai.assert.isTrue(second.hasError);
    });

    test('same constant name in different groups is fine', function() {
      const a = appendGroup('API', entry('A', 1));
      const b = appendGroup('COLORS', entry('A', 2));
      workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
      chai.assert.isNotTrue(a.getInputTargetBlock('CONSTANTS').hasError);
      chai.assert.isNotTrue(b.getInputTargetBlock('CONSTANTS').hasError);
    });

    test('duplicate group name is an error', function() {
      const a = appendGroup('API', entry('A', 1));
      appendGroup('API', entry('B', 2));
      workspace.getWarningHandler().checkAllBlocksForWarningsAndErrors();
      chai.assert.isTrue(a.hasError);
    });

    test('group generates one definition per constant', function() {
      const group = appendGroup('API', entry('VERSION', 3));
      chai.assert.include(AI.Yail.blockToCode(group), '(def c$API$VERSION 3)');
      const getBlock = Blockly.serialization.blocks.append({
        type: 'constant_group_get', fields: { GROUP: 'API', CONSTANT: 'VERSION' }
      }, workspace);
      chai.assert.include(AI.Yail.blockToCode(getBlock)[0], '(get-var c$API$VERSION)');
    });

    test('mutator group declaration generates definitions and is read by getter', function() {
      const block = workspace.newBlock('constant_group_declaration');
      block.setFieldValue('MATH_CONSTS', 'GROUP');
      block.updateConstantInputs_(['PI', 'E']);
      const piVal = workspace.newBlock('math_number');
      piVal.setFieldValue('3.14159', 'NUM');
      block.getInput('CONST0').connection.connect(piVal.outputConnection);
      const eVal = workspace.newBlock('math_number');
      eVal.setFieldValue('2.71828', 'NUM');
      block.getInput('CONST1').connection.connect(eVal.outputConnection);

      const yail = AI.Yail.blockToCode(block);
      chai.assert.include(yail, '(def c$MATH_CONSTS$PI 3.14159)');
      chai.assert.include(yail, '(def c$MATH_CONSTS$E 2.71828)');

      const getBlock = Blockly.serialization.blocks.append({
        type: 'constant_group_get', fields: { GROUP: 'MATH_CONSTS', CONSTANT: 'PI' }
      }, workspace);
      chai.assert.include(AI.Yail.blockToCode(getBlock)[0], '(get-var c$MATH_CONSTS$PI)');
    });
  });
});
