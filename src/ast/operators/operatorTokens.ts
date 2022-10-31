// eslint-disable-next-line max-classes-per-file
import { Token } from 'antlr4ts'
import {
    AssignmentOperator,
    Operator,
    UnaryOperator,
    UnaryMathOperator,
    UnaryBoolOperator,
    BinaryOperator,
    MathOperator,
    Comparator,
    BoolOperator,
} from './operatorTypes'
/* eslint-disable max-classes-per-file */
import AST, { SyntaxKind } from '../ast'

export abstract class OperatorToken extends AST {
    constructor(kind: SyntaxKind, token: Token, public readonly op: Operator) {
        super(kind, token)
    }
}

export abstract class UnaryOperatorToken extends OperatorToken {
    constructor(kind: SyntaxKind, token: Token, public readonly op: UnaryOperator) {
        super(kind, token, op)
    }
}

export class UnaryMathOperatorToken extends UnaryOperatorToken {
    constructor(token: Token, public readonly op: UnaryMathOperator) {
        super(SyntaxKind.UnaryMathOperatorToken, token, op)
    }
}

export class UnaryBoolOperatorToken extends UnaryOperatorToken {
    constructor(token: Token, public readonly op: UnaryBoolOperator) {
        super(SyntaxKind.UnaryBoolOperatorToken, token, op)
    }
}

export abstract class BinaryOperatorToken extends OperatorToken {
    constructor(kind: SyntaxKind, token: Token, public readonly op: BinaryOperator) {
        super(kind, token, op)
    }
}

export class MathOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: MathOperator) {
        super(SyntaxKind.UnaryMathOperatorToken, token, op)
    }
}

export class CompOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: Comparator) {
        super(SyntaxKind.CompOperatorToken, token, op)
    }
}

export class BoolOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: BoolOperator) {
        super(SyntaxKind.BoolOperatorToken, token, op)
    }
}

export class AssignOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: AssignmentOperator) {
        super(SyntaxKind.AssignOperatorToken, token, op)
    }
}
