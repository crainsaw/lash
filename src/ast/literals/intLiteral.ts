import { ParserRuleContext } from 'antlr4ts'
import DataType from '../types/dataType'
import Literal from './literal'

export default class IntLiteral extends Literal {
    constructor(parseCtx: ParserRuleContext, public readonly value: number) {
        super(parseCtx, DataType.INT)
    }
}
