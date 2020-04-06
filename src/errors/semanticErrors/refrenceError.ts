import AST from '../../ast/ast'
import SemanticError from './semanticError'

/**
 * Base class for all invalid references
 */
export default abstract class RefrenceError extends SemanticError {
    constructor(astNode: AST, msg: string) {
        super(astNode, msg, 'RefrenceError')
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
