import { listClientErrors, deleteClientError } from '@/lib/utils/clientErrors';

export async function GET(req) {
    return listClientErrors(req, 'web');
}

// DELETE /api/admin/web-errors  -> purge every resolved error
export async function DELETE(req) {
    return deleteClientError(req, 'web', null);
}
