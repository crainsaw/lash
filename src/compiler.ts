import { CharStreams, CommonTokenStream } from 'antlr4ts'
import { lashLexer as LashLexer } from '../antlr_ts_build/src/grammar/lashLexer'
import { lashParser as LashParser } from '../antlr_ts_build/src/grammar/lashParser'
import AntlrVisitor from './grammar/antlrVisitor'
import BashGenerator from './emitter/bash'
import TypeInferencer from './grammar/typeInferencer'
import Program from './ast/program'

/**
 * Reads the given lash source code and creates the AST for it
 * @param lashSrc
 */
export function sourceToAST(lashSrc: string): Program {
    // initiate the compiler
    const lexer = new LashLexer(CharStreams.fromString(lashSrc))
    const parser = new LashParser(new CommonTokenStream(lexer))

    // create the AST
    const programTree = parser.program()

    // use the visitor to transform the AST generated by ANTLR into our own AST
    const antlrVisitor = new AntlrVisitor(programTree)
    return antlrVisitor.getAST()
}

/**
 * Generates Unix Bash Code for the given AST
 * @param program
 */
export function astToBash(program: Program): string {
    const types = new TypeInferencer(program)
    const generator = new BashGenerator(program, types)
    return generator.generateBash()
}
