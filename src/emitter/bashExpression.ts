import { ParserRuleContext } from 'antlr4ts/ParserRuleContext'
import {
    AssignmentOperator,
    UnaryMathOperator,
    Comparator,
    BoolOperator,
    MathOperator,
    BinaryOperator,
} from '../ast/operators/operatorTypes'
import TypeInferencer from '../grammar/typeInferencer'
import NotImplementedError from '../errors/notImplementedError'
import UnexpectedError from '../errors/unexpectedError'
import Expression from '../ast/expressions/expression'
import VariableReference from '../ast/expressions/variableReference'
import Literal from '../ast/literals/literal'
import BinaryExpression from '../ast/expressions/binaryExpression'
import { UpdateExpression, UnaryOperatorType } from '../ast/expressions/updateExpression'
import CallExpression from '../ast/expressions/callExpression'
import AssignmentExpression from '../ast/expressions/assignmentExpression'
import DataType from '../ast/types/dataType'

import { MathOperatorToken, BoolOperatorToken, CompOperatorToken } from '../ast/operators/operatorTokens'
import IntLiteral from '../ast/literals/intLiteral'
import FloatLiteral from '../ast/literals/floatLiteral'
import StringLiteral from '../ast/literals/stringLiteral'
import BoolLiteral from '../ast/literals/boolLiteral'

/**
 * The integer representation of boolean values in bash
 */
enum BashBoolValue {
    TRUE = '0',
    FALSE = '1',
}

/**
 * Indicates that the parent operation started a certain output.
 * This might be bc mode for float operations.
 * Or boolean operation when using && or ||.
 * This helps further function calls to emit the correct source code.
 */
export enum ExpressionMode {
    NORMAL = 'NORMAL',
    BC = 'BC-MODE', // this forces to print arithmetic expressions as they are e.g. 4+8*9 without any bash extras
    STRING_CONCAT = 'STRING-CONCATENATION',
}

/**
 *
 */
export default class BashExpressionGenerator {
    constructor(public readonly types: TypeInferencer) {}

    /**
     *
     * @param expr
     * @param isExprStatement
     */
    public visit(expr: Expression, isExprStatement = false, mode = ExpressionMode.NORMAL): string {
        return this.visitExpression(expr, mode, isExprStatement)
    }

    /**
     *
     * @param expr
     * @param isExprStatement true if this expression is used as an expression statement
     */
    protected visitExpression(expr: Expression, mode = ExpressionMode.NORMAL, isExprStatement = false): string {
        if (mode === ExpressionMode.BC) {
            // in bc mode only binary variable reference, expression, literal, and update expression is supported
            if (expr instanceof VariableReference) return this.visitVariableReference(expr, mode)
            if (expr instanceof Literal) return this.visitLiteralExpr(expr, mode)
            if (expr instanceof BinaryExpression) return this.visitBinaryExpr(expr, mode, isExprStatement)
            if (expr instanceof UpdateExpression) return this.visitUpdateExpr(expr)
            throw Error('Unsupported operation in bc mode')
        } else {
            if (expr instanceof VariableReference) return this.visitVariableReference(expr, mode)
            if (expr instanceof CallExpression) return this.visitCallExpr(expr, isExprStatement)
            if (expr instanceof Literal) return this.visitLiteralExpr(expr, mode)
            if (expr instanceof BinaryExpression) return this.visitBinaryExpr(expr, mode, isExprStatement)
            if (expr instanceof UpdateExpression) return this.visitUpdateExpr(expr)
            if (expr instanceof AssignmentExpression) return this.visitAssignmentExpr(expr, isExprStatement)
            throw new NotImplementedError()
        }
    }

    /**
     * This stores the data type for every virtual expression (i.e. an expression we created in this generator)
     */
    protected virtualExprTypes = new Map<Expression, DataType>()

    /**
     * Returns the type of the expression
     * @param expr
     */
    protected getExprType(expr: Expression): DataType {
        if (this.virtualExprTypes.has(expr)) return this.virtualExprTypes.get(expr) as DataType
        return this.types.getExprType(expr)
    }

    /**
     *
     * @param expr
     */
    visitAssignmentExpr(expr: AssignmentExpression, isExprStatement = false): string {
        if (!isExprStatement) {
            // forbid using assignment expressions in other epxressions since bash does not support it
            // TODO: instead of throwing an error here change grammar or throw in TypeInferencer
            throw Error('Assignment expressions are not allowed in other expressions')
        }
        if (expr.assignOperator.op === AssignmentOperator.ASSIGN) {
            const value = this.visitExpression(expr.value, ExpressionMode.NORMAL, true)
            return `${expr.name.name}=${value}`
        }
        const varRef = new VariableReference(expr.startToken, expr.name.name)
        this.virtualExprTypes.set(varRef, this.getExprType(expr.name))
        const opToken = new MathOperatorToken(expr.startToken, MathOperator.PLUS)
        const newExpr = new BinaryExpression(expr.parseCtx as ParserRuleContext, opToken, varRef, expr.value)
        this.virtualExprTypes.set(newExpr, this.getExprType(expr.value))
        const value = this.visitExpression(newExpr)
        return `${expr.name.name}=${value}`
    }

