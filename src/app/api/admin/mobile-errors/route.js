import { listClientErrors, deleteClientError } from '@/lib/utils/clientErrors';

export async function GET(req) {
    return listClientErrors(req, 'mobile');
}

// DELETE /api/admin/mobile-errors  -> purge every resolved error
export async function DELETE(req) {
    return deleteClientError(req, 'mobile', null);
}
