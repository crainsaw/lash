import { ParserRuleContext } from 'antlr4ts'
import Expression from './expression'

export default class CallExpression extends Expression {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly functionName: string,
        public readonly params: Expression[],
    ) {
        super(parseCtx)
    }
}