    /**
     *
     * @param expr
     * @param mode
     */
    protected visitVariableReference(expr: VariableReference, mode: ExpressionMode): string {
        const type = this.getExprType(expr)
        if (mode === ExpressionMode.STRING_CONCAT) {
            return `\${${expr.name}}`
        }
        if (type === DataType.BOOL) {
            return `[ $${expr.name} -eq 0 ]`
        }
        return `$${expr.name}`
    }

    /**
     *
     * @param expr
     */
    protected visitUpdateExpr(expr: UpdateExpression): string {
        const op = expr.operator.op === UnaryMathOperator.INC ? '++' : '--'
        if (expr.operatorType === UnaryOperatorType.PREFIX) {
            return `${op}${expr.variable.name}`
        }
        if (expr.operatorType === UnaryOperatorType.SUFFIX) {
            return `${expr.variable.name}${op}`
        }
        throw new UnexpectedError()
    }

    /**
     *
     * @param expr the expression to be translated
     * @param isExprStatement set to true if this expression is used as an expression statement
     * @param useBCCommand set to true if the parent expression uses the bc command already (then keep using it)
     */
    protected visitBinaryExpr(expr: BinaryExpression, mode: ExpressionMode, isExprStatement = false): string {
        if (expr.operator instanceof MathOperatorToken) return this.visitBinaryMathExpr(expr, mode)
        if (expr.operator instanceof BoolOperatorToken) return this.visitBinaryBoolExpr(expr, mode, isExprStatement)
        if (expr.operator instanceof CompOperatorToken) return this.visitBinaryCompExpr(expr, mode, isExprStatement)
        throw new UnexpectedError()
    }

