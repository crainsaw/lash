/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/camelcase */
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import { ParseTree } from 'antlr4ts/tree/ParseTree'
import { ErrorNode } from 'antlr4ts/tree/ErrorNode'
import { Token } from 'antlr4ts/Token'
import {
    AssignOperatorToken,
    UnaryOperatorToken,
    UnaryMathOperatorToken,
    UnaryBoolOperatorToken,
    BinaryOperatorToken,
    MathOperatorToken,
    CompOperatorToken,
    BoolOperatorToken,
} from '../ast/operators/operatorTokens'
import {
    Assignment_expressionContext,
    Math_operator_precedenceContext,
    Math_operator_subContext,
    BinMathSubExprContext,
    BinMathPrecExprContext,
    ProgramContext,
    StatementContext,
    Variable_declarationContext,
    If_statementContext,
    ExpressionContext,
    ParenExprContext,
    CallExprContext,
    AssignExprContext,
    LiteralExprContext,
    IdentifierExprContext,
    FloatLiteralContext,
    IntLiteralContext,
    StringLiteralContext,
    BoolTrueLiteralContext,
    BoolFalseLiteralContext,
    Call_expressionContext,
    For_statementContext,
    Block_statementContext,
    Expression_statementContext,
    Function_declarationContext,
    BinCompExprContext,
    BinBoolExprContext,
    Boolean_operatorContext,
    ComparatorContext,
    SuffixExprContext,
    Suffix_expressionContext,
    Prefix_expressionContext,
    PrefixExprContext,
    Function_parameterContext,
    Data_typeContext,
    Assignment_opertorContext,
} from '../../antlr_ts_build/lashParser'

import { lashLexer as Lexer } from '../../antlr_ts_build/lashLexer'
import GrammarError from '../errors/grammarError'
import Program from '../ast/program'
import Statement from '../ast/statements/statement'
import NOPStatement from '../ast/statements/NOPStatement'
import FunctionDeclarationStatement from '../ast/statements/functionDeclarationStatement'
import FunctionParameter from '../ast/statements/functionParameter'
import DataType from '../ast/types/dataType'
import ExpressionStatement from '../ast/statements/expressionStatement'
import BlockStatement from '../ast/statements/blockStatement'
import ForStatement from '../ast/statements/forStatement'
import Expression from '../ast/expressions/expression'
import VariableDeclarationStatement from '../ast/statements/variableDeclarationStatement'
import IfStatement from '../ast/statements/ifStatement'
import BinaryExpression from '../ast/expressions/binaryExpression'
import VariableReference from '../ast/expressions/variableReference'
import { UpdateExpression, UnaryOperatorType } from '../ast/expressions/updateExpression'

import {
    UnaryMathOperator,
    UnaryBoolOperator,
    MathOperator,
    Comparator,
    BoolOperator,
    AssignmentOperator,
} from '../ast/operators/operatorTypes'
import CallExpression from '../ast/expressions/callExpression'
import Literal from '../ast/literals/literal'
import FloatLiteral from '../ast/literals/floatLiteral'
import IntLiteral from '../ast/literals/intLiteral'
import StringLiteral from '../ast/literals/stringLiteral'
import BoolLiteral from '../ast/literals/boolLiteral'
import VariableType from '../ast/types/variableType'
import UnexpectedError from '../errors/unexpectedError'
import AssignmentExpression from '../ast/expressions/assignmentExpression'

/**
 * Used to transform the parse tree generated from ANTLR into an AST which is easier to process.
 * Furthermore, this intermediate step allows to develop the specific lash grammar more indepdantly from the rest of the lash compiler software.
 */
export default class AntlrVisitor {
    constructor(public readonly programNode: ProgramContext) {}

    /**
     *
     */
    public getAST(): Program {
        if (!this.programNode.children) throw new GrammarError()
        const statements = this.visitInputLines(this.programNode.children)
        return new Program(statements)
    }

    /**
     * Processes arbitrary input (i.e. lines of the program)
     * @param inputLines
     */
    protected visitInputLines(inputLines: ParseTree[]): Statement[] {
        const statements = Array<Statement>()
        for (const child of inputLines) {
            if (child instanceof StatementContext) {
                statements.push(this.visitStatement(child))
            } else if (this.isNewlineNode(child)) {
                // skip newlines at the start and the end of the program
            } else if (child instanceof ErrorNode) {
                throw Error(`Error node found at: ${child}`)
            } else if (this.isEOF(child)) {
                // ignore that one
            } else {
                throw new UnexpectedError()
            }
        }
        return statements
    }

