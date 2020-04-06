import { ParserRuleContext } from 'antlr4ts'
import DataType from '../types/dataType'
import Literal from './literal'

export default class StringLiteral extends Literal {
    constructor(parseCtx: ParserRuleContext, public readonly value: string) {
        super(parseCtx, DataType.STRING)
    }
}
