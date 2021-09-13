import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'
import Expression from '../expressions/expression'
import { SyntaxKind } from '../ast'

export default class ReturnStatement extends Statement {
    constructor(parseCtx: ParserRuleContext, public readonly expr: Expression) {
        super(SyntaxKind.ReturnStatement, parseCtx)
    }
}