    /**
     * Returns null for empty lines
     * @param ctx
     */
    protected visitStatement(ctx: StatementContext): Statement {
        if (!ctx.children || ctx.childCount !== 1) throw new GrammarError()
        const child = ctx.children[0]
        if (child instanceof Variable_declarationContext) return this.visitVariableDeclaration(child)
        if (child instanceof If_statementContext) return this.visitIfStatement(child)
        if (child instanceof For_statementContext) return this.visitForStatement(child)
        if (child instanceof Block_statementContext) return this.visitBlockStatement(child)
        if (child instanceof Expression_statementContext) return this.visitExpressionStatement(child)
        if (child instanceof Function_declarationContext) return this.visitFunctionDeclaration(child)
        if (this.isNewlineNode(child)) return new NOPStatement(ctx)
        throw new UnexpectedError()
    }

    /**
     *
     * @param child
     */
    protected visitFunctionDeclaration(ctx: Function_declarationContext): FunctionDeclarationStatement {
        const functionName = ctx._name.text
        if (!functionName) throw new GrammarError()
        if (!ctx.children) throw new GrammarError()
        const params: FunctionParameter[] = []
        for (let i = 3; i < ctx.childCount - 2; i += 2) {
            const param = ctx.children[i]
            if (!(param instanceof Function_parameterContext)) throw new GrammarError()
            params.push(this.visitFunctionParameter(param))
        }
        const body = this.visitStatement(ctx._body)
        return new FunctionDeclarationStatement(ctx, functionName, params, body, DataType.ANY)
    }

    /**
     *
     * @param ctx
     */
    protected visitFunctionParameter(ctx: Function_parameterContext): FunctionParameter {
        const value = ctx._identifier.text
        if (!value) throw new GrammarError()
        const type = ctx._dataType != null ? this.visitDataType(ctx._dataType) : DataType.ANY
        return new FunctionParameter(ctx, value, type)
    }

    /**
     *
     * @param ctx
     */
    protected visitDataType(ctx: Data_typeContext): DataType {
        const child = ctx.getChild(0)
        if (!(child instanceof TerminalNode)) throw new GrammarError()
        switch (child.symbol.type) {
            case Lexer.INT_TYPE:
                return DataType.INT
            case Lexer.FLOAT_TYPE:
                return DataType.FLOAT
            case Lexer.STRING_TYPE:
                return DataType.STRING
            case Lexer.BOOL_TYPE:
                return DataType.BOOL
            case Lexer.ANY_TYPE:
                return DataType.ANY
            default:
                throw new UnexpectedError()
        }
    }

    /**
     *
     * @param exprStmt
     */
    protected visitExpressionStatement(exprStmt: Expression_statementContext): ExpressionStatement {
        if (!exprStmt.children || exprStmt.childCount !== 1) throw new GrammarError()
        const child = exprStmt.children[0]
        if (!(child instanceof ExpressionContext)) throw new GrammarError()
        const expr = this.visitExpression(child)
        return new ExpressionStatement(exprStmt, expr)
    }

    /**
     *
     * @param ctx
     */
    protected visitBlockStatement(ctx: Block_statementContext): BlockStatement {
        if (!ctx.children || ctx.childCount <= 2) throw new GrammarError()
        const codeLines = ctx.children.slice(1, ctx.children.length - 2)
        const statements = this.visitInputLines(codeLines)
        return new BlockStatement(ctx, statements)
    }

    /**
     *
     * @param ctx
     */
    protected visitForStatement(ctx: For_statementContext): ForStatement {
        let init: Expression | VariableDeclarationStatement | null = null
        if (ctx._initVar) init = this.visitVariableDeclaration(ctx._initVar)
        else if (ctx._initExpr) init = this.visitExpression(ctx._initExpr)
        let condition: Expression | null = null
        if (ctx._condition) condition = this.visitExpression(ctx._condition)
        let update: Expression | null = null
        if (ctx._update) update = this.visitExpression(ctx._update)
        const stmt: Statement = this.visitStatement(ctx._stmt)
        return new ForStatement(ctx, init, condition, update, stmt)
    }

    /**
     *
     * @param ctx
     */
    protected visitIfStatement(ctx: If_statementContext): IfStatement {
        const expr = this.visitExpression(ctx._expr)
        const stmt = this.visitStatement(ctx._stmt)
        return new IfStatement(ctx, expr, stmt)
    }

