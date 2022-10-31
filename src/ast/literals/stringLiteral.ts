import { ParserRuleContext } from 'antlr4ts'
import { SyntaxKind } from '../ast'
import DataType from '../types/dataType'
import Literal from './literal'

export default class StringLiteral extends Literal {
    constructor(parseCtx: ParserRuleContext, public readonly value: string) {
        super(SyntaxKind.StringLiteral, parseCtx, DataType.STRING)
    }
}
