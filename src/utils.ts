export function makeDefaultMessageText(relating: Entity | Entity[], operation: Operation, isError: boolean): string {
  const attachmentForMany = Array.isArray(relating) ? ` Related to ${relating.length} items.` : '';
  switch (operation) {
    case 'CREATE':
      return (isError ? 'Failed to create.' : 'Successfully created.') + attachmentForMany;
    case 'READ':
      return (isError ? 'Failed to fetch data.' : 'Successfully fetched data.') + attachmentForMany;
    case 'UPDATE':
      return (isError ? 'Failed to update.' : 'Successfully updated.') + attachmentForMany;
    case 'DELETE':
      return (isError ? 'Failed to delete.' : 'Successfully deleted.') + attachmentForMany;
    default:
      return isError
        ? 'Unknown and unexpected message.'
        : 'Success, but with unknown and unexpected message.';
  }
}
