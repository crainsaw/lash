import UnexpectedError from '../errors/unexpectedError'
import TypeError from '../errors/semanticErrors/typeError'
import DataType from '../ast/types/dataType'
import FunctionDeclarationStatement from '../ast/statements/functionDeclarationStatement'
import Program from '../ast/program'
import Expression from '../ast/expressions/expression'
import VariableReference from '../ast/expressions/variableReference'
import InvalidVariableReferenceError from '../errors/semanticErrors/invalidVariableReferenceError'
import Statement from '../ast/statements/statement'
import VariableDeclarationStatement from '../ast/statements/variableDeclarationStatement'
import ExpressionStatement from '../ast/statements/expressionStatement'
import ForStatement from '../ast/statements/forStatement'
import BlockStatement from '../ast/statements/blockStatement'
import IfStatement from '../ast/statements/ifStatement'
import ReturnStatement from '../ast/statements/returnStatement'
import ContinueStatement from '../ast/statements/continueStatement'
import BreakStatement from '../ast/statements/breakStatement'
import NOPStatement from '../ast/statements/NOPStatement'
import NestedFunctionError from '../errors/semanticErrors/nestedFunctionError'
import DuplicateNameError from '../errors/semanticErrors/duplicateNameError'
import CallExpression from '../ast/expressions/callExpression'
import Literal from '../ast/literals/literal'
import BinaryExpression from '../ast/expressions/binaryExpression'
import { UpdateExpression } from '../ast/expressions/updateExpression'
import AssignmentExpression from '../ast/expressions/assignmentExpression'
import {
    UnaryMathOperator,
    UnaryBoolOperator,
    MathOperator,
    Comparator,
    BoolOperator,
} from '../ast/operators/operatorTypes'

export type VariableScope = Map<string, DataType>

/**
 * This class is responsible for checking multiple semantic rules and also infers types for expressions and functions.
 * For example it does:
 * 1) Check for if variables or methods are referenced which are not present in the current scope
 * 2) Create a map which maps all expressions, variables and functions to their data types
 * 3) Emit type errors
 * 4) Make sure functions are only declared on the top level
 */
export default class TypeInferencer {
    /**
     * Gloabal variable scope
     */
    protected globalScope: VariableScope = new Map<string, DataType>()

    /**
     * Every function might define addtional local variables which are stored in the functions scope
     */
    protected functionScopes = new Map<Program | FunctionDeclarationStatement, VariableScope>()

    /**
     * The current function scope or null if we are not in any function
     */
    protected currentFunctionScope: VariableScope | null = null

    /**
     * This stores the data type for every expression in the AST
     */
    protected expressionTypeMap = new Map<Expression, DataType>()

    /**
     *
     * @param program
     */
    constructor(public readonly program: Program) {
        this.visitStatements(program.statements)
    }

    /**
     * When in a function returns the function scope.
     * If not in a function returns the global scope
     */
    protected getScope(): VariableScope {
        if (this.currentFunctionScope != null) return this.currentFunctionScope
        return this.globalScope
    }

    /**
     * Returns the type of the variable given its name or the type of the expression
     * @param node
     */
    public getExprType(node: Expression): DataType {
        if (this.expressionTypeMap.has(node)) return this.expressionTypeMap.get(node) as DataType
        throw new UnexpectedError()
    }

    /**
     *
     * @param varName
     */
    protected getVarType(varRef: VariableReference): DataType {
        const varName = varRef.name
        if (this.currentFunctionScope != null) {
            if (this.currentFunctionScope.has(varName)) return this.currentFunctionScope.get(varName) as DataType
        }
        if (this.globalScope.has(varName)) return this.globalScope.get(varName) as DataType
        throw new InvalidVariableReferenceError(varRef)
    }

    /**
     * Visits multiple statements (i.e. lines of code)
     * @param statements
     */
    protected visitStatements(statements: Statement[]): void {
        statements.map(this.visitStatement.bind(this))
    }

