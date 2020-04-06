import AST from '../../ast/ast'

/**
 * Base class for all semantic errors
 */
export default abstract class SemanticError extends Error {
    constructor(public astNode: AST, public description: string | null = null, public name: string = 'SemanticError') {
        super()
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }

    public get message(): string {
        const errMsg = this.description ? ` ${this.description}` : ''
        return `${this.name} on line ${this.astNode.line}:${this.astNode.charPositionInLine + 1}.${errMsg}`
    }
}
