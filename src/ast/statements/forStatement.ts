import { ParserRuleContext } from 'antlr4ts'
import Statement from './statement'
import Expression from '../expressions/expression'
import VariableDeclarationStatement from './variableDeclarationStatement'

export default class ForStatement extends Statement {
    constructor(
        parseCtx: ParserRuleContext,
        public readonly init: Expression | VariableDeclarationStatement | null,
        public readonly condition: Expression | null,
        public readonly update: Expression | null,
        public readonly body: Statement,
    ) {
        super(parseCtx)
    }
}
