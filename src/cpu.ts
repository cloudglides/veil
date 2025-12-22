export async function runCPUBenchmark(): Promise<{
  computeTime: number;
  opsPerSecond: number;
  memoryUsed: number;
}> {
  const start = performance.now();
  let operations = 0;

  const primes: number[] = [];
  for (let i = 2; i < 10000; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
      operations++;
    }
  }

  let fib = 0;
  let a = 0;
  let b = 1;
  for (let i = 0; i < 30; i++) {
    fib = a + b;
    a = b;
    b = fib;
    operations++;
  }

  const arr = new Array(5000).fill(0).map((_, i) => Math.sin(i) * Math.cos(i));
  arr.sort((x, y) => x - y);
  operations += 5000;

  for (let i = 0; i < 1000; i++) {
    const sum = arr.reduce((a, b) => a + b, 0);
    const mean = sum / arr.length;
    operations++;
  }

  const computeTime = performance.now() - start;
  const opsPerSecond = (operations / computeTime) * 1000;
  const memoryUsed = primes.length + arr.length;

  return {
    computeTime,
    opsPerSecond,
    memoryUsed,
  };
}

export async function getCPUHash(): Promise<string> {
  const benchmark = await runCPUBenchmark();
  const data = `${benchmark.computeTime}${benchmark.opsPerSecond}${benchmark.memoryUsed}`;

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16);
}
