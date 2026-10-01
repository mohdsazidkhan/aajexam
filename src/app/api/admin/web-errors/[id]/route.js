import { updateClientError, deleteClientError } from '@/lib/utils/clientErrors';

export async function PATCH(req, { params }) {
    const { id } = await params;
    return updateClientError(req, 'web', id);
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    return deleteClientError(req, 'web', id);
}
