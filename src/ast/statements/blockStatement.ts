import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'

export default class BlockStatement extends Statement {
    constructor(parseCtx: ParserRuleContext, public readonly statements: Statement[]) {
        super(parseCtx)
    }
}
