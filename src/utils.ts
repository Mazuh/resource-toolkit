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
