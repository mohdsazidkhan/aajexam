import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BankDetail from '@/models/BankDetail';
import { protect } from '@/middleware/auth';

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { accountHolderName, accountNumber, bankName, ifscCode, branchName, upiId } = await req.json();

        let bankDetail = await BankDetail.findOne({ user: auth.user.id });
        if (bankDetail) {
            bankDetail.accountHolderName = accountHolderName;
            bankDetail.accountNumber = accountNumber;
            bankDetail.bankName = bankName;
            bankDetail.ifscCode = ifscCode;
            bankDetail.branchName = branchName;
            bankDetail.upiId = upiId;
            await bankDetail.save();
        } else {
            bankDetail = await BankDetail.create({ user: auth.user.id, accountHolderName, accountNumber, bankName, ifscCode, branchName, upiId });
        }

        return NextResponse.json({ success: true, bankDetail });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
