import { Entity, Operation, IdentifierKey } from './reducer-typings';

export class ResourceToolkitError extends Error {}

export function makeDefaultMessageText(relating: Entity | Entity[], operation: Operation, error: null|Error|boolean): string {
  const isError = error instanceof Error || error;
  const attachmentForMany = Array.isArray(relating) ? ` Related to ${relating.length} items.` : '';

  switch (operation) {
    case 'CREATE':
      return (isError ? 'Failed to create.' : 'Successfully created.') + attachmentForMany;
    case 'READ':
      return (isError ? 'Failed to fetch data.' : 'Successfully fetched data.') + attachmentForMany;
    case 'UPDATE':
      return (isError ? 'Failed to update.' : 'Successfully updated.');
    case 'DELETE':
      return (isError ? 'Failed to delete.' : 'Successfully deleted.');
    case 'RELATED':
    case 'RELATED_CREATED':
    case 'RELATED_READ':
    case 'RELATED_UPDATED':
    case 'RELATED_DELETED':
      return (isError ? 'Failed operation on related data.' : 'Successful operation on related data.');
    default:
      return isError
        ? 'Unknown and unexpected error response.'
        : 'Success, but with unknown and unexpected response.';
  }
}

export function handleErrorFn(namespace: string, logLibError: typeof console.error) {
  return function handleError(error: Error) {
    if (error instanceof ResourceToolkitError) {
      logLibError(`[${namespace}]`, error);
    }
  }
}

export function blockNonIdentifying(identifying: any) {
  if (!Array.isArray(identifying)) {
    blockNonIdentifier(identifying);
    return;
  }

  if (identifying.length === 0) {
    throw new ResourceToolkitError('Expected ids with string or numbers, but got the array empty.');
  }

  identifying.forEach((identifier: any) => {
    const idType = typeof identifier;
    if (!validIdentifierTypes.includes(idType)) {
      throw new ResourceToolkitError(`Expected ids as strings or numbers, but got an array with ${idType}.`);
    }
  });
}

export function blockNonIdentifier(identifier: any) {
  const idType = typeof identifier;
  if (!validIdentifierTypes.includes(idType)) {
    throw new ResourceToolkitError(`Expected unique id to be string or number, but got ${idType}.`);
  }
}

export function blockNonDataWithMeta(payload: any) {
  if (!isObjectInstance(payload) || isArrayInstance(payload)) {
    throw new ResourceToolkitError(`Expected Object instance as payload, but got something else of type ${typeof payload}.`);
  }

  const { data } = payload;
  if (!isObjectInstance(data) || !isArrayInstance(data)) {
    throw new ResourceToolkitError(`Expected Array or Object instance as data, but got something else of type ${typeof data}.`);
  }

  const { meta } = payload;
  if (!isObjectInstance(meta)) {
    throw new ResourceToolkitError(`Expected Object instance as meta, but got something else of type ${typeof meta}.`);
  }
}

export function blockNonEntitiesFn(idKey: IdentifierKey) {
  return function blockNonEntities(items: any) {
    if (!isArrayInstance(items)) {
      throw new ResourceToolkitError(`Expected Array instance as gateway return, but got something else of type ${typeof items}.`);
    }

    items.forEach((item: any, index: number) => {
      if (!isObjectInstance(item) || isArrayInstance(item)) {
        throw new ResourceToolkitError(`Expected single Object instances in gateway items, but got something else of type ${typeof item} at index ${index}.`);
      }

      if (!item[idKey]) {
        throw new ResourceToolkitError(`Expected truthy "entityId" in gateway items, but got something else of type ${typeof item[idKey]} at index ${index}.`);
      }

      if (!['string', 'number'].includes(typeof item[idKey])) {
        throw new ResourceToolkitError(`Expected string or number for "${idKey}" in gateway items, but got something else of type ${typeof item[idKey]} at index ${index}.`);
      }
    });
  }
}

export function blockNonEntityFn(idKey: IdentifierKey) {
  return function blockNonEntity(item: any) {
    if (isArrayInstance(item)) {
      throw new ResourceToolkitError('Expected single Object instance as gateway return, but got an Array.');
    }

    if (!isObjectInstance(item)) {
      throw new ResourceToolkitError(`Expected Object instance as gateway return, but got something else of type ${typeof item}.`);
    }

    if (!item[idKey]) {
      throw new ResourceToolkitError(`Expected truthy "${idKey}" in gateway return, but got something else of type ${typeof item[idKey]}.`);
    }

    if (!['string', 'number'].includes(typeof item[idKey])) {
      throw new ResourceToolkitError(`Expected string or number for "${idKey}" in gateway return, but got something else of type ${typeof item[idKey]}.`);
    }
  };
}

export function minimalDelayedHOC(func: GenericFunction, threshold: number = 1000): GenericFunction {
  const initialTime = Date.now();
  const thresholdTime = initialTime + threshold;

  return (...args: any[]): void => {
    const pendingTime = thresholdTime - Date.now();
    if (pendingTime > 0) {
      global.setTimeout(() => func(...args), pendingTime);
    } else {
      func(...args);
    }
  };
}

export const isObjectInstance = (x: any) => x instanceof Object;

export const isArrayInstance = (x: any) => Array.isArray(x);

type GenericFunction = (...args: any[]) => void;

const validIdentifierTypes = ['string', 'number'];
