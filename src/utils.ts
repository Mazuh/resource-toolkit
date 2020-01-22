import { Entity, Operation } from './redux-typings';

export function makeDefaultMessageText(relating: Entity | Entity[], operation: Operation, isError: boolean): string {
  const attachmentForMany = Array.isArray(relating) ? ` Related to ${relating.length} items.` : '';
  switch (operation) {
    case 'READ':
      return (isError ? 'Failed to fetch data.' : 'Successfully fetched data.') + attachmentForMany;
    default:
      return isError
        ? 'Unknown and unexpected error response.'
        : 'Success, but with unknown and unexpected response.';
  }
}
