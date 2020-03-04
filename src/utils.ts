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
    case 'RELATED_READ':
    case 'RELATED_UPDATED':
      return (isError ? 'Failed operation on related data.' : 'Successful operation on related data.');
    default:
      return isError
        ? 'Unknown and unexpected error response.'
        : 'Success, but with unknown and unexpected response.';
  }
}
