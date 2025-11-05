export function calculateEuclideanDistance(
  vect1: number[],
  vect2: number[],
): number {
  return Math.sqrt(
    vect1.reduce((sum, val, i) => sum + Math.pow(val - vect2[i], 2), 0),
  );
}

export function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
