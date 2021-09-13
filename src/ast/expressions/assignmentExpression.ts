import { ParserRuleContext } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import { BinaryOperatorToken } from '../operators/operatorTokens'
import Expression from './expression'
import VariableReference from './variableReference'

export default class AssignmentExpression extends Expression {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly name: VariableReference,
        public readonly assignOperator: BinaryOperatorToken,
        public readonly value: Expression,
    ) {
        super(SyntaxKind.AssignmentExpression, parseCtx)
    }
}
