import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'
import DataType from '../types/dataType'
import Expression from '../expressions/expression'
import VariableType from '../types/variableType'

/**
 * A variable declaration e.g. var1 = 5 or var2 = fib(4) or const var3 = 8 or var test = "hallo"
 */
export default class VariableDeclarationStatement extends Statement {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly identifier: string,
        public readonly type: VariableType,
        public readonly dataType: DataType | null,
        public readonly value: Expression,
    ) {
        super(parseCtx)
    }
}
