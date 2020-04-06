import { ParserRuleContext } from 'antlr4ts'
import Literal from './literal'
import DataType from '../types/dataType'

export default class BoolLiteral extends Literal {
    constructor(parseCtx: ParserRuleContext, public readonly value: boolean) {
        super(parseCtx, DataType.BOOL)
    }
}
