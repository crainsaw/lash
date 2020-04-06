import { ParserRuleContext } from 'antlr4ts'
import DataType from '../types/dataType'
import Expression from '../expressions/expression'

export default abstract class Literal extends Expression {
    constructor(parseCtx: ParserRuleContext, public readonly dataType: DataType) {
        super(parseCtx)
    }
}