    /**
     * Visits a single Statement
     * @param stmt
     */
    protected visitStatement(stmt: Statement): void {
        if (stmt instanceof VariableDeclarationStatement) this.visitVariableDeclarationStmt(stmt)
        else if (stmt instanceof ExpressionStatement) this.visitExpression(stmt.expr)
        else if (stmt instanceof ForStatement) this.visitForStmt(stmt)
        else if (stmt instanceof BlockStatement) this.visitStatements(stmt.statements)
        else if (stmt instanceof IfStatement) this.visitIfStatement(stmt)
        else if (stmt instanceof ReturnStatement) this.visitExpression(stmt.expr)
        // eslint-disable-next-line no-useless-return
        else if (stmt instanceof ContinueStatement) return
        // eslint-disable-next-line no-useless-return
        else if (stmt instanceof BreakStatement) return
        // eslint-disable-next-line no-useless-return
        else if (stmt instanceof NOPStatement) return
        else if (stmt instanceof FunctionDeclarationStatement) this.visitFunctionDeclarationStmt(stmt)
        else throw new UnexpectedError()
    }

    /**
     *
     * @param stmt
     */
    protected visitFunctionDeclarationStmt(stmt: FunctionDeclarationStatement): void {
        if (this.currentFunctionScope != null) throw new NestedFunctionError(stmt)
        const functionScope = new Map<string, DataType>()
        this.currentFunctionScope = functionScope
        this.functionScopes.set(stmt, functionScope)
        // add all params to local function scope
        for (const param of stmt.params) {
            functionScope.set(param.name, param.type)
        }
        this.visitStatement(stmt.body)
        this.currentFunctionScope = null
    }

    /**
     *
     * @param stmt
     */
    protected visitIfStatement(stmt: IfStatement): void {
        const type = this.visitExpression(stmt.testExpression)
        if (type !== DataType.BOOL) throw new TypeError(stmt.testExpression, 'Boolean expression expected.')
        this.visitStatement(stmt.body)
    }

    /**
     *
     * @param stmt
     */
    protected visitForStmt(stmt: ForStatement): void {
        if (stmt.init instanceof VariableDeclarationStatement) {
            this.visitVariableDeclarationStmt(stmt.init)
        } else if (stmt.init instanceof Expression) {
            this.visitExpression(stmt.init)
        } else if (stmt.init == null) {
            // ignore
        } else {
            throw new UnexpectedError()
        }
        if (stmt.condition != null) this.visitExpression(stmt.condition)
        if (stmt.update != null) this.visitExpression(stmt.update)
        this.visitStatement(stmt.body)
    }

    /**
     *
     * @param stmt
     */
    protected visitVariableDeclarationStmt(stmt: VariableDeclarationStatement): void {
        const scope = this.getScope()
        const type = this.visitExpression(stmt.value)
        if (scope.has(stmt.identifier))
            throw new DuplicateNameError(stmt, `The variable ${stmt.identifier} has already been declared.`)
        scope.set(stmt.identifier, type)
    }

    /**
     *
     * @param expr
     * @param isExprStatement
     */
    protected visitExpression(expr: Expression): DataType {
        let type: DataType
        if (expr instanceof VariableReference) type = this.getVarType(expr)
        else if (expr instanceof CallExpression) type = this.visitCallExpr(expr)
        // TODO: How to find this?
        else if (expr instanceof Literal) type = expr.dataType
        else if (expr instanceof BinaryExpression) type = this.visitBinaryExpr(expr)
        else if (expr instanceof UpdateExpression) type = this.visitUpdateExpr(expr)
        else if (expr instanceof AssignmentExpression) type = this.visitAssignExpr(expr)
        else throw new UnexpectedError()
        this.expressionTypeMap.set(expr, type)
        return type
    }

    /**
     *
     * @param expr
     */
    protected visitAssignExpr(expr: AssignmentExpression): DataType {
        const rhsType = this.visitExpression(expr.value)
        const varType = this.getVarType(expr.name)
        this.expressionTypeMap.set(expr.name, varType)
        if (rhsType !== varType) {
            const errMsg = `Trying to assign ${rhsType} to variable ${expr.name.name} of type ${varType}`
            throw new TypeError(expr.assignOperator, errMsg)
        }
        return varType
    }

