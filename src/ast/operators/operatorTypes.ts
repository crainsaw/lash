export type Operator = UnaryOperator | BinaryOperator

export type UnaryOperator = UnaryMathOperator | UnaryBoolOperator

export enum UnaryMathOperator {
    INC = '++',
    DEC = '--',
}

export enum UnaryBoolOperator {
    NOT = '!',
}

export type BinaryOperator = MathOperator | Comparator | BoolOperator | AssignmentOperator

export enum MathOperator {
    PLUS = '+',
    MINUS = '-',
    MULTIPLY = '*',
    DEVIDE = '/',
}

export enum Comparator {
    LT = '<',
    GT = '>',
    LE = '<=',
    GE = '>=',
    EQ = '==',
    NEQ = '!=',
}

export enum BoolOperator {
    AND = '&&',
    OR = '||',
}

export enum AssignmentOperator {
    ASSIGN = '=',
    ASSIGN_ADD = '+=',
    ASSIGN_SUB = '-',
    ASSIGN_MUL = '*=',
    ASSIGN_DIV = '/=',
}
