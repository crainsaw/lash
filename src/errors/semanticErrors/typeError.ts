import AST from '../../ast/ast'
import SemanticError from './semanticError'

/**
 * All type errors (e.g operations on unsupported types)
 */
export default class TypeError extends SemanticError {
    constructor(astNode: AST, msg: string) {
        super(astNode, msg, 'TypeError')
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
