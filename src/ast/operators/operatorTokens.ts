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
import AST from '../ast'

export abstract class OperatorToken extends AST {
    constructor(token: Token, public readonly op: Operator) {
        super(token)
    }
}

export abstract class UnaryOperatorToken extends OperatorToken {
    constructor(token: Token, public readonly op: UnaryOperator) {
        super(token, op)
    }
}

export class UnaryMathOperatorToken extends UnaryOperatorToken {
    constructor(token: Token, public readonly op: UnaryMathOperator) {
        super(token, op)
    }
}

export class UnaryBoolOperatorToken extends UnaryOperatorToken {
    constructor(token: Token, public readonly op: UnaryBoolOperator) {
        super(token, op)
    }
}

export abstract class BinaryOperatorToken extends OperatorToken {
    constructor(token: Token, public readonly op: BinaryOperator) {
        super(token, op)
    }
}

export class MathOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: MathOperator) {
        super(token, op)
    }
}

export class CompOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: Comparator) {
        super(token, op)
    }
}

export class BoolOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: BoolOperator) {
        super(token, op)
    }
}

export class AssignOperatorToken extends BinaryOperatorToken {
    constructor(token: Token, public readonly op: AssignmentOperator) {
        super(token, op)
    }
}
