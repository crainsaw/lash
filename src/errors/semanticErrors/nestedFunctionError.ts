import AST from '../../ast/ast'
import SemanticError from './semanticError'

/**
 *
 */
export default class NestedFunctionError extends SemanticError {
    constructor(astNode: AST) {
        super(
            astNode,
            `Function declarations are only allowed on the top level. Nested function declarations are permitted.`,
            'NestedFunctionError',
        )
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