    /**
     *
     * @param expr
     */
    protected visitUpdateExpr(expr: UpdateExpression): DataType {
        const exprType = this.getVarType(expr.variable)
        switch (expr.operator.op) {
            case UnaryMathOperator.INC:
            case UnaryMathOperator.DEC:
                if (exprType !== DataType.INT)
                    throw new TypeError(expr.operator, 'Can call increment or decrement on variables of type int.')
                return DataType.INT
            case UnaryBoolOperator.NOT:
                if (exprType !== DataType.BOOL)
                    throw new TypeError(expr.operator, 'Negation can only be applied to boolean values.')
                return DataType.BOOL
            default:
                throw new UnexpectedError()
        }
    }

    /**
     *
     * @param expr
     */
    protected visitBinaryExpr(expr: BinaryExpression): DataType {
        const lhsType = this.visitExpression(expr.leftHandSide)
        const rhsType = this.visitExpression(expr.rightHandSide)
        const op = expr.operator.op
        switch (expr.operator.op) {
            case MathOperator.PLUS:
            case MathOperator.MINUS:
            case MathOperator.DEVIDE:
            case MathOperator.MULTIPLY:
                if (lhsType === DataType.STRING || rhsType === DataType.STRING) {
                    if (op !== MathOperator.PLUS) {
                        throw new TypeError(expr.operator, `The operator ${op} does not allow string values.`)
                    }
                    if (lhsType !== rhsType) {
                        throw new TypeError(expr.operator, 'String concatentation only supports string values')
                    }
                    return DataType.STRING
                }
                if (!(lhsType === DataType.INT || lhsType === DataType.FLOAT))
                    throw new TypeError(
                        expr.operator,
                        `Left hand side of expression must be numerical for operator ${op}`,
                    )
                if (!(rhsType === DataType.INT || rhsType === DataType.FLOAT))
                    throw new TypeError(
                        expr.operator,
                        `Right hand side of expression must be numerical for operator ${op}`,
                    )
                return lhsType === DataType.FLOAT || rhsType === DataType.FLOAT ? DataType.FLOAT : DataType.INT
            case Comparator.GE:
            case Comparator.LE:
                if (lhsType !== DataType.INT || rhsType !== DataType.INT)
                    throw new TypeError(expr.operator, `Comparator ${op} only work with string or int.`)
                return DataType.BOOL
            case Comparator.EQ:
            case Comparator.NEQ:
            case Comparator.GT:
            case Comparator.LT:
                if (!(lhsType === DataType.INT || lhsType === DataType.STRING || lhsType === DataType.FLOAT))
                    throw new TypeError(
                        expr.operator,
                        `Left hand side of expression must either be of type int, string or floar for comparator ${op}.`,
                    )
                if (!(rhsType === DataType.INT || rhsType === DataType.STRING || rhsType === DataType.FLOAT))
                    throw new TypeError(
                        expr.operator,
                        `Right hand side of expression must either be of type int, string or floar for comparator ${op}.`,
                    )
                if (lhsType === DataType.STRING && rhsType === DataType.STRING) {
                    return DataType.BOOL
                }
                if (lhsType === DataType.STRING || rhsType === DataType.STRING) {
                    throw new TypeError(expr.operator, `Comparator ${op} can only compare two values of the same type`)
                } else {
                    return DataType.BOOL
                }
            case BoolOperator.AND:
            case BoolOperator.OR:
                if (lhsType !== DataType.BOOL || rhsType !== DataType.BOOL)
                    throw new TypeError(expr.operator, `Operator ${op} can only be applied on boolean values.`)
                return DataType.BOOL
            default:
                throw new UnexpectedError()
        }
    }

    /**
     *
     * @param expr
     * @param isExprStatement
     */
    protected visitCallExpr(expr: CallExpression): DataType {
        for (const param of expr.params) {
            this.visitExpression(param)
        }
        return DataType.INT // TODO: how to get the return type of a method which we may not have yet analyzed?!
    }
}
