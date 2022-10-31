import { ParserRuleContext, Token } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import Statement from './statement'

/**
 * Just an empty line in the source code
 */
export default class NOPStatement extends Statement {
    constructor(public readonly parseCtx: ParserRuleContext | Token) {
        super(SyntaxKind.NOPStatement, parseCtx)
    }
}
