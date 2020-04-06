import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'
import DataType from '../types/dataType'
import FunctionParameter from './functionParameter'

/**
 * A function declaration like 'function myFun(var1, var2) { }'
 */
export default class FunctionDeclarationStatement extends Statement {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly name: string,
        public readonly params: FunctionParameter[],
        public readonly body: Statement,
        public readonly returnType: DataType,
    ) {
        super(parseCtx)
    }
}
