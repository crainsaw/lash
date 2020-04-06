import TypeInferencer from '../grammar/typeInferencer'
import BashExpressionGenerator, { ExpressionMode } from './bashExpression'
import NotImplementedError from '../errors/notImplementedError'
import Program from '../ast/program'
import Statement from '../ast/statements/statement'
import BlockStatement from '../ast/statements/blockStatement'
import VariableDeclarationStatement from '../ast/statements/variableDeclarationStatement'
import ExpressionStatement from '../ast/statements/expressionStatement'
import ForStatement from '../ast/statements/forStatement'
import IfStatement from '../ast/statements/ifStatement'
import ReturnStatement from '../ast/statements/returnStatement'
import ContinueStatement from '../ast/statements/continueStatement'
import BreakStatement from '../ast/statements/breakStatement'
import NOPStatement from '../ast/statements/NOPStatement'
import FunctionDeclarationStatement from '../ast/statements/functionDeclarationStatement'
import VariableType from '../ast/types/variableType'

/**
 * set -u # will cause the script to fail if you’re trying to reference a variable that hasn’t been set. The default behavior will just evaluate the variable to the empty string.
 * set -e" # will cause the script to exit immediately if a command fails. The default behavior is to simply continue executing the remaining commands in the script.
 * set -o pipefail # will cause a pipeline to fail if any of the commands in the pipeline failed. The default behavior is to only use the exit status of the last command.
 */
const HEADER = `#!/bin/bash
set -u
set -e
set -o

`

/**
 *
 */
export default class BashGenerator {
    /**
     * Used to generate bash code for expressions
     */
    protected exprGenerator: BashExpressionGenerator

    /**
     *
     * @param program
     * @param types
     */
    constructor(
        public readonly program: Program,
        public readonly types: TypeInferencer,
        public readonly newline = '\n',
        public readonly intent = '\t',
    ) {
        this.exprGenerator = new BashExpressionGenerator(types)
    }

    /**
     *
     * @param addHeader
     */
    public generateBash(addHeader = false): string {
        if (addHeader) {
            return HEADER + this.visitStatements(this.program.statements)
        }
        return this.visitStatements(this.program.statements)
    }

    /**
     * Visits multiple statements (i.e. lines of code)
     * @param statements
     */
    protected visitStatements(statements: Statement[]): string {
        return statements.map(this.visitStatement.bind(this)).join(this.newline)
    }

    /**
     * Makes sure the visitors output is intended
     * @param visitor
     */
    protected addIntent(srcCode: string): string {
        let intendedRes = ''
        for (const line of srcCode.split(this.newline)) {
            intendedRes += this.intent + line + this.newline
        }
        intendedRes = intendedRes.slice(0, intendedRes.length - this.newline.length)
        return intendedRes
    }

    /**
     * Equal to visitStatement expect that BlockStatements do not add extra bracets
     * @param stmt
     */
    protected visitUnpackStmt(stmt: Statement): string {
        if (stmt instanceof BlockStatement) {
            return this.visitStatements(stmt.statements)
        }
        return this.visitStatement(stmt)
    }

    /**
     * Visits a single Statement
     * @param stmt
     */
    protected visitStatement(stmt: Statement): string {
        if (stmt instanceof VariableDeclarationStatement) return this.visitVariableDeclarationStmt(stmt)
        if (stmt instanceof ExpressionStatement) return this.exprGenerator.visit(stmt.expr, true)
        if (stmt instanceof ForStatement) return this.visitForStmt(stmt)
        if (stmt instanceof BlockStatement) return `{${this.addIntent(this.visitStatements(stmt.statements))}}`
        if (stmt instanceof IfStatement) return this.visitIfStatement(stmt)
        if (stmt instanceof ReturnStatement) return `return ${this.exprGenerator.visit(stmt.expr)}`
        if (stmt instanceof ContinueStatement) return 'continue'
        if (stmt instanceof BreakStatement) return 'break'
        if (stmt instanceof NOPStatement) return this.newline
        if (stmt instanceof FunctionDeclarationStatement) return this.visitFunctionDeclarationStmt(stmt)
        throw new NotImplementedError()
    }

    /**
     *
     * @param stmt
     */
    protected visitFunctionDeclarationStmt(stmt: FunctionDeclarationStatement): string {
        let res = `function ${stmt.name} {${this.newline}`

        // create body
        let body = ''
        for (let i = 0; i < stmt.params.length; i++) {
            const param = stmt.params[i]
            body += `${param.name}=$${i + 1}${this.newline}`
        }
        body += this.visitUnpackStmt(stmt.body)

        res += this.addIntent(body)
        res += this.newline
        res += '}'

        return res
    }

    /**
     *
     * @param stmt
     */
    protected visitIfStatement(stmt: IfStatement): string {
        let res = 'if '
        res += this.exprGenerator.visit(stmt.testExpression)
        res += `; then${this.newline}`
        res += this.addIntent(this.visitUnpackStmt(stmt.body))
        res += `${this.newline}fi`
        return res
    }

    /**
     *
     * @param stmt
     */
    protected visitForStmt(stmt: ForStatement): string {
        let init: string
        if (stmt.init == null) {
            init = ''
        } else if (stmt.init instanceof VariableDeclarationStatement) {
            init = this.visitStatement(stmt.init)
        } else {
            init = this.exprGenerator.visit(stmt.init)
        }
        const condition =
            stmt.condition != null ? this.exprGenerator.visit(stmt.condition, false, ExpressionMode.BC) : ''
        const update = stmt.update != null ? this.exprGenerator.visit(stmt.update) : ''
        const body = this.addIntent(this.visitUnpackStmt(stmt.body))
        return `for (( ${init}; ${condition}; ${update} )); do${this.newline}${body}${this.newline}done`
    }

    /**
     *
     * @param stmt
     */
    protected visitVariableDeclarationStmt(stmt: VariableDeclarationStatement): string {
        const expr = this.exprGenerator.visit(stmt.value)
        const declarePrefix = stmt.type === VariableType.CONST ? 'declare -r ' : ''
        if (expr.startsWith('[')) {
            // boolean return values cannot be stored in variable directly
            return `${declarePrefix}${stmt.identifier}=$(${expr}; echo $?)`
        }
        // arithmetic expessions can be stored directly
        return `${declarePrefix}${stmt.identifier}=${expr}`
    }
}
