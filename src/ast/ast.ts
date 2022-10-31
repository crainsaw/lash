import { ParserRuleContext, Token } from 'antlr4ts'

// Base class for all nodes in the syntax tree
export default abstract class AST {
    // TODO: what does everything need to have? Line Number?
    constructor(public readonly kind: SyntaxKind, public readonly parseCtx: ParserRuleContext | Token) {}

    /**
     * Returns the token or in case of a parser rule the first token of the rule
     */
    public get startToken(): Token {
        if (this.parseCtx instanceof ParserRuleContext) {
            return this.parseCtx.start
        }
        return this.parseCtx
    }

    /**
     *
     */
    public get line(): number {
        return this.startToken.line
    }

    /**
     *
     */
    public get charPositionInLine(): number {
        return this.startToken.charPositionInLine
    }
}

export enum SyntaxKind {
    AssignmentExpression,
    BinaryExpression,
    CallExpression,
    UpdateExpression,
    VariableReference,
    BoolLiteral,
    FloatLiteral,
    IntLiteral,
    StringLiteral,
    UnaryMathOperatorToken,
    UnaryBoolOperatorToken,
    CompOperatorToken,
    BoolOperatorToken,
    AssignOperatorToken,
    BlockStatement,
    BreakStatement,
    ContinueStatement,
    ExpressionStatement,
    ForStatement,
    FunctionDeclarationStatement,
    FunctionParameter,
    IfStatement,
    NOPStatement,
    ReturnStatement,
    VariableDeclarationStatement,
}
