import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApprovalStatus } from '@/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { approvalStatus, adminRole } = await req.json();

    if (adminRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Only system administrators can approve or reject properties' },
        { status: 403 }
      );
    }

    if (!approvalStatus || !['approved', 'pending', 'rejected'].includes(approvalStatus)) {
      return NextResponse.json(
        { success: false, message: 'Valid approval status (approved, pending, rejected) is required' },
        { status: 400 }
      );
    }

    const updated = db.updateHotel(id, {
      approvalStatus: approvalStatus as ApprovalStatus
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Property listing status set to: ${approvalStatus.toUpperCase()}`,
      hotel: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
