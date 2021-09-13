import { ParserRuleContext, Token } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import Statement from './statement'

export default class BreakStatement extends Statement {
    constructor(public readonly parseCtx: ParserRuleContext | Token) {
        super(SyntaxKind.BreakStatement, parseCtx)
    }
}
