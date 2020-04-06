export default class GrammarError extends Error {
    constructor() {
        super('It seems the grammar or the parse tree converter have been modified without adapting the other.')
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