    /**
     *
     * @param parseTree
     */
    protected isNewlineNode(parseTree: ParseTree): boolean {
        return parseTree instanceof TerminalNode && parseTree._symbol.type === Lexer.NEWLINE
    }

    /**
     *
     * @param parseTree
     */
    protected isEOF(parseTree: ParseTree): boolean {
        return parseTree instanceof TerminalNode && parseTree._symbol.type === Lexer.EOF
    }

    /**
     *
     * @param ctx
     */
    protected visitExpression(ctx: ExpressionContext): Expression {
        if (!ctx.children) throw new GrammarError()
        if (ctx instanceof ParenExprContext) {
            return this.visitExpression(ctx._expr)
        }
        if (
            ctx instanceof BinMathPrecExprContext ||
            ctx instanceof BinMathSubExprContext ||
            ctx instanceof BinCompExprContext ||
            ctx instanceof BinBoolExprContext
        ) {
            const left = this.visitExpression(ctx._leftExpr)
            const right = this.visitExpression(ctx._rightExpr)
            const op = this.visitBinaryOperatorCtx(ctx._op)
            return new BinaryExpression(ctx, op, left, right)
        }
        if (ctx instanceof CallExprContext) {
            if (!ctx.children) throw new GrammarError()
            const child = ctx.children[0]
            if (!(child instanceof Call_expressionContext)) throw new GrammarError()
            return this.visitCallExpr(child)
        }
        if (ctx instanceof AssignExprContext) {
            if (!ctx.children) throw new GrammarError()
            const child = ctx.children[0]
            if (!(child instanceof Assignment_expressionContext)) throw new GrammarError()
            return this.visitAssignExpr(child)
        }
        if (ctx instanceof PrefixExprContext) {
            if (!ctx.children) throw new GrammarError()
            const child = ctx.children[0]
            if (!(child instanceof Prefix_expressionContext)) throw new GrammarError()
            return this.visitPrefixExpr(child)
        }
        if (ctx instanceof SuffixExprContext) {
            if (!ctx.children) throw new GrammarError()
            const child = ctx.children[0]
            if (!(child instanceof Suffix_expressionContext)) throw new GrammarError()
            return this.visitSuffixExpr(child)
        }
        if (ctx instanceof LiteralExprContext) {
            return this.visitLiteralExpr(ctx)
        }
        if (ctx instanceof IdentifierExprContext) {
            return new VariableReference(ctx.start, ctx.text)
        }
        throw new UnexpectedError()

        /*
        for (const child of ctx.children) {
            if (child instanceof LiteralContext) return this.visitLiteral(child)
        } */
    }

    /**
     *
     * @param ctx
     */
    protected visitAssignExpr(ctx: Assignment_expressionContext): Expression {
        const identifier = ctx._identifier.text
        if (!identifier) throw new UnexpectedError()
        const varRef = new VariableReference(ctx._identifier, identifier)
        const operator = this.visitBinaryOperatorCtx(ctx._operator)
        const expr = this.visitExpression(ctx._expr)
        return new AssignmentExpression(ctx, varRef, operator, expr)
    }

    /**
     *
     * @param ctx
     */
    protected visitPrefixExpr(ctx: Prefix_expressionContext): Expression {
        if (!ctx._identifier.text) throw new GrammarError()
        const identifier = new VariableReference(ctx._identifier, ctx._identifier.text)
        const operator = this.visitUnaryOperator(ctx._operator)
        return new UpdateExpression(ctx, identifier, operator, UnaryOperatorType.PREFIX)
    }

    /**
     *
     * @param ctx
     */
    protected visitSuffixExpr(ctx: Suffix_expressionContext): Expression {
        if (!ctx._identifier.text) throw new GrammarError()
        const identifier = new VariableReference(ctx._identifier, ctx._identifier.text)
        const operator = this.visitUnaryOperator(ctx._operator)
        return new UpdateExpression(ctx, identifier, operator, UnaryOperatorType.SUFFIX)
    }

    /**
     *
     * @param operatorToken
     */
    protected visitUnaryOperator(operatorToken: Token): UnaryOperatorToken {
        switch (operatorToken.type) {
            case Lexer.INC:
                return new UnaryMathOperatorToken(operatorToken, UnaryMathOperator.INC)
            case Lexer.DEC:
                return new UnaryMathOperatorToken(operatorToken, UnaryMathOperator.DEC)
            case Lexer.NOT:
                return new UnaryBoolOperatorToken(operatorToken, UnaryBoolOperator.NOT)
            default:
                throw new UnexpectedError()
        }
    }

