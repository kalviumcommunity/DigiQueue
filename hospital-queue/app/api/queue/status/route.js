export async function GET() {
  return Response.json({
    currentToken: 5,
    queueActive: true,
  });
}
