import RefrenceError from './refrenceError'
import VariableReference from '../../ast/expressions/variableReference'

/**
 *
 */
export default class InvalidVariableReferenceError extends RefrenceError {
    constructor(astNode: VariableReference) {
        super(astNode, `The variable ${astNode.name} does not exist.`)
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
