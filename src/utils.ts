import { Entity, Operation } from './redux-typings';

export function makeDefaultMessageText(relating: Entity | Entity[], operation: Operation, isError: boolean): string {
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

export function blockNonIdentifying(identifying: any) {
  if (!Array.isArray(identifying)) {
    blockNonIdentifier(identifying);
    return;
  }

  if (identifying.length === 0) {
    throw new Error('Expected ids with string or numbers, but got the array empty.');
  }

  identifying.forEach((identifier: any) => {
    const idType = typeof identifier;
    if (!validIdentifierTypes.includes(idType)) {
      throw new Error(`Expected ids as strings or numbers, but got an array with ${idType}.`);
    }
  });
}

export function blockNonIdentifier(identifier: any) {
  const idType = typeof identifier;
  if (!validIdentifierTypes.includes(idType)) {
    throw new Error(`Expected unique id to be string or number, but got ${idType}.`);
  }
}

export function blockNonDataWithMeta(payload: any) {
  if (!isObjectInstance(payload) || isArrayInstance(payload)) {
    throw new Error(`Expected Object instance as payload, but got something else of type ${typeof payload}.`);
  }

  const { data } = payload;
  if (!isObjectInstance(data) || !isArrayInstance(data)) {
    throw new Error(`Expected Array or Object instance as data, but got something else of type ${typeof data}.`);
  }

  const { meta } = payload;
  if (!isObjectInstance(meta)) {
    throw new Error(`Expected Object instance as meta, but got something else of type ${typeof meta}.`);
  }
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

type GenericFunction = (...args: any[]) => void;

const validIdentifierTypes = ['string', 'number'];

const isObjectInstance = (x: any) => x instanceof Object;

const isArrayInstance = (x: any) => Array.isArray(x);
