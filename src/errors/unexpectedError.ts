/**
 * Indicates that a branch has been reached which should never be called on proper implementation.
 * It may be ccaused by a missing branch or some missing pre-condition checks
 */
export default class UnexpectedError extends Error {
    constructor() {
        super('An unexpected error occured. Please report this issue.')
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}
