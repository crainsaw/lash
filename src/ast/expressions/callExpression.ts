import { ParserRuleContext } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import Expression from './expression'

export default class CallExpression extends Expression {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly functionName: string,
        public readonly params: Expression[],
    ) {
        super(SyntaxKind.CallExpression, parseCtx)
    }
}
