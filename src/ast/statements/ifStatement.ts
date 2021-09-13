import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'
import Expression from '../expressions/expression'
import { SyntaxKind } from '../ast'

export default class IfStatement extends Statement {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly testExpression: Expression,
        public readonly body: Statement,
    ) {
        super(SyntaxKind.IfStatement, parseCtx)
    }
}
