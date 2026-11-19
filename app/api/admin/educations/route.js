import * as educationHandler from '../education/route';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return educationHandler.GET(request);
}

export async function POST(request) {
  return educationHandler.POST(request);
}

export async function PUT(request) {
  return educationHandler.PUT(request);
}

export async function DELETE(request) {
  return educationHandler.DELETE(request);
}
