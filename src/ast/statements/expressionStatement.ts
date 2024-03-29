import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'
import Expression from '../expressions/expression'
import { SyntaxKind } from '../ast'

/**
 * When a statement only consists of an expression use this type
 */
export default class ExpressionStatement extends Statement {
    constructor(parseCtx: ParserRuleContext, public readonly expr: Expression) {
        super(SyntaxKind.ExpressionStatement, parseCtx)
    }
}
