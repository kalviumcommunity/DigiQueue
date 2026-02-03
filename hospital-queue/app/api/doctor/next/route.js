let mockToken = 5;

export async function POST() {
  mockToken += 1;
  return Response.json({
    currentToken: mockToken,
  });
}
