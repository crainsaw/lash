/* eslint-disable jest/no-export */
import { join as joinPath, parse as parsePath } from 'path'
import { readFileSync, existsSync, readdirSync, lstatSync } from 'fs'
import { sourceToAST, astToBash } from '../../src/compiler'

/**
 * Lists all files contained in the given folder.
 * @param startPath
 * @param filter
 * @param recursive
 */
function getTestFiles(startPath: string, filter = '.lsh', recursive = true): string[] {
    if (!existsSync(startPath)) {
        throw Error(`Specified path ${startPath} does not exist.`)
    }
    const filteredFiles = []
    const files = readdirSync(startPath)
    for (const file of files) {
        const filename = joinPath(startPath, file)
        const stat = lstatSync(filename)
        if (recursive && stat.isDirectory()) {
            const filesInSubDir = getTestFiles(filename, filter, recursive)
            filteredFiles.push(...filesInSubDir)
        }
        if (stat.isFile() && filename.indexOf(filter) >= 0) {
            filteredFiles.push(filename)
        }
    }
    return filteredFiles
}

/**
 *
 * @param inputFile
 */
function getExpectedOutputFile(inputFile: string): string {
    const fileInfo = parsePath(inputFile)
    return `${fileInfo.dir}/${fileInfo.name}.sh`
}

/**
 *
 * @param lashFile
 */
function getExpectedOutput(lashFile: string): string {
    // read test specification
    const outputfile = getExpectedOutputFile(lashFile)
    return readFileSync(outputfile, 'utf8')
}

/**
 *
 * @param lashFile
 */
function compileInputFile(lashFile: string): string {
    const lashSourceCode = readFileSync(lashFile, 'utf8')
    const ast = sourceToAST(lashSourceCode)
    return astToBash(ast)
}

/**
 *
 * @param filename
 */
function getPathRelativeTo(rootFile: string, filename: string): string {
    return filename.slice(rootFile.length + 1)
}

/**
 *
 * @param suiteName
 * @param testsRootFolder
 */
export function performPositiveTests(suiteName: string, testsRootFolder: string): void {
    describe(suiteName, () => {
        const inFiles = getTestFiles(testsRootFolder)

        for (const inFile of inFiles) {
            test(`should generate expected result for ${getPathRelativeTo(testsRootFolder, inFile)}`, () => {
                const expectedOutput = getExpectedOutput(inFile)
                const generatedOutput = compileInputFile(inFile)
                // warn: if input and output seem to be equal check that expectedOutput does not include \r characters
                expect(generatedOutput).toBe(expectedOutput)
            })
        }
    })
}

/**
 *
 * @param suiteName
 * @param testsRootFolder
 * @param tests
 */
export function performNegativeTests(suiteName: string, testsRootFolder: string): void {
    describe(suiteName, () => {
        const inFiles = getTestFiles(testsRootFolder)

        for (const inFile of inFiles) {
            test(`should throw error for ${getPathRelativeTo(testsRootFolder, inFile)}`, () => {
                expect(() => {
                    compileInputFile(inFile)
                }).toThrow()
            })
        }
    })
}
