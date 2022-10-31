import { ParserRuleContext } from 'antlr4ts'
import Expression from './expression'
import { BinaryOperatorToken } from '../operators/operatorTokens'
import { SyntaxKind } from '../ast'

/**
 * A binary opertator call like 5+3 or true && false
 */
export default class BinaryExpression extends Expression {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly operator: BinaryOperatorToken,
        public readonly leftHandSide: Expression,
        public readonly rightHandSide: Expression,
    ) {
        super(SyntaxKind.BinaryExpression, parseCtx)
    }
}
