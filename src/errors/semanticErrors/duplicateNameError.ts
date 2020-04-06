import AST from '../../ast/ast'
import SemanticError from './semanticError'

/**
 *
 */
export default class DuplicateNameError extends SemanticError {
    constructor(astNode: AST, msg: string) {
        super(astNode, msg, 'DuplicateNameError')
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
