import { ParserRuleContext } from 'antlr4ts'
import DataType from '../types/dataType'
import AST from '../ast'

export default class FunctionParameter extends AST {
    constructor(parseCtx: ParserRuleContext, public readonly name: string, public readonly type: DataType) {
        super(parseCtx)
    }
}
