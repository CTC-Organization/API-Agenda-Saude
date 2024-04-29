export function excludeFieldsInEntity(entity, ...keys) {
    if (Array.isArray(entity)) {
        for (const data of entity) {
            for (const key of keys) {
                delete data[key];
            }
        }
    } else {
        for (const key of keys) {
            delete entity[key];
        }
        return entity;
    }
}
