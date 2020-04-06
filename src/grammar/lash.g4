grammar lash;

/*
 * Parser Rules
 */

program : (statement | NEWLINE)* EOF ;

// ---- statement definition

statement : variable_declaration
        | if_statement
        | for_statement
        | block_statement
        | expression_statement
        | return_statement
        | continue_statement
        | break_statement
        | function_declaration
        ;

// ----- statements

block_statement : '{' (statement | NEWLINE)* '}' ;

variable_declaration : vartype=(CONST | VAR) identifier=IDENTIFIER op=assign_op expr=expression ;

if_statement : IF '(' expr=expression ')' stmt=statement ;

for_statement : FOR '(' (initVar=variable_declaration | initExpr=assignment_expression)? ';' condition=expression? ';' update=expression? ')' stmt=statement ;

function_declaration : FUNCTION name=IDENTIFIER '(' (function_parameter (',' function_parameter)* )? ')' body=statement ;

function_parameter: identifier=IDENTIFIER (':' dataType=data_type)? ;

// forin_statement : ;

return_statement : 'return' expression ;

break_statement: 'break' ;

continue_statement: 'continue' ;

expression_statement: expression;


// ---- expressions
// TODO: <assoc=right> expr '^' expr #expExpr

expression : '(' expr=expression ')' # parenExpr
            | prefix_expression #prefixExpr
            | suffix_expression #suffixExpr
            | leftExpr=expression op=math_operator_precedence rightExpr=expression #binMathPrecExpr
            | leftExpr=expression op=math_operator_sub rightExpr=expression #binMathSubExpr
            | leftExpr=expression op=comparator rightExpr=expression #binCompExpr
            | leftExpr=expression op=boolean_operator rightExpr=expression #binBoolExpr
            | call_expression #callExpr
            | assignment_expression #assignExpr
            | literal #literalExpr
            | IDENTIFIER #identifierExpr
            ;


call_expression: IDENTIFIER '(' ( expression (',' expression)* )? ')' ;

assignment_expression : identifier=IDENTIFIER operator=assignment_opertor expr=expression ;

prefix_expression: operator=(NOT | INC | DEC) identifier=IDENTIFIER ;

suffix_expression : identifier=IDENTIFIER operator=(INC | DEC) ;

// -- basic constructs --
literal : FLOAT_LITERAL #floatLiteral
        | INT_LITERAL #intLiteral
        | STRING_LITERAL #stringLiteral
        | TRUE_LITERAL #boolTrueLiteral
        | FALSE_LITERAL #boolFalseLiteral
        ;

// TODO: add alternative names here as well? or handle in code by text comparison?
boolean_operator: AND
                 | OR
                 ;

comparator: EQ
            | NEQ
            | LT
            | LE
            | GT
            | GE
            ;

math_operator_precedence: MUL
                        | DIV
                        ;

math_operator_sub: SUB
                  | ADD
                  ;
                

// variable assignment
assign_op :  ASSIGN
            | ASSIGN_ADD
            | ASSIGN_DIV
            | ASSIGN_MUL
            | ASSIGN_SUB
            ;

data_type: STRING_TYPE
           | INT_TYPE
           | FLOAT_TYPE
           | BOOL_TYPE
           | ANY_TYPE
           ;

/*
 * Lexer Rules
 */

NEWLINE : '\r\n'
        | '\n'
        | '\r';

// -- punctuation --
COMMA : ',' ;
COLON : ':' ;
SEMICOLON : ';' ;
L_PAREN : '(' ;
R_PAREN : ')' ;
L_BRACKET: '[' ;
R_BRACKET: ']' ;
L_CURLY : '{' ;
R_CURLY : '}' ;

// DOT : '.' ;

// -- operators --
// comparison
EQ : '==' ;
NEQ : '!=' ;
LT : '<' ;
LE : '<=' ;
GT : '>' ;
GE : '>=' ;

// binary operations
RARR: '->' ;
ADD : '+' ;
SUB : '-' ;
MUL : '*' ;
DIV : '/' ;
//MOD : '%';
OR : '||' ;
AND: '&&' ;

// unary operations
DEC : '--' ;
INC : '++' ;
NOT : '!' ;

// variable assignment
assignment_opertor: ASSIGN
                     | ASSIGN_ADD
                     | ASSIGN_SUB
                     | ASSIGN_MUL
                     | ASSIGN_DIV
                     ;

ASSIGN  : '=' ;
ASSIGN_ADD : '+=';
ASSIGN_SUB : '-=';
ASSIGN_MUL : '*=';
ASSIGN_DIV : '/=';

// -- keywords
TRUE_LITERAL : 'true' ;
FALSE_LITERAL : 'false' ;
BREAK : 'break' ;
IF : 'if' ;
ELSE : 'else' ;
ELIF : 'elif' ;
WHILE : 'while';
FOR : 'for';
IN : 'in';
RETURN : 'return' ;
//RANGETO: '..';
FUNCTION : 'function' ; 
VAR: 'var' ;
CONST : 'const' ;

// types
STRING_TYPE : 'string' ;
INT_TYPE : 'int' ;
FLOAT_TYPE: 'float' ;
BOOL_TYPE : 'bool' ;
ANY_TYPE: 'any' ;

// -- Comments
LINE_COMMENT : '#' [.*?] NEWLINE -> channel(HIDDEN);
BLOCK_COMMENT : '/*' + [.*?] + '*/' -> channel(HIDDEN);


// -  literals
STRING_LITERAL : '"' ('\\"'|.)*? '"' ;

fragment LETTER : [a-zA-Z] ;
fragment DIGIT : [0-9] ;


FLOAT_LITERAL : DIGIT+ '.' (DIGIT+)? ;

INT_LITERAL : DIGIT+ ;

BOOLEAN_LITERAL: TRUE_LITERAL | FALSE_LITERAL ;

// -  identifier

IDENTIFIER : (LETTER | '_') (LETTER | '_' | DIGIT)* ;

// - whitespace

WHITESPACE : (' ' | '\t') -> skip ;