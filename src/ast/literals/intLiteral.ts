import { ParserRuleContext } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import DataType from '../types/dataType'
import Literal from './literal'

export default class IntLiteral extends Literal {
    constructor(parseCtx: ParserRuleContext, public readonly value: number) {
        super(SyntaxKind.IntLiteral, parseCtx, DataType.INT)
    }
}
