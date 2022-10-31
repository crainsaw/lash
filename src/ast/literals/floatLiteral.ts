import { ParserRuleContext } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import DataType from '../types/dataType'
import Literal from './literal'

export default class FloatLiteral extends Literal {
    constructor(parseCtx: ParserRuleContext, public readonly value: number) {
        super(SyntaxKind.FloatLiteral, parseCtx, DataType.FLOAT)
    }
}
