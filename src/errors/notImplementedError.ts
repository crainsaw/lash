/**
 * This error should only be used as a placeholder while implementing new functionality
 */
export default class NotImplementedError extends Error {
    constructor() {
        super('It seems you found a dead code path. Please report this issue on github.')
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