    /**
     *
     * @param ctx
     */
    protected visitCallExpr(ctx: Call_expressionContext): CallExpression {
        if (!ctx.children) throw new GrammarError()
        const identifier = ctx.children[0].text
        const params: Expression[] = []
        if (ctx.childCount > 3) {
            for (let i = 2; i < ctx.childCount; i += 2) {
                const child = ctx.children[i]
                if (!(child instanceof ExpressionContext)) throw new GrammarError()
                params.push(this.visitExpression(child))
            }
        }
        return new CallExpression(ctx, identifier, params)
    }

    /**
     *
     * @param _op
     */
    protected visitBinaryOperatorCtx(
        ctx:
            | Boolean_operatorContext
            | Math_operator_precedenceContext
            | Math_operator_subContext
            | ComparatorContext
            | Assignment_opertorContext,
    ): BinaryOperatorToken {
        const child = ctx.getChild(0)
        if (!(child instanceof TerminalNode)) throw new GrammarError()
        const token = child._symbol
        switch (token.type) {
            case Lexer.ADD:
                return new MathOperatorToken(token, MathOperator.PLUS)
            case Lexer.SUB:
                return new MathOperatorToken(token, MathOperator.MINUS)
            case Lexer.MUL:
                return new MathOperatorToken(token, MathOperator.MULTIPLY)
            case Lexer.DIV:
                return new MathOperatorToken(token, MathOperator.DEVIDE)
            case Lexer.LT:
                return new CompOperatorToken(token, Comparator.LT)
            case Lexer.GT:
                return new CompOperatorToken(token, Comparator.GT)
            case Lexer.AND:
                return new BoolOperatorToken(token, BoolOperator.AND)
            case Lexer.OR:
                return new BoolOperatorToken(token, BoolOperator.OR)
            case Lexer.ASSIGN:
                return new AssignOperatorToken(token, AssignmentOperator.ASSIGN)
            case Lexer.ASSIGN_ADD:
                return new AssignOperatorToken(token, AssignmentOperator.ASSIGN_ADD)
            case Lexer.ASSIGN_SUB:
                return new AssignOperatorToken(token, AssignmentOperator.ASSIGN_SUB)
            case Lexer.ASSIGN_MUL:
                return new AssignOperatorToken(token, AssignmentOperator.ASSIGN_MUL)
            case Lexer.ASSIGN_DIV:
                return new AssignOperatorToken(token, AssignmentOperator.ASSIGN_DIV)
            default:
                throw new UnexpectedError()
        }
    }

    /**
     *
     * @param ctx
     */
    protected visitLiteralExpr(ctx: LiteralExprContext): Literal {
        if (ctx.children == null || ctx.children.length !== 1) throw new GrammarError()
        const child = ctx.children[0]
        if (child instanceof FloatLiteralContext) {
            const val = parseFloat(child.text)
            return new FloatLiteral(ctx, val)
        }
        if (child instanceof IntLiteralContext) {
            const val = parseInt(child.text)
            return new IntLiteral(ctx, val)
        }
        if (child instanceof StringLiteralContext) {
            const val = child.text.substr(1, child.text.length - 2)
            return new StringLiteral(ctx, val)
        }
        if (child instanceof BoolTrueLiteralContext) {
            return new BoolLiteral(ctx, true)
        }
        if (child instanceof BoolFalseLiteralContext) {
            return new BoolLiteral(ctx, false)
        }
        throw new UnexpectedError()
    }

    /**
     *
     * @param ctx
     */
    protected visitVariableDeclaration(ctx: Variable_declarationContext): VariableDeclarationStatement {
        if (ctx.children == null || ctx.children.length !== 4) throw new GrammarError()
        const variableType = ctx._vartype.type === Lexer.VAR ? VariableType.VAR : VariableType.CONST
        const identifier = ctx._identifier.text
        const expressionCtx = ctx._expr
        if (!(expressionCtx instanceof ExpressionContext)) throw new GrammarError()
        if (identifier === undefined) throw new GrammarError()
        const expression = this.visitExpression(expressionCtx as ExpressionContext)
        const dataType = DataType.ANY
        // TODO: get data type from expression
        return new VariableDeclarationStatement(ctx, identifier, variableType, dataType, expression)
    }
}
