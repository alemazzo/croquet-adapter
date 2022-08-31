import { Model } from '@croquet/croquet'
import pkg from 'fast-json-patch';
const { applyOperation } = pkg;


export class DataManager extends Model {

    init(options) {
        this.data = options.data
    }

    update(patches) {
        patches.forEach(this._applyPatch)
    }

    _applyPatch(patch) {
        applyOperation(this.data, patch, true, true)
    }

}