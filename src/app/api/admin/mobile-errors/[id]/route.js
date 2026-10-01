import { updateClientError, deleteClientError } from '@/lib/utils/clientErrors';

export async function PATCH(req, { params }) {
    const { id } = await params;
    return updateClientError(req, 'mobile', id);
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    return deleteClientError(req, 'mobile', id);
}
