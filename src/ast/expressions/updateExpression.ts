import { ParserRuleContext } from 'antlr4ts'
import Expression from './expression'
import VariableReference from './variableReference'
import { UnaryOperatorToken } from '../operators/operatorTokens'

export enum UnaryOperatorType {
    PREFIX = 'prefix',
    SUFFIX = 'suffix',
}

/**
 * A unary  opertator call like ++i or n++
 */
export class UpdateExpression extends Expression {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly variable: VariableReference,
        public readonly operator: UnaryOperatorToken,
        public readonly operatorType: UnaryOperatorType,
    ) {
        super(parseCtx)
    }
}
