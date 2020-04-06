#!/usr/bin/env node
import yargs from 'yargs'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { parse as parsePath, join as joinPath } from 'path'
import { sourceToAST, astToBash } from './compiler'

const argv = yargs
    .option('out', {
        alias: 'o',
        default: '',
        describe: 'The generated output file',
        type: 'string',
    })
    .option('target', {
        alias: 't',
        describe: 'Which language the input file will be converted to',
        choices: ['bash'],
        default: 'bash',
    })
    .boolean('print')
    .alias('print', 'p')
    .describe('print', 'Prints the compiled code to the console')
    .demandCommand(1)
    .help()
    .alias('help', 'h')
    .usage('Usage: lash [ops] input.lsh')
    .parse()

if (argv._.length !== 1) {
    console.error('No input file has been specified.')
    process.exit(1)
}

// get input file name
const inFile = argv._[0]

if (!existsSync(inFile)) {
    console.error(`The specified input file ${inFile} does not exist.`)
    process.exit(1)
}

// read the input file
const lashProgram = readFileSync(inFile, 'utf8')

// compile the content
const ast = sourceToAST(lashProgram)
const targetCode = astToBash(ast)

// write generated code to output file
let outFile = argv.out
if (outFile === '' && !argv.print) {
    const fileInfo = parsePath(inFile)
    // make sure we do not override the input file
    if (fileInfo.ext === '.sh') {
        console.error(
            `Cannot write output file ${outFile} since it would override the input file. Use the --out option to specify an output file.`,
        )
        process.exit(1)
    }
    outFile = joinPath(fileInfo.dir, `${fileInfo.name}.sh`)
}

if (outFile !== '') {
    writeFileSync(outFile, targetCode, 'utf8')
}

// write generated code to console (if requested with option --print)
if (argv.print) {
    console.log(targetCode)
}
