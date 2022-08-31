import { Model } from '@croquet/croquet'
import pkg from 'fast-json-patch';
import { Logger } from '../../logger.js';
const { applyOperation } = pkg;


export class DataManager extends Model {

    $logger = Logger.getLogger("DataManager")

    init(options) {
        this.data = options.data
    }

    update(patches) {
        patches.forEach((patch) => {
            applyOperation(this.data, patch, true, true)
        })
        this.$logger.debug(`Updated data: ${JSON.stringify(this.data)}`)
    }

}