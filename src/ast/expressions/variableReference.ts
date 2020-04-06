import { Token } from 'antlr4ts'
import Expression from './expression'

/**
 * A variable reference like var1
 * Maybe rename to Identifier? How do other languages name it?
 */
export default class VariableReference extends Expression {
    constructor(token: Token, public readonly name: string) {
        super(token)
    }
}