    /**
     *
     * @param expr
     * @param isExprStatement
     * @param mode
     */
    protected visitBinaryCompExpr(expr: BinaryExpression, mode: ExpressionMode, isExprStatement: boolean): string {
        let operator: string | null = null

        // check comparators
        const lhsType = this.getExprType(expr.leftHandSide)
        const rhsType = this.getExprType(expr.rightHandSide)
        const needsBCCommand = mode === ExpressionMode.BC || lhsType === DataType.FLOAT || rhsType === DataType.FLOAT
        type opType = 'COMMAND' | 'SYMBOL'
        const operatorType: opType = lhsType === DataType.STRING || needsBCCommand ? 'SYMBOL' : 'COMMAND'

        switch (expr.operator.op) {
            case Comparator.LT:
                operator = operatorType === 'COMMAND' ? '-lt' : '<'
                break
            case Comparator.GT:
                operator = operatorType === 'COMMAND' ? '-gt' : '>'
                break
            case Comparator.LE:
                if (operatorType === 'COMMAND') operator = '-le'
                else throw Error('LE not available for string comparison')
                break
            case Comparator.GE:
                if (operatorType === 'COMMAND') operator = '-ge'
                else throw Error('GE not available for string comparison')
                break
            case Comparator.EQ:
                operator = operatorType === 'COMMAND' ? '-eq' : '='
                break
            case Comparator.NEQ:
                operator = operatorType === 'COMMAND' ? '-ne' : '!='
                break
            default:
                throw new UnexpectedError()
        }
        let res: string
        if (mode === ExpressionMode.BC) {
            const lhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.leftHandSide)
            const rhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.rightHandSide)
            return `${lhsExpr} ${operator} ${rhsExpr}`
        }
        if (needsBCCommand) {
            // floats need to be compared with bc
            const lhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.leftHandSide)
            const rhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.rightHandSide)
            res = `[ $(echo "${lhsExpr} ${operator} ${rhsExpr}" | bc -l) -eq 1 ]`
            // TODO: once in BC mode we can only use variables or need to stay in BC mode since it uses echo to pipe a command to bc (which only allows certain commands)
        } else {
            // datat types string and int use the simple test function
            const lhsExpr = this.visitExpression(expr.leftHandSide)
            const rhsExpr = this.visitExpression(expr.rightHandSide)
            res = `[ ${lhsExpr} ${operator} ${rhsExpr} ]`
        }
        if (isExprStatement) {
            return `$(${res}; echo $?)`
        }
        return res
    }

    /**
     *
     * @param expr
     */
    protected visitBinaryBoolExpr(expr: BinaryExpression, mode: ExpressionMode, isExprStatement: boolean): string {
        let operator: string | null = null

        // process boolean operators
        switch (expr.operator.op) {
            case BoolOperator.AND:
                operator = ' && '
                break
            case BoolOperator.OR:
                operator = ' || '
                break
            default:
                throw new UnexpectedError()
        }
        if (mode === ExpressionMode.BC) {
            throw Error('Boolean operations not supported in bc mode')
        }
        const lhsExpr = this.visitExpression(expr.leftHandSide)
        const rhsExpr = this.visitExpression(expr.rightHandSide)
        const res = `${lhsExpr}${operator}${rhsExpr}`
        if (isExprStatement) {
            return `$(${res}; echo $?)`
        }
        return res
    }

    /**
     *
     * @param expr
     */
    protected visitBinaryMathExpr(expr: BinaryExpression, mode: ExpressionMode): string {
        let operator: string | null = null
        const exprType: DataType = this.getExprType(expr)

        // process string concatenation
        if (exprType === DataType.STRING && expr.operator.op === MathOperator.PLUS) {
            const lhsExpr = this.visitExpression(expr.leftHandSide, ExpressionMode.STRING_CONCAT)
            const rhsExpr = this.visitExpression(expr.rightHandSide, ExpressionMode.STRING_CONCAT)
            return `"${lhsExpr}${rhsExpr}"`
        }

        // process math operator
        switch (expr.operator.op) {
            case MathOperator.PLUS:
                operator = '+'
                break
            case MathOperator.MINUS:
                operator = '-'
                break
            case MathOperator.MULTIPLY:
                operator = '*'
                break
            case MathOperator.DEVIDE:
                operator = '/'
                break
            default:
                throw new UnexpectedError()
        }
        if (mode === ExpressionMode.BC) {
            const lhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.leftHandSide)
            const rhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.rightHandSide)
            return `${lhsExpr} ${operator} ${rhsExpr}`
        }
        if (exprType === DataType.INT) {
            const lhsExpr = this.visitExpression(expr.leftHandSide)
            const rhsExpr = this.visitExpression(expr.rightHandSide)
            return `$(( ${lhsExpr} ${operator} ${rhsExpr} ))`
        }
        if (exprType === DataType.FLOAT) {
            const lhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.leftHandSide)
            const rhsExpr = this.visitExpressionBCMode(expr.operator.op, expr.rightHandSide)
            return `$(echo '${lhsExpr} ${operator} ${rhsExpr}' | bc)`
        }
        throw new UnexpectedError()
    }

    /**
     * Visits the epxression in BC-Mode and puts it into brackets if necessary (considering MUL/DIV vs PLUS/MINUS)
     * @param operator the operator of the current expression
     * @param expr the child expressions (lhs or rhs) to be visited
     */
    protected visitExpressionBCMode(operator: BinaryOperator, expr: Expression): string {
        const exprStr = this.visitExpression(expr, ExpressionMode.BC)
        if (this.bracketsRequired(operator, expr)) {
            return `(${exprStr})`
        }
        return exprStr
    }

    /**
     * Returns true if in the given situation the childExpr needs to be put in brackets to preserve the correct operation
     * @param parentOperator the operator of the current expression
     * @param childExpr the child expressions (lhs or rhs) of the current expression
     */
    protected bracketsRequired(parentOperator: BinaryOperator, childExpr: Expression): boolean {
        if (parentOperator === MathOperator.MULTIPLY || parentOperator === MathOperator.DEVIDE) {
            if (childExpr instanceof BinaryExpression) {
                const { op } = childExpr.operator
                if (op === MathOperator.PLUS || op === MathOperator.MINUS) {
                    return true
                }
            }
        }
        return false
    }

    /**
     *
     * @param literal
     */
    protected visitLiteralExpr(literal: Literal, mode: ExpressionMode): string {
        if (literal instanceof IntLiteral) return literal.value.toString()
        if (literal instanceof FloatLiteral) return literal.value.toString()
        if (literal instanceof StringLiteral)
            return mode === ExpressionMode.STRING_CONCAT ? literal.value : `"${literal.value}"`
        if (literal instanceof BoolLiteral) return literal.value === true ? BashBoolValue.TRUE : BashBoolValue.FALSE
        throw new NotImplementedError()
    }

    /**
     *
     * @param expr
     */
    protected visitCallExpr(expr: CallExpression, isExprStatement = false): string {
        let res = ''
        if (!isExprStatement) res += '$('
        res += expr.functionName
        for (const param of expr.params) {
            res += ` ${this.visitExpression(param)}`
        }
        // res = res.substr(0, res.length-1)
        if (!isExprStatement) res += ')'
        return res
    }
}
