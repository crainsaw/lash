import { ParserRuleContext } from 'antlr4ts'
import DataType from '../types/dataType'
import Expression from '../expressions/expression'
import { SyntaxKind } from '../ast'

export default abstract class Literal extends Expression {
    constructor(kind: SyntaxKind, parseCtx: ParserRuleContext, public readonly dataType: DataType) {
        super(kind, parseCtx)
    }
}
